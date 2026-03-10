'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ContactForm = dynamic(
  () => import('@/components/ContactForm').then((mod) => mod.ContactForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    ),
  }
);

export function ContactFormIsland() {
  return <ContactForm />;
}
