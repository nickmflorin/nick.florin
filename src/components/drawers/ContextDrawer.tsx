import { type JSX, type ReactNode } from 'react';

import { ErrorBoundary } from '~/components/errors/ErrorBoundary';
import { classNames, type ComponentProps } from '~/components/types';

import { ContextDrawerButtons } from './ContextDrawerButtons';
import { DrawerContent } from './DrawerContent';
import { DrawerFooter } from './DrawerFooter';
import { DrawerHeader } from './DrawerHeader';

export interface DrawerProps extends ComponentProps {
  readonly children: ReactNode;
}

const LocalContextDrawer = ({ children, ...props }: DrawerProps): JSX.Element => (
  <div {...props} className={classNames('drawer', props.className)}>
    <ErrorBoundary>{children}</ErrorBoundary>
    <ContextDrawerButtons />
  </div>
);

export const ContextDrawer = Object.assign(LocalContextDrawer, {
  Content: DrawerContent,
  displayName: 'ContextDrawer',
  Footer: DrawerFooter,
  Header: DrawerHeader,
});
