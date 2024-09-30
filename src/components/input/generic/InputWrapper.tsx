import React, { forwardRef, type ForwardedRef } from "react";

import { UnreachableCaseError } from "~/application/errors";

import {
  type InputSize,
  InputSizes,
  InputVariants,
  type InputVariant,
} from "~/components/input/types";
import {
  classNames,
  type TypographyCharacteristics,
  type ComponentProps,
  BorderRadii,
  type BorderRadius,
  getTypographyClassName,
  getTypographyStyle,
  omitTypographyProps,
} from "~/components/types";

type WrapperComponentName = "div" | "textarea";

type WrapperElement<C extends WrapperComponentName> = {
  div: HTMLDivElement;
  textarea: HTMLTextAreaElement;
}[C];

export type InputWrapperProps<C extends WrapperComponentName> = ComponentProps &
  Omit<React.ComponentProps<C>, keyof ComponentProps> &
  Omit<TypographyCharacteristics, "transform" | "align" | "truncate" | "lineClamp"> & {
    readonly component: C;
    readonly size?: InputSize;
    readonly variant?: InputVariant;
    readonly isActive?: boolean;
    readonly isDisabled?: boolean;
    readonly isLocked?: boolean;
    readonly isLoading?: boolean;
    readonly isReadOnly?: boolean;
    readonly dynamicHeight?: boolean;
    readonly radius?: BorderRadius;
  };

const dataAttributeValue = (v?: boolean) => (v === true ? true : undefined);

export const InputWrapper = forwardRef(
  <C extends WrapperComponentName>(
    {
      children,
      component,
      isDisabled = false,
      isActive = false,
      dynamicHeight = false,
      size = InputSizes.SMALL,
      radius = BorderRadii.SM,
      isLoading = false,
      isLocked = false,
      isReadOnly = false,
      variant = InputVariants.PRIMARY,
      ...props
    }: InputWrapperProps<C>,
    ref: ForwardedRef<WrapperElement<C>>,
  ): JSX.Element => {
    const ps = {
      ...omitTypographyProps(props),
      ref,
      children,
      "data-attr-disabled": dataAttributeValue(isDisabled),
      "data-attr-locked": dataAttributeValue(isLocked),
      "data-attr-loading": dataAttributeValue(isLoading),
      "data-attr-active": dataAttributeValue(isActive),
      "data-attr-read-only": dataAttributeValue(isReadOnly),
      style: { ...getTypographyStyle(props), ...props.style },
      className: classNames(
        "input",
        `input--size-${size}`,
        `input--variant-${variant}`,
        `input--radius-${radius}`,
        {
          "input--dynamic-height": dynamicHeight,
        },
        getTypographyClassName(props),
        props.className,
      ),
    };
    switch (component) {
      case "div":
        return <div {...(ps as React.ComponentProps<"div">)} />;
      case "textarea": {
        const className = classNames("text-area", ps.className);
        return (
          <textarea
            disabled={isDisabled}
            {...(ps as React.ComponentProps<"textarea">)}
            className={className}
          />
        );
      }
      default:
        throw new UnreachableCaseError(`Invalid 'component' provided: ${component}!`);
    }
  },
) as {
  <C extends WrapperComponentName>(
    props: InputWrapperProps<C> & { readonly ref?: ForwardedRef<WrapperElement<C>> },
  ): JSX.Element;
};
