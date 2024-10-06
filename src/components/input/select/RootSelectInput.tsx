import React, {
  type ForwardedRef,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";

import { Input, type InputProps } from "~/components/input/generic";
import { NativeInput } from "~/components/input/generic/NativeInput";
import { type InputEventName } from "~/components/input/types";
import { classNames } from "~/components/types";

export interface RootSelectInputInstance extends HTMLDivElement {
  readonly setLoading: (v: boolean) => void;
  readonly focus: () => void;
}

export interface RootSelectInputProps
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
    | "id"
    | InputEventName
  > {
  readonly isOpen: boolean;
  readonly search?: string;
  readonly onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RootSelectInput = forwardRef(
  (
    {
      dynamicHeight = true,
      isOpen = false,
      search: propSearch,
      children,
      isLoading: propIsLoading,
      onSearch,
      onClear,
      ...props
    }: RootSelectInputProps,
    ref: ForwardedRef<RootSelectInputInstance>,
  ) => {
    const [_isLoading, setIsLoading] = useState(false);

    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLInputElement>(null);
    const [_search, setSearch] = useState("");

    const search = propSearch ?? _search;
    const isLoading = _isLoading || propIsLoading;

    useEffect(() => {
      if (isOpen && innerRef.current) {
        innerRef.current.focus();
      } else if (!isOpen && innerRef.current) {
        innerRef.current.blur();
      }
    }, [isOpen]);

    useImperativeHandle(ref, () =>
      Object.assign(outerRef.current as HTMLDivElement, {
        focus: () => innerRef.current?.focus(),
        setLoading: (v: boolean) => setIsLoading(v),
      }),
    );

    return (
      <Input
        withCaret
        {...props}
        ref={outerRef}
        isLoading={isLoading}
        showPlaceholder={
          onSearch === undefined ? props.showPlaceholder : !isOpen && props.showPlaceholder
        }
        isCaretOpen={isOpen}
        className={classNames("select", props.className)}
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
  (
    props: RootSelectInputProps & { readonly ref?: ForwardedRef<RootSelectInputInstance> },
  ): JSX.Element;
};
