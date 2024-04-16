import React, { useMemo } from "react";

import clsx from "clsx";

import type * as types from "./types";

import { isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { type ComponentProps, type Size, sizeToString } from "~/components/types";

export type ActionsProps<
  A extends types.Action[] | types.ActionsBySide = types.Action[] | types.ActionsBySide,
> = ComponentProps & {
  readonly children?: JSX.Element;
  readonly actions?: A;
  readonly gap?: Size;
};

const LocalActions = ({
  actions,
  gap = 8,
  children,
  ...props
}: ActionsProps<types.Action[]>): JSX.Element => {
  const a = useMemo(() => (actions ?? []).filter(a => a !== null && a !== undefined), [actions]);
  if (a.length === 0) {
    return <>{children}</>;
  } else if (children !== undefined) {
    return (
      <>
        <Actions actions={a ?? []} gap={gap} {...props} />
        {children}
      </>
    );
  }
  return (
    <div
      className={clsx(
        "flex flex-row items-center h-full [&>.button]:max-h-full [&>.icon]:max-h-full",
        props.className,
      )}
      style={{ ...props.style, gap: sizeToString(gap, "px") }}
    >
      {a.map((ai, index) => (
        <React.Fragment key={index}>
          {isIconProp(ai) ? <Icon dimension="height" size="fill" fit="square" icon={ai} /> : ai}
        </React.Fragment>
      ))}
    </div>
  );
};

export const Actions = ({ actions, children, gap = 8, ...props }: ActionsProps): JSX.Element => {
  if (!Array.isArray(actions)) {
    return (
      <>
        <Actions actions={actions?.left ?? []} gap={gap} {...props} />
        {children}
        <Actions actions={actions?.right ?? []} gap={gap} {...props} />
      </>
    );
  }
  return (
    <LocalActions actions={actions} gap={gap}>
      {children}
    </LocalActions>
  );
};
