
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Car } from '@/lib/types';
import { Header } from '@/components/Header';
import { MostSearchedCarCard } from '@/components/MostSearchedCarCard';
import { FilterForm } from '@/components/FilterForm';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, ListX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { fetchVehicles } from '@/services/vehicleService';

const CARS_PER_PAGE = 12;

type FilterParams = {
  [key: string]: string | undefined;
};

type SearchParams = Record<string, string | string[] | undefined>;

const toSingleParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const toSearchParams = (params: SearchParams) => {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const singleValue = toSingleParam(value);
    if (singleValue !== undefined && singleValue !== '') {
      next.set(key, singleValue);
    }
  }
  return next;
};

export default function FleetPageClient({ searchParams }: { searchParams: SearchParams }) {
  const router = useRouter();
  const pathname = usePathname();

  const [allCars, setAllCars] = useState<Car[]>([]);
  const [displayedCars, setDisplayedCars] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(toSingleParam(searchParams.sort) || 'createdAt-desc');
  const [loading, setLoading] = useState(true);

  const brand = toSingleParam(searchParams.brand) || undefined;
  const type = toSingleParam(searchParams.type) || undefined;
  const fuelType = toSingleParam(searchParams.fuelType) || undefined;
  const transmission = toSingleParam(searchParams.transmission) || undefined;
  const seatingCapacityParam = toSingleParam(searchParams.seatingCapacity) || undefined;
  const price = toSingleParam(searchParams.price) || undefined;
  const sortParam = toSingleParam(searchParams.sort) || 'createdAt-desc';

  const [minPriceRaw, maxPriceRaw] = price?.split('-') ?? [];
  const parsedMinPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
  const parsedMaxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
  const parsedSeatingCapacity = seatingCapacityParam ? Number(seatingCapacityParam) : undefined;
  const minPrice = Number.isFinite(parsedMinPrice) ? parsedMinPrice : undefined;
  const maxPrice = Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : undefined;
  const seatingCapacity = Number.isFinite(parsedSeatingCapacity) ? parsedSeatingCapacity : undefined;

  const createQueryString = useCallback(
    (params: Record<string, string | number | undefined | null>) => {
      const newSearchParams = toSearchParams(searchParams);
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  const sortCars = useCallback((carsToSort: Car[], sortOrder: string) => {
    const sorted = [...carsToSort];
    sorted.sort((a, b) => {
        const [key, direction] = sortOrder.split('-');
        const dir = direction === 'asc' ? 1 : -1;
        
        let valA: any;
        let valB: any;

        switch(key) {
            case 'pricePerDay':
                valA = a.pricePerDay;
                valB = b.pricePerDay;
                break;
            case 'year':
                valA = a.year;
                valB = b.year;
                break;
            case 'createdAt': // Assuming 'createdAt' exists on the data, if not, might need a default sort.
                 // The API doesn't seem to provide createdAt, so we can't sort by "Newest First" on the frontend
                 // We will leave it as the default but it won't do anything if not present.
                 valA = (a as any).createdAt || 0;
                 valB = (b as any).createdAt || 0;
                 break;
            default:
                return 0;
        }

        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
    });
    return sorted;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadVehicles = async () => {
      setLoading(true);
      try {
        const response = await fetchVehicles({
          brand,
          type,
          fuelType,
          transmission,
          seatingCapacity,
          minPrice,
          maxPrice,
        });
        if (isMounted) {
          setAllCars(response.data || []);
          setPage(1);
        }
      } catch (error) {
        console.error('Failed to fetch fleet vehicles:', error);
        if (isMounted) {
          setAllCars([]);
          setPage(1);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVehicles();

    return () => {
      isMounted = false;
    };
  }, [brand, type, fuelType, transmission, seatingCapacity, minPrice, maxPrice]);

  useEffect(() => {
    setSort(sortParam);
  }, [sortParam]);

  useEffect(() => {
    const sorted = sortCars(allCars, sort);
    setDisplayedCars(sorted.slice(0, page * CARS_PER_PAGE));
  }, [allCars, sort, page, sortCars]);

  const handleFilterChange = (filters: FilterParams) => {
    const newQueryString = createQueryString({ ...filters, page: '1' }); // Reset page on filter
    router.push(`${pathname}?${newQueryString}`);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    const newQueryString = createQueryString({ sort: newSort });
    router.push(`${pathname}?${newQueryString}`);
  }

  const handleLoadMore = () => {
    if (page * CARS_PER_PAGE < allCars.length) {
      setPage(prev => prev + 1);
    }
  };

  const totalVehicles = allCars.length;
  const hasMore = displayedCars.length < totalVehicles;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="relative bg-black">
        <div className="absolute inset-0 z-0">
            <Image
                src="https://duruthemes.com/demo/html/renax/dark/img/slider/11.jpg"
                alt="Fleet background"
                fill
                className="object-cover opacity-50"
                priority
            />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-[320px] md:h-[420px] text-center text-white p-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Our Fleet</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
                Find the perfect car for your next adventure.
            </p>
        </div>
      </div>
      <main>
        <section className="relative z-20 container mx-auto px-4 -mt-24">
            <div className="w-full max-w-4xl mx-auto">
              <Suspense fallback={<div className="h-[172px] w-full rounded-xl bg-white/95" />}>
                <FilterForm onFilterChange={handleFilterChange} />
              </Suspense>
            </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-2">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-2" style={{color: '#050b20'}}>
                    Explore Our Fleet Selection
                </h2>
            </div>
           <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <p className="text-sm" style={{color: '#050b20'}}>
              Showing 1 - {loading ? CARS_PER_PAGE : displayedCars.length} of {totalVehicles} vehicles
            </p>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-auto min-w-[180px] h-10 px-4 rounded-full bg-primary text-primary-foreground border-0 gap-2 focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="w-[180px]">
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="pricePerDay-asc">Price: Low to High</SelectItem>
                <SelectItem value="pricePerDay-desc">Price: High to Low</SelectItem>
                <SelectItem value="year-desc">Year: Newest First</SelectItem>
                <SelectItem value="year-asc">Year: Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: CARS_PER_PAGE }).map((_, i) => (
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
          ) : displayedCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayedCars.map((car) => (
                <MostSearchedCarCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
             <div className="text-center col-span-full py-16">
              <ListX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Vehicles Found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}

          {hasMore && !loading && (
            <div className="text-center mt-12">
              <Button onClick={handleLoadMore} size="lg">
                Load More
              </Button>
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}
