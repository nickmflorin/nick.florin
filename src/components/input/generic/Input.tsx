import { forwardRef, type ReactNode } from "react";

import { IconButton } from "~/components/buttons";
import { type IconProp, type IconName } from "~/components/icons";
import { CaretIcon } from "~/components/icons/CaretIcon";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { Actions, type Action } from "~/components/structural/Actions";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import { InputWrapper, type InputWrapperProps } from "./InputWrapper";

export interface InputProps
  extends Omit<InputWrapperProps<"div">, "component" | "onChange" | "placeholder">,
    ComponentProps,
    Pick<
      React.ComponentProps<"div">,
      | "onFocus"
      | "onBlur"
      | "onPointerDown"
      | "onMouseDown"
      | "onClick"
      | "onKeyDown"
      | "onKeyUp"
      | "onFocusCapture"
    > {
  readonly id?: string;
  readonly actions?: Action[];
  readonly icon?: IconProp | IconName;
  readonly withCaret?: boolean;
  readonly isCaretOpen?: boolean;
  readonly reserveSpaceForLoadingIndicator?: boolean;
  readonly isClearDisabled?: boolean;
  readonly isClearVisible?: boolean;
  readonly clearIcon?: IconProp | IconName;
  readonly placeholder?: ReactNode;
  readonly showPlaceholder?: boolean;
  readonly onClear?: () => void;
}

const InputPlaceholder = ({
  placeholder,
  showPlaceholder = false,
  children,
}: {
  readonly placeholder?: ReactNode;
  readonly showPlaceholder?: boolean;
  readonly children: ReactNode;
}) => {
  if (showPlaceholder && placeholder) {
    return <div className="placeholder">{placeholder}</div>;
  }
  return <>{children}</>;
};

export const Input = forwardRef<HTMLDivElement, InputProps>(
  (
    {
      children,
      actions = [],
      withCaret = false,
      isCaretOpen = false,
      isClearDisabled = false,
      clearIcon = { name: "xmark" },
      isClearVisible = true,
      reserveSpaceForLoadingIndicator = false,
      placeholder,
      showPlaceholder,
      icon,
      onClear,
      ...props
    }: InputProps,
    ref,
  ) => (
    <InputWrapper {...props} ref={ref} component="div">
      {icon && <Icon icon={icon} />}
      <div className="input__content">
        <InputPlaceholder showPlaceholder={showPlaceholder} placeholder={placeholder}>
          {children}
        </InputPlaceholder>
      </div>
      <Actions
        className="input__actions"
        gap={2}
        actions={[
          <div
            key="0"
            className={classNames("items-center justify-center", {
              "w-[14px]": reserveSpaceForLoadingIndicator || props.isLoading === true,
            })}
          >
            <Spinner isLoading={props.isLoading === true} size="14px" className="text-gray-500" />
          </div>,
          ...actions,
          onClear && isClearVisible && !showPlaceholder && (
            <IconButton.Transparent
              icon={clearIcon}
              key={actions.length + 1}
              radius="full"
              isDisabled={isClearDisabled}
              element="button"
              size="xsmall"
              className="text-gray-400 aspect-square p-[4px] hover:text-gray-500"
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
            />
          ),
          withCaret && (
            <CaretIcon
              key={actions.length + 2}
              open={isCaretOpen}
              className="text-gray-700 aspect-square w-auto h-[22px] p-[4px]"
              size="14px"
              /* We have to pass these props to the CaretIcon component such that the CaretIcon's
                 outer <div /> also picks up click events in cases where the Input is being used for
                 a Select or other component where click events on the Input are used. */
              onPointerDown={props.onPointerDown}
              onPointerUp={props.onMouseDown}
              onClick={props.onClick}
              onMouseDown={props.onMouseDown}
            />
          ),
        ]}
      />
    </InputWrapper>
  ),
);
