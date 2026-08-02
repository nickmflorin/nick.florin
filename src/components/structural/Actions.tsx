'use client';
import { Fragment, type JSX, type ReactNode } from 'react';

import { isFragment } from 'react-is';

import {
  classNames,
  type ComponentProps,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

export type Action = Exclude<ReactNode, number | string | true>;

/**
 * An {@link Action} that has been filtered to exclude values that are not renderable as a single
 * action.
 *
 * React 19 removed the deprecated `React.ReactFragment` alias, which was defined as an iterable of
 * nodes.
 */
type FilteredAction = Exclude<Action, Iterable<ReactNode> | null | undefined>;

const isValidAction = (action: Action): action is FilteredAction =>
  Boolean(action) && !isFragment(action);

/**
 * Determines whether the actions provided to the component were provided as an array of actions or
 * as a single action.
 *
 * The check cannot be performed with `Array.isArray` alone because that method narrows to `any[]`,
 * which would silently reintroduce `any` into the array of actions that the component renders.
 */
const isActionArray = (value: Action | Action[]): value is Action[] => Array.isArray(value);

export interface ActionsBaseProps extends ComponentProps {
  readonly gap?: QuantitativeSize;
}

export interface ActionsExplicitProps extends ActionsBaseProps {
  readonly actions: Action[];
  readonly children?: never;
}

export interface ActionsChildrenProps extends ActionsBaseProps {
  readonly actions?: never;
  readonly children: Action | Action[];
}

export type ActionsProps = ActionsChildrenProps | ActionsExplicitProps;

export const Actions = ({
  actions,
  children,
  gap = '6px',
  ...props
}: ActionsProps): JSX.Element | null => {
  const _acts: Action | Action[] = actions ?? children ?? [];
  const _array: Action[] = isActionArray(_acts) ? _acts : [_acts];
  const filtered = _array.reduce((prev: FilteredAction[], action) => {
    if (isValidAction(action)) {
      return [...prev, action];
    }
    return prev;
  }, [] as FilteredAction[]);

  if (filtered.length === 0) {
    return null;
  }
  return (
    <div
      {...props}
      className={classNames('flex flex-row items-center h-full [&>*]:max-h-full', props.className)}
      /* The propagation guard has to be a React handler rather than a native listener on the
         element.  React delivers every event from a single listener at the root, so a native
         listener that stopped the click mid-bubble would prevent the click from ever reaching
         React - silencing the 'onClick' handlers of the actions themselves.  The synthetic
         handler only stops the event from propagating to React handlers above this element,
         after the action's own handler has already run. */
      onClick={e => e.stopPropagation()}
      role='presentation'
      style={{ ...props.style, gap: sizeToString(gap, 'px') }}
    >
      {filtered.map((action, index) => (
        <Fragment key={index}>{action}</Fragment>
      ))}
    </div>
  );
};
