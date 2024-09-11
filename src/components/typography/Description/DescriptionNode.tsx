import React, { forwardRef } from "react";

import { type ComponentProps, type HTMLElementProps, classNames } from "~/components/types";
import {
  type TypographyCharacteristics,
  getTypographyClassName,
} from "~/components/types/typography";

export type DescriptionComponent = "div" | "p";

export interface DescriptionNodeProps extends TypographyCharacteristics, ComponentProps {
  readonly children: React.ReactNode;
  readonly as?: DescriptionComponent;
}

type DescriptionComponentProps<T extends DescriptionComponent> = Omit<
  HTMLElementProps<T>,
  keyof ComponentProps
> &
  ComponentProps;

const Div = forwardRef<HTMLDivElement, DescriptionComponentProps<"div">>(
  (props, ref): JSX.Element => <div {...props} ref={ref} className={classNames(props.className)} />,
);

const P = forwardRef<HTMLDivElement, DescriptionComponentProps<"p">>(
  (props, ref): JSX.Element => <p {...props} ref={ref} className={classNames(props.className)} />,
);

const Components = {
  p: P,
  div: Div,
} as const;

/* I do not understand why HTMLDivElement works as a ref regardless of the component type prop, but
   it does - likely because it is the most restrictive. */
export const DescriptionNode = forwardRef<HTMLDivElement, DescriptionNodeProps>(
  ({ children, style, as = "div", ...props }: DescriptionNodeProps, ref): JSX.Element => {
    const Component = Components[as];
    return (
      <Component
        style={style}
        ref={ref}
        className={classNames(
          "description",
          getTypographyClassName(props),
          {
            [classNames("text-sm", props.className)]: props.fontSize === undefined,
            [classNames("max-sm:text-xs", props.className)]: props.fontSize === undefined,
          },
          props.className,
        )}
      >
        {children}
      </Component>
    );
  },
);
