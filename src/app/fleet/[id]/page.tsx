import FleetDetailPageClient from '@/components/pages/FleetDetailPageClient';

type FleetDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function FleetDetailPage({ params }: FleetDetailProps) {
  const { id } = await params;
  return <FleetDetailPageClient vehicleSlug={id} />;
}
