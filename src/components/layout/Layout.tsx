import { type ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export interface LayoutProps {
  readonly children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className="layout">
    <Header />
    <div className="layout__content">
      <Sidebar />
      <div className="content">{children}</div>
    </div>
  </div>
);
