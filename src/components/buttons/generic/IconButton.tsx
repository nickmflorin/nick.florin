import { forwardRef } from "react";

import { type Optional } from "utility-types";

import { capitalize } from "~/lib/formatters";
import { type IconProp, type IconElement } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { isIconProp } from "~/components/icons/util";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";

export type IconButtonProps<O extends types.ButtonOptions> = Optional<
  Omit<types.AbstractProps<"icon-button", O>, "buttonType">,
  "children"
> & {
  readonly icon?: IconProp | IconElement;
};

const Base = AbstractButton as React.FC<types.AbstractProps<"icon-button", types.ButtonOptions>>;

const LocalIconButton = forwardRef(
  <O extends types.ButtonOptions>(
    { children, icon, ...props }: IconButtonProps<O>,
    ref: types.PolymorphicButtonRef<O>,
  ) => {
    const ps = {
      ...props,
      buttonType: "icon-button",
    } as types.AbstractProps<"icon-button", O>;
    return (
      <Base {...ps} ref={ref}>
        {children ? children : isIconProp(icon) ? <Icon icon={icon} /> : icon}
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

type WithVariants = { [key in Capitalize<types.ButtonVariant>]: VariantPartial };

const withVariants = types.ButtonVariants.values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: <O extends types.ButtonOptions>(
      props: Omit<IconButtonProps<O>, "variant">,
    ) => <LocalIconButton<O> {...({ ...props, variant } as IconButtonProps<O>)} />,
  }),
  {} as WithVariants,
);

export const IconButton = Object.assign(LocalIconButton, withVariants);
