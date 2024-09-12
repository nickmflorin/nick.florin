"use client";
import clsx from "clsx";

import { Button, type ButtonProps } from "./generic";

export type TabButtonProps = Omit<
  ButtonProps<"a">,
  "size" | "fontWeight" | "isLoading" | "children" | "isLocked" | "variant"
> & {
  readonly isPending?: boolean;
  readonly children: string;
  readonly isLoading?: boolean;
};

export const TabButton = ({
  isActive,
  isPending,
  isLoading,
  children,
  ...props
}: TabButtonProps) => (
  <Button.Transparent
    {...(props as ButtonProps<"a">)}
    className={clsx(
      "rounded-none rounded-t-md relative top-[2px]",
      "border-b-[2px] text-gray-800",
      "hover:bg-neutral-100",
      "px-3",
      {
        "border-transparent hover:border-gray-300": !(isActive || isPending),
        "border-blue-700": isActive || isPending,
      },
      props.className,
    )}
    fontWeight="regular"
    size="medium"
    isLoading={isPending || isLoading}
    isLocked={isActive}
  >
    {children}
  </Button.Transparent>
);
