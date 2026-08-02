import { type JSX } from 'react';

import { getProfile } from '~/actions/get-profile';

import { SocialButton } from './SocialButton';

export const GithubButton = async (): Promise<JSX.Element> => {
  const profile = await getProfile();
  return (
    <SocialButton
      className='hover:text-github-black'
      href={profile?.githubUrl ?? '#'}
      icon={{ iconStyle: 'brands', name: 'github' }}
      isTight
      openInNewTab
    />
  );
};
