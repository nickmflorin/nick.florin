import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { DetailEntityType } from "~/prisma/model";

const UpdateDetailsDrawer = dynamic(() => import("~/components/drawers/UpdateDetailsDrawer"));

interface ExperiencesLayoutProps {
  readonly children: ReactNode;
}

export default async function ExperiencesLayout({ children }: ExperiencesLayoutProps) {
  return (
    <>
      {children}
      <UpdateDetailsDrawer entityType={DetailEntityType.EXPERIENCE} />
    </>
  );
}
