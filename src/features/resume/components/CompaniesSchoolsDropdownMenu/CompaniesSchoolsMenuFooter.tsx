import { type MouseEvent } from 'react';

import { Button } from '~/components/buttons';
import { MenuFooter } from '~/components/menus/MenuFooter';
import { classNames, type ComponentProps } from '~/components/types';

export interface CompaniesSchoolsMenuFooterProps extends ComponentProps {
  readonly onCreate: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const CompaniesSchoolsMenuFooter = ({
  onCreate,
  ...props
}: CompaniesSchoolsMenuFooterProps) => (
  <MenuFooter
    {...props}
    className={classNames(
      'w-full flex flex-row item-center justify-center px-[18px] pb-[12px] pt-[6px]',
      props.className,
    )}
  >
    <Button.Solid className='w-full' element='button' onClick={e => onCreate(e)} scheme='primary'>
      Create
    </Button.Solid>
  </MenuFooter>
);
