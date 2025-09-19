export interface Route {
  id: string;
  name: string;
  description: string;
  distance: number;
  starts_at_longitude: number;
  starts_at_latitude: number;
  ends_at_longitude: number;
  ends_at_latitude: number;
  elevation_gain_m: number | null;
  elevation_loss_m: number | null;
  min_elevation_m: number | null;
  max_elevation_m: number | null;
  created_at: Date;
}
