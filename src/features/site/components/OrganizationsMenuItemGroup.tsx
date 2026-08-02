'use client';
import { useState } from 'react';

import { useOrganization, useOrganizationList } from '@clerk/nextjs';

import { Icon } from '~/components/icons/Icon';
import { Spinner } from '~/components/icons/Spinner';
import { MenuItem } from '~/components/menus/MenuItem';
import { MenuItemGroup, type MenuItemGroupProps } from '~/components/menus/MenuItemGroup';

export interface OrganizationsMenuItemGroupProps extends Omit<
  MenuItemGroupProps,
  'children' | 'isLoading' | 'label' | 'labelContainerClassName'
> {}

export const OrganizationsMenuItemGroup = (props: OrganizationsMenuItemGroupProps) => {
  const [changingToOrg, setChangingToOrg] = useState<null | string>(null);
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const { isLoaded: orgIsLoaded, organization } = useOrganization();

  return (
    <MenuItemGroup
      {...props}
      isLoading={!isLoaded || !orgIsLoaded}
      label='Organizations'
      labelContainerClassName='px-[6px] py-[4px]'
    >
      {(userMemberships.data ?? []).map(mem => (
        <MenuItem
          contentClassName='gap-[16px]'
          key={mem.id}
          onClick={async () => {
            setChangingToOrg(mem.organization.id);
            await setActive?.({ organization: mem.organization.id });
            setChangingToOrg(null);
          }}
        >
          <div className='w-[16px] h-[16px] flex flex-col items-center justify-center'>
            {organization?.id === mem.organization.id ? (
              <Icon className='text-green-600' icon='check' iconStyle='solid' size='14px' />
            ) : mem.organization.id === changingToOrg ? (
              <Spinner className='text-description' isLoading size='14px' />
            ) : null}
          </div>
          {mem.organization.name}
        </MenuItem>
      ))}
    </MenuItemGroup>
  );
};
