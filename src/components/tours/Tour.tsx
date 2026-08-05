'use client';
import dynamic from 'next/dynamic';

import { useCookies } from 'next-client-cookies';

import { useScreenSizes } from '~/hooks/use-screen-sizes';

import { SuppressTourCookie } from './use-tour';

/* The provider ('@reactour/tour', plus the tour's step content) and the flow it wraps are loaded in
   one client-only chunk, and only when the gate below decides the tour should be offered at all — a
   visitor who has dismissed the tour, or a mobile visitor, never downloads it. `ssr: false` is
   deliberate here: the subtree contains no page content (it is the tour UI alone), so excluding it
   from server rendering costs nothing and keeps the page's hydration independent of this chunk. */
const TourRoot = dynamic(() => import('./TourRoot').then(mod => mod.TourRoot), { ssr: false });

/**
 * Gates the site tour: renders the tour provider and flow only when the visitor has not
 * previously dismissed the tour and the screen is large enough for the tour to run.
 */
export const Tour = () => {
  const cookies = useCookies();
  const { isLessThanOrEqualTo } = useScreenSizes();

  if (
    isLessThanOrEqualTo('md') ||
    cookies.get(SuppressTourCookie)?.toLocaleLowerCase() === 'true'
  ) {
    return null;
  }
  return <TourRoot />;
};
