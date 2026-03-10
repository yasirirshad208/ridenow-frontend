import FleetPageClient from '@/components/pages/FleetPageClient';

type FleetPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FleetPage({ searchParams }: FleetPageProps) {
  return <FleetPageClient searchParams={await searchParams} />;
}
