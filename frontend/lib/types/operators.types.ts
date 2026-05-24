// type DashboardStats = {
//     totalTrips: number,
//     totalTripsToday: number,
//     totalTripsThisMonth: number,
//     totalTripsThisYear: number,
//     totalTripsLastMonth: number,
//     totalTripsLastYear: number,

// }

export type DashboardStats = {
  operator: {
    name: string;
    is_verified: boolean;
    is_active: boolean;
  };
  assets: {
    buses: {
      total: number;
    };
    drivers: {
      total: number;
      verified: number;
      pending: number;
    };
  };
};
