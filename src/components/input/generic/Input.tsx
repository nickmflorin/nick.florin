import { forwardRef } from "react";

import { Spinner } from "~/components/icons/Spinner";
import { type ActionsType, mergeActions } from "~/components/structural";
import { Actions } from "~/components/structural/Actions";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";

import { InputWrapper, type InputWrapperProps } from "./InputWrapper";

export interface InputProps
  extends Omit<InputWrapperProps<"div">, "component" | "onChange">,
    ComponentProps,
    Pick<
      HTMLElementProps<"div">,
      | "onFocus"
      | "onBlur"
      | "onPointerDown"
      | "onMouseDown"
      | "onClick"
      | "onKeyDown"
      | "onKeyUp"
      | "onFocusCapture"
    > {
  readonly actions?: ActionsType;
}

export const Input = forwardRef<HTMLDivElement, InputProps>(
  ({ children, actions, ...props }: InputProps, ref) => (
    <InputWrapper {...props} ref={ref} component="div">
      <Actions
        gap={4}
        actions={mergeActions(actions, {
          right: [
            <Spinner key="0" isLoading={props.isLoading} size="14px" className="text-gray-500" />,
          ],
        })}
      >
        <div className="input__content">{children}</div>
      </Actions>
    </InputWrapper>
  ),
);
