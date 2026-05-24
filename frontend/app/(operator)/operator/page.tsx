import Dashboard from "@/components/operators/Dashboard";
import { getAccessToken } from "@/lib/actions/auth.actions";
import { BASE_URL } from "@/lib/services/apiService";
import { cookies } from "next/headers";

const OperatorDashboard = async () => {
  const res = await fetch("/api/operators/stats", { cache: "no-store" });

  if (!res.ok) {
    return <div>Failed to load stats</div>;
  }

  const stats = await res.json();
  return (
    <div>
      <Dashboard stats={stats} />;
    </div>
  );
};
export default OperatorDashboard;
