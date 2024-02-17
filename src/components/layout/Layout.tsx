import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { logger } from "~/application/logger";
import { prisma } from "~/prisma/client";

import { Header } from "./Header";
import { LayoutNav, type ILayoutNavItem } from "./LayoutNav";

const ToastContainer = dynamic(() => import("~/app/config/ToastContainer"));

export interface LayoutProps {
  readonly children: ReactNode;
  readonly nav: ILayoutNavItem[];
}

export const Layout = async ({ children, nav }: LayoutProps): Promise<JSX.Element> => {
  const profiles = await prisma.profile.findMany({ orderBy: { createdAt: "desc" }, take: 1 });
  if (profiles.length === 0) {
    logger.error(
      "No profile found!  The layout will not include the social buttons in the header.",
    );
  }
  return (
    <div className="layout">
      <Header profile={profiles.length === 0 ? null : profiles[0]} />
      <div className="layout__content">
        <LayoutNav items={nav} />
        <main className="content">
          {children}
          <ToastContainer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
