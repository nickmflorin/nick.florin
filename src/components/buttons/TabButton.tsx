"use client";
import clsx from "clsx";

import { Button, type ButtonOptions, type ButtonProps } from "~/components/buttons";

export type TabButtonProps<O extends ButtonOptions> = Omit<
  ButtonProps<O>,
  "size" | "fontWeight" | "isLoading" | "children" | "isLocked"
> & {
  readonly isPending?: boolean;
  readonly children: string;
  readonly isLoading?: boolean;
};

export const TabButton = <O extends ButtonOptions>({
  isActive,
  isPending,
  isLoading,
  children,
  ...props
}: TabButtonProps<O>) => (
  <Button.Bare
    {...props}
    className={clsx(
      "rounded-none rounded-t-md relative top-[2px]",
      "border-b-[2px] text-gray-800",
      "hover:bg-neutral-100",
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
  </Button.Bare>
);
