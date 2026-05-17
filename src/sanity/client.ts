import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

export const isSanityConfigured =
  !!projectId && projectId !== 'your-project-id-here';

export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion: '2024-10-01',
      useCdn: true,
    })
  : null;

// Write client (server-side only, uses token)
export const sanityWriteClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion: '2024-10-01',
      useCdn: false,
      token: import.meta.env.SANITY_API_TOKEN,
    })
  : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

// Returns an image URL builder, or a dummy one that yields '' when Sanity isn't configured
export function urlFor(source: SanityImageSource | undefined | null) {
  if (!builder || !source) {
    return {
      url: () => '',
      width: () => ({ url: () => '' }),
      height: () => ({ url: () => '' }),
    } as any;
  }
  return builder.image(source);
}
