import { type ReactNode } from "react";

import { logger } from "~/application/logger";
import { prisma } from "~/prisma/client";

import { Header } from "./Header";
import { Sidebar } from "./sidebar";
import { type ISidebarItem } from "./types";

export interface LayoutProps {
  readonly children: ReactNode;
  readonly sidebar: ISidebarItem[];
}

export const Layout = async ({ children, sidebar }: LayoutProps): Promise<JSX.Element> => {
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
        <Sidebar items={sidebar} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
