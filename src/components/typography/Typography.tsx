import { forwardRef } from "react";

import { isFragment } from "react-is";
import { type Subtract } from "utility-types";

import {
  classNames,
  type TypographyVariant,
  type TypographyComponent,
  type TypographyRef,
} from "~/components/types";

import { BaseTypography, type BaseTypographyProps } from "./BaseTypography";

type Inherit<T extends TypographyVariant> = T extends "text" ? boolean : never;

type TypographyPropsPartial<T extends TypographyVariant> = {
  readonly variant: T;
  readonly isDisabled?: boolean;
  readonly flex?: boolean;
  readonly inherit?: Inherit<T>;
};

export type TypographyProps<
  T extends TypographyVariant,
  C extends TypographyComponent<T>,
> = BaseTypographyProps<C> & TypographyPropsPartial<T>;

const TypographyClassNames: { [key in TypographyVariant]: string } = {
  text: "body",
  title: "title",
  label: "label",
};

export const Typography = forwardRef(
  <T extends TypographyVariant, C extends TypographyComponent<T>>(
    { variant, flex, inherit, isDisabled, ...props }: TypographyProps<T, C>,
    ref: TypographyRef<C>,
  ): JSX.Element => {
    if (
      isFragment(props.children) ||
      props.children === undefined ||
      props.children === null ||
      typeof props.children === "boolean" ||
      (typeof props.children === "string" && props.children.trim() === "")
    ) {
      return <></>;
    }
    return (
      <BaseTypography
        {...(props as Subtract<
          TypographyProps<T, C>,
          TypographyPropsPartial<T>
        > as BaseTypographyProps<C>)}
        ref={ref}
        className={classNames(
          TypographyClassNames[variant],
          {
            ["flex flex-row items-center"]: flex,
            "text-disabled": isDisabled,
            [`${TypographyClassNames[variant]}--inherit`]: inherit,
          },
          props.className,
        )}
      />
    );
  },
) as {
  <T extends TypographyVariant, C extends TypographyComponent<T>>(
    props: TypographyProps<T, C> & { readonly ref?: TypographyRef<C> },
  ): JSX.Element;
};
