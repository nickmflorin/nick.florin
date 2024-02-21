import { forwardRef } from "react";

import { type InputWrapperProps, InputWrapper } from "./generic";

export interface TextAreaProps
  extends Omit<InputWrapperProps<"textarea">, "component" | "children"> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props: TextAreaProps, ref) => <InputWrapper {...props} component="textarea" ref={ref} />,
);
