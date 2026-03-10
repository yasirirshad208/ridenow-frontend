
'use client';

import { useEffect, useState } from 'react';
import { type Car } from '@/lib/types';
import { Header } from '@/components/Header';
import Image from 'next/image';
import {
  Calendar,
  Gauge,
  Cog,
  Fuel,
  Users,
  Share2,
  ChevronRight,
  Check,
  MapPin,
  Plus,
  Minus,
  Car as CarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingForm } from '@/components/BookingForm';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MostSearchedCarCard } from '@/components/MostSearchedCarCard';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/Footer';
import { resolveImageUrl } from '@/lib/image-url';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchVehicleBySlug, fetchVehicles } from '@/services/vehicleService';


const faqs = [
  {
    question: "What documents do I need to rent a car?",
    answer: "You will need a valid driver's license, a credit card in your name, and a form of identification, such as a passport or national ID card."
  },
  {
    question: "Is there a minimum age to rent a vehicle?",
    answer: "Yes, the minimum age for renting a vehicle is typically 21 years old. However, drivers under 25 may be subject to a young driver surcharge."
  },
  {
    question: "Can I add an additional driver?",
    answer: "Yes, you can add additional drivers to your rental agreement. They must also meet the minimum age and license requirements. Additional fees may apply."
  },
  {
    question: "What is your fuel policy?",
    answer: "Our standard policy is 'full-to-full,' meaning you'll receive the car with a full tank of gas and are expected to return it full. Other options may be available."
  }
]

const shuffleArray = <T,>(array: T[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function FleetDetailPageClient({
  vehicleSlug,
}: {
  vehicleSlug: string;
}) {
  const { toast } = useToast();
  const [car, setCar] = useState<Car | null>(null);
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([]);
  const [isCarLoading, setIsCarLoading] = useState(true);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadVehicleData = async () => {
      setIsCarLoading(true);
      setIsRecommendedLoading(true);

      const loadCar = async () => {
        try {
          const vehicle = await fetchVehicleBySlug(vehicleSlug);
          if (isMounted) {
            setCar(vehicle);
          }
        } catch (error) {
          console.error('Failed to fetch vehicle details:', error);
          if (isMounted) {
            setCar(null);
          }
        } finally {
          if (isMounted) {
            setIsCarLoading(false);
          }
        }
      };

      const loadRecommendations = async () => {
        try {
          const recommendations = await fetchVehicles({ limit: 20 });
          if (isMounted) {
            setRecommendedCars(shuffleArray(recommendations.data || []).slice(0, 8));
          }
        } catch (error) {
          console.error('Failed to fetch recommended vehicles:', error);
          if (isMounted) {
            setRecommendedCars([]);
          }
        } finally {
          if (isMounted) {
            setIsRecommendedLoading(false);
          }
        }
      };

      await Promise.allSettled([loadCar(), loadRecommendations()]);
    };

    loadVehicleData();

    return () => {
      isMounted = false;
    };
  }, [vehicleSlug]);

  const mainImage = resolveImageUrl(car?.images?.[0]);
  const galleryImages = car?.images?.slice(1, 5).map(img => resolveImageUrl(img)).filter(Boolean) as string[];
  
  const handleShare = async () => {
    if (!car) return;

    const shareData = {
      title: `Check out the ${car.brand} ${car.model}`,
      text: `I found this ${car.name} on RideNow!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied!",
          description: "The car's URL has been copied to your clipboard.",
        });
      } catch (err) {
        console.error("Failed to copy:", err);
        toast({
          variant: "destructive",
          title: "Oops!",
          description: "Could not copy the link.",
        });
      }
    }
  };


  if (isCarLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 pt-28 md:pt-32 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>

          <div className="space-y-3 mb-6">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-56" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
            <Skeleton className="col-span-2 row-span-2 min-h-[240px] md:min-h-[400px] rounded-lg" />
            <Skeleton className="min-h-[116px] md:min-h-[192px] rounded-lg" />
            <Skeleton className="min-h-[116px] md:min-h-[192px] rounded-lg" />
            <Skeleton className="min-h-[116px] md:min-h-[192px] rounded-lg hidden md:block" />
            <Skeleton className="min-h-[116px] md:min-h-[192px] rounded-lg hidden md:block" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-52 w-full" />
            </div>
            <div className="md:col-span-1">
              <Skeleton className="h-[420px] w-full rounded-xl" />
            </div>
          </div>

          <div className="mt-12 md:mt-16 pt-8 border-t">
            <Skeleton className="h-8 w-52 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Vehicle not found</h1>
          <p className="text-muted-foreground">
            The car you are looking for does not exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/fleet">Back to Fleet</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  const overviewDetails = [
    { icon: CarIcon, label: 'Body', value: car.type || 'N/A' },
    { icon: Gauge, label: 'Mileage', value: car.mileage },
    { icon: Fuel, label: 'Fuel Type', value: car.fuelType },
    { icon: Calendar, label: 'Year', value: car.year },
    { icon: Cog, label: 'Transmission', value: car.transmission },
    { icon: Users, label: 'Seating', value: `${car.seatingCapacity} passengers` },
    // API doesn't provide engine details, we can remove or show N/A
    // { icon: GitCommitHorizontal, label: 'Engine', value: 'N_A' }, 
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 pt-28 md:pt-32 pb-8">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/fleet" className="hover:text-primary">Fleet</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground">{car.brand} {car.model}</span>
        </div>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div className="w-full">
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
                {car.brand} {car.model}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">{car.name}</p>

                <div className="flex md:hidden items-center justify-between">
                    <p className="text-2xl font-bold font-headline text-primary">
                        ${car.pricePerDay}
                        <span className="text-sm font-normal text-muted-foreground">/day</span>
                    </p>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                </div>
            </div>

            <div className="hidden md:flex flex-col items-end gap-2">
                 <p className="text-4xl font-bold font-headline text-primary">
                    ${car.pricePerDay}
                    <span className="text-sm font-normal text-muted-foreground">/day</span>
                </p>
                <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
            </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
          <div className="col-span-2 row-span-2 relative min-h-[240px] md:min-h-[400px] rounded-lg overflow-hidden">
            {mainImage && (
              <Image
                src={mainImage}
                alt={car.name}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          {galleryImages.map((src, index) => (
            <div key={index} className={`relative min-h-[116px] md:min-h-[192px] rounded-lg overflow-hidden ${index >= 2 ? 'hidden md:block' : ''}`}>
              <Image
                src={src}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
           {/* Fill remaining gallery slots if API gives less than 4 extra images */}
          {Array.from({ length: Math.max(0, 4 - galleryImages.length) }).map((_, index) => (
              <div key={`placeholder-${index}`} className={`relative min-h-[116px] md:min-h-[192px] rounded-lg overflow-hidden ${index + galleryImages.length >= 2 ? 'hidden md:block' : ''}`}>
                  <Image src={`https://picsum.photos/seed/gallery${index+5}/800/600`} alt="placeholder" fill className="object-cover" />
              </div>
          ))}
        </div>

        {/* Details and Booking Form */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2">
            
            {/* Car Overview */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">Car Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-muted-foreground">
                {overviewDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-3">
                       <detail.icon className="h-5 w-5 text-primary" />
                       <span className="font-medium capitalize">{detail.label}</span>
                    </div>
                    <span className="text-right text-foreground capitalize">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 text-muted-foreground mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Description</h3>
                <p>{car.description || `Discover the perfect blend of style, performance, and comfort with the ${car.brand} ${car.model}. This vehicle is an excellent choice for both city driving and long-distance journeys, offering a smooth ride and impressive fuel efficiency.`}</p>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
             <div className="mb-8 md:mb-0">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                    FAQs
                </h3>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="bg-white border shadow-sm rounded-lg">
                        <AccordionTrigger className="flex justify-between items-center w-full p-4 md:p-6 text-base md:text-lg font-semibold text-left hover:no-underline [&[data-state=open]>div>svg.plus]:hidden [&[data-state=closed]>div>svg.minus]:hidden">
                            {faq.question}
                            <div className="ml-4 flex-shrink-0 p-2 rounded-full bg-primary text-primary-foreground">
                                <Plus className="h-5 w-5 plus" />
                                <Minus className="h-5 w-5 minus" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground px-4 pb-4 md:px-6 md:pb-6">
                        {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
            </div>

          </div>
          <div className="md:col-span-1">
             <div className="sticky top-2.5">
                <BookingForm selectedCar={car} />
             </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-foreground mb-8">
            Our Location
          </h2>
          <div className="relative h-80 md:h-[400px] rounded-lg overflow-hidden border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12090.545839739433!2d-74.00594132857448!3d40.7127753443171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a1b3c955555%3A0x6a2c2fac288e136b!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1685000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="flex items-center gap-2 text-lg text-muted-foreground mt-4">
            <MapPin className="h-5 w-5 text-primary" />
            <span>123 Car Rental Lane, Auto City, AC 54321</span>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold font-headline text-foreground">Recommended Cars</h2>
            <Link href="/fleet" className="text-primary hover:underline flex items-center gap-2">
              <span>View all</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {isRecommendedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          ) : recommendedCars.length > 0 ? (
            <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {recommendedCars.map((recCar) => (
                    <CarouselItem key={recCar._id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-1 h-full">
                        <MostSearchedCarCard car={recCar} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-2 mt-8">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
          ) : (
            <p className="text-muted-foreground">No recommended cars available right now.</p>
          )}
        </div>


      </main>
      <Footer />
    </div>
  );
}

    
