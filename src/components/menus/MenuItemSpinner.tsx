import type { SpinnerProps } from "~/components/icons";
import { Spinner } from "~/components/icons/Spinner";
import { classNames, type ComponentProps, type QuantitativeSize } from "~/components/types";

export interface MenuItemSpinnerProps {
  readonly iconSize?: QuantitativeSize<"px">;
  readonly spinnerProps?: Omit<SpinnerProps, "isLoading" | "size" | "className">;
  readonly isLoading?: boolean;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
}

export const MenuItemSpinner = ({
  spinnerClassName,
  spinnerProps,
  iconSize = "16px",
  iconClassName,
  isLoading,
}: MenuItemSpinnerProps) => (
  <Spinner
    {...spinnerProps}
    className={classNames("text-gray-600", iconClassName, spinnerClassName)}
    isLoading={isLoading}
    size={iconSize}
  />
);
