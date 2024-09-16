"use client";
import type { ReactNode } from "react";
import React from "react";

import { isFragment } from "react-is";

import { type QuantitativeSize, type ComponentProps, sizeToString } from "~/components/types";
import { classNames } from "~/components/types";

export type Action = Exclude<ReactNode, string | number | true>;

type FilteredAction = Exclude<Action, React.ReactFragment | null | undefined>;

const isValidAction = (action: Action): action is FilteredAction =>
  Boolean(action) && !isFragment(action);

export interface ActionsBaseProps extends ComponentProps {
  readonly gap?: QuantitativeSize;
}

export interface ActionsExplicitProps extends ActionsBaseProps {
  readonly actions: Action[];
  readonly children?: never;
}

export interface ActionsChildrenProps extends ActionsBaseProps {
  readonly children: Action | Action[];
  readonly actions?: never;
}

export type ActionsProps = ActionsChildrenProps | ActionsExplicitProps;

export const Actions = ({
  actions,
  children,
  gap = "6px",
  ...props
}: ActionsProps): JSX.Element => {
  const _acts: Action | Action[] = actions ?? children ?? [];
  const _array: Action[] = Array.isArray(_acts) ? _acts : [_acts];
  const filtered = _array.reduce((prev: FilteredAction[], action) => {
    if (isValidAction(action)) {
      return [...prev, action];
    }
    return prev;
  }, [] as FilteredAction[]);

  if (filtered.length === 0) {
    return <></>;
  }
  return (
    <div
      {...props}
      onClick={e => e.stopPropagation()}
      className={classNames("flex flex-row items-center h-full [&>*]:max-h-full", props.className)}
      style={{ ...props.style, gap: sizeToString(gap, "px") }}
    >
      {filtered.map((action, index) => (
        <React.Fragment key={index}>{action}</React.Fragment>
      ))}
    </div>
  );
};
