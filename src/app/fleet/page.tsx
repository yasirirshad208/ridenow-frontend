import { Suspense } from 'react';
import FleetPageClient from '@/components/pages/FleetPageClient';

export default function FleetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <FleetPageClient />
    </Suspense>
  );
}
