import React, { type ReactNode } from "react";

import { ShowHide } from "~/components/util";

import { EmptyView, type EmptyViewProps } from "./EmptyView";

export interface EmptyProps extends EmptyViewProps {
  readonly isEmpty?: boolean;
  readonly content?: ReactNode;
}

export const Empty = ({
  isEmpty = false,
  content,
  children,
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
