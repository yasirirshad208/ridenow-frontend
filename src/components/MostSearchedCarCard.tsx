
'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gauge, Fuel, Cog } from 'lucide-react';
import Link from 'next/link';
import { Separator } from './ui/separator';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/image-url';

type MostSearchedCarCardProps = {
  car: Car;
};

export function MostSearchedCarCard({ car }: MostSearchedCarCardProps) {
  const images = car.images?.slice(0, 3) || [];
  const placeholderImage = 'https://picsum.photos/seed/car-placeholder/600/400';

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl">
      <Carousel setApi={setApi} className="relative w-full group">
        <CarouselContent>
          {images.length > 0 ? (
            images.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative h-52 w-full">
                  <Link href={`/fleet/${car.slug}`} className="block h-full w-full">
                    <Image
                      src={resolveImageUrl(img) || placeholderImage}
                      alt={`${car.name} image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover rounded-t-xl"
                    />
                  </Link>
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="relative h-52 w-full">
                <Link href={`/fleet/${car.slug}`} className="block h-full w-full">
                  <Image
                    src={placeholderImage}
                    alt={car.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-t-xl"
                  />
                </Link>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
         {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/30 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                            'h-1.5 rounded-full transition-all',
                            current === index ? 'w-6 bg-white' : 'w-4 bg-white/50'
                        )}
                    />
                ))}
            </div>
        )}
      </Carousel>
      <CardContent className="p-4 flex flex-col space-y-4 flex-grow">
        <div className="space-y-1">
          <Link href={`/fleet/${car.slug}`}>
            <h3 className="font-headline text-[18px] font-medium text-foreground hover:text-primary transition-colors capitalize">
              {car.brand} {car.model}
            </h3>
          </Link>
          <p className="text-sm text-foreground capitalize">{car.name}</p>
        </div>
        <div className="flex-grow space-y-4">
          <Separator />
          <div className="flex justify-between text-foreground">
            <div className="flex flex-col items-center gap-1">
              <Gauge className="h-4 w-4 text-foreground" />
              <span className="text-[14px]">{car.mileage}</span>
            </div>
            <div className="flex flex-col items-center gap-1 capitalize">
              <Fuel className="h-4 w-4 text-foreground" />
              <span className="text-[14px]">{car.fuelType}</span>
            </div>
            <div className="flex flex-col items-center gap-1 capitalize">
              <Cog className="h-4 w-4 text-foreground" />
              <span className="text-[14px]">{car.transmission}</span>
            </div>
          </div>
          <Separator />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">
            ${car.pricePerDay}
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </p>
          <Button asChild variant="link" className="p-0 h-auto text-primary">
            <Link href={`/fleet/${car.slug}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
