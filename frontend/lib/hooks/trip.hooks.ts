import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { tripsApi } from "../api/trips.api";

export function useGetTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.getTrips(),
  });
}

export function useGetTrip(tripId: string) {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => tripsApi.getTrip(tripId),
    enabled: !!tripId,
  });
}

export const useBookTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripData: any) => tripsApi.bookTrip(tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip Booked Successfully!");
    },
  });
};
