import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { Suspense } from "react";

import { Header } from "./Header";
import { LayoutNavigation } from "./LayoutNavigation";
import { Navigating } from "./Navigating";
import { type ISidebarItem } from "./types";

const ToastContainer = dynamic(() => import("./ToastContainer"), { ssr: false });
const LayoutDrawer = dynamic(() => import("~/components/drawers/LayoutDrawer"), { ssr: false });
const LayoutMenuOverlay = dynamic(
  () => import("./LayoutMenuOverlay").then(mod => mod.LayoutMenuOverlay),
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
      <LayoutNavigation nav={nav} />
      <main className="content-container">
        <Navigating>{children}</Navigating>
        <LayoutMenuOverlay />
        <ToastContainer />
      </main>
      <LayoutDrawer />
    </div>
  </div>
);

export default Layout;
