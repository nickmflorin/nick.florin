import { forwardRef, type ReactNode } from "react";

import { capitalize } from "~/lib/formatters";
import { type MultipleIconProp, parseMultipleIconsProp } from "~/components/icons";
import { isIconProp, isDynamicIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { sizeToString } from "~/components/types";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";

export type ButtonProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"button", O>,
  "buttonType"
> & {
  readonly icon?: MultipleIconProp;
};

const Base = AbstractButton as React.FC<types.AbstractProps<"button", types.ButtonOptions>>;

type LocalButtonType = {
  <O extends types.ButtonOptions>(
    props: ButtonProps<O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

const WithLoading = ({
  children,
  isLoading,
}: {
  children: ReactNode;
  isLoading?: boolean;
}): JSX.Element => {
  if (isLoading) {
    return <Spinner isLoading />;
  }
  return <>{children}</>;
};

const LocalButton = forwardRef(
  <O extends types.ButtonOptions>(
    { children, icon, ...props }: ButtonProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const [leftIcon, rightIcon] = icon ? parseMultipleIconsProp(icon) : ([null, null] as const);

    const ps = {
      ...props,
      buttonType: "button",
    } as types.AbstractProps<"button", O>;

    return (
      <Base {...ps} ref={ref}>
        {leftIcon ? (
          isIconProp(leftIcon) || isDynamicIconProp(leftIcon) ? (
            <Icon
              icon={leftIcon}
              isLoading={props.isLoading}
              fit="square"
              dimension="height"
              /* If the icon size corresponds to a discrete size, it will be set with a class name
               by the abstract form of the button.  Otherwise, the size has to be provided directly
               to the Icon component, in the case that it is non discrete (e.g. 32px, not
               "small"). */
              size={
                props.iconSize !== undefined &&
                !types.ButtonDiscreteIconSizes.contains(props.iconSize)
                  ? sizeToString(props.iconSize)
                  : undefined
              }
            />
          ) : (
            <WithLoading isLoading={props.isLoading}>{leftIcon}</WithLoading>
          )
        ) : (
          <Spinner isLoading={props.isLoading} />
        )}
        <div className="button__sub-content">{children}</div>
        {rightIcon ? (
          isIconProp(rightIcon) || isDynamicIconProp(rightIcon) ? (
            <Icon
              icon={rightIcon}
              fit="square"
              dimension="height"
              /* If the icon size corresponds to a discrete size, it will be set with a class name
                 by the abstract form of the button.  Otherwise, the size has to be provided
                 directly to the Icon component, in the case that it is non discrete (e.g. 32px, not
                 "small"). */
              size={
                props.iconSize !== undefined &&
                !types.ButtonDiscreteIconSizes.contains(props.iconSize)
                  ? sizeToString(props.iconSize)
                  : undefined
              }
            />
          ) : (
            rightIcon
          )
        ) : (
          <></>
        )}
      </Base>
    );
  },
) as LocalButtonType;

type VariantPartial = {
  <O extends types.ButtonOptions>(
    props: Omit<ButtonProps<O>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant<"button">>]: VariantPartial };

const withVariants = types.ButtonVariants.button.values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: forwardRef(
      <O extends types.ButtonOptions>(
        props: Omit<ButtonProps<O>, "variant">,
        ref: types.PolymorphicButtonRef<O>,
      ) => <Button<O> {...({ ...props, variant } as ButtonProps<O>)} ref={ref} />,
    ) as {
      <O extends types.ButtonOptions>(
        props: Omit<ButtonProps<O>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<O> },
      ): JSX.Element;
    },
  }),
  {} as WithVariants,
);

export const Button = Object.assign(LocalButton, withVariants) as LocalButtonType & WithVariants;
