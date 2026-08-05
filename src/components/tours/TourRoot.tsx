'use client';
import { TourProvider } from '~/components/config/TourProvider';

import { TourFlow } from './TourFlow';

/**
 * Mounts the tour provider around the tour flow — and nothing else.
 *
 * The provider's context is consumed only by the tour UI itself, so it wraps exactly that subtree
 * rather than the application: a lazily-loaded provider above the page tree would make the whole
 * page's hydration depend on its chunk, which is the shape that produced hydration errors when
 * the provider lived in `ClientConfig`.
 */
export const TourRoot = () => (
  <TourProvider>
    <TourFlow />
  </TourProvider>
);
