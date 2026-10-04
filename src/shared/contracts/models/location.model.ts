export type LocationType =
  | 'igreja'
  | 'hotel'
  | 'restaurante'
  | 'posto_policial';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  address: string;
  country: string;
  zip_code: string;
  number: string;
  created_by: string;
  created_at: Date;
  geom?: any; // Tipo geometry(Point, 4326) do PostGIS
}
