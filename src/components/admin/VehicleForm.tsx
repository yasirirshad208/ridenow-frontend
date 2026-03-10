
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Car } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { createVehicle, updateVehicle } from '@/services/adminService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Upload } from 'lucide-react';

const baseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900, 'Invalid year'),
  pricePerDay: z.coerce.number().min(0, 'Price must be positive'),
  seatingCapacity: z.coerce.number().min(1, 'Seating capacity is required'),
  mileage: z.string().min(1, 'Mileage is required'),
  type: z.enum(['sedan', 'suv', 'hatchback', 'luxury', 'sports', 'van', 'truck']),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  transmission: z.enum(['automatic', 'manual']),
  description: z.string().optional(),
  features: z.string().optional(), // Comma-separated
  availability: z.boolean().default(true),
});

const createVehicleSchema = baseSchema.extend({
  images: z.instanceof(FileList).refine((files) => files.length === 5, 'You must upload exactly 5 images.'),
});

const updateVehicleSchema = baseSchema.extend({
  images: z.instanceof(FileList).refine((files) => files.length === 0 || files.length === 5, 'If replacing images, you must upload exactly 5 new ones.').optional(),
});


type VehicleFormData = z.infer<typeof createVehicleSchema>;

interface VehicleFormProps {
  vehicle?: Car | null;
  onSuccess: () => void;
}

const carBrands = ["Toyota", "Ford", "Mazda", "Honda", "Tesla", "Mercedes-Benz", "BMW", "Audi", "Nissan", "Volkswagen", "Hyundai", "Kia"];

type ImagePreviewItem = {
  id: string;
  file: File;
  src: string;
};

export function VehicleForm({ vehicle, onSuccess }: VehicleFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [previewImages, setPreviewImages] = useState<ImagePreviewItem[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const isEditMode = !!vehicle;
  
  const defaultValues = {
    name: vehicle?.name || '',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    pricePerDay: vehicle?.pricePerDay || 0,
    seatingCapacity: vehicle?.seatingCapacity || 4,
    mileage: vehicle?.mileage || '',
    type: vehicle?.type || 'sedan',
    fuelType: vehicle?.fuelType || 'petrol',
    transmission: vehicle?.transmission || 'automatic',
    description: vehicle?.description || '',
    features: vehicle?.features?.join(', ') || '',
    availability: vehicle?.availability ?? true,
    images: undefined,
  };

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm<VehicleFormData>({
    resolver: zodResolver(isEditMode ? updateVehicleSchema : createVehicleSchema),
    defaultValues,
    mode: "onBlur"
  });

  const images = watch('images');

  useEffect(() => {
    reset(defaultValues);
  }, [vehicle, reset]);


  useEffect(() => {
    if (images && images.length > 0) {
      const fileArray = Array.from(images);
      const nextPreviewImages = fileArray.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        file,
        src: URL.createObjectURL(file),
      }));
      setPreviewImages(nextPreviewImages);

      return () => {
        nextPreviewImages.forEach((img) => URL.revokeObjectURL(img.src));
      }
    } else {
        setPreviewImages([]);
    }
  }, [images]);

  const handlePreviewDrop = (dropIndex: number) => {
    if (draggingIndex === null || draggingIndex === dropIndex) return;

    setPreviewImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggingIndex, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });

    setDraggingIndex(null);
  };

  const onSubmit = (data: VehicleFormData) => {
    if (!user?.token) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        
        // Append all fields except images initially
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'images' && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        
        // Only append images if they exist and have been selected
        if (previewImages.length > 0) {
          previewImages.forEach((img) => {
            formData.append('images', img.file);
          });
        } else if (data.images && data.images.length > 0) {
          for (let i = 0; i < data.images.length; i++) {
            formData.append('images', data.images[i]);
          }
        }
        
        const slug = vehicle?.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        formData.append('slug', slug);

        if (vehicle) {
          await updateVehicle(user.token, vehicle._id, formData);
        } else {
          await createVehicle(user.token, formData);
        }
        
        onSuccess();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Camry LE" />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
           <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {carBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.brand && <p className="text-destructive text-xs mt-1">{errors.brand.message}</p>}
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input id="model" {...register('model')} placeholder="e.g. Camry" />
          {errors.model && <p className="text-destructive text-xs mt-1">{errors.model.message}</p>}
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" {...register('year')} />
          {errors.year && <p className="text-destructive text-xs mt-1">{errors.year.message}</p>}
        </div>
        <div>
          <Label htmlFor="pricePerDay">Price/Day ($)</Label>
          <Input id="pricePerDay" type="number" step="0.01" {...register('pricePerDay')} />
          {errors.pricePerDay && <p className="text-destructive text-xs mt-1">{errors.pricePerDay.message}</p>}
        </div>
        <div>
          <Label htmlFor="mileage">Mileage</Label>
          <Input id="mileage" {...register('mileage')} placeholder="e.g. 15,000 mi"/>
          {errors.mileage && <p className="text-destructive text-xs mt-1">{errors.mileage.message}</p>}
        </div>
         <div>
          <Label htmlFor="type">Type</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-destructive text-xs mt-1">{errors.type.message}</p>}
        </div>
        <div>
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Controller
            name="fuelType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.fuelType && <p className="text-destructive text-xs mt-1">{errors.fuelType.message}</p>}
        </div>
         <div>
          <Label htmlFor="transmission">Transmission</Label>
          <Controller
            name="transmission"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.transmission && <p className="text-destructive text-xs mt-1">{errors.transmission.message}</p>}
        </div>
         <div>
          <Label htmlFor="seatingCapacity">Seating Capacity</Label>
          <Input id="seatingCapacity" type="number" {...register('seatingCapacity')} />
          {errors.seatingCapacity && <p className="text-destructive text-xs mt-1">{errors.seatingCapacity.message}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="A brief description of the vehicle." />
      </div>
      <div>
        <Label htmlFor="features">Features (comma-separated)</Label>
        <Input id="features" {...register('features')} placeholder="e.g. GPS, Sunroof, Bluetooth" />
      </div>

       <div>
        <Label htmlFor="images">Images</Label>
        <div className="flex items-center justify-center w-full">
            <label htmlFor="images-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground">Upload exactly 5 images (PNG, JPG)</p>
                </div>
                <Input id="images-upload" type="file" {...register('images')} className="hidden" multiple accept="image/*" />
            </label>
        </div>
        {errors.images && <p className="text-destructive text-xs mt-1">{errors.images.message as string}</p>}
        {previewImages.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">
              Drag images to change their order. The first image will be used as the cover image.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {previewImages.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => setDraggingIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handlePreviewDrop(index)}
                  onDragEnd={() => setDraggingIndex(null)}
                  className={`relative rounded-md overflow-hidden border cursor-move ${
                    draggingIndex === index ? 'opacity-60 ring-2 ring-primary' : ''
                  }`}
                  title="Drag to reorder"
                >
                  <img src={image.src} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover" />
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                  {index === 0 && (
                    <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="availability"
          control={control}
          render={({ field }) => (
             <Switch
                id="availability"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
          )}
        />
        <Label htmlFor="availability">Available for rent</Label>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <LoaderCircle className="animate-spin" /> : (vehicle ? 'Update Vehicle' : 'Create Vehicle')}
      </Button>
    </form>
  );
}
