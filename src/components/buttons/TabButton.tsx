"use client";
import clsx from "clsx";

import { Button, type ButtonForm, type ButtonProps } from "~/components/buttons";

export type TabButtonProps<F extends ButtonForm> = Omit<
  ButtonProps<F>,
  "size" | "fontWeight" | "isLoading" | "children" | "isLocked" | "variant"
> & {
  readonly isPending?: boolean;
  readonly children: string;
  readonly isLoading?: boolean;
};

export const TabButton = <F extends ButtonForm>({
  isActive,
  isPending,
  isLoading,
  children,
  ...props
}: TabButtonProps<F>) => (
  <Button.Bare<F>
    {...(props as ButtonProps<F>)}
    className={clsx(
      "rounded-none rounded-t-md relative top-[2px]",
      "border-b-[2px] text-gray-800",
      "hover:bg-neutral-100",
      "max-sm:rounded-md top-0",
      {
        "border-transparent hover:border-gray-300": !(isActive || isPending),
        "border-blue-700": isActive || isPending,
        "max-sm:bg-neutral-200": isActive || isPending,
      },
      "max-sm:border-none",
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
