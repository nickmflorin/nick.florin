import React, { type ForwardedRef, forwardRef, useMemo } from "react";

import clsx from "clsx";

import type * as types from "./types";

import { Input } from "../../generic";

export const BaseSelectInput = forwardRef<HTMLDivElement, types.BaseSelectInputProps>(
  (
    {
      isOpen,
      placeholder,
      showPlaceholder = false,
      children,
      ...props
    }: types.BaseSelectInputProps,
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
