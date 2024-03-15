import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { DetailEntityType } from "~/prisma/model";

const UpdateDetailsDrawer = dynamic(() => import("~/components/drawers/UpdateDetailsDrawer"));

interface EducationsLayoutProps {
  readonly children: ReactNode;
}

export default async function EducationsLayout({ children }: EducationsLayoutProps) {
  return (
    <>
      {children}
      <UpdateDetailsDrawer entityType={DetailEntityType.EDUCATION} />
    </>
  );
}
