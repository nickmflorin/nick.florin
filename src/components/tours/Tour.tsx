'use client';
import dynamic from 'next/dynamic';

import { getCookie } from '~/lib/cookies';

import { useIsHydrated } from '~/hooks/use-is-hydrated';
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
  const isHydrated = useIsHydrated();
  const { isLessThanOrEqualTo } = useScreenSizes();

  /* The gate is only evaluated once the document exists, because both of its inputs - the
     suppression cookie and the measured viewport - are readable in the browser and nowhere else.
     The subtree this guards is `ssr: false` regardless, so deferring the decision costs nothing
     and keeps the server's output and the first client render trivially in agreement. */
  if (!isHydrated) {
    return null;
  }
  if (isLessThanOrEqualTo('md') || getCookie(SuppressTourCookie)?.toLocaleLowerCase() === 'true') {
    return null;
  }
  return <TourRoot />;
};
