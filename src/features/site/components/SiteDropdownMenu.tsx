import { type BrandResume } from "~/database/model";
import { db } from "~/database/prisma";

import { convertToPlainObject } from "~/api/serialization";

import { type ComponentProps } from "~/components/types";

import { ClientSiteDropdownMenu } from "./ClientSiteDropdownMenu";

export interface SiteDropdownMenuProps extends ComponentProps {}

export const SiteDropdownMenu = async (props: SiteDropdownMenuProps) => {
  let resume: BrandResume | null = null;
  const resumes = await db.resume.findMany({
    where: { primary: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  if (resumes.length !== 0) {
    resume = convertToPlainObject(resumes[0]);
  }

  return <ClientSiteDropdownMenu {...props} resume={resume} />;
};
