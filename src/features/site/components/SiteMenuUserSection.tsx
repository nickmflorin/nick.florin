'use client';
import { useUser } from '@clerk/nextjs';

import { Avatar } from '~/components/images/Avatar';
import { Loading } from '~/components/loading/Loading';
import { Menu } from '~/components/menus/Menu';
import { Label, Text } from '~/components/typography';

import { OrganizationsMenuItemGroup } from './OrganizationsMenuItemGroup';

/**
 * The signed-in user's section of the site menu: their avatar, name, email address, and the
 * organizations they can switch between.
 *
 * This is the Clerk-dependent portion of the site menu, split into its own module so that the
 * menu itself carries no Clerk imports. It is only rendered when the server has established that
 * a session exists, which also guarantees `<ClerkProvider />` is mounted; the loading state below
 * covers the window where clerk-js has not yet resolved the user on the client.
 */
export const SiteMenuUserSection = () => {
  const { isSignedIn, user } = useUser();
  if (!isSignedIn) {
    return <Loading isLoading />;
  }
  return (
    <>
      <Menu.Item className='px-[6px] py-[6px]' shouldHighlightOnHover={false}>
        <Avatar size='40px' src={user.imageUrl} />
        <div className='flex flex-col gap-1'>
          <Label fontSize='sm'>{user.fullName}</Label>
          <Text fontSize='xs'>{user.emailAddresses[0]?.emailAddress}</Text>
        </div>
      </Menu.Item>
      <OrganizationsMenuItemGroup />
    </>
  );
};
