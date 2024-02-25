import { forwardRef } from "react";

import { type InputWrapperProps, InputWrapper } from "./generic";

export interface TextAreaProps
  extends Omit<InputWrapperProps<"textarea">, "component" | "children" | "dynamicHeight"> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props: TextAreaProps, ref) => (
    <InputWrapper {...props} dynamicHeight={true} component="textarea" ref={ref} />
  ),
);
