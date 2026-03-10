
export type Car = {
  _id: string;
  name: string;
  make?: string; // Kept for compatibility, but brand is primary
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  imageId?: string; // Kept for local placeholders if needed
  images: string[];
  engineDetails?: string; // API doesn't provide this directly
  mileage: string; // API provides as string e.g. "15,000 mi"
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'automatic' | 'manual';
  type: 'sedan' | 'suv' | 'hatchback' | 'luxury' | 'sports' | 'van' | 'truck';
  seatingCapacity: number;
  description?: string;
  features?: string[];
  availability: boolean;
  slug: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone: string;
  avatar?: string;
  createdAt: string;
}

export type Reservation = {
  _id: string;
  user: User; // User object
  vehicle: Car;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalCost: number;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequests?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};
