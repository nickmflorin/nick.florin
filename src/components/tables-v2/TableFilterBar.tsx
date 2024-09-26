"use client";
import React, { type ReactNode, useRef, type MutableRefObject, useState } from "react";

import type * as types from "./types";

import { IconButton } from "~/components/buttons";
import type { DrawerId } from "~/components/drawers";
import { TextInput } from "~/components/input/TextInput";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { ShowHide } from "~/components/util";
import { useDebounceCallback } from "~/hooks";

import { FiltersSelect } from "./FiltersSelect";
import { NewButton } from "./NewButton";

export interface TableFilterBarProps<F extends types.TableFilters> extends ComponentProps {
  readonly children?: ReactNode;
  readonly isSearchable?: boolean;
  readonly searchPlaceholder?: string;
  readonly searchDebounceInterval?: number;
  readonly searchPending?: boolean;
  readonly search?: string;
  readonly isControlled?: boolean;
  readonly excludeFilters?: (keyof F & string)[];
  readonly searchInputRef?: MutableRefObject<HTMLInputElement | null>;
  readonly newDrawerId?: DrawerId;
  readonly filters?: F;
  readonly configuration?: types.TableFiltersConfiguration<F>;
  readonly onSearch?: (search: string) => void;
  readonly onClear?: () => void;
}

export const TableFilterBar = <F extends types.TableFilters>({
  children,
  isSearchable = true,
  searchPlaceholder = "Search...",
  searchDebounceInterval = 0,
  search = "",
  isControlled = false,
  searchPending = false,
  searchInputRef,
  newDrawerId,
  configuration,
  filters,
  excludeFilters,
  onSearch: _onSearch,
  onClear,
  ...props
}: TableFilterBarProps<F>): JSX.Element => {
  const _inputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = searchInputRef ?? _inputRef;

  const [visibleFilters, setVisibleFilters] = useState<(keyof F & string)[]>(
    (configuration ?? [])
      .filter(config => config.isHiddenByDefault !== true)
      .map(config => config.id),
  );

  const onSearch = useDebounceCallback((search: string) => {
    _onSearch?.(search);
  }, searchDebounceInterval);

  return (
    <div {...props} className={classNames("flex flex-row items-center gap-2", props.className)}>
      {isSearchable && (
        <TextInput
          ref={inputRef}
          isLoading={searchPending}
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
      {filters && (
        <>
          {(configuration ?? []).map(filter => (
            <ShowHide
              key={filter.id}
              show={
                !(excludeFilters ?? []).includes(filter.id) && visibleFilters.includes(filter.id)
              }
            >
              {filter.renderer(filters[filter.id])}
            </ShowHide>
          ))}
        </>
      )}
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
      {configuration && (
        <FiltersSelect
          configuration={configuration}
          excludeFilters={excludeFilters}
          value={visibleFilters}
          onChange={f => setVisibleFilters(f)}
        />
      )}
      {newDrawerId && <NewButton drawerId={newDrawerId} />}
      {children}
    </div>
  );
};
