import { type JSX, type ReactNode, Suspense } from 'react';

import { Loading } from '~/components/loading/Loading';
import { SiteNavMenu } from '~/features/site/components/SiteNavMenu';

import { ContextDrawerWrapper, SiteNavMenuOverlay, ToastContainer } from './DynamicOverlays';
import { Header } from './Header';
import { HeaderSkeleton } from './Header/HeaderSkeleton';
import { LayoutNavigation } from './LayoutNavigation';
import { Navigating } from './Navigating';
import { type ISidebarItem } from './types';

export interface LayoutProps {
  readonly children: ReactNode;
  readonly nav: ISidebarItem[];
}

export const Layout = ({ children, nav }: LayoutProps): JSX.Element => (
  <div className='layout'>
    <header className='header'>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
    </header>
    <div className='layout__content'>
      <LayoutNavigation nav={nav}>
        <Suspense fallback={<Loading isLoading />}>
          <SiteNavMenu nav={nav} />
        </Suspense>
      </LayoutNavigation>
      <main className='content-container'>
        <Navigating>{children}</Navigating>
        <SiteNavMenuOverlay />
        <ToastContainer />
      </main>
      <ContextDrawerWrapper />
      <div id='drawer-target' />
    </div>
  </div>
);
