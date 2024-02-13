import { forwardRef } from "react";

import clsx from "clsx";

import { Spinner } from "~/components/icons/Spinner";
import { type ActionsType, mergeActions } from "~/components/structural";
import { Actions } from "~/components/structural/Actions";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";

import { type InputSize, InputSizes, InputVariants, type InputVariant } from "./types";

export interface InputProps
  extends ComponentProps,
    Pick<
      HTMLElementProps<"div">,
      | "onFocus"
      | "onBlur"
      | "onPointerDown"
      | "onMouseDown"
      | "onClick"
      | "onKeyDown"
      | "onKeyUp"
      | "onFocusCapture"
    > {
  readonly children: JSX.Element;
  readonly size?: InputSize;
  readonly variant?: InputVariant;
  readonly isActive?: boolean;
  readonly isDisabled?: boolean;
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly actions?: ActionsType;
}

export const Input = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      children,
      actions,
      isDisabled = false,
      isActive = false,
      size = InputSizes.MEDIUM,
      isLoading = false,
      isLocked = false,
      variant = InputVariants.PRIMARY,
      ...props
    }: InputProps,
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={clsx(
        "input",
        `input--size-${size}`,
        `input--variant-${variant}`,
        {
          disabled: isDisabled,
          "input--locked": isLocked,
          "input--loading": isLoading,
          "input--active": isActive,
        },
        props.className,
      )}
    >
      <Actions
        actions={mergeActions(actions, {
          right: [<Spinner key="0" isLoading={isLoading} size="14px" className="text-gray-500" />],
        })}
      >
        <div className="input__content">{children}</div>
      </Actions>
    </div>
  ),
);
