"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  BusFront,
  MapPin,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Ticket,
  Navigation,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useBookTrip, useGetTrip } from "@/lib/hooks/trip.hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// --- Types based on your JSON ---
type StationType = {
  id: string;
  name: string;
  location: string;
};

type TripType = {
  id: string;
  route: {
    id: string;
    source: string;
    destination: string;
    estimated_duration: string;
  };
  departure_station: StationType;
  arrival_station: StationType;
  bus: {
    id: string;
    plate_number: string;
    capacity: number;
  };
  driver: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  departure_time: string;
  arrival_time: string | null;
  base_price: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  seats_available: number;
};

// --- Form Schema ---
const bookingSchema = z.object({
  seats: z.coerce.number().min(1, "At least 1 seat").max(20, "Max 20 seats"),
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// --- Helper Functions ---
const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(amount));
};

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTimeDisplay = (dateString: string) => {
  if (!dateString) return "--:--";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateArrivalTime = (departureTime: string, duration: string) => {
  if (!departureTime || !duration) return null;
  const date = new Date(departureTime);
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  date.setHours(date.getHours() + (hours || 0));
  date.setMinutes(date.getMinutes() + (minutes || 0));
  date.setSeconds(date.getSeconds() + (seconds || 0));
  return date.toISOString();
};

// --- Main Component ---
export default function TripDetailsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = React.use(params);
  const router = useRouter();

  // In a real app, use the actual hook. For now, assuming type matches.
  const { data: trip, isLoading } = useGetTrip(tripId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<BookingFormValues | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { seats: 1 },
  });

  const selectedSeats = watch("seats");

  // Calculate Arrivals & Pricing
  const calculatedArrival = useMemo(() => {
    if (!trip) return null;
    return (
      trip.arrival_time ||
      calculateArrivalTime(trip.departure_time, trip.route.estimated_duration)
    );
  }, [trip]);

  const totalPrice = useMemo(() => {
    if (!trip) return 0;
    return parseFloat(trip.base_price) * (selectedSeats || 1);
  }, [trip, selectedSeats]);

  // 1. Initial Form Check
  const onSubmitForm = (data: BookingFormValues) => {
    setPendingData(data);
    setShowConfirmModal(true);
  };
  const bookTrip = useBookTrip();
  // 2. Final API Submission
  const handleConfirmBooking = async () => {
    if (!trip || !pendingData) return;

    setIsSubmitting(true);

    // --- CONSTRUCTING THE EXACT PAYLOAD ---
    const payload = {
      trip_id: trip.id,
      passengers: [
        {
          full_name: pendingData.fullName,
          email: pendingData.email,
          phone: pendingData.phone,
        },
      ],
      payment_method: "CASH",
    };

    console.log("🚀 Sending Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await bookTrip.mutateAsync(payload);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Booking Successful", {
        description: `Ticket reserved. Total: ${formatCurrency(totalPrice)}`,
      });

      setShowConfirmModal(false);
      // router.push(`/bookings/${response.data.id}`);
    } catch (error) {
      toast.error("Booking Failed", { description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );

  if (!trip)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Trip not found
      </div>
    );

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl pt-2">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Trip Details
            </h1>
            <p className="text-muted-foreground">
              {trip.route.source} to {trip.route.destination}
            </p>
          </div>
          <Badge
            variant={trip.status === "SCHEDULED" ? "default" : "secondary"}
            className="w-fit text-sm px-4 py-1"
          >
            {trip.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: TRIP DETAILS (2/3 width) --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route & Time Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-2 border-primary/20 pl-6 md:border-l-0 md:pl-0">
                  {/* Departure */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-background md:hidden" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Departure
                    </p>
                    <h3 className="text-xl font-bold text-foreground">
                      {trip.departure_station.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {trip.departure_station.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2 bg-primary/5 w-fit px-3 py-1 rounded-md">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-primary">
                        {formatTimeDisplay(trip.departure_time)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        | {formatDateDisplay(trip.departure_time)}
                      </span>
                    </div>
                  </div>

                  {/* Duration Indicator (Hidden on mobile for cleaner look) */}
                  <div className="hidden md:flex flex-col items-center flex-1 px-4">
                    <span className="text-xs text-muted-foreground mb-1">
                      Duration: {trip.route.estimated_duration}
                    </span>
                    <div className="w-full h-[2px] bg-border relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-2">
                        <BusFront className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-muted-foreground bg-background md:hidden" />
                    <p className="text-sm font-medium text-muted-foreground text-left md:text-right">
                      Arrival
                    </p>
                    <h3 className="text-xl font-bold text-foreground text-left md:text-right">
                      {trip.arrival_station.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1 text-left md:text-right">
                      {trip.arrival_station.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2 bg-accent w-fit md:ml-auto px-3 py-1 rounded-md">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {calculatedArrival
                          ? formatTimeDisplay(calculatedArrival)
                          : "--:--"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle & Driver Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  {/* <SteeringWheel className="w-5 h-5 text-primary" /> */}
                  Operator Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bus Info */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BusFront className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Bus Details
                      </p>
                      <p className="font-semibold">{trip.bus.plate_number}</p>
                      <p className="text-xs text-muted-foreground">
                        Capacity: {trip.bus.capacity} seats
                      </p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Driver
                      </p>
                      <p className="font-semibold">{trip.driver.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Tel: {trip.driver.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy / Amenities (Static for now to make it look full) */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Important Info
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  • Please arrive at{" "}
                  <strong>{trip.departure_station.name}</strong> at least 30
                  minutes before departure.
                </p>
                <p>• Luggage allowance is limited to 15kg per passenger.</p>
                <p>
                  • Show your booking reference to the driver{" "}
                  <strong>{trip.driver.name}</strong> upon boarding.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT COLUMN: BOOKING FORM (1/3 width) --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="flex justify-between items-center">
                    <span>Book Ticket</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(trip.base_price)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {trip.seats_available} seats remaining
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  <form
                    onSubmit={handleSubmit(onSubmitForm)}
                    className="space-y-4"
                  >
                    {/* Seats */}
                    <div className="space-y-2">
                      <Label>Number of Seats</Label>
                      <Input
                        type="number"
                        {...register("seats")}
                        min={1}
                        max={trip.seats_available}
                      />
                      {errors.seats && (
                        <span className="text-xs text-red-500">
                          {errors.seats.message}
                        </span>
                      )}
                    </div>

                    <Separator />

                    {/* Passenger Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Passenger Details</h4>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="John Doe"
                            {...register("fullName")}
                          />
                        </div>
                        {errors.fullName && (
                          <span className="text-xs text-red-500">
                            {errors.fullName.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="080 1234 5678"
                            {...register("phone")}
                          />
                        </div>
                        {errors.phone && (
                          <span className="text-xs text-red-500">
                            {errors.phone.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="john@example.com"
                            {...register("email")}
                          />
                        </div>
                        {errors.email && (
                          <span className="text-xs text-red-500">
                            {errors.email.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Total Price Display */}
                    <div className="flex justify-between items-center pt-2 font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full font-bold"
                      size="lg"
                      disabled={trip.seats_available === 0}
                    >
                      {trip.seats_available === 0
                        ? "Sold Out"
                        : "Proceed to Book"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION DIALOG --- */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Please review your details before confirming.
            </DialogDescription>
          </DialogHeader>

          {pendingData && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {trip.route.source} → {trip.route.destination}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateDisplay(trip.departure_time)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Passenger</p>
                  <p className="font-medium">{pendingData.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="font-medium">{pendingData.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Seats</p>
                  <p className="font-medium">{pendingData.seats}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-accent p-3 rounded-md font-bold">
                <span>Total To Pay</span>
                <span className="text-primary text-lg">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between flex-row gap-2">
            <div className="w-full gap-2 space-y-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="w-full"
              >
                Edit
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
