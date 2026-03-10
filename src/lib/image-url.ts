import { getClientImageBaseUrl } from '@/lib/config/client';

export function resolveImageUrl(image?: string | null): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;

  const baseUrl = getClientImageBaseUrl();
  if (image.startsWith('/')) return `${baseUrl}${image}`;
  return `${baseUrl}/${image}`;
}
