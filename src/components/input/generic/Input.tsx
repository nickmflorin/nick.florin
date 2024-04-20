import { forwardRef } from "react";

import { CaretIcon } from "~/components/icons/CaretIcon";
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
  readonly withCaret?: boolean;
  readonly caretIsOpen?: boolean;
}

export const Input = forwardRef<HTMLDivElement, InputProps>(
  ({ children, actions, caretIsOpen = false, withCaret, ...props }: InputProps, ref) => (
    <InputWrapper {...props} ref={ref} component="div">
      <Actions
        gap={8}
        actions={mergeActions(actions, {
          right: [
            /* Always leave space for the Spinner, regardless of whether or not it is loading.  This
               prevents the shifting of elements and text inside the Input when the loading state
               changes. */
            <div className="w-[14px] items-center justify-center" key="0">
              <Spinner isLoading={props.isLoading} size="14px" className="text-gray-500" />
            </div>,
            withCaret ? <CaretIcon key="1" open={caretIsOpen} /> : null,
          ],
        })}
      >
        <div className="input__content">{children}</div>
      </Actions>
    </InputWrapper>
  ),
);
