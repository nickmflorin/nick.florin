import { type ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { type ISidebarItem } from "./types";

export interface LayoutProps {
  readonly children: ReactNode;
  readonly sidebar: ISidebarItem[];
}

export const Layout = ({ children, sidebar }: LayoutProps) => (
  <div className="layout">
    <Header />
    <div className="layout__content">
      <Sidebar items={sidebar} />
      <main className="content">{children}</main>
    </div>
  </div>
);
