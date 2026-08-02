'use client';
import dynamic from 'next/dynamic';

import { type BrandResume } from '~/database/model';

import { IconButton } from '~/components/buttons';
import { Loading } from '~/components/loading/Loading';
import { DropdownMenu, type DropdownMenuProps } from '~/components/menus/DropdownMenu';

const SiteMenu = dynamic(() => import('./SiteMenu').then(mod => mod.SiteMenu), {
  loading: () => <Loading isLoading />,
});

export interface ClientSiteDropdownMenuProps extends Omit<
  DropdownMenuProps,
  'children' | 'content' | 'placement' | 'triggers' | 'width'
> {
  readonly resume: BrandResume | null;
}

export const ClientSiteDropdownMenu = ({ resume, ...props }: ClientSiteDropdownMenuProps) => (
  <DropdownMenu
    {...props}
    content={({ setIsOpen }) => (
      <div className='flex flex-col relative min-h-[40px] p-[8px]'>
        <SiteMenu onClose={e => setIsOpen(false, e)} resume={resume} />
      </div>
    )}
    contentClassName='z-50'
    placement='bottom-end'
    width={300}
  >
    <IconButton.Solid
      className='max-[450px]:hidden'
      element='button'
      icon='bars'
      id='site-dropdown-menu-button'
      radius='sm'
      scheme='secondary'
    />
  </DropdownMenu>
);
