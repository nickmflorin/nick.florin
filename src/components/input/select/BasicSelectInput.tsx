import React, {
  type ForwardedRef,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  type RefObject,
} from "react";

import { Input, type InputProps } from "~/components/input/generic";
import { NativeInput } from "~/components/input/generic/NativeInput";
import { classNames } from "~/components/types";

export interface BasicSelectInputInstance {
  readonly focus: () => void;
}

export interface BasicSelectInputProps
  extends Pick<
    InputProps,
    | "isLocked"
    | "isLoading"
    | "size"
    | "isDisabled"
    | "isActive"
    | "actions"
    | "className"
    | "withCaret"
    | "dynamicHeight"
    | "onClear"
    | "isClearDisabled"
    | "placeholder"
    | "showPlaceholder"
    | "children"
    | "onFocus"
    | "onBlur"
    | "id"
  > {
  readonly isOpen: boolean;
  readonly search?: string;
  readonly inputRef?: RefObject<BasicSelectInputInstance>;
  readonly onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicSelectInput = forwardRef<HTMLDivElement, BasicSelectInputProps>(
  (
    {
      dynamicHeight = true,
      isOpen = false,
      search: propSearch,
      children,
      inputRef,
      onSearch,
      onClear,
      ...props
    }: BasicSelectInputProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);
    const [_search, setSearch] = useState("");

    const search = propSearch ?? _search;

    useEffect(() => {
      if (isOpen && innerRef.current) {
        innerRef.current.focus();
      } else if (!isOpen && innerRef.current) {
        innerRef.current.blur();
      }
    }, [isOpen]);

    useImperativeHandle(inputRef, () => ({
      focus: () => innerRef.current?.focus(),
    }));

    return (
      <Input
        withCaret
        {...props}
        showPlaceholder={
          onSearch === undefined ? props.showPlaceholder : !isOpen && props.showPlaceholder
        }
        isCaretOpen={isOpen}
        className={classNames("select", props.className)}
        ref={ref}
        isActive={isOpen || props.isActive}
        dynamicHeight={dynamicHeight}
        isClearVisible={onSearch === undefined ? true : !isOpen}
        onClear={onClear && (() => onClear?.())}
      >
        {onSearch && isOpen ? (
          <NativeInput
            ref={innerRef}
            value={search}
            onClick={e => {
              e.stopPropagation();
            }}
            onChange={e => {
              setSearch(e.target.value);
              onSearch(e);
            }}
          />
        ) : (
          children
        )}
      </Input>
    );
  },
) as {
  (props: BasicSelectInputProps & { readonly ref?: ForwardedRef<HTMLDivElement> }): JSX.Element;
};
