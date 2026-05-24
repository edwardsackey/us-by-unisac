import { apiService } from "../services/apiService";

export const bookingsApi = {
  getBookings: async () => {
    const res = await apiService.get("/bookings/history/");
    return res;
  },
};
