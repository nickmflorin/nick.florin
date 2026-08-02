import Link from 'next/link';
import { type JSX } from 'react';

import { getProfile } from '~/actions/get-profile';

import { GithubButton } from '~/components/buttons/GithubButton';
import { LinkedInButton } from '~/components/buttons/LinkedInButton';
import { ModelImage } from '~/components/images/ModelImage';
import { classNames, type ComponentProps } from '~/components/types';
import { Title } from '~/components/typography';

export interface ProfileSectionProps extends ComponentProps {}

export const ProfileSection = async (props: ProfileSectionProps): Promise<JSX.Element> => {
  const profile = await getProfile();

  return (
    <div
      {...props}
      className={classNames('flex flex-row gap-[16px] items-center', props.className)}
    >
      <Link href='/'>
        <ModelImage
          className='group'
          hasPriority
          imageClassName='brightness-90 group-hover:brightness-75'
          radius='full'
          size={60}
          url={profile?.profileImageUrl}
        />
      </Link>
      <div className='flex flex-col'>
        <div className='flex flex-row gap-[8px]'>
          <Title component='h4' fontWeight='semibold'>
            {profile ? `${profile.firstName} ${profile.lastName}` : ''}
          </Title>
          <LinkedInButton />
          <GithubButton />
        </div>
        <Title component='h5'>{profile ? profile.displayName : ''}</Title>
      </div>
    </div>
  );
};
