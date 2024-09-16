import { forwardRef } from "react";

import { omit, pick } from "lodash-es";

import { classNames } from "~/components/types";

import { type InputProps, Input, NativeInput, type NativeInputProps } from "./generic";

export interface TextInputProps
  extends Omit<InputProps, "children" | "dynamicHeight" | "placeholder">,
    Omit<NativeInputProps, keyof InputProps | "value"> {
  readonly value?: string;
  readonly placeholder?: string;
}

const INPUT_PROPS = [
  "className",
  "style",
  "variant",
  "size",
  "onFocus",
  "onBlur",
  "onPointerDown",
  "onMouseDown",
  "onClick",
  "onKeyDown",
  "onKeyUp",
  "onFocusCapture",
  "actions",
  "isActive",
  "isLocked",
  "isLoading",
  "isReadOnly",
  "radius",
  "icon",
  "isClearVisible",
  "isClearDisabled",
  "onClear",
  "clearIcon",
  "reserveSpaceForLoadingIndicator",
] as const;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ isDisabled, ...props }: TextInputProps, ref) => (
    <Input
      {...pick(props, INPUT_PROPS)}
      isDisabled={isDisabled}
      className={classNames("text-input", props.className)}
      dynamicHeight={false}
    >
      <NativeInput {...omit(props, INPUT_PROPS)} isDisabled={isDisabled} ref={ref} />
    </Input>
  ),
);
