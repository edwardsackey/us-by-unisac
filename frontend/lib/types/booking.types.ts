export type BookingType = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  trip: {
    id: string;
    route: {
      source: string;
      destination: string;
      estimated_duration: string;
    };
    departure_station: {
      name: string;
      location: string;
    };
    arrival_station: {
      name: string;
      location: string;
    };
    bus: {
      plate_number: string;
    };
    departure_time: string;
    base_price: string;
    status: string;
  };
};
