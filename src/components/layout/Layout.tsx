import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { Suspense } from "react";

import { Header } from "./Header";
import { LayoutNav, type ILayoutNavItem } from "./LayoutNav";

const ToastContainer = dynamic(() => import("./ToastContainer"), { ssr: false });

export interface LayoutProps {
  readonly children: ReactNode;
  readonly drawer: ReactNode;
  readonly nav: ILayoutNavItem[];
}

export const Layout = async ({ children, drawer, nav }: LayoutProps): Promise<JSX.Element> => (
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
      {drawer}
      <div id="drawer-target" className="drawer-target"></div>
    </div>
  </div>
);

export default Layout;
