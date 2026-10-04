export interface RouteCheckpoint {
  id: string;
  route_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  elevation: number | null;
}
