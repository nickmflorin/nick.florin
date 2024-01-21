import type * as types from "./types";

import { type MultipleIconProp, parseMultipleIconsProp } from "~/components/icons";

import { AbstractButton } from "./AbstractButton";

export type ButtonProps<O extends types.ButtonOptions> = Omit<
  types.AbstractButtonProps<O>,
  "buttonType" | "children"
> & {
  readonly children: string;
  readonly icon?: MultipleIconProp;
};

export const Button = <O extends types.ButtonOptions>({
  icon,
  children,
  ...props
}: ButtonProps<O>) => {
  const icons = icon ? parseMultipleIconsProp(icon) : [null, null];
  return (
    <AbstractButton<O> {...({ ...props, buttonType: "button" } as types.AbstractButtonProps<O>)}>
      <div className="button__sub-content">{children}</div>
    </AbstractButton>
  );
};
