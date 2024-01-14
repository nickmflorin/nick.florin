import { type ReactNode } from "react";

export interface LayoutProps {
  readonly children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => <div className="layout">{children}</div>;
