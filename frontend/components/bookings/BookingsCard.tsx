import React from "react";
import {
  MapPin,
  Calendar,
  Clock,
  BusFront,
  QrCode,
  CreditCard,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BookingType } from "@/lib/types/booking.types";
import { TripType } from "@/lib/types/trip.types";

export const BookingCard = ({ booking }: { booking: BookingType }) => {
  const { trip, status } = booking;

  const isPending = status === "PENDING";

  // Format Currency
  const price = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(trip.base_price));

  // Format Date
  const dateObj = new Date(trip.departure_time);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePayNow = () => {
    // Logic to redirect to payment gateway or open modal
    toast.info(`Initiating payment for Trip to ${trip.route.destination}`);
    console.log("Pay for booking ID:", booking.id);
  };

  const handleCancelBooking = () => {
    toast.info(`Initiating cancellation for Trip to ${trip.route.destination}`);
    console.log("Cancel booking ID:", booking.id);
  };

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md border-l-4 ${
        isPending ? "border-l-yellow-500" : "border-l-green-500"
      }`}
    >
      <div className="p-5 flex flex-col md:flex-row gap-6">
        {/* Left: Date Box */}
        <div className="hidden md:flex flex-col items-center justify-center p-4 bg-accent rounded-lg min-w-25 border border-border">
          <span className="text-3xl font-bold text-primary">
            {dateObj.getDate()}
          </span>
          <span className="text-sm font-medium text-secondary-foreground uppercase">
            {dateObj.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {dateObj.getFullYear()}
          </span>
        </div>

        {/* Middle: Route & Details */}
        <div className="flex-1 space-y-4">
          {/* Header: Route + ID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                {trip.route.source}
                <span className="text-muted-foreground/50">→</span>
                {trip.route.destination}
              </h3>
              {isPending && (
                <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              )}
            </div>
            <div className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">
              #{booking.id.slice(0, 8)}
            </div>
          </div>

          <Separator className="bg-accent" />

          {/* Stations & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <div>
                  <span className="block text-primary font-medium">
                    {trip.departure_station.name}
                  </span>
                  <span
                    className="text-xs truncate max-w-[200px] block"
                    title={trip.departure_station.location}
                  >
                    {trip.departure_station.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">{timeStr}</span>
                <span className="text-xs">• Bus {trip.bus.plate_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status & Action */}
        <div className="flex flex-row md:flex-col items-center md:justify-center justify-between gap-3 md:border-l md:pl-6">
          <div className="text-right md:text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Price</p>
            <p className="text-xl font-bold text-primary">{price}</p>
          </div>

          {isPending ? (
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Badge
                variant="outline"
                className="justify-center w-full border-yellow-200 bg-yellow-50 text-yellow-700"
              >
                Payment Pending
              </Badge>
              <Button
                onClick={handlePayNow}
                size="sm"
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
              <Button
                onClick={() => handleCancelBooking(booking.id)}
                size="sm"
                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm"
              >
                Cancel Booking
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Badge
                variant="outline"
                className="justify-center w-full border-green-200 bg-green-50 text-green-700"
              >
                Confirmed
              </Badge>
              <Button variant="outline" size="sm" className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                View Ticket
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Only Date (since we hid the big box on mobile) */}
      <div className="md:hidden px-5 py-2 text-xs text-muted-foreground flex items-center gap-2 border-t">
        <Calendar className="w-3 h-3" />
        {dateStr}
      </div>
    </Card>
  );
};
