
import type { Reservation } from '@/lib/types';
import { apiFetch } from '@/lib/api/client';

interface ReservationsApiResponse {
  success: boolean;
  count: number;
  data: Reservation[];
}

export async function fetchUserReservations(token: string): Promise<ReservationsApiResponse> {
  return apiFetch<ReservationsApiResponse>('/reservations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
