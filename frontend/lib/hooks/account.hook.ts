import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { accountApi } from "../api/accont.api";

export function useGetProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => accountApi.getProfile(),
  });
}
