
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addDays, format, differenceInCalendarDays } from 'date-fns';
import { createBooking, type BookingState } from '@/app/actions';
import type { Car } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, LoaderCircle, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import type { DateRange } from 'react-day-picker';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';


const initialState: BookingState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full mt-[-8px]">
      {pending ? <><LoaderCircle className="animate-spin mr-2" /> Confirming...</> : 'Confirm Booking'}
    </Button>
  );
}

const locations = [
    'JFK Airport, New York',
    'Downtown Manhattan, NY',
    'Brooklyn, NY',
    'LaGuardia Airport, NY',
    'Newark Liberty Airport, NJ'
]

export function BookingForm({ selectedCar }: { selectedCar: Car | null }) {
  const { user } = useAuth();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4),
  });
  const { toast } = useToast();
  const [state, formAction] = useActionState(createBooking, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  useEffect(() => {
    if (state.message && state.bookingDetails) {
        setIsBookingConfirmed(true);
    }
    if (state.error) {
        toast({
            variant: "destructive",
            title: "Booking failed",
            description: state.error,
        });
    }
  }, [state, toast]);

  useEffect(() => {
    if (selectedCar) {
        setIsBookingConfirmed(false);
        formRef.current?.reset();
        setDate({
            from: new Date(),
            to: addDays(new Date(), 4),
        });
    }
  }, [selectedCar]);

  const rentalDays = useMemo(() => {
    if (date?.from && date?.to) {
      return differenceInCalendarDays(date.to, date.from) + 1;
    }
    return 0;
  }, [date]);

  const totalPrice = useMemo(() => {
    if (selectedCar && rentalDays > 0) {
      return rentalDays * selectedCar.pricePerDay;
    }
    return 0;
  }, [selectedCar, rentalDays]);

  if (isBookingConfirmed && state.bookingDetails) {
    return (
        <Card className="transition-all duration-300">
            <CardHeader>
                 <CardTitle className="font-headline text-2xl">Booking Confirmed!</CardTitle>
                 <CardDescription>Your car is reserved.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <p className="text-lg font-semibold">{state.message}</p>
                <div className="text-left bg-secondary p-4 rounded-md space-y-2">
                    <p><strong>Car:</strong> {state.bookingDetails.car}</p>
                    <p><strong>Dates:</strong> {state.bookingDetails.dates}</p>
                    <p><strong>Pickup:</strong> {state.bookingDetails.pickupLocation}</p>
                    <p><strong>Dropoff:</strong> {state.bookingDetails.dropoffLocation}</p>
                    {state.bookingDetails.specialRequests && <p><strong>Requests:</strong> {state.bookingDetails.specialRequests}</p>}
                </div>
                <Button onClick={() => setIsBookingConfirmed(false)} className="w-full mt-4">Book Another Car</Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="transition-all duration-300">
      <CardHeader className="mb-[-24px]">
        <CardTitle className="font-headline text-2xl">
          {selectedCar ? `Book: ${selectedCar.brand} ${selectedCar.model}` : 'Book Your Car'}
        </CardTitle>
        <CardDescription>
          {selectedCar ? 'Complete your details to finalize the booking.' : 'Select a car from the list to start booking.'}
        </CardDescription>
      </CardHeader>
      {selectedCar ? (
        !user ? (
             <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-8 text-center">
                    <KeyRound className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Login to Continue</h3>
                    <p className='text-muted-foreground mb-6'>You need to be logged in to book a car.</p>
                    <Button asChild className="w-full">
                        <Link href="/login">Login or Register</Link>
                    </Button>
                </div>
            </CardContent>
        ) : (
            <>
            <form action={formAction} ref={formRef}>
                <input type="hidden" name="carId" value={selectedCar._id} />
                <input type="hidden" name="carName" value={`${selectedCar.brand} ${selectedCar.model}`} />
                <input type="hidden" name="userId" value={user.data.user._id} />
                <input type="hidden" name="token" value={user.token} />
                {date?.from && <input type="hidden" name="startDate" value={format(date.from, 'yyyy-MM-dd')} />}
                {date?.to && <input type="hidden" name="endDate" value={format(date.to, 'yyyy-MM-dd')} />}
                <CardContent className="space-y-3">
                <div className="grid gap-2">
                    <Label>Rental Dates</Label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="date"
                        variant="outline"
                        className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                            <>
                                {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                            </>
                            ) : (
                            format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        disabled={{ before: new Date() }}
                        />
                    </PopoverContent>
                    </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="pickupLocation">Pickup Location</Label>
                    <Select name="pickupLocation" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map(location => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="dropoffLocation">Dropoff Location</Label>
                    <Select name="dropoffLocation" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map(location => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <Textarea id="specialRequests" name="specialRequests" placeholder="e.g., Child seat, GPS" />
                </div>


                {totalPrice > 0 && (
                    <div className="p-4 bg-secondary rounded-md text-center">
                    <p className="text-muted-foreground">Total Price for {rentalDays} days</p>
                    <p className="text-3xl font-bold font-headline text-primary">${totalPrice}</p>
                    </div>
                )}
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-4">
                <SubmitButton />
                {state.error && !state.message && (
                    <div className="text-destructive text-sm flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p>{state.error}</p>
                    </div>
                )}
                </CardFooter>
            </form>
            </>
        )
      ) : (
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed p-4 text-center text-muted-foreground">
            <p>Please select a car from the list to see booking options.</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
