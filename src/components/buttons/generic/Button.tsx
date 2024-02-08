import { capitalize } from "~/lib/formatters";
import { type MultipleIconProp, parseMultipleIconsProp } from "~/components/icons";

import * as types from "../types";

import { AbstractButton } from "./AbstractButton";

export type ButtonProps<O extends types.ButtonOptions> = Omit<
  types.AbstractProps<"button", O>,
  "buttonType"
> & {
  readonly icon?: MultipleIconProp;
};

const Base = AbstractButton as React.FC<types.AbstractProps<"button", types.ButtonOptions>>;

const LocalButton = <O extends types.ButtonOptions>({
  children,
  icon,
  ...props
}: ButtonProps<O>) => {
  const icons = icon ? parseMultipleIconsProp(icon) : [null, null];

  const ps = {
    ...props,
    buttonType: "button",
  } as types.AbstractProps<"button", O>;

  return (
    <Base {...ps}>
      <div className="button__sub-content">{children}</div>
    </Base>
  );
};

type VariantPartial = {
  <O extends types.ButtonOptions>(props: Omit<ButtonProps<O>, "variant">): JSX.Element;
};

type WithVariants = { [key in Capitalize<types.ButtonVariant>]: VariantPartial };

const withVariants = types.ButtonVariants.values.reduce<WithVariants>(
  (acc, variant) => ({
    ...acc,
    [capitalize(variant)]: <O extends types.ButtonOptions>(
      props: Omit<ButtonProps<O>, "variant">,
    ) => <Button<O> {...({ ...props, variant } as ButtonProps<O>)} />,
  }),
  {} as WithVariants,
);

export const Button = Object.assign(LocalButton, withVariants);
