import { type JSX } from 'react';

import { preloadProfile } from '~/actions/get-profile';

import { LayoutMenuButton } from '~/components/buttons/LayoutMenuButton';
import { SiteResumeActions } from '~/features/site/components/SiteResumeActions';

import { ProfileSection } from './ProfileSection';

export const Header = (): JSX.Element => {
  preloadProfile();
  return (
    <>
      <ProfileSection />
      <div className='header__right'>
        <SiteResumeActions className='max-xs:hidden' />
        <LayoutMenuButton />
      </div>
    </>
  );
};
