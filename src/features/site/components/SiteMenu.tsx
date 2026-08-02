import dynamic from 'next/dynamic';
import { type MouseEvent } from 'react';

import { useUser } from '@clerk/nextjs';

import { type BrandResume } from '~/database/model';

import { Button, IconButton } from '~/components/buttons';
import { NavMenuAnchor } from '~/components/buttons/NavMenuAnchor';
import { SignInButton } from '~/components/buttons/SignInButton';
import { SignOutButton } from '~/components/buttons/SignOutButton';
import { Avatar } from '~/components/images/Avatar';
import { flattenSidebarItems, type ISidebarItem } from '~/components/layout/types';
import { Menu } from '~/components/menus/Menu';
import { Label, Text } from '~/components/typography';
import { ShowHide } from '~/components/util';
import { useUserProfile } from '~/hooks';

const OrganizationsMenuItemGroup = dynamic(() =>
  import('./OrganizationsMenuItemGroup').then(mod => mod.OrganizationsMenuItemGroup),
);

export interface SiteMenuProps {
  readonly nav?: ISidebarItem[];
  readonly onClose: (e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
  readonly resume: BrandResume | null;
}

export const SiteMenu = ({ nav, onClose, resume }: SiteMenuProps) => {
  const { isSignedIn, user } = useUser();
  const { open } = useUserProfile();

  return (
    <Menu className='site-menu'>
      <Menu.Content className='flex flex-col justify-between gap-[8px]'>
        <ShowHide show={isSignedIn === true || (nav !== undefined && nav.length !== 0)}>
          <div className='flex flex-col gap-[8px]'>
            {isSignedIn ? (
              <Menu.Item className='px-[6px] py-[6px]' shouldHighlightOnHover={false}>
                <Avatar size='40px' src={user.imageUrl} />
                <div className='flex flex-col gap-1'>
                  <Label fontSize='sm'>{user.fullName}</Label>
                  <Text fontSize='xs'>{user.emailAddresses[0]?.emailAddress}</Text>
                </div>
              </Menu.Item>
            ) : null}
            {isSignedIn ? <OrganizationsMenuItemGroup /> : null}
            {nav && nav.length !== 0 ? (
              <div className='flex flex-col gap-[4px]'>
                {flattenSidebarItems(nav).map((item, index) => (
                  <Menu.Item className='p-0' key={index} shouldHighlightOnHover={false}>
                    <NavMenuAnchor item={item} />
                  </Menu.Item>
                ))}
              </div>
            ) : null}
          </div>
        </ShowHide>
        <div className='flex flex-col gap-[8px]'>
          {resume ? (
            <Menu.Item
              className='flex flex-row items-center gap-[8px] p-0'
              id='site-dropdown-menu-resume-item'
              shouldHighlightOnHover={false}
            >
              <Button.Outlined
                className='grow'
                element='a'
                href={resume.url}
                onClick={e => e.stopPropagation()}
                openInNewTab
                size='medium'
              >
                View Resume
              </Button.Outlined>
              <IconButton.Solid
                element='a'
                href={resume.downloadUrl}
                icon={{ name: 'cloud-arrow-down' }}
                onClick={e => e.stopPropagation()}
                scheme='primary'
                size='medium'
                target='_blank'
              />
            </Menu.Item>
          ) : null}
          {isSignedIn ? (
            <Menu.Item className='p-0' shouldHighlightOnHover={false}>
              <Button.Outlined
                className='w-full'
                element='button'
                onClick={e => {
                  open();
                  onClose(e);
                }}
                size='medium'
              >
                Manage Account
              </Button.Outlined>
            </Menu.Item>
          ) : null}
          <Menu.Item className='p-0'>
            {isSignedIn ? (
              <SignOutButton className='w-full' onClick={e => onClose(e)} />
            ) : (
              <SignInButton className='w-full' onClick={e => onClose(e)} />
            )}
          </Menu.Item>
        </div>
      </Menu.Content>
    </Menu>
  );
};
