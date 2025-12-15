-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) UNIQUE NOT NULL CHECK (type IN ('payg', 'starter', 'growth', 'scale', 'enterprise')),
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  price_per_credit DECIMAL(10, 4) NOT NULL,
  billing_period VARCHAR(20) DEFAULT 'once' CHECK (billing_period IN ('once', 'monthly', 'yearly')),
  stripe_price_id TEXT,
  active BOOLEAN DEFAULT true,
  min_conversations INTEGER,
  max_conversations INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_balances table
CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  total_credits INTEGER DEFAULT 0,
  used_credits INTEGER DEFAULT 0,
  available_credits INTEGER DEFAULT 0,
  reserved_credits INTEGER DEFAULT 0,
  last_consumption_at TIMESTAMP,
  last_purchase_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'consumption', 'refund', 'bonus', 'adjustment')),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  metadata JSONB,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  payment_id UUID,
  session_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid')),
  credits_per_period INTEGER NOT NULL,
  price_per_period DECIMAL(10, 2) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_invoice_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  credits_purchased INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded', 'partially_refunded')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('card', 'pix', 'boleto')),
  description TEXT,
  metadata JSONB,
  paid_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  receipt_url TEXT,
  subscription_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_credit_transactions_org_id ON credit_transactions(organization_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_payments_org_id ON payments(organization_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Insert default plans
INSERT INTO plans (type, name, description, credits, price, price_per_credit, billing_period) VALUES
  ('payg', 'Pay As You Go', 'Pague apenas pelo que usar', 1, 0.45, 0.45, 'once'),
  ('starter', 'Starter', '2.000 créditos - Ideal para pequenas empresas', 2000, 790.00, 0.395, 'monthly'),
  ('growth', 'Growth', '10.000 créditos - Para empresas em crescimento', 10000, 3700.00, 0.37, 'monthly'),
  ('scale', 'Scale', '50.000 créditos - Para grandes volumes', 50000, 16500.00, 0.33, 'monthly'),
  ('enterprise', 'Enterprise', '200.000 créditos - Para corporações', 200000, 58000.00, 0.29, 'monthly')
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  credits = EXCLUDED.credits,
  price = EXCLUDED.price,
  price_per_credit = EXCLUDED.price_per_credit;

-- Create function to update credit balance after transaction
CREATE OR REPLACE FUNCTION update_credit_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.type = 'purchase' THEN
      UPDATE credit_balances
      SET 
        total_credits = total_credits + NEW.amount,
        available_credits = available_credits + NEW.amount,
        last_purchase_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = NEW.organization_id;
    ELSIF NEW.type = 'consumption' THEN
      UPDATE credit_balances
      SET 
        used_credits = used_credits + ABS(NEW.amount),
        available_credits = available_credits - ABS(NEW.amount),
        last_consumption_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = NEW.organization_id;
    ELSIF NEW.type = 'refund' OR NEW.type = 'bonus' THEN
      UPDATE credit_balances
      SET 
        total_credits = total_credits + NEW.amount,
        available_credits = available_credits + NEW.amount,
        updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = NEW.organization_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credit balance updates
DROP TRIGGER IF EXISTS trigger_update_credit_balance ON credit_transactions;
CREATE TRIGGER trigger_update_credit_balance
  AFTER INSERT ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_balance_on_transaction();

-- Create function to initialize credit balance for new organizations
CREATE OR REPLACE FUNCTION create_credit_balance_for_org()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credit_balances (organization_id, total_credits, used_credits, available_credits)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new organizations
DROP TRIGGER IF EXISTS trigger_create_credit_balance ON organizations;
CREATE TRIGGER trigger_create_credit_balance
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_credit_balance_for_org();
