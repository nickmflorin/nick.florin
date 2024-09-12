import React, { useMemo } from "react";

import { isFragment } from "react-is";

import type * as types from "./types";

import { isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { classNames } from "~/components/types";
import { type ComponentProps, type QuantitativeSize, sizeToString } from "~/components/types";

export type ActionsChildrenProps = ComponentProps & {
  readonly children: JSX.Element | JSX.Element[];
  readonly actions?: never;
  readonly gap?: QuantitativeSize<"px">;
  readonly height?: QuantitativeSize<"px"> | "full" | "auto";
};

export type ActionsWrappedProps<
  A extends types.Action[] | types.ActionsBySide = types.Action[] | types.ActionsBySide,
> = ComponentProps & {
  readonly children?: JSX.Element;
  readonly actions: A | null;
  readonly gap?: QuantitativeSize<"px">;
  readonly height?: QuantitativeSize<"px"> | "full" | "auto";
};

export type ActionsProps<
  A extends types.Action[] | types.ActionsBySide = types.Action[] | types.ActionsBySide,
> = ActionsWrappedProps<A> | ActionsChildrenProps;

const LocalActions = ({
  actions,
  gap = 8,
  children,
  height = "full",
  ...props
}: ActionsProps<types.Action[]>): JSX.Element => {
  const a = useMemo(
    () =>
      (actions === undefined
        ? Array.isArray(children)
          ? children
          : [children]
        : actions === null
          ? []
          : actions
      ).filter((a: types.Action | JSX.Element) => a !== null && a !== undefined && !isFragment(a)),
    [actions, children],
  );
  if (a.length === 0) {
    /* If the actions are undefined, it means that the actions were provided as children - in that
       case, we want to return an empty fragment because there are no valid actions to display.
       If the actions are not undefined, it means that the children prop corresponds to content
       that should be displayed alongside of the actions - so the children should be returned. */
    if (actions !== undefined) {
      return <>{children}</>;
    }
    return <></>;
  } else if (children !== undefined && actions !== undefined) {
    return (
      <>
        <Actions actions={a} gap={gap} {...props} height={height} />
        {children}
      </>
    );
  }
  return (
    <div
      className={classNames(
        "flex flex-row items-center [&>.button]:max-h-full [&>.icon]:max-h-full",
        props.className,
      )}
      style={{
        ...props.style,
        gap: sizeToString(gap, "px"),
        height: height === "full" ? "100%" : height,
      }}
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
  if (actions === undefined) {
    return (
      <LocalActions gap={gap} {...props}>
        {children}
      </LocalActions>
    );
  } else if (!Array.isArray(actions)) {
    return (
      <>
        <Actions actions={actions?.left ?? []} gap={gap} {...props} />
        {children}
        <Actions actions={actions?.right ?? []} gap={gap} {...props} />
      </>
    );
  }
  return (
    <LocalActions actions={actions} gap={gap} {...props}>
      {children}
    </LocalActions>
  );
};

export default Actions;
