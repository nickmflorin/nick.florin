import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { Suspense } from "react";

import { Loading } from "~/components/loading/Loading";
import { SiteNavMenu } from "~/features/site/components/SiteNavMenu";

import { Header } from "./Header";
import { LayoutNavigation } from "./LayoutNavigation";
import { Navigating } from "./Navigating";
import { type ISidebarItem } from "./types";

const ToastContainer = dynamic(() => import("./ToastContainer"), { ssr: false });
const LayoutDrawer = dynamic(() => import("~/components/drawers/LayoutDrawer"), { ssr: false });
const SiteNavMenuOverlay = dynamic(
  () => import("~/features/site/components/SiteNavMenuOverlay").then(mod => mod.SiteNavMenuOverlay),
  { ssr: false },
);
const UserProfile = dynamic(
  () => import("~/features/site/components/UserProfile").then(mod => mod.UserProfile),
  { ssr: false },
);

export interface LayoutProps {
  readonly children: ReactNode;
  readonly nav: ISidebarItem[];
}

export const Layout = async ({ children, nav }: LayoutProps): Promise<JSX.Element> => (
  <div className="layout">
    <header className="header">
      <Suspense fallback={<></>}>
        <Header />
      </Suspense>
    </header>
    <div className="layout__content">
      <LayoutNavigation nav={nav}>
        <Suspense fallback={<Loading isLoading />}>
          <SiteNavMenu nav={nav} />
        </Suspense>
      </LayoutNavigation>
      <main className="content-container">
        <Navigating>{children}</Navigating>
        <SiteNavMenuOverlay />
        <ToastContainer />
        <UserProfile />
      </main>
      <LayoutDrawer />
    </div>
  </div>
);

export default Layout;
