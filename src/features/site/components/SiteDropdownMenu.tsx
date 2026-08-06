import { auth } from '@clerk/nextjs/server';

import { getPrimaryResume } from '~/actions/resumes/get-primary-resume';

import { type ComponentProps } from '~/components/types';

import { ClientSiteDropdownMenu } from './ClientSiteDropdownMenu';

export interface SiteDropdownMenuProps extends ComponentProps {}

export const SiteDropdownMenu = async (props: SiteDropdownMenuProps) => {
  /* Started before the session check so the two do not serialize; the read itself is cached
     cross-request (see get-primary-resume.ts), which is what lets the header render in the
     initial HTML flush instead of streaming in after a database round trip. */
  const resumePromise = getPrimaryResume();
  const { userId } = await auth();
  return (
    <ClientSiteDropdownMenu {...props} isSignedIn={userId !== null} resume={await resumePromise} />
  );
};
