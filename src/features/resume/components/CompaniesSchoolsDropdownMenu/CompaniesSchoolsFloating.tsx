'use client';
import { type JSX } from 'react';

import { Button } from '~/components/buttons';
import { DrawerIds } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { Popover } from '~/components/floating/Popover';
import { PopoverContent } from '~/components/floating/PopoverContent';
import { CaretIcon } from '~/components/icons/CaretIcon';
import { Menu } from '~/components/menus/Menu';

import { CompaniesSchoolsMenuFooter } from './CompaniesSchoolsMenuFooter';
import { type ModelType } from './types';

const ButtonContent: Record<ModelType, string> = {
  company: 'Companies',
  school: 'Schools',
};

export interface CompaniesSchoolsFloatingProps {
  readonly content: JSX.Element;
  readonly modelType: ModelType;
}

export const CompaniesSchoolsFloating = ({ content, modelType }: CompaniesSchoolsFloatingProps) => {
  const { open } = useDrawers();
  return (
    <Popover
      content={content}
      hasArrow={false}
      maxHeight={400}
      offset={{ mainAxis: 4 }}
      outerContent={({ children, setIsOpen }) => (
        <PopoverContent className='p-[0px] rounded-md overflow-hidden z-50'>
          <Menu className='box-shadow-none'>
            {children}
            <CompaniesSchoolsMenuFooter
              onCreate={e => {
                if (modelType === 'company') {
                  open(DrawerIds.CREATE_COMPANY, {});
                } else {
                  open(DrawerIds.CREATE_SCHOOL, {});
                }
                setIsOpen(false, e);
              }}
            />
          </Menu>
        </PopoverContent>
      )}
      placement='bottom-end'
      triggers={['click']}
      width={400}
    >
      {({ isOpen, params, ref }) => (
        <Button.Solid
          ref={ref}
          {...params}
          icon={{
            right: <CaretIcon isOpen={isOpen} />,
          }}
          scheme='secondary'
        >
          {ButtonContent[modelType]}
        </Button.Solid>
      )}
    </Popover>
  );
};
