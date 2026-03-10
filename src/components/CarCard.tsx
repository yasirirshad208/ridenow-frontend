import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, DollarSign } from 'lucide-react';

type CarCardProps = {
  car: Car;
  onBookNow: (car: Car) => void;
};

export function CarCard({ car, onBookNow }: CarCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === car.imageId);

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        {image && (
          <div className="relative h-48 w-full">
            <Image
              src={image.imageUrl}
              alt={image.description}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={image.imageHint}
            />
          </div>
        )}
        <div className="p-6 pb-0">
          <CardTitle className="font-headline text-2xl">
            {car.make} {car.model}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 pt-2">
            <CalendarDays className="h-4 w-4" />
            <span>{car.year}</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
          <DollarSign className="h-5 w-5" />
          <span>{car.pricePerDay} / day</span>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button onClick={() => onBookNow(car)} className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
