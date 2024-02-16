import { forwardRef, type ReactNode } from "react";

import { type Optional } from "utility-types";

import { capitalize } from "~/lib/formatters";
import { type IconProp } from "~/components/icons";
import { isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import Spinner from "~/components/icons/Spinner";
import { sizeToString } from "~/components/types";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";

export type IconButtonProps<O extends types.ButtonOptions> = Optional<
  Omit<types.AbstractProps<"icon-button", O>, "buttonType">,
  "children"
> & {
  readonly icon?: IconProp;
};

const Base = AbstractButton as React.FC<types.AbstractProps<"icon-button", types.ButtonOptions>>;

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

const LocalIconButton = forwardRef(
  <O extends types.ButtonOptions>(
    { children, icon, isLoading, ...props }: IconButtonProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const ps = {
      ...props,
      buttonType: "icon-button",
    } as types.AbstractProps<"icon-button", O>;
    return (
      <Base {...ps} ref={ref} isLoading={isLoading}>
        {children ? (
          <WithLoading isLoading={isLoading}>{children}</WithLoading>
        ) : isIconProp(icon) ? (
          <Icon
            icon={icon}
            isLoading={isLoading}
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
          <WithLoading isLoading={isLoading}>{icon}</WithLoading>
        )}
      </Base>
    );
  },
) as {
  <O extends types.ButtonOptions>(
    props: IconButtonProps<O> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type VariantPartial = {
  <O extends types.ButtonOptions>(
    props: Omit<IconButtonProps<O>, "variant"> & { readonly ref?: types.PolymorphicButtonRef<O> },
  ): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant<"icon-button">>]: VariantPartial };

const withVariants = types.ButtonVariants["icon-button"].values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: <O extends types.ButtonOptions>(
      props: Omit<IconButtonProps<O>, "variant">,
    ) => <LocalIconButton<O> {...({ ...props, variant } as IconButtonProps<O>)} />,
  }),
  {} as WithVariants,
);

export const IconButton = Object.assign(LocalIconButton, withVariants);
