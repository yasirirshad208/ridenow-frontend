import type { Car } from '@/lib/types';
import { apiFetch } from '@/lib/api/client';

interface FetchVehiclesParams {
  page?: number;
  limit?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  fuelType?: string;
  transmission?: string;
  seatingCapacity?: number;
  availability?: boolean;
  search?: string;
  random?: string;
  sort?: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Car[];
}

export async function fetchVehicles(params: FetchVehiclesParams = {}): Promise<ApiResponse> {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const endpoint = query.toString() ? `/vehicles?${query.toString()}` : '/vehicles';
  const data = await apiFetch<ApiResponse>(endpoint);
  
  // The API returns 'brand', but our old type used 'make'. We map it here.
  const transformedData = data.data.map(car => ({
      ...car,
      make: car.brand
  }));

  return { ...data, data: transformedData };
}

export async function fetchVehicleBySlug(slug: string): Promise<Car | null> {
    try {
        const vehicleData = await apiFetch<{ data: Car }>(`/vehicles/${slug}`);
        // The API returns 'brand', but our old type used 'make'. We map it here.
        return { ...vehicleData.data, make: vehicleData.data.brand };
    } catch (error) {
        if (error instanceof Error && /404/.test(error.message)) {
            return null;
        }
        console.error('Error fetching vehicle by slug:', error);
        return null;
    }
}
