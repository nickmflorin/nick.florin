"use client";
import { type ReactNode, useState } from "react";

import clsx from "clsx";

import { IconButton } from "~/components/buttons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

import { Actions } from "./Actions";
import { type Action } from "./types";

interface CollapseProps extends ComponentProps {
  readonly children: ReactNode;
  readonly title?: string | JSX.Element;
  readonly open?: boolean;
  readonly actions?: Action[];
  readonly contentClassName?: ComponentProps["className"];
  readonly onToggle?: () => void;
}

export const Collapse = ({
  children,
  open: _propOpen,
  title,
  actions,
  contentClassName = "overflow-y-scroll",
  onToggle,
  ...props
}: CollapseProps) => {
  const [_open, setOpen] = useState(false);
  const open = _propOpen ?? _open;

  return (
    <div {...props} className={clsx("flex flex-col gap-[8px]", props.className)}>
      <div className="flex flex-row justify-between overflow-hidden items-center">
        {typeof title === "string" ? (
          <Text size="sm" fontWeight="medium">
            {title}
          </Text>
        ) : (
          title
        )}
        <div className="flex flex-row gap-[6px] items-center">
          <Actions actions={actions} />
          <IconButton.Bare
            key={actions ? actions.length : "0"}
            size="xsmall"
            onClick={() => {
              setOpen(curr => !curr);
              onToggle?.();
            }}
          >
            <CaretIcon open={open} />
          </IconButton.Bare>
        </div>
      </div>
      {open && <div className={clsx("flex flex-col", contentClassName)}>{children}</div>}
    </div>
  );
};
