import React, { type ForwardedRef, forwardRef, useMemo, type ReactNode } from "react";

import clsx from "clsx";

import { Input, type InputProps } from "../../generic";

export interface SelectInputProps
  extends Pick<
    InputProps,
    | "isLocked"
    | "isLoading"
    | "size"
    | "isDisabled"
    | "actions"
    | "className"
    | "withCaret"
    | "caretIsOpen"
    | "dynamicHeight"
  > {
  readonly isOpen: boolean;
  readonly children?: ReactNode;
  readonly placeholder?: ReactNode;
  readonly showPlaceholder?: boolean;
}

export const SelectInput = forwardRef<HTMLDivElement, SelectInputProps>(
  (
    { isOpen, placeholder, showPlaceholder = false, children, ...props }: SelectInputProps,
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
        withCaret
        caretIsOpen={isOpen}
        className={clsx("select", props.className)}
        ref={ref}
        isActive={isOpen}
      >
        {renderedValue}
      </Input>
    );
  },
);
