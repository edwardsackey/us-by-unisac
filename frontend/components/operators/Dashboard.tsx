import { BASE_URL } from "@/lib/services/apiService";
import { DashboardStats } from "@/lib/types/operators.types";
import React from "react";

const Dashboard = async ({ stats }: { stats: DashboardStats }) => {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default Dashboard;
