import { type ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export interface LayoutProps {
  readonly children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className="layout">
    <Sidebar />
    <div className="layout__content">
      <Header />
      <main className="content">{children}</main>
    </div>
  </div>
);
