export interface ListReportsDto {
  sentiment?: 'positive' | 'negative' | 'neutral';
  type?: 'appointment' | 'order' | 'faq';
  agent_id?: string;
  agent_ids?: string | string[];
  created_at?: Date | string;
}
