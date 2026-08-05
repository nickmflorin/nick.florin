import dynamic from 'next/dynamic';
import { type MouseEvent } from 'react';

import { type BrandResume } from '~/database/model';

import { Button, IconButton } from '~/components/buttons';
import { NavMenuAnchor } from '~/components/buttons/NavMenuAnchor';
import { SignInButton } from '~/components/buttons/SignInButton';
import { flattenSidebarItems, type ISidebarItem } from '~/components/layout/types';
import { Loading } from '~/components/loading/Loading';
import { Menu } from '~/components/menus/Menu';
import { ShowHide } from '~/components/util';
import { useUserProfile } from '~/hooks';

/* The Clerk-dependent pieces of the menu are split into lazily-loaded modules and only rendered
   when the server has established that a session exists. Anonymous visitors never fetch these
   chunks — or clerk-js — at all. */
const SiteMenuUserSection = dynamic(
  () => import('./SiteMenuUserSection').then(mod => mod.SiteMenuUserSection),
  { loading: () => <Loading isLoading /> },
);

const SignOutButton = dynamic(
  () => import('~/components/buttons/SignOutButton').then(mod => mod.SignOutButton),
  { loading: () => <Loading isLoading /> },
);

export interface SiteMenuProps {
  readonly isSignedIn: boolean;
  readonly nav?: ISidebarItem[];
  readonly onClose: (e: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
  readonly resume: BrandResume | null;
}

export const SiteMenu = ({ isSignedIn, nav, onClose, resume }: SiteMenuProps) => {
  const { open } = useUserProfile();

  return (
    <Menu className='site-menu'>
      <Menu.Content className='flex flex-col justify-between gap-[8px]'>
        <ShowHide show={isSignedIn || (nav !== undefined && nav.length !== 0)}>
          <div className='flex flex-col gap-[8px]'>
            {isSignedIn ? <SiteMenuUserSection /> : null}
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
              <SignInButton className='w-full' onClick={e => onClose(e.nativeEvent)} />
            )}
          </Menu.Item>
        </div>
      </Menu.Content>
    </Menu>
  );
};
