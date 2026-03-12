
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Settings2, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

type FilterFormProps = {
  onFilterChange?: (filters: Record<string, string | undefined>) => void;
};

const getSearchFilterValue = (value: string | null) => {
  if (!value) return 'all';
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === 'all' || normalized === 'undefined' || normalized === 'null') {
    return 'all';
  }
  return value;
};

export function FilterForm({ onFilterChange }: FilterFormProps) {
  const searchParams = useSearchParams();

  const [brand, setBrand] = useState(getSearchFilterValue(searchParams.get('brand')));
  const [carType, setCarType] = useState(getSearchFilterValue(searchParams.get('type')));
  const [price, setPrice] = useState(getSearchFilterValue(searchParams.get('price')));
  const [seatingCapacity, setSeatingCapacity] = useState(getSearchFilterValue(searchParams.get('seatingCapacity')));
  const [fuelType, setFuelType] = useState(getSearchFilterValue(searchParams.get('fuelType')));
  const [transmission, setTransmission] = useState(getSearchFilterValue(searchParams.get('transmission')));
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    setBrand(getSearchFilterValue(searchParams.get('brand')));
    setCarType(getSearchFilterValue(searchParams.get('type')));
    setPrice(getSearchFilterValue(searchParams.get('price')));
    setSeatingCapacity(getSearchFilterValue(searchParams.get('seatingCapacity')));
    setFuelType(getSearchFilterValue(searchParams.get('fuelType')));
    setTransmission(getSearchFilterValue(searchParams.get('transmission')));
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onFilterChange) {
        onFilterChange({
          brand: brand === 'all' ? undefined : brand,
          type: carType === 'all' ? undefined : carType,
          price: price === 'all' ? undefined : price,
          seatingCapacity: seatingCapacity === 'all' ? undefined : seatingCapacity,
          fuelType: fuelType === 'all' ? undefined : fuelType,
          transmission: transmission === 'all' ? undefined : transmission,
        });
    }
  };

  const handleReset = () => {
    setBrand('all');
    setCarType('all');
    setPrice('all');
    setSeatingCapacity('all');
    setFuelType('all');
    setTransmission('all');
    if(onFilterChange) {
        onFilterChange({
          brand: undefined,
          type: undefined,
          price: undefined,
          seatingCapacity: undefined,
          fuelType: undefined,
          transmission: undefined,
        });
    }
  }

  const hasActiveFilters = brand !== 'all' || carType !== 'all' || price !== 'all' || seatingCapacity !== 'all' || fuelType !== 'all' || transmission !== 'all';


  return (
    <Card className="shadow-lg bg-white border-none w-full max-w-5xl rounded-xl">
      <CardContent className="p-4">
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-center gap-2">
              <div className="relative flex items-center">
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger id="brand" className="bg-white text-foreground border-0 focus:ring-0">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Brand</SelectItem>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                    <SelectItem value="Ford">Ford</SelectItem>
                    <SelectItem value="Mazda">Mazda</SelectItem>
                    <SelectItem value="Honda">Honda</SelectItem>
                    <SelectItem value="Tesla">Tesla</SelectItem>
                    <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="Audi">Audi</SelectItem>
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" className="h-6 hidden md:block" />
              </div>

              <div className="relative flex items-center">
                <Select value={carType} onValueChange={setCarType}>
                  <SelectTrigger id="car-type" className="bg-white text-foreground border-0 focus:ring-0">
                    <SelectValue placeholder="Car Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Type</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" className="h-6 hidden md:block" />
              </div>

              <div className="relative flex items-center">
                <Select value={price} onValueChange={setPrice}>
                  <SelectTrigger id="price" className="bg-white text-foreground border-0 focus:ring-0">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">Any Price</SelectItem>
                    <SelectItem value="0-50">$0 - $50</SelectItem>
                    <SelectItem value="51-100">$51 - $100</SelectItem>
                    <SelectItem value="101-150">$101 - $150</SelectItem>
                    <SelectItem value="151-250">$151 - $250</SelectItem>
                    <SelectItem value="251-9999">$250+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 rounded-xl h-10 px-6 col-span-1 mt-4 md:mt-0">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
               {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    className="w-full text-muted-foreground hover:text-foreground h-10 px-4 col-span-1 md:w-auto mt-2 md:mt-0"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                )}
            </div>
            
            <CollapsibleContent className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                 <div className="space-y-2 relative flex items-center">
                  <Select value={seatingCapacity} onValueChange={setSeatingCapacity}>
                    <SelectTrigger id="seating-capacity" className="bg-white text-foreground border-0 focus:ring-0">
                      <SelectValue placeholder="Seating Capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Capacity</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="7">7+</SelectItem>
                    </SelectContent>
                  </Select>
                  <Separator orientation="vertical" className="h-6 hidden md:block" />
                </div>

                <div className="space-y-2 relative flex items-center">
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger id="fuel-type" className="bg-white text-foreground border-0 focus:ring-0">
                      <SelectValue placeholder="Fuel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Fuel Type</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Separator orientation="vertical" className="h-6 hidden md:block" />
                </div>
                
                 <div className="space-y-2 relative flex items-center">
                  <Select value={transmission} onValueChange={setTransmission}>
                    <SelectTrigger id="transmission" className="bg-white text-foreground border-0 focus:ring-0">
                      <SelectValue placeholder="Transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Transmission</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>

            <div className="text-center">
                <CollapsibleTrigger asChild>
                    <Button variant="link" className="p-0 h-auto text-primary">
                    <Settings2 className="mr-2 h-4 w-4" />
                    {isAdvancedOpen ? 'Hide' : 'Advanced'} Filters
                    </Button>
                </CollapsibleTrigger>
            </div>
          </form>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
