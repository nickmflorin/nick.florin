import { type ChangeEvent, type JSX } from 'react';

import { isFragment } from 'react-is';

import { TextInput } from '~/components/input/TextInput';
import { classNames, type ComponentProps } from '~/components/types';

export interface MenuHeaderProps extends ComponentProps {
  readonly children?: JSX.Element;
  readonly onSearch?: (e: ChangeEvent<HTMLInputElement>, v: string) => void;
  readonly search?: string;
}

export const MenuHeader = ({
  children,
  onSearch,
  search,
  ...props
}: MenuHeaderProps): JSX.Element | null => {
  if ((children && !isFragment(children)) || search || onSearch) {
    return (
      <div {...props} className={classNames('menu__header', props.className)}>
        {onSearch && (
          <TextInput onChange={e => onSearch(e, e.target.value)} size='small' value={search} />
        )}
        {children}
      </div>
    );
  }
  return null;
};
