export type AlertStatus = 'aberto' | 'em_atendimento' | 'encerrado';
export type AlertDetails = {
  type:
    | 'domestic-violence'
    | 'disturbance'
    | 'illegal-event'
    | 'school-security'
    | 'crime-in-progress'
    | 'traffic-accident'
    | 'past-crime'
    | 'urgente';
  life_in_danger?: boolean;
  people_in_danger?: boolean;
  criminal_is_present?: boolean;
  serious_injury?: boolean;
  has_weapons?: boolean;
  needs_ambulance?: boolean;
  needs_fire_department?: boolean;
  more_details?: string;
};

export interface Alert {
  id?: string;
  user_id: string;
  attended_by_user_id?: string;
  closed_by_user_id?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  number?: string;
  country?: string;
  alert_details?: AlertDetails;
  status: AlertStatus;
  created_at?: Date;
  resolved_at?: Date;
  investigation_started_at?: Date;
}
