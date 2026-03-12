
'use client';

import { Suspense, useEffect, useState } from 'react';
import type { Car as CarType } from '@/lib/types';
import { Header } from '@/components/Header';
import { FilterForm } from '@/components/FilterForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { MostSearchedCarCard } from '@/components/MostSearchedCarCard';
import Link from 'next/link';
import { MoveUpRight, Check, Star, Smartphone, KeyRound, ArrowRight, ListX, Map, Calendar, Smile } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchVehicles } from '@/services/vehicleService';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Car } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Frequent Traveler',
    avatar: 'https://i.pravatar.cc/150?img=1',
    testimonial: 'RideNow has completely transformed my travel experience. Their wide selection of cars and seamless booking process make every trip a breeze. I wouldn’t choose anyone else!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Business Owner',
    avatar: 'https://i.pravatar.cc/150?img=2',
    testimonial:
      'As a business owner, I need reliable and high-quality vehicles for my team. RideNow consistently delivers top-notch cars and exceptional customer service. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Jessica Patel',
    role: 'Vacationer',
    avatar: 'https://i.pravatar.cc/150?img=3',
    testimonial:
      'The customer service at RideNow is outstanding. They went above and beyond to ensure our family had the perfect car for our vacation. The process was smooth and hassle-free.',
    rating: 5,
  },
  {
    name: 'David Miller',
    role: 'Road Tripper',
    avatar: 'https://i.pravatar.cc/150?img=4',
    testimonial:
      'I love the transparency and fair pricing. No hidden fees, just great cars at great prices. RideNow is my go-to for all my road trip adventures.',
    rating: 5,
  },
];

const brands = [
    { name: 'Audi', logo: 'https://boxcar-nextjs.vercel.app/_next/image?url=%2Fimages%2Fresource%2Fbrand-1.png&w=128&q=75', width: 90, height: 30 },
    { name: 'BMW', logo: 'https://boxcar-nextjs.vercel.app/_next/image?url=%2Fimages%2Fresource%2Fbrand-2.png&w=96&q=75', width: 60, height: 60 },
    { name: 'Ford', logo: 'https://boxcar-nextjs.vercel.app/_next/image?url=%2Fimages%2Fresource%2Fbrand-3.png&w=128&q=75', width: 90, height: 30 },
    { name: 'Mercedes Benz', logo: 'https://boxcar-nextjs.vercel.app/_next/image?url=%2Fimages%2Fresource%2Fbrand-4.png&w=128&q=75', width: 90, height: 30 },
    { name: 'Peugeot', logo: 'https://boxcar-nextjs.vercel.app/_next/image?url=%2Fimages%2Fresource%2Fbrand-5.png&w=96&q=75', width: 60, height: 60 },
    { name: 'Volkswagen', logo: 'https://boxcar-nextjs.vercel.app/_next/image?url=%2Fimages%2Fresource%2Fbrand-6.png&w=96&q=75', width: 60, height: 60 },
]

type CarCategory = 'all' | 'suv' | 'sedan' | 'electric';

const shuffleArray = <T,>(array: T[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function HomePageClient() {
  const [allCars, setAllCars] = useState<CarType[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CarCategory>('all');

  useEffect(() => {
    let isMounted = true;

    const loadCars = async () => {
      setLoading(true);
      try {
        const response = await fetchVehicles({ limit: 20 });
        const shuffled = shuffleArray(response.data || []);
        if (isMounted) {
          setAllCars(shuffled);
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCars();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredCars(allCars.slice(0, 8));
    } else {
      const categoryCars = allCars.filter(car => car.type === activeCategory);
      setFilteredCars(categoryCars.slice(0, 8));
    }
  }, [activeCategory, allCars]);


  const handleFilterSubmit = (filters: Record<string, string | undefined>) => {
    const queryEntries = Object.entries(filters).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        value !== 'all' &&
        value !== 'undefined' &&
        value !== 'null'
    ) as [string, string][];

    const queryString = new URLSearchParams(queryEntries).toString();
    router.push(queryString ? `/fleet?${queryString}` : '/fleet');
  };


  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');
  const bestDealImage = PlaceHolderImages.find((img) => img.id === 'best-deal-car');
  const specialOfferSportsCar = PlaceHolderImages.find((img) => img.id === 'special-offer-sports-car');
  const specialOfferSuv = PlaceHolderImages.find((img) => img.id === 'special-offer-suv');
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <div className="relative bg-black">
            <div className="absolute inset-0 z-10">
            {heroImage && (
                <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover opacity-50"
                data-ai-hint={heroImage.imageHint}
                priority
                />
            )}
            </div>
            <div className="relative z-20 flex flex-col items-center justify-center text-center min-h-[600px] md:min-h-[700px] text-white p-4 gap-8">
               <div className="grid gap-4 text-center">
                    <p className="text-lg md:text-xl text-gray-200">
                        Find cars for sale and for rent near you
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold font-headline">
                        Find Your Perfect Car
                    </h2>
                </div>
                <div className="w-full max-w-4xl mx-auto relative z-30">
                    <Suspense fallback={<div className="h-[172px] w-full rounded-xl bg-white/90" />}>
                      <FilterForm onFilterChange={handleFilterSubmit} />
                    </Suspense>
                </div>
            </div>
        </div>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-wrap justify-between items-center gap-4 md:mb-8 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline text-foreground">Featured Vehicles</h2>
              <p className="text-muted-foreground mt-1">Discover our handpicked selection of top-quality vehicles.</p>
            </div>
            <div className="w-full md:w-auto flex flex-wrap items-center justify-between gap-y-4 gap-x-2">
              <div className="flex items-center gap-2 flex-wrap">
                {(['all', 'suv', 'sedan', 'electric'] as CarCategory[]).map(category => (
                   <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                        activeCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    <span className="capitalize">{category}</span>
                  </button>
                ))}
              </div>
              <div className="flex-shrink-0">
                <Link href="/fleet" className="text-primary hover:underline flex items-center gap-1">
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-52 w-full rounded-t-xl" />
                    <CardContent className="p-4 space-y-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex justify-between items-center pt-4">
                         <Skeleton className="h-8 w-1/3" />
                         <Skeleton className="h-8 w-1/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredCars.map((car) => (
                  <MostSearchedCarCard key={car._id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center col-span-full py-16">
                  <ListX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold">No Vehicles Found</h3>
                  <p className="text-muted-foreground mt-2">No vehicles found in this category. Try another one!</p>
              </div>
            )}
        </section>

        <section className="bg-secondary py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-12">
              Special Offers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Weekend Special */}
              <Card className="overflow-hidden flex flex-col md:flex-row items-stretch shadow-lg">
                <div className="relative w-full md:w-1/2 min-h-[250px] md:min-h-full">
                  {specialOfferSportsCar && (
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjXyRI7L2ImjVzsd-3oToB2IHpZ1u4lShimAO0p6iw1JV0_N8CDLhSyQvKvIr_SoIb7xKn-cqdb9U9J3b5pwnZQTz6BxCGEz128r6Q_UebzKUUtUj7gpJIAYeOOlkuoNQjVtEKRP4X9XuQJ8En4L9AU96vABvFf0LzegV2tWpozHDhZ16J-iBp7SNWBiQiJdKi1i0fsMxX44UNWQvbeRdn7iedHTM5mYgLZI4cej1JNbDegidU9cWOBHwYzEwijlqpjSKuiw_P6k6q"
                      alt={specialOfferSportsCar.description}
                      fill
                      className="object-cover"
                      data-ai-hint={specialOfferSportsCar.imageHint}
                    />
                  )}
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-8 text-left space-y-4 flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-muted-foreground">Weekend Special</h3>
                  <p className="text-3xl md:text-4xl font-bold text-primary">35% OFF</p>
                  <p className="text-muted-foreground">
                    On all luxury and sports car rentals. Limited time offer.
                  </p>
                  <Button className="w-full">Claim Offer</Button>
                </div>
              </Card>
              {/* Weekly Deal */}
              <Card className="overflow-hidden flex flex-col md:flex-row items-stretch shadow-lg">
                 <div className="relative w-full md:w-1/2 min-h-[250px] md:min-h-full">
                  {specialOfferSuv && (
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf_mTw8VOZFUgQ2AYbPfiUdYow37tjcd49vdFatQsXsCvuRHbv6xavvXLPUiEfvOpv__NJowbClz9rdm4ePaFM2Rj8w9O4Zcuj_i3VC26goWSA59JnriM0uvtkkTu6IyUBXZmEdzmFl-zR4r3O8WhnEZ2KoxQ5XHIt3WlKhk3OObRZ5HZxhlgbp1oE0yaUk0hUBP5G6lIlNv6fYs_iOS523WMTmA-ROHNwP379EsV1lFhz8SIneb-wCVbcN8wOKys0cQmKOVt6crwL"
                      alt={specialOfferSuv.description}
                      fill
                      className="object-cover"
                      data-ai-hint={specialOfferSuv.imageHint}
                    />
                  )}
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-8 text-left space-y-4 flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-muted-foreground">Weekly Deal</h3>
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    $99<span className="text-lg font-medium text-muted-foreground">/day</span>
                  </p>
                  <p className="text-muted-foreground">
                    Rent any SUV for a week and get this exclusive daily rate.
                  </p>
                  <Button className="w-full">Claim Offer</Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-12 text-foreground">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              <div className="flex flex-col items-start text-left">
                <div className='mb-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="51" height="60" viewBox="0 0 51 60" fill="none"><g clipPath="url(#clip0_24_628)"><path d="M22.9688 52.9676C22.9688 52.7320 22.8270 52.5195 22.6096 52.4289C20.0682 51.3695 18.2812 48.8627 18.2812 45.9375V23.4375C18.2812 20.5123 20.0682 18.0054 22.6096 16.9461C22.8270 16.8555 22.9688 16.6429 22.9688 16.4074V16.4062H18.2812C14.3980 16.4062 11.25 19.5543 11.25 23.4375V45.9375C11.25 49.8207 14.3980 52.9688 18.2812 52.9688H22.9688V52.9676Z" fill="#EEF1FB"></path><path d="M23.3708 41.3167L36.6292 28.0583" stroke="#FF5CF4" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M30 21.0938L44.0625 2.34375" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15.9375 2.34375L25.3895 12.9483" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M48.75 30V23.4375C48.75 19.5543 45.6020 16.4062 41.7188 16.4062H38.0747C36.4508 13.6159 33.4612 11.7188 30 11.7188C26.5388 11.7188 23.5493 13.6159 21.9253 16.4062H18.2812C14.3980 16.4062 11.25 19.5543 11.25 23.4375V45.9375C11.25 49.8207 14.3980 52.9688 18.2812 52.9688H21.9253C23.5492 55.7591 26.5388 57.6562 30 57.6562C33.4612 57.6562 36.4507 55.7591 38.0747 52.9688H41.7188C45.6020 52.9688 48.75 49.8207 48.75 45.9375V39.375" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path></g><defs><clipPath id="clip0_24_628"><rect width="51" height="60" fill="white"></rect></clipPath></defs></svg>
                </div>
                <h3 className="text-[20px] font-medium mb-2 text-foreground">Special Financing Offers</h3>
                <p className="text-foreground text-[15px] font-normal pr-0 sm:pr-8 md:pr-14">Our stress-free finance department that can find financial solutions to save you money.</p>
              </div>
              <div className="flex flex-col items-start text-left">
                <div className='mb-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none"><path d="M30 2.34375V7.03125" stroke="#FF5CF4" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M48.75 2.34375L44.0625 7.03125" stroke="#FF5CF4" strokeWidth="3" strokeMiterlimit="Ionicons/logo-instagram" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15.4738 36.6607C14.3072 35.4056 13.5938 33.7236 13.5938 31.875C13.5938 30.7464 13.8596 29.68 14.3323 28.7347L19.0198 19.3597C20.1732 17.0529 22.5579 15.4688 25.3125 15.4688H18.2812C15.5266 15.4688 13.1420 17.0529 11.9885 19.3597L7.30102 28.7347C6.82840 29.68 6.5625 30.7464 6.5625 31.875C6.5625 33.7236 7.27594 35.4056 8.44254 36.6607L26.5658 56.1592C27.4218 57.0802 28.6436 57.6562 30 57.6562C31.3564 57.6562 32.5782 57.0802 33.4342 56.1593L33.5156 56.0716L15.4738 36.6607Z" fill="#EEF1FB"></path><path d="M48.0115 19.3597L52.6990 28.7347C53.1716 29.6798 53.4375 30.7464 53.4375 31.875C53.4375 33.7236 52.7241 35.4057 51.5575 36.6608L33.4342 56.1593C32.5782 57.0802 31.3564 57.6562 30 57.6562C28.6436 57.6562 27.4218 57.0802 26.5658 56.1593L8.44254 36.6608C7.27594 35.4057 6.5625 33.7236 6.5625 31.875C6.5625 30.7464 6.82840 29.6798 7.30102 28.7347L11.9885 19.3597C13.1420 17.0528 15.5266 15.4688 18.2812 15.4688H41.7188C44.4734 15.4688 46.8580 17.0528 48.0115 19.3597Z" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M11.25 2.34375L15.9375 7.03125" stroke="#FF5CF4" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round"></path><path d="M17.3849 29.5312H42.6151" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M25.3125 24.8438L30 29.5312L34.6875 24.8438" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M30 43.5938V29.7306" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
                <h3 className="text-[20px] font-medium mb-2 text-foreground">Trusted Car Dealership</h3>
                <p className="text-foreground text-[15px] font-normal pr-0 sm:pr-8 md:pr-14">Our stress-free finance department that can find financial solutions to save you money.</p>
              </div>
              <div className="flex flex-col items-start text-left">
                <div className='mb-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none"><g clipPath="url(#clip0_24_681)"><path d="M8.75576 36.7478L35.3054 10.198C37.1360 8.36741 40.1040 8.36741 41.9346 10.198L36.8955 5.15894C35.0649 3.32837 32.0970 3.32837 30.2664 5.15894L3.71671 31.7087C1.88613 33.5393 1.88613 36.5073 3.71671 38.3378L8.75576 43.3768C6.92518 41.5462 6.92518 38.5783 8.75576 36.7478Z" fill="#EEF1FB"></path><path d="M50.1537 18.4171C51.9843 20.2477 51.9843 23.2157 50.1537 25.0463L23.6039 51.5959C21.7734 53.4265 18.8054 53.4265 16.9748 51.5959L3.71671 38.3378C1.88613 36.5072 1.88613 33.5392 3.71671 31.7086L30.2664 5.15894C32.0970 3.32836 35.0649 3.32836 36.8955 5.15894L43.5247 11.7881L52.9689 2.34387" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M18.9633 31.0458C18.7631 32.4554 19.2051 33.9388 20.2894 35.0231C22.1200 36.8537 25.0880 36.8537 26.9186 35.0231C28.7492 33.1926 28.7492 30.2246 26.9186 28.394C25.0880 26.5634 25.0880 23.5954 26.9186 21.7648C28.7492 19.9342 31.7172 19.9342 33.5478 21.7648C34.6321 22.8491 35.0741 24.3325 34.8739 25.7421" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16.9749 38.3378L20.2894 35.0232" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M33.5476 21.765L36.8621 18.4504" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M43.5938 57.6562L57.6563 43.5937" stroke="#FF5CF3" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path></g><defs><clipPath id="clip0_24_681"><rect width="60" height="60" fill="white"></rect></clipPath></defs></svg>
                </div>
                <h3 className="text-[20px] font-medium mb-2 text-foreground">Transparent Pricing</h3>
                <p className="text-foreground text-[15px] font-normal pr-0 sm:pr-8 md:pr-14">Our stress-free finance department that can find financial solutions to save you money.</p>
              </div>
              <div className="flex flex-col items-start text-left">
                <div className='mb-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none"><path d="M23.5465 4.45312C19.8452 4.45312 16.4904 6.63082 14.9836 10.0114L8.88656 23.6906C5.23148 23.9418 2.34375 26.9843 2.34375 30.7031V36.0938C2.34375 39.3298 4.96711 41.9531 8.20312 41.9531H9.80918C9.81785 41.5022 9.82934 41.0514 9.84375 40.6005C9.46230 39.8230 9.24727 38.9490 9.24727 38.0245L9.14062 33.8672C9.14062 30.7927 9.76617 29.6094 12.0483 29.1497C13.1331 28.9311 14.0413 28.1920 14.4858 27.1786L22.0148 10.0114C23.5215 6.63082 26.8764 4.45312 30.5777 4.45312H23.5465Z" fill="#EEF1FB"></path><path d="M8.20312 41.9531C4.96711 41.9531 2.34375 39.3298 2.34375 36.0938V30.7031C2.34375 26.9843 5.23148 23.9418 8.88656 23.6906L14.9836 10.0114C16.4903 6.63082 19.8451 4.45312 23.5465 4.45312H34.2217C37.7441 4.45312 40.9692 6.42750 42.5711 9.56461L45.5859 15.4688M57.6562 30.7031C57.6562 26.8199 54.5082 23.6719 50.6250 23.6719H18.6328M28.2422 15.4688V4.57031M32.4609 41.9531H27.1873M20.7420 37.2656C18.1532 37.2656 16.0545 39.3643 16.0545 41.9531C16.0545 44.5419 18.1532 46.6406 20.7420 46.6406C23.3307 46.6406 25.4295 44.5419 25.4295 41.9531C25.4295 39.3643 23.3309 37.2656 20.7420 37.2656Z" stroke="#405FF2" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M57.6562 41.6016C57.6562 46.0997 54.0098 49.8047 49.5117 49.8047C45.0136 49.8047 41.3672 46.1583 41.3672 41.6602C41.3672 37.1620 45.0722 33.5156 49.5703 33.5156M43.5352 48.1055L36.0938 55.5469" stroke="#FF5CF3" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
                <h3 className="text-[20px] font-medium mb-2 text-foreground">Expert Car Service</h3>
                <p className="text-foreground text-[15px] font-normal pr-0 sm:pr-8 md:pr-14">Our stress-free finance department that can find financial solutions to save you money.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
                {bestDealImage && (
                  <Image
                    src={bestDealImage.imageUrl}
                    alt={bestDealImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={bestDealImage.imageHint}
                  />
                )}
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
                  Get The Best Deal On Your Car Rental — Book With Us Today
                </h2>
                <p className="text-muted-foreground">
                  We are committed to providing our customers with exceptional service, competitive rental rates, and a wide selection of vehicles to suit every need.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <span>As the leading car rental provider, we have more locations and vehicles available than anyone else.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <span>Enjoy 24/7 customer support and roadside assistance wherever you go.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <span>Drive confidently — our cars are reliable, well-maintained, and ready for your next journey.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground text-center mb-12">
              Top Brands We Deal With
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {brands.map((brand) => (
                <div key={brand.name} className="group bg-white border border-[#e1e1e1] rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 h-[180px] transition-all duration-300 ease-in-out hover:border-primary">
                  <div className="flex-grow flex items-center justify-center">
                    <Image src={brand.logo} alt={brand.name} width={brand.width} height={brand.height} className="transition-transform duration-300 ease-in-out group-hover:scale-110" />
                  </div>
                  <p className="text-[18px] text-foreground mt-auto">{brand.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-8 md:mb-12 text-center text-foreground">
              What Our Customers Say
            </h2>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="flex flex-col h-full shadow-lg rounded-xl">
                        <CardContent className="flex-grow p-6 space-y-6">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-foreground/80 text-lg leading-relaxed">"{testimonial.testimonial}"</p>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                           <div className="flex items-center gap-4">
                            <Avatar className='h-12 w-12'>
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-8">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="text-foreground">
                <h3 className="text-3xl md:text-4xl font-semibold">620M</h3>
                <p className="text-sm md:text-base font-normal">CARS RENTED</p>
              </div>
              <div className="text-foreground">
                <h3 className="text-3xl md:text-4xl font-semibold">540M</h3>
                <p className="text-sm md:text-base font-normal">CUSTOMER REVIEWS</p>
              </div>
              <div className="text-foreground">
                <h3 className="text-3xl md:text-4xl font-semibold">85M</h3>
                <p className="text-sm md:text-base font-normal">VISITORS PER DAY</p>
              </div>
              <div className="text-foreground">
                <h3 className="text-3xl md:text-4xl font-semibold">210M</h3>
                <p className="text-sm md:text-base font-normal">VERIFIED RENTAL LOCATIONS</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
