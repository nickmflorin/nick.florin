"use client";
import { type ReactNode, useState } from "react";

import { IconButton } from "~/components/buttons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography";

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
  contentClassName = "overflow-y-auto",
  onToggle,
  ...props
}: CollapseProps) => {
  const [_open, setOpen] = useState(false);
  const open = _propOpen ?? _open;

  return (
    <div {...props} className={classNames("flex flex-col gap-[8px]", props.className)}>
      <div className="flex flex-row justify-between overflow-hidden items-center">
        {typeof title === "string" ? (
          <Text fontSize="sm" fontWeight="medium">
            {title}
          </Text>
        ) : (
          title
        )}
        <div className="flex flex-row gap-[6px] items-center">
          <Actions actions={actions ?? null} />
          <IconButton.Transparent
            key={actions ? actions.length : "0"}
            size="xsmall"
            onClick={() => {
              setOpen(curr => !curr);
              onToggle?.();
            }}
          >
            <CaretIcon open={open} />
          </IconButton.Transparent>
        </div>
      </div>
      {open && <div className={classNames("flex flex-col", contentClassName)}>{children}</div>}
    </div>
  );
};
