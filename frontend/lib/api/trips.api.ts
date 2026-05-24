import { apiService } from "../services/apiService";

export const tripsApi = {
  getTrips: async () => {
    const res = await apiService.get("/trips/");
    return res;
  },

  getTrip: async (tripId: string) => {
    const res = await apiService.get(`/trips/${tripId}/`);
    return res;
  },

  bookTrip: async (tripData: any) => {
    const res = await apiService.post(`/bookings/book/user/`, tripData);
    return res;
  },
};
