-- Insert or Update Plans
INSERT INTO plans (
  type, 
  name, 
  description, 
  credits, 
  price, 
  price_per_credit, 
  billing_period, 
  min_conversations, 
  max_conversations,
  active
) VALUES
  (
    'starter', 
    'Starter', 
    'Ideal para pequenas empresas iniciando com IA', 
    2000, 
    790.00, 
    0.395, 
    'monthly', 
    300, 
    500,
    true
  ),
  (
    'growth', 
    'Growth', 
    'Para empresas em crescimento acelerado', 
    10000, 
    3700.00, 
    0.37, 
    'monthly', 
    1200, 
    2500,
    true
  ),
  (
    'scale', 
    'Scale', 
    'Volume alto para operações robustas', 
    50000, 
    16500.00, 
    0.33, 
    'monthly', 
    6000, 
    12500,
    true
  ),
  (
    'enterprise', 
    'Enterprise', 
    'Solução completa para grandes corporações', 
    200000, 
    58000.00, 
    0.29, 
    'monthly', 
    25000, 
    50000,
    true
  )
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  credits = EXCLUDED.credits,
  price = EXCLUDED.price,
  price_per_credit = EXCLUDED.price_per_credit,
  min_conversations = EXCLUDED.min_conversations,
  max_conversations = EXCLUDED.max_conversations,
  active = EXCLUDED.active,
  updated_at = CURRENT_TIMESTAMP;
