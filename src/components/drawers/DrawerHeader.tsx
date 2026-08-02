import { type JSX } from 'react';

import { classNames, type ComponentProps } from '~/components/types';
import { Description, Title } from '~/components/typography';

export interface DrawerHeaderProps extends ComponentProps {
  readonly children?: JSX.Element | string;
  readonly description?: JSX.Element | string;
}

const _DrawerHeader = ({ children, description, ...props }: DrawerHeaderProps) =>
  children ? (
    <div {...props} className={classNames('drawer__header', props.className)}>
      {typeof children === 'string' ? <Title component='h4'>{children}</Title> : children}
      {typeof description === 'string' ? (
        <Description fontSize='sm'>{description}</Description>
      ) : (
        description
      )}
    </div>
  ) : null;

export const DrawerHeader = Object.assign(_DrawerHeader, { displayName: 'DrawerHeader' });
