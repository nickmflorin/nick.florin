import { getPrimaryResume } from '~/actions/resumes/get-primary-resume';

import { type ISidebarItem } from '~/components/layout';

import { SiteMenu } from './SiteMenu';

export interface SiteNavMenuProps {
  readonly nav: ISidebarItem[];
}

export const SiteNavMenu = async ({ nav }: SiteNavMenuProps) => (
  <SiteMenu nav={nav} resume={await getPrimaryResume()} />
);
