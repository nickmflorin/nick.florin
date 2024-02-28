import { Suspense } from "react";

import clsx from "clsx";

import { IconButton } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

import { type Filters } from "../types";

import { TableFilters } from "./TableFilters";

export interface ControlBarProps extends ComponentProps {
  readonly checkedRows: string[];
  readonly filters: Filters;
}

export const ControlBar = async ({ checkedRows, filters, ...props }: ControlBarProps) => (
  <div
    {...props}
    className={clsx(
      "flex flex-row gap-[8px] items-center justify-between w-full h-[32px]",
      props.className,
    )}
  >
    <IconButton.Danger icon={{ name: "trash-alt" }} isDisabled={checkedRows.length === 0} />
    <Suspense>
      <TableFilters filters={filters} />
    </Suspense>
  </div>
);
