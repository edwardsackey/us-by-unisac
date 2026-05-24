export type StationType = {
  id: string;
  name: string;
  location: string;
};

export type RouteType = {
  id: string;
  source: string;
  destination: string;
  estimated_duration: string;
};

export type BusType = {
  id: string;
  plate_number: string;
  capacity: number;
};

export type TripType = {
  id: string;
  route: RouteType;
  departure_station: StationType;
  arrival_station: StationType;
  bus: BusType;
  driver: {
    id: string;
    name: string;
    phone: string;
  };
  departure_time: string;
  arrival_time: string | null;
  base_price: string;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  seats_available: number;
};
