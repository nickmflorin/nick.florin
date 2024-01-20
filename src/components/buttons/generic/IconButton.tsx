import { capitalize } from "~/lib/formatters";
import { type IconProp, type IconElement } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { isIconProp } from "~/components/icons/util";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";

export type IconButtonProps<O extends types.ButtonOptions> = Omit<
  types.AbstractButtonProps<O>,
  "children" | "buttonType"
> & {
  readonly icon: IconProp | IconElement;
};

const LocalIconButton = <O extends types.ButtonOptions>({ icon, ...props }: IconButtonProps<O>) => (
  <AbstractButton<O> {...({ ...props, buttonType: "icon-button" } as types.AbstractButtonProps<O>)}>
    {isIconProp(icon) ? <Icon icon={icon} /> : icon}
  </AbstractButton>
);

type VariantPartial = {
  <O extends types.ButtonOptions>(props: Omit<IconButtonProps<O>, "variant">): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant>]: VariantPartial };

const withVariants = types.ButtonVariants.values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: <O extends types.ButtonOptions>(
      props: Omit<IconButtonProps<O>, "variant">,
    ) => <LocalIconButton<O> {...props} variant={variant} />,
  }),
  {} as WithVariants,
);

export const IconButton = Object.assign(LocalIconButton, withVariants);
