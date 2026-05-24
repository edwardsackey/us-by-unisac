import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { tripsApi } from "../api/trips.api";
import { bookingsApi } from "../api/bookings.api";

export function useGetBookingHistory() {
  return useQuery({
    queryKey: ["bookings-history"],
    queryFn: () => bookingsApi.getBookings(),
  });
}
