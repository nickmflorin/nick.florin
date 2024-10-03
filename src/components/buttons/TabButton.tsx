import { classNames } from "~/components/types";

import { Button, type ButtonProps } from "./generic";

export type TabButtonProps<E extends "button" | "link"> = Omit<
  ButtonProps<E>,
  "size" | "fontWeight" | "isLoading" | "children" | "isLocked" | "variant"
> & {
  readonly isPending?: boolean;
  readonly children: string;
  readonly isLoading?: boolean;
};

export const TabButton = <E extends "button" | "link">({
  isActive,
  isPending,
  isLoading,
  children,
  ...props
}: TabButtonProps<E>) => (
  <Button.Transparent<E>
    {...(props as ButtonProps<E>)}
    className={classNames(
      "rounded-none rounded-t-md relative top-[2px] max-sm:w-full",
      "border-b-[2px] text-gray-800",
      "hover:bg-neutral-100",
      {
        "border-transparent hover:border-gray-300": !(isActive || isPending),
        "border-blue-700": isActive || isPending,
        "max-sm:bg-neutral-200": isActive || isPending,
      },
      "max-sm:border-none max-sm:rounded-md max-sm:top-0",
      "max-[700px]:px-3",
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
