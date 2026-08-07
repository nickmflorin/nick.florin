'use client';
import { type JSX } from 'react';

import { DrawerIds } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { Popover } from '~/components/floating/Popover';
import { PopoverContent } from '~/components/floating/PopoverContent';
import { Menu } from '~/components/menus/Menu';

import { CompaniesSchoolsMenuFooter } from './CompaniesSchoolsMenuFooter';
import { CompaniesSchoolsTrigger } from './CompaniesSchoolsTrigger';
import { type ModelType } from './types';

export interface CompaniesSchoolsFloatingProps {
  readonly content: JSX.Element;
  /**
   * Whether the menu should be open as soon as it mounts.
   *
   * Used when the component is mounted lazily in response to its trigger already having been
   * clicked, so that the menu opens without requiring a second click.
   */
  readonly isInitiallyOpen?: boolean;
  readonly modelType: ModelType;
}

export const CompaniesSchoolsFloating = ({
  content,
  isInitiallyOpen = false,
  modelType,
}: CompaniesSchoolsFloatingProps) => {
  const { open } = useDrawers();
  return (
    <Popover
      content={content}
      hasArrow={false}
      initiallyIsOpen={isInitiallyOpen}
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
        <CompaniesSchoolsTrigger {...params} isOpen={isOpen} modelType={modelType} ref={ref} />
      )}
    </Popover>
  );
};
