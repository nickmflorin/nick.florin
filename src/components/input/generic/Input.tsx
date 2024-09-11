import dynamic from "next/dynamic";
import { forwardRef } from "react";

import { CaretIcon } from "~/components/icons/CaretIcon";
import { Spinner } from "~/components/icons/Spinner";
import { type ActionsType, mergeActions } from "~/components/structural";
import { Actions } from "~/components/structural/Actions";
import { classNames } from "~/components/types";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";

import { InputWrapper, type InputWrapperProps } from "./InputWrapper";

const ClearButton = dynamic(() => import("~/components/buttons/ClearButton"), {});

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
  readonly reserveSpaceForLoadingIndicator?: boolean;
  readonly clearDisabled?: boolean;
  readonly onClear?: () => void;
}

export const Input = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      children,
      actions,
      caretIsOpen = false,
      clearDisabled = false,
      reserveSpaceForLoadingIndicator = true,
      onClear,
      withCaret,
      ...props
    }: InputProps,
    ref,
  ) => (
    <InputWrapper {...props} ref={ref} component="div">
      <Actions
        gap={6}
        actions={mergeActions(actions, {
          right: [
            /* By default, leave space for the Spinner, regardless of whether or not it is loading.
               This prevents the shifting of elements and text inside the Input when the loading
               state changes. */
            <div
              key="0"
              className={classNames("w-[14px] items-center justify-center", {
                "w-[14px]": reserveSpaceForLoadingIndicator,
              })}
            >
              <Spinner isLoading={props.isLoading} size="14px" className="text-gray-500" />
            </div>,
            onClear ? (
              <ClearButton
                key="1"
                isDisabled={clearDisabled}
                onClick={e => {
                  e.stopPropagation();
                  onClear();
                }}
              />
            ) : null,
            withCaret ? <CaretIcon key="2" open={caretIsOpen} /> : null,
          ],
        })}
      >
        <div className="input__content">{children}</div>
      </Actions>
    </InputWrapper>
  ),
);
