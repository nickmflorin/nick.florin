'use client';
import {
  type JSX,
  type MouseEventHandler,
  type MutableRefObject,
  type ReactNode,
  useRef,
  useState,
} from 'react';

import type * as types from './types';

import { IconButton } from '~/components/buttons';
import { type DrawerId } from '~/components/drawers';
import { Tooltip } from '~/components/floating/Tooltip';
import { TextInput } from '~/components/input/TextInput';
import { classNames, type ComponentProps } from '~/components/types';
import { useDebounceCallback } from '~/hooks';

import { FiltersSelect } from './FiltersSelect';
import { NewButton } from './NewButton';

/**
 * Narrows the `onClick` handler that the floating element library embeds in the reference props it
 * provides to the tooltip's trigger, which it types as a record of unknown values.
 */
const isButtonClickHandler = (value: unknown): value is MouseEventHandler<HTMLButtonElement> =>
  typeof value === 'function';

export interface TableFilterBarProps<F extends types.TableFilters> extends ComponentProps {
  readonly children?: ReactNode;
  readonly configuration?: types.TableFiltersConfiguration<F>;
  readonly excludeFilters?: (keyof F & string)[];
  readonly filters?: F;
  readonly isControlled?: boolean;
  readonly isSearchable?: boolean;
  readonly isSearchPending?: boolean;
  readonly newDrawerId?: DrawerId;
  readonly onClear?: () => void;
  readonly onSearch?: (search: string) => void;
  readonly search?: string;
  readonly searchDebounceInterval?: number;
  readonly searchInputRef?: MutableRefObject<HTMLInputElement | null>;
  readonly searchPlaceholder?: string;
}

interface TableFilterRendererProps<K extends types.TableFilterId<F>, F extends types.TableFilters> {
  readonly config: types.TableFilterConfiguration<K, F>;
  readonly excludeFilters?: types.TableFilterId<F>[];
  readonly value: F[K];
  readonly visibleFilters: types.TableFilterId<F>[];
}

export const TableFilterRenderer = <
  K extends types.TableFilterId<F>,
  F extends types.TableFilters,
>({
  config,
  excludeFilters = [],
  value,
  visibleFilters = [],
}: TableFilterRendererProps<K, F>): JSX.Element | null => {
  if (excludeFilters.includes(config.id) || !visibleFilters.includes(config.id)) {
    return null;
  } else if (config.tooltipLabel) {
    const tooltip =
      typeof config.tooltipLabel === 'function' ? config.tooltipLabel(value) : config.tooltipLabel;
    return (
      <Tooltip content={tooltip}>{popoverProps => config.renderer(value, popoverProps)}</Tooltip>
    );
  }
  return <>{(config as types.TableFilterWoTooltip<F, K>).renderer(value)}</>;
};

export const TableFilterBar = <F extends types.TableFilters>({
  children,
  configuration,
  excludeFilters,
  filters,
  isControlled = false,
  isSearchable = true,
  isSearchPending = false,
  newDrawerId,
  onClear,
  onSearch: _onSearch,
  search = '',
  searchDebounceInterval = 0,
  searchInputRef,
  searchPlaceholder = 'Search...',
  ...props
}: TableFilterBarProps<F>): JSX.Element => {
  const _inputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = searchInputRef ?? _inputRef;

  const [visibleFilters, setVisibleFilters] = useState<(keyof F & string)[]>(
    (configuration ?? [])
      .filter(config => config.isHiddenByDefault !== true)
      .map(config => config.id),
  );

  const onSearch = useDebounceCallback((nextSearch: string) => {
    _onSearch?.(nextSearch);
  }, searchDebounceInterval);

  return (
    <div {...props} className={classNames('flex flex-row items-center gap-2', props.className)}>
      {isSearchable ? (
        <TextInput
          className='grow'
          defaultValue={isControlled ? undefined : search}
          isLoading={isSearchPending}
          onChange={e => onSearch(e.target.value)}
          onClear={() => {
            if (inputRef.current && !isControlled) {
              inputRef.current.value = '';
            }
            _onSearch?.('');
          }}
          placeholder={searchPlaceholder}
          ref={inputRef}
          value={isControlled ? search : undefined}
        />
      ) : null}
      {filters ? (
        <>
          {(configuration ?? []).map(filter => (
            <TableFilterRenderer
              config={filter}
              excludeFilters={excludeFilters}
              key={filter.id}
              value={filters[filter.id]}
              visibleFilters={visibleFilters}
            />
          ))}
        </>
      ) : null}
      <Tooltip content='Clear filters'>
        {({ params, ref }) => (
          <IconButton.Transparent
            {...params}
            className='text-gray-400 h-full aspect-square w-auto p-[4px] hover:text-gray-500'
            element='button'
            icon='xmark'
            onClick={e => {
              if (isButtonClickHandler(params.onClick)) {
                params.onClick(e);
              }
              if (inputRef.current && !isControlled) {
                inputRef.current.value = '';
              }
              onClear?.();
            }}
            radius='full'
            ref={ref}
          />
        )}
      </Tooltip>
      {configuration ? (
        <FiltersSelect
          configuration={configuration}
          excludeFilters={excludeFilters}
          onChange={f => setVisibleFilters(f)}
          value={visibleFilters}
        />
      ) : null}
      {newDrawerId ? <NewButton drawerId={newDrawerId} /> : null}
      {children}
    </div>
  );
};
