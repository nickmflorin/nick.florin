import { type BrandResume } from "~/database/model";
import { db } from "~/database/prisma";

import { convertToPlainObject } from "~/api-v2/serialization";

import { type ISidebarItem } from "~/components/layout";

import { ClientSiteNavMenu } from "./ClientSiteNavMenu";

export interface SiteNavMenuProps {
  readonly nav: ISidebarItem[];
}

export const SiteNavMenu = async ({ nav }: SiteNavMenuProps) => {
  let resume: BrandResume | null = null;
  const resumes = await db.resume.findMany({
    where: { primary: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  if (resumes.length !== 0) {
    resume = convertToPlainObject(resumes[0]);
  }
  return <ClientSiteNavMenu resume={resume} nav={nav} />;
};
