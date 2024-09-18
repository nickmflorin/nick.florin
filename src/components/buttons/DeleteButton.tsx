import { forwardRef } from "react";

import { classNames } from "~/components/types";

import { IconButton, type IconButtonProps } from "./generic";

export interface DeleteButtonProps
  extends Omit<IconButtonProps<"button">, "icon" | "scheme" | "variant"> {}

export const DeleteButton = forwardRef<HTMLButtonElement, DeleteButtonProps>(
  (props: DeleteButtonProps, ref) => (
    <IconButton.Transparent
      {...props}
      ref={ref}
      icon="trash-alt"
      disabledClassName="text-disabled hover:text-disabled hover:bg-transparent"
      className={classNames(
        "text-red-600 hover:text-red-700 hover:bg-transparent",
        props.className,
      )}
    />
  ),
);
