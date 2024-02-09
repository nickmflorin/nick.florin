import clsx from "clsx";
import omit from "lodash.omit";
import pick from "lodash.pick";

import { type InputProps, Input, NativeInput, type NativeInputProps } from "./generic";

export interface TextInputProps
  extends Omit<InputProps, "children">,
    Omit<NativeInputProps, "disabled" | "children" | "size"> {}

const INPUT_PROPS = ["className", "style", "variant", "size"] as const;

export const TextInput = ({ disabled, ...props }: TextInputProps) => (
  <Input
    {...pick(props, INPUT_PROPS)}
    disabled={disabled}
    className={clsx("text-input", props.className)}
  >
    <NativeInput {...omit(props, INPUT_PROPS)} disabled={disabled} />
  </Input>
);
