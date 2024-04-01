"use client";
import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface TableControlBarProps extends ComponentProps {
  readonly children?: JSX.Element | JSX.Element[];
  readonly deleteButton?: JSX.Element;
}

export const TableControlBar = ({ children, deleteButton, ...props }: TableControlBarProps) => (
  <div
    {...props}
    className={clsx(
      "flex flex-row gap-[8px] items-center justify-between w-full h-[32px]",
      props.className,
    )}
  >
    {deleteButton}
    <div className="flex flex-row gap-[8px] items-center grow h-full justify-end">{children}</div>
  </div>
);
