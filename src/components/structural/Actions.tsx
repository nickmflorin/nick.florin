import React from "react";

import clsx from "clsx";

import type * as types from "./types";

import { isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { type ComponentProps, type Size, sizeToString } from "~/components/types";

export type ActionsProps = ComponentProps & {
  readonly children?: JSX.Element;
  readonly actions: types.Action[] | types.ActionsBySide;
  readonly gap?: Size;
};

export const Actions = ({ actions, children, gap = 8, ...props }: ActionsProps): JSX.Element => {
  if (!Array.isArray(actions)) {
    return (
      <>
        <Actions actions={actions.left ?? []} gap={gap} {...props} />
        {children}
        <Actions actions={actions.right ?? []} gap={gap} {...props} />
      </>
    );
  } else if (actions.length === 0) {
    return <>{children}</>;
  } else if (children !== undefined) {
    return (
      <>
        <Actions actions={actions ?? []} gap={gap} {...props} />
        {children}
      </>
    );
  }
  return (
    <div
      className={clsx("flex flex-row items-center h-full [&>*]:max-h-full", props.className)}
      style={{ ...props.style, gap: sizeToString(gap) }}
    >
      {actions.map((a, index) => (
        <React.Fragment key={index}>
          {isIconProp(a) ? <Icon dimension="height" size="fill" icon={a} /> : a}
        </React.Fragment>
      ))}
    </div>
  );
};
