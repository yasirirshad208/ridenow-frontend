'use client';

import { useEffect, useState } from 'react';
import type { Reservation } from '@/lib/types';
import { Header } from '@/components/Header';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Car, Calendar, DollarSign, Tag, Info, ListX } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { resolveImageUrl } from '@/lib/image-url';
import { fetchUserReservations } from '@/services/reservationService';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-blue-100 text-blue-800 border-blue-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export function ReservationsPageClient({ token }: { token: string }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReservations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchUserReservations(token);
        if (isMounted) {
          setReservations(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch reservations.');
          setReservations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReservations();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 md:pt-28 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-foreground">
          My Reservations
        </h1>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="h-48 md:h-auto w-full md:w-1/3" />
                  <div className="flex-grow p-4 md:p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-56" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                      <Skeleton className="h-7 w-20" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : reservations.length === 0 ? (
          <Card className="text-center p-8 md:p-12">
            <ListX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Reservations Found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              You haven&apos;t booked any cars yet. Ready to find your perfect ride?
            </p>
            <Button asChild>
              <Link href="/fleet" prefetch>
                Explore Our Fleet
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <Card key={reservation._id} className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-48 md:h-auto w-full md:w-1/3 flex-shrink-0 bg-secondary">
                    {reservation.vehicle?.images?.[0] ? (
                      <Image
                        src={
                          resolveImageUrl(reservation.vehicle.images[0]) ||
                          'https://picsum.photos/seed/car-placeholder/600/400'
                        }
                        alt={`${reservation.vehicle.brand} ${reservation.vehicle.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                      <div>
                        <CardTitle className="font-headline text-xl md:text-2xl capitalize mb-1">
                          {reservation.vehicle.brand} {reservation.vehicle.model}
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {reservation.vehicle.name}
                        </CardDescription>
                      </div>
                      <Badge className={`mt-2 sm:mt-0 capitalize self-start ${statusStyles[reservation.status]}`}>
                        {reservation.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground mt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>
                          {format(new Date(reservation.startDate), 'PPP')} to{' '}
                          {format(new Date(reservation.endDate), 'PPP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span>Booking ID: {reservation._id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        <span className="capitalize">Pickup: {reservation.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        <span className="capitalize">Dropoff: {reservation.dropoffLocation}</span>
                      </div>
                    </div>

                    <div className="flex justify-end items-center mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-xl font-bold text-primary">
                        <DollarSign className="h-5 w-5" />
                        <span>{reservation.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
