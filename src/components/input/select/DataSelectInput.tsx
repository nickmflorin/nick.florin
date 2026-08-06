import { type ForwardedRef, type JSX, type ReactNode, useCallback, useMemo } from 'react';

import { logger } from '~/internal/logger';

import * as types from '~/components/input/select/types';

import { useDataSelectOptions } from './hooks/use-data-select-options';
import { MultiValueRenderer, type MultiValueRendererProps } from './MultiValueRenderer';
import {
  RootSelectInput,
  type RootSelectInputInstance,
  type RootSelectInputProps,
} from './RootSelectInput';

export interface DataSelectInputProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>
  extends
    Omit<RootSelectInputProps, 'children' | 'isPlaceholderVisible'>,
    Pick<
      MultiValueRendererProps<M>,
      | 'badgeProps'
      | 'chipClassName'
      | 'chipSize'
      | 'getBadgeIcon'
      | 'getBadgeProps'
      | 'maximumValuesToRender'
      | 'onBadgeClose'
      | 'summarizeValue'
      | 'summarizeValueAfter'
      | 'valueSummary'
    > {
  readonly getItemLabel?: (m: M) => ReactNode;
  readonly itemValueRenderer?: (m: M) => JSX.Element;
  readonly modelValue: types.DataSelectNullableModelValue<M, O> | types.NotSet;
  readonly options: O;
  readonly value: types.NotSet | types.SelectNullableValue<{ model: M; options: O }>;
  readonly valueRenderer?: (
    value: types.SelectValue<{ model: M; options: O }>,
    modelValue: types.DataSelectModelValue<M, O>,
  ) => ReactNode;
}

export const DataSelectInput = <
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
>({
  badgeProps,
  chipClassName,
  chipSize,
  getBadgeIcon,
  getBadgeProps,
  getItemLabel: _getItemLabel,
  hasDynamicHeight = true,
  itemValueRenderer,
  maximumValuesToRender,
  modelValue,
  onBadgeClose,
  options,
  ref,
  summarizeValue,
  summarizeValueAfter,
  value,
  valueRenderer,
  valueSummary,
  ...props
}: {
  readonly ref?: ForwardedRef<RootSelectInputInstance>;
} & DataSelectInputProps<M, O>): JSX.Element => {
  const { getModelId } = useDataSelectOptions<M, O>({ options });

  const showPlaceholder = useMemo(
    () =>
      /* The NOTSET sentinel means the select's data - and therefore its model value - has not
         resolved yet. The placeholder stands in for that state so the input does not present as
         holding a value (which would also surface the clear button) before any data exists. */
      modelValue === types.NOTSET ||
      (Array.isArray(modelValue) && modelValue.length === 0) ||
      modelValue === null,
    [modelValue],
  );

  const getItemLabel = useCallback(
    (m: M) => {
      if (_getItemLabel !== undefined) {
        return _getItemLabel(m);
      } else if ('valueLabel' in m && m.valueLabel !== undefined) {
        return m.valueLabel;
      } else if ('label' in m && m.label !== undefined) {
        return m.label;
      }
    },
    [_getItemLabel],
  );

  const renderedValue = useMemo(() => {
    if (showPlaceholder || value === types.NOTSET) {
      // This value will be hidden in favor of the placeholder anyways.
      return null;
    } else if (Array.isArray(modelValue)) {
      if (!Array.isArray(value)) {
        logger.error('Encountered a non-array select value when the model value is an array!', {
          modelValue,
          value,
        });
        return null;
      } else if (valueRenderer) {
        /* These type coercions are safe because the difference between DataSelectValue and
           DataSelectNullableValue (and consequently DataSelectModelValue and
           DataSelectNullableModelValue) is only that the nullable forms can include a null value
           when the Select's behavior is single, but non-nullable.  Since we are already checking
           if the value and model values are arrays, we can safely coerce them to the non-nullable
           value forms because we know they are non-null. */
        return valueRenderer(
          value as types.SelectValue<{ model: M; options: O }>,
          modelValue as types.DataSelectModelValue<M, O>,
        );
      }
      /* Make sure to sort the models based on a consistent key to prevent reordering of the
         badges in the MultiValueRenderer when rerenders occur. */
      const sorted = modelValue.sort((a, b) => {
        const aKey = getModelId(a);
        const bKey = getModelId(b);
        return aKey > bKey ? 1 : -1;
      });
      return (
        <MultiValueRenderer<M>
          badgeProps={badgeProps}
          chipClassName={chipClassName}
          chipSize={chipSize}
          data={sorted}
          getBadgeIcon={getBadgeIcon}
          getBadgeLabel={getItemLabel}
          getBadgeProps={getBadgeProps}
          hasDynamicHeight={hasDynamicHeight}
          maximumValuesToRender={maximumValuesToRender}
          onBadgeClose={onBadgeClose}
          renderer={itemValueRenderer}
          summarizeValue={summarizeValue}
          summarizeValueAfter={summarizeValueAfter}
          valueSummary={valueSummary}
        />
      );
    } else if (modelValue !== null) {
      /* This type coercion is safe because we know the model value is non-null and not an array,
         meaning the only other possibility is that it is a single model value (i.e. the
         model). */
      return getItemLabel(modelValue as M);
    }
  }, [
    value,
    modelValue,
    maximumValuesToRender,
    hasDynamicHeight,
    showPlaceholder,
    chipClassName,
    summarizeValue,
    valueSummary,
    summarizeValueAfter,
    badgeProps,
    chipSize,
    getBadgeProps,
    onBadgeClose,
    valueRenderer,
    itemValueRenderer,
    getBadgeIcon,
    getItemLabel,
    getModelId,
  ]);

  return (
    <RootSelectInput
      {...props}
      hasDynamicHeight={hasDynamicHeight}
      isPlaceholderVisible={showPlaceholder}
      onClick={e => {
        e.stopPropagation();
        props.onClick?.(e);
      }}
      ref={ref}
    >
      <>{renderedValue}</>
    </RootSelectInput>
  );
};
