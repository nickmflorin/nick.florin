import { type JSX, type ReactNode } from 'react';

import { ErrorBoundary } from '~/components/errors/ErrorBoundary';
import { classNames, type ComponentProps } from '~/components/types';

import { DrawerButtons } from './DrawerButtons';
import { DrawerContent } from './DrawerContent';
import { DrawerFooter } from './DrawerFooter';
import { DrawerHeader } from './DrawerHeader';

export interface DrawerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly onClose: () => void;
}

const LocalDrawer = ({ children, onClose, ...props }: DrawerProps): JSX.Element => (
  <div {...props} className={classNames('drawer', props.className)}>
    <ErrorBoundary>{children}</ErrorBoundary>
    <DrawerButtons onClose={onClose} />
  </div>
);

export const Drawer = Object.assign(LocalDrawer, {
  Content: DrawerContent,
  displayName: 'Drawer',
  Footer: DrawerFooter,
  Header: DrawerHeader,
});
