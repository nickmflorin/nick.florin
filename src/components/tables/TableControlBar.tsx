import clsx from "clsx";

import { IconButton } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

export interface TableControlBarProps extends ComponentProps {
  readonly checkedRows: string[];
  readonly children?: JSX.Element | JSX.Element[];
}

export const TableControlBar = async ({
  checkedRows,
  children,
  ...props
}: TableControlBarProps) => (
  <div
    {...props}
    className={clsx(
      "flex flex-row gap-[8px] items-center justify-between w-full h-[32px]",
      props.className,
    )}
  >
    <IconButton.Danger icon={{ name: "trash-alt" }} isDisabled={checkedRows.length === 0} />
    {children}
  </div>
);
