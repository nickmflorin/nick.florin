import React, { type ForwardedRef, forwardRef, useMemo, type ReactNode } from "react";

import clsx from "clsx";

import { CaretIcon } from "~/components/icons/CaretIcon";
import { mergeActions } from "~/components/structural";

import { Input, type InputProps } from "../../generic";

export interface SelectInputProps
  extends Pick<
    InputProps,
    "isLocked" | "isLoading" | "size" | "isDisabled" | "actions" | "className" | "dynamicHeight"
  > {
  readonly isOpen: boolean;
  readonly children?: ReactNode;
  readonly placeholder?: ReactNode;
  readonly showPlaceholder?: boolean;
}

export const SelectInput = forwardRef<HTMLDivElement, SelectInputProps>(
  (
    { actions, isOpen, placeholder, showPlaceholder = false, children, ...props }: SelectInputProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const renderedValue = useMemo(() => {
      if (showPlaceholder && placeholder) {
        return <div className="placeholder">{placeholder}</div>;
      }
      return <>{children}</>;
    }, [children, showPlaceholder, placeholder]);

    return (
      <Input
        dynamicHeight={true}
        {...props}
        className={clsx("select", props.className)}
        ref={ref}
        actions={mergeActions(actions, {
          right: [<CaretIcon key="0" open={isOpen} />],
        })}
        isActive={isOpen}
      >
        {renderedValue}
      </Input>
    );
  },
);
