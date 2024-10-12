import React, { type ForwardedRef, forwardRef, useMemo, type ReactNode, useCallback } from "react";

import { logger } from "~/internal/logger";

import * as types from "~/components/input/select/types";

import { useDataSelectOptions } from "./hooks/use-data-select-options";
import { MultiValueRenderer, type MultiValueRendererProps } from "./MultiValueRenderer";
import {
  RootSelectInput,
  type RootSelectInputProps,
  type RootSelectInputInstance,
} from "./RootSelectInput";

export interface DataSelectInputProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> extends Omit<RootSelectInputProps, "showPlaceholder" | "children">,
    Pick<
      MultiValueRendererProps<M>,
      | "chipClassName"
      | "badgeProps"
      | "chipSize"
      | "onBadgeClose"
      | "getBadgeIcon"
      | "getBadgeProps"
      | "maximumValuesToRender"
      | "summarizeValueAfter"
      | "summarizeValue"
      | "valueSummary"
    > {
  readonly value: types.SelectNullableValue<{ model: M; options: O }> | types.NotSet;
  readonly modelValue: types.DataSelectNullableModelValue<M, O> | types.NotSet;
  readonly options: O;
  readonly itemValueRenderer?: (m: M) => JSX.Element;
  readonly valueRenderer?: (
    value: types.SelectValue<{ model: M; options: O }>,
    modelValue: types.DataSelectModelValue<M, O>,
  ) => ReactNode;
  readonly getItemLabel?: (m: M) => ReactNode;
}

export const DataSelectInput = forwardRef(
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
    {
      value,
      dynamicHeight = true,
      maximumValuesToRender,
      modelValue,
      options,
      chipClassName,
      chipSize,
      badgeProps,
      summarizeValue,
      summarizeValueAfter,
      valueSummary,
      onBadgeClose,
      valueRenderer,
      itemValueRenderer,
      getItemLabel: _getItemLabel,
      getBadgeIcon,
      getBadgeProps,
      ...props
    }: DataSelectInputProps<M, O>,
    ref: ForwardedRef<RootSelectInputInstance>,
  ) => {
    const { getModelId } = useDataSelectOptions<M, O>({ options });

    const showPlaceholder = useMemo(
      () => (Array.isArray(modelValue) && modelValue.length === 0) || modelValue === null,
      [modelValue],
    );

    const getItemLabel = useCallback(
      (m: M) => {
        if (_getItemLabel !== undefined) {
          return _getItemLabel(m);
        } else if ("valueLabel" in m && m.valueLabel !== undefined) {
          return m.valueLabel;
        } else if ("label" in m && m.label !== undefined) {
          return m.label;
        }
      },
      [_getItemLabel],
    );

    const renderedValue = useMemo(() => {
      if (showPlaceholder || modelValue === types.NOTSET || value === types.NOTSET) {
        // This value will be hidden in favor of the placeholder anyways.
        return <></>;
      } else if (Array.isArray(modelValue)) {
        if (!Array.isArray(value)) {
          logger.error("Encountered a non-array select value when the mdoel value is an array!", {
            modelValue,
            value,
          });
          return <></>;
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
            data={sorted}
            valueSummary={valueSummary}
            summarizeValue={summarizeValue}
            summarizeValueAfter={summarizeValueAfter}
            dynamicHeight={dynamicHeight}
            maximumValuesToRender={maximumValuesToRender}
            badgeProps={badgeProps}
            chipSize={chipSize}
            chipClassName={chipClassName}
            getBadgeLabel={getItemLabel}
            getBadgeIcon={getBadgeIcon}
            getBadgeProps={getBadgeProps}
            onBadgeClose={onBadgeClose}
            renderer={itemValueRenderer}
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
      dynamicHeight,
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
        onClick={e => {
          e.stopPropagation();
          props.onClick?.(e);
        }}
        dynamicHeight={dynamicHeight}
        ref={ref}
        showPlaceholder={showPlaceholder}
      >
        <>{renderedValue}</>
      </RootSelectInput>
    );
  },
) as {
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
    props: DataSelectInputProps<M, O> & { readonly ref?: ForwardedRef<RootSelectInputInstance> },
  ): JSX.Element;
};
