"use client";
import { type ReactNode, useRef, type MutableRefObject } from "react";

import { IconButton } from "~/components/buttons";
import { TextInput } from "~/components/input/TextInput";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { useDebounceCallback } from "~/hooks";

export interface TableFilterBarProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly isSearchable?: boolean;
  readonly searchPlaceholder?: string;
  readonly searchDebounceInterval?: number;
  readonly search?: string;
  readonly isControlled?: boolean;
  readonly searchInputRef?: MutableRefObject<HTMLInputElement | null>;
  readonly onSearch?: (search: string) => void;
  readonly onClear?: () => void;
}

export const TableFilterBar = ({
  children,
  isSearchable = true,
  searchPlaceholder = "Search...",
  searchDebounceInterval = 0,
  search = "",
  isControlled = false,
  searchInputRef,
  onSearch: _onSearch,
  onClear,
  ...props
}: TableFilterBarProps): JSX.Element => {
  const _inputRef = useRef<HTMLInputElement | null>(null);

  const inputRef = searchInputRef ?? _inputRef;

  const onSearch = useDebounceCallback((search: string) => {
    _onSearch?.(search);
  }, searchDebounceInterval);

  return (
    <div {...props} className={classNames("flex flex-row items-center gap-2", props.className)}>
      {isSearchable && (
        <TextInput
          ref={inputRef}
          defaultValue={!isControlled ? search : undefined}
          value={isControlled ? search : undefined}
          onChange={e => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="grow"
          onClear={() => {
            if (inputRef.current && !isControlled) {
              inputRef.current.value = "";
            }
            _onSearch?.("");
          }}
        />
      )}
      {children}
      <IconButton.Transparent
        icon="xmark"
        radius="full"
        element="button"
        className="text-gray-400 h-full aspect-square w-auto p-[4px] hover:text-gray-500"
        onClick={() => {
          if (inputRef.current && !isControlled) {
            inputRef.current.value = "";
          }
          onClear?.();
        }}
      />
    </div>
  );
};
