import { apiService } from "../services/apiService";

export const accountApi = {
  getProfile: async () => {
    const res = await apiService.get("/profile/me/");
    return res;
  },
};
