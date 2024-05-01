import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { Suspense } from "react";

import { Header } from "./Header";
import { type ILayoutNavItem } from "./LayoutNav";

const LayoutDrawer = dynamic(() => import("./LayoutDrawer"), { ssr: false });
const ToastContainer = dynamic(() => import("./ToastContainer"), { ssr: false });
const LayoutNav = dynamic(() => import("./LayoutNav"));

export interface LayoutProps {
  readonly children: ReactNode;
  readonly nav: ILayoutNavItem[];
}

export const Layout = async ({ children, nav }: LayoutProps): Promise<JSX.Element> => (
  <div className="layout">
    <header className="header">
      <Suspense fallback={<></>}>
        <Header />
      </Suspense>
    </header>
    <div className="layout__content">
      <LayoutNav items={nav} />
      <main className="content">
        {children}
        <ToastContainer />
      </main>
      <LayoutDrawer />
    </div>
  </div>
);

export default Layout;
