
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

const normalizeFilterValue = (value: string | number | undefined | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const normalizeSearchParam = (value: string | null) => {
  if (!value) return undefined;

  const trimmed = value.trim();
  const normalized = trimmed.toLowerCase();

  if (!trimmed || normalized === 'all' || normalized === 'undefined' || normalized === 'null') {
    return undefined;
  }

  return trimmed;
};

const typeAliases: Record<string, string[]> = {
  sedan: ['sedan', 'saloon'],
  suv: ['suv', 'sportutilityvehicle', 'crossover'],
  hatchback: ['hatchback'],
  luxury: ['luxury', 'premium'],
  sports: ['sports', 'sport', 'sportscar', 'coupe', 'performance'],
  van: ['van', 'minivan', 'mpv'],
  truck: ['truck', 'pickup', 'pickuptruck'],
};

const matchesNormalizedValue = (
  sourceValue: string | number | undefined | null,
  selectedValue: string | number | undefined | null
) => {
  const source = normalizeFilterValue(sourceValue);
  const selected = normalizeFilterValue(selectedValue);

  if (!selected) return true;
  if (!source) return false;

  return source === selected || source.includes(selected) || selected.includes(source);
};

const matchesCarType = (
  sourceType: string | number | undefined | null,
  selectedType: string | undefined
) => {
  const normalizedSourceType = normalizeFilterValue(sourceType);
  const normalizedSelectedType = normalizeFilterValue(selectedType);

  if (!normalizedSelectedType) return true;
  if (!normalizedSourceType) return false;

  const aliases = typeAliases[normalizedSelectedType] ?? [normalizedSelectedType];
  return aliases.some(
    (alias) =>
      normalizedSourceType === alias ||
      normalizedSourceType.includes(alias) ||
      alias.includes(normalizedSourceType)
  );
};

export default function FleetPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [allCars, setAllCars] = useState<Car[]>([]);
  const [displayedCars, setDisplayedCars] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt-desc');
  const [loading, setLoading] = useState(true);

  const brand = normalizeSearchParam(searchParams.get('brand'));
  const type = normalizeSearchParam(searchParams.get('type'));
  const fuelType = normalizeSearchParam(searchParams.get('fuelType'));
  const transmission = normalizeSearchParam(searchParams.get('transmission'));
  const seatingCapacityParam = normalizeSearchParam(searchParams.get('seatingCapacity'));
  const price = normalizeSearchParam(searchParams.get('price'));
  const sortParam = normalizeSearchParam(searchParams.get('sort')) || 'createdAt-desc';

  const [minPriceRaw, maxPriceRaw] = price?.split('-') ?? [];
  const parsedMinPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
  const parsedMaxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
  const parsedSeatingCapacity = seatingCapacityParam ? Number(seatingCapacityParam) : undefined;
  const minPrice = Number.isFinite(parsedMinPrice) ? parsedMinPrice : undefined;
  const maxPrice = Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : undefined;
  const seatingCapacity = Number.isFinite(parsedSeatingCapacity) ? parsedSeatingCapacity : undefined;

  const createQueryString = useCallback(
    (params: Record<string, string | number | undefined | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
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
        // Fetch a full working set and apply filters locally for consistent results.
        const response = await fetchVehicles({ limit: 500 });
        const vehicles = response.data || [];

        const filteredVehicles = vehicles.filter((car) => {
          const extendedCar = car as Car & {
            make?: string;
            manufacturer?: string;
            carType?: string;
            bodyType?: string;
            category?: string;
          };

          const carBrandSource = extendedCar.brand ?? extendedCar.make ?? extendedCar.manufacturer;
          const carTypeSource =
            extendedCar.type ?? extendedCar.carType ?? extendedCar.bodyType ?? extendedCar.category;
          const carFuelType = normalizeFilterValue(car.fuelType);
          const carTransmission = normalizeFilterValue(car.transmission);
          const carPrice = Number(car.pricePerDay);
          const carSeating = Number(car.seatingCapacity);

          const matchesBrand = matchesNormalizedValue(carBrandSource, brand);
          const matchesType = matchesCarType(carTypeSource, type);
          const matchesFuelType = !fuelType || carFuelType === normalizeFilterValue(fuelType);
          const matchesTransmission =
            !transmission || carTransmission === normalizeFilterValue(transmission);
          const matchesMinPrice = minPrice === undefined || carPrice >= minPrice;
          const matchesMaxPrice = maxPrice === undefined || carPrice <= maxPrice;
          const matchesSeating =
            seatingCapacity === undefined
              ? true
              : seatingCapacityParam === '7'
              ? carSeating >= 7
              : carSeating === seatingCapacity;

          return (
            matchesBrand &&
            matchesType &&
            matchesFuelType &&
            matchesTransmission &&
            matchesMinPrice &&
            matchesMaxPrice &&
            matchesSeating
          );
        });

        if (isMounted) {
          setAllCars(filteredVehicles);
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
