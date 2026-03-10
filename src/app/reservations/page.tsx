import { requireSession } from '@/lib/auth/session';
import { ReservationsPageClient } from '@/components/pages/ReservationsPageClient';

export default async function ReservationsPage() {
  const session = await requireSession('/login');
  return <ReservationsPageClient token={session.token} />;
}
