import { type JSX, type ReactNode } from 'react';

import { ShowHide } from '~/components/util';

import { EmptyView, type EmptyViewProps } from './EmptyView';

export interface EmptyProps extends EmptyViewProps {
  readonly content?: ReactNode;
  readonly isEmpty?: boolean;
}

export const Empty = ({
  children,
  content,
  isEmpty = false,
  ...props
}: EmptyProps): JSX.Element => {
  if (children) {
    return (
      <>
        <ShowHide show={isEmpty}>
          <EmptyView {...props}>{content}</EmptyView>
        </ShowHide>
        <ShowHide show={!isEmpty}>{children}</ShowHide>
      </>
    );
  }
  return (
    <ShowHide show={isEmpty}>
      <EmptyView {...props} />
    </ShowHide>
  );
};
