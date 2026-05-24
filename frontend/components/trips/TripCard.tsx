import Link from "next/link";
import React from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Armchair,
  BusFront,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils"; // Your util functions
import { TripType } from "@/lib/types/trip.types";

const TripCard = ({ trip }: { trip: TripType }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "default";
      case "ONGOING":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Safe formatting for currency
  const price = parseFloat(trip.base_price).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });

  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <Card className="hover:shadow-lg transition-shadow duration-200 border-border/60 overflow-hidden">
        {/* --- Header: Route & Status --- */}
        <CardHeader className="p-4 pb-3 bg-muted/20 border-b">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <span>{trip.route.source}</span>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <span>{trip.route.destination}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                <BusFront className="w-3.5 h-3.5" />
                <span>{trip.bus.plate_number}</span>
              </div>
            </div>
            <Badge variant={getStatusVariant(trip.status)}>{trip.status}</Badge>
          </div>
        </CardHeader>

        {/* --- Content: Time & Duration --- */}
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Departure Info */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Departure
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {formatDate(trip.departure_time)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {formatTime(trip.departure_time)}
                </span>
              </div>
              {/* Station Name */}
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {trip.departure_station.name}
                </span>
              </div>
            </div>

            {/* Duration & Arrival Info */}
            <div className="flex flex-col space-y-1 pl-4 border-l">
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Details
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="text-sm font-semibold text-foreground">
                  {trip.route.estimated_duration}
                </span>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {trip.arrival_station.name}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* --- Footer: Seats & Price --- */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full">
            <Armchair
              className={`w-4 h-4 ${
                trip.seats_available < 5 ? "text-orange-500" : "text-green-600"
              }`}
            />
            <span className="text-xs font-medium">
              <span
                className={
                  trip.seats_available < 5
                    ? "text-orange-600 font-bold"
                    : "text-foreground"
                }
              >
                {trip.seats_available}
              </span>
              <span className="text-muted-foreground ml-1">seats left</span>
            </span>
          </div>

          <div className="text-xl font-bold text-primary">{price}</div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TripCard;
