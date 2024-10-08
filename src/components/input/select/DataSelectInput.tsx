import React, { type ForwardedRef, forwardRef, useMemo, type ReactNode, useCallback } from "react";

import { logger } from "~/internal/logger";

import * as types from "~/components/input/select/types";

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
  readonly value: types.DataSelectNullableValue<M, O> | types.NotSet;
  readonly modelValue: types.DataSelectNullableModelValue<M, O> | types.NotSet;
  readonly options: O;
  readonly itemValueRenderer?: (m: M) => JSX.Element;
  readonly valueRenderer?: (
    value: types.DataSelectValue<M, O>,
    modelValue: types.DataSelectModelValue<M, O>,
  ) => ReactNode;
  readonly getItemLabel?: (m: M) => ReactNode;
  readonly getItemId?: (m: M) => string | number | undefined;
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
      getItemId: _getItemId,
      ...props
    }: DataSelectInputProps<M, O>,
    ref: ForwardedRef<RootSelectInputInstance>,
  ) => {
    const showPlaceholder = useMemo(
      () => (Array.isArray(modelValue) && modelValue.length === 0) || modelValue === null,
      [modelValue],
    );

    const getItemId = useCallback(
      (m: M) => {
        const id = _getItemId?.(m);
        if (typeof id === "string" || typeof id === "number") {
          return String(id);
        } else if ("id" in m && (typeof m.id === "string" || typeof m.id === "number")) {
          return String(m.id);
        }
        return undefined;
      },
      [_getItemId],
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

    const getModelKey = useCallback(
      (m: M, index: number): string => {
        const id = getItemId(m);
        if (id !== undefined) {
          return id;
        }
        const v = options.getItemValue?.(m);
        if (typeof v === "string" || typeof v === "number") {
          return String(v);
        } else if ("value" in m && (typeof m.value === "string" || typeof m.value === "number")) {
          return String(m.value);
        }
        const label = getItemLabel(m);
        if (typeof label === "string" || typeof label === "number") {
          return String(label).toLocaleLowerCase();
        }
        return `model-${index}`;
      },
      [options, getItemLabel, getItemId],
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
            value as types.DataSelectValue<M, O>,
            modelValue as types.DataSelectModelValue<M, O>,
          );
        }
        /* Make sure to sort the models based on a consistent key to prevent reordering of the
           badges in the MultiValueRenderer when rerenders occur. */
        const sorted = modelValue
          .map((m, i) => ({ model: m, index: i }))
          .sort((a, b) => {
            const aKey = getModelKey(a.model, a.index);
            const bKey = getModelKey(b.model, b.index);
            return aKey > bKey ? 1 : -1;
          })
          .map((m): M => m.model);
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
      getModelKey,
      valueRenderer,
      itemValueRenderer,
      getBadgeIcon,
      getItemLabel,
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
