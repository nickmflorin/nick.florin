import { type BrandResume } from '~/database/model';
import { db } from '~/database/prisma';

import { convertToPlainObject } from '~/api/serialization';

import { type ISidebarItem } from '~/components/layout';

import { ClientSiteNavMenu } from './ClientSiteNavMenu';

export interface SiteNavMenuProps {
  readonly nav: ISidebarItem[];
}

export const SiteNavMenu = async ({ nav }: SiteNavMenuProps) => {
  let resume: BrandResume | null = null;
  const resumes = await db.resume.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    where: { primary: true },
  });
  if (resumes.length !== 0) {
    resume = convertToPlainObject(resumes[0]);
  }
  return <ClientSiteNavMenu nav={nav} resume={resume} />;
};
