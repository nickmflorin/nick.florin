import { forwardRef } from "react";

import clsx from "clsx";
import omit from "lodash.omit";
import pick from "lodash.pick";

import { type InputProps, Input, NativeInput, type NativeInputProps } from "./generic";

export interface TextInputProps
  extends Omit<InputProps, "children">,
    Omit<NativeInputProps, keyof InputProps> {}

const INPUT_PROPS = ["className", "style", "variant", "size"] as const;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ isDisabled, ...props }: TextInputProps, ref) => (
    <Input
      {...pick(props, INPUT_PROPS)}
      isDisabled={isDisabled}
      className={clsx("text-input", props.className)}
    >
      <NativeInput {...omit(props, INPUT_PROPS)} isDisabled={isDisabled} ref={ref} />
    </Input>
  ),
);
