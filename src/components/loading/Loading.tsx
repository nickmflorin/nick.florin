import { type JSX, type ReactNode } from 'react';

import { type ViewComponent } from '~/components/structural/View';
import { ShowHide } from '~/components/util';

import { LoadingView, type LoadingViewProps } from './LoadingView';

export interface LoadingProps<C extends ViewComponent> extends LoadingViewProps<C> {
  readonly children?: ReactNode;
}

export const Loading = <C extends ViewComponent>({
  children,
  isLoading = false,
  ...props
}: LoadingProps<C>): JSX.Element => {
  if (children) {
    return (
      <>
        <ShowHide show={isLoading}>
          <LoadingView {...props} isLoading={isLoading} />
        </ShowHide>
        {children}
      </>
    );
  }
  return (
    <ShowHide show={isLoading}>
      <LoadingView {...props} isLoading={isLoading} />
    </ShowHide>
  );
};
