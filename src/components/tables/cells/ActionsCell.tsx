import { type JSX } from 'react';

import { IconButton } from '~/components/buttons';
import { type FloatingContentRenderProps } from '~/components/floating';
import { DropdownMenu } from '~/components/menus/DropdownMenu';
import { Menu } from '~/components/menus/Menu';
import { type DataTableRowAction } from '~/components/tables/types';
import { classNames, type QuantitativeSize } from '~/components/types';

export interface ActionsCellProps {
  readonly actions:
    | ((params: Pick<FloatingContentRenderProps, 'setIsOpen'>) => DataTableRowAction[])
    | DataTableRowAction[];
  readonly menuWidth?: 'available' | 'target' | QuantitativeSize<'px'>;
}

export const ActionsCell = ({ actions, menuWidth = 120 }: ActionsCellProps): JSX.Element => (
  <div className='flex flex-row items-center justify-center'>
    <DropdownMenu
      content={({ setIsOpen }) => (
        <Menu>
          <Menu.Content>
            {(typeof actions === 'function' ? actions({ setIsOpen }) : actions).map(
              ({ content, ...rest }, i) => (
                <Menu.Item key={i} {...rest} className={classNames('font-medium', rest.className)}>
                  {content}
                </Menu.Item>
              ),
            )}
          </Menu.Content>
        </Menu>
      )}
      isInPortal
      placement='bottom-end'
      width={menuWidth}
    >
      {({ isOpen, params, ref }) => (
        <IconButton.Transparent
          {...params}
          activeClassName='text-blue-700 bg-gray-100'
          className='text-gray-500 hover:bg-gray-100'
          element='button'
          icon='ellipsis-h'
          isActive={isOpen}
          onClick={e => {
            e.stopPropagation();
            if ('onClick' in params && typeof params.onClick === 'function') {
              /* The floating element's reference props are untyped, so the handler has to be
                 coerced back to a click handler after it is verified to be callable. */
              const onClick = params.onClick as (event: typeof e) => void;
              onClick(e);
            }
          }}
          radius='full'
          ref={ref}
          size='medium'
        />
      )}
    </DropdownMenu>
  </div>
);
