import { type JSX } from 'react';

import { getProfile } from '~/actions/get-profile';

import { SocialButton } from './SocialButton';

export const LinkedInButton = async (): Promise<JSX.Element> => {
  const profile = await getProfile();
  return (
    <SocialButton
      className='hover:text-[#0a66c2]'
      href={profile?.linkedinUrl ?? '#'}
      icon={{ iconStyle: 'brands', name: 'linkedin' }}
      isTight
      openInNewTab
    />
  );
};
