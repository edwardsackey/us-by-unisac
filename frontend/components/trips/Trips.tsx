import { BASE_URL } from "@/lib/services/apiService";
import React from "react";
import TripCard from "./TripCard";
import TripSearch from "./TripSearch";

// Types defined for reuse
export type RouteType = {
  id: string;
  source: string;
  destination: string;
  price: string;
  estimated_duration: string;
};

export type TripType = {
  id: string;
  route: RouteType;
  departure_time: string;
  arrival_time: string | null;
  status: string;
  seats_available: number;
  base_price: string;
  bus: {
    id: string;
    plate_number: string;
    capacity: number;
    bus_type: string;
  };
};

// Next.js pages receive searchParams as a prop
const Trips = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  // 1. Extract params
  const sourceQuery = (searchParams?.source as string) || "";
  const destQuery = (searchParams?.destination as string) || "";

  // 2. Fetch Data (Ideally, pass queries to API here: `${BASE_URL}/trips/?source=${sourceQuery}`)
  const res = await fetch(`${BASE_URL}/trips/`, {
    cache: "no-store", // Ensure dynamic data isn't cached stale
  });

  if (!res.ok) {
    return <div>Failed to load trips</div>;
  }

  const trips: TripType[] = await res.json();

  console.log(trips);

  // 3. Filter Logic (Server-side filtering)
  const filteredTrips = trips.filter((trip) => {
    const matchesSource = trip.route.source
      .toLowerCase()
      .includes(sourceQuery.toLowerCase());
    const matchesDest = trip.route.destination
      .toLowerCase()
      .includes(destQuery.toLowerCase());

    return matchesSource && matchesDest;
  });

  return (
    <div className="">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">
          Available Trips
        </h1>

        {/* Client Component for Inputs */}
        <TripSearch />

        {/* Results */}
        <div className="space-y-4">
          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => (
              // TripCard remains a Server Component
              <TripCard key={trip.id} trip={trip} />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No trips found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trips;
