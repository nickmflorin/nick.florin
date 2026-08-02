import { type JSX, type ReactNode } from 'react';

import { isFragment } from 'react-is';

import { classNames, type ComponentProps } from '~/components/types';
import { Label, type LabelProps } from '~/components/typography';

import { MenuContent, type MenuContentProps } from './MenuContent';

export interface MenuItemGroupProps extends MenuContentProps<'group'> {
  readonly contentClassName?: ComponentProps['className'];
  readonly label?: ReactNode;
  readonly labelClassName?: ComponentProps['className'];
  readonly labelContainerClassName?: ComponentProps['className'];
  readonly labelProps?: Omit<LabelProps<'label'>, 'children' | 'className' | 'ref'>;
}

export const MenuItemGroup = ({
  children,
  className,
  contentClassName,
  label,
  labelClassName,
  labelContainerClassName,
  labelProps,
  style,
  ...props
}: MenuItemGroupProps): JSX.Element | null => {
  const validChildren = (
    Array.isArray(children) ? children : children === undefined ? [] : [children]
  ).filter((ch): ch is JSX.Element => !isFragment(ch) && ch !== null);

  if (validChildren.length === 0) {
    return null;
  }
  return (
    <div className={classNames('menu__item-group', className)} style={style}>
      {label && !isFragment(label) && (
        <div className={classNames('menu__item-group__label-container', labelContainerClassName)}>
          {typeof label === 'string' ? (
            <Label
              fontSize='sm'
              {...labelProps}
              className={classNames('menu__item-group__label', labelClassName)}
            >
              {label}
            </Label>
          ) : (
            label
          )}
        </div>
      )}
      <MenuContent __private_parent_prop__='group' {...props} className={contentClassName}>
        {validChildren}
      </MenuContent>
    </div>
  );
};
