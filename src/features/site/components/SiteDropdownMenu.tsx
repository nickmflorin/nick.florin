import { auth } from '@clerk/nextjs/server';

import { type BrandResume } from '~/database/model';
import { db } from '~/database/prisma';

import { convertToPlainObject } from '~/api/serialization';

import { type ComponentProps } from '~/components/types';

import { ClientSiteDropdownMenu } from './ClientSiteDropdownMenu';

export interface SiteDropdownMenuProps extends ComponentProps {}

export const SiteDropdownMenu = async (props: SiteDropdownMenuProps) => {
  const { userId } = await auth();

  let resume: BrandResume | null = null;
  const resumes = await db.resume.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    where: { primary: true },
  });
  if (resumes.length !== 0) {
    resume = convertToPlainObject(resumes[0]);
  }

  return <ClientSiteDropdownMenu {...props} isSignedIn={userId !== null} resume={resume} />;
};
