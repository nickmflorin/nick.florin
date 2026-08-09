'use client';
import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { type ISidebarItem } from '~/components/layout/types';

/* Imported statically so the rail is never a lazily-loaded ancestor during hydration: as a bare
   `dynamic()` it had no Suspense boundary of its own, and its chunk resolving late could bubble a
   suspension to the nearest route boundary. */
import { Sidebar } from './Sidebar';

const SiteNavMenuWrapper = dynamic(
  () => import('~/features/site/components/SiteNavMenuWrapper').then(mod => mod.SiteNavMenuWrapper),
  { ssr: false },
);

export interface LayoutNavigationProps {
  readonly children: JSX.Element;
  readonly nav: ISidebarItem[];
}

/* Both navigation variants render unconditionally and CSS decides which one displays: the sidebar
   rail hides at or below the mobile-navigation cutoff (the `xs` breakpoint is defined as the same
   450px that `MobileNavigationCutoff` holds, so `max-xs:` cannot drift from it), and the slide-out
   menu renders nothing until opened - which only the cutoff-gated hamburger button can do, and
   `NavMenuProvider` closes it whenever the window grows past the cutoff.

   Gating the variants on the UA-seeded viewport width instead meant that whenever the seed
   disagreed with the real width (device emulation, a desktop window resized narrow, tablets with
   desktop User-Agents) the wrong variant was server-rendered, and the correction mounted or
   removed the rail a beat after first paint - shifting the entire content area sideways. */
export const LayoutNavigation = ({ children, nav }: LayoutNavigationProps) => (
  <>
    <div className='contents max-xs:hidden'>
      <Sidebar items={nav} />
    </div>
    <SiteNavMenuWrapper>{children}</SiteNavMenuWrapper>
  </>
);
