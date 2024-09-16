import React, { type ForwardedRef, forwardRef, useMemo, type ReactNode, useCallback } from "react";

import * as types from "~/components/input/select/types";

import { BasicSelectInput, type BasicSelectInputProps } from "./BasicSelectInput";
import { MultiValueRenderer, type MultiValueRendererProps } from "./MultiValueRenderer";

export interface DataSelectInputProps<
  M extends types.DataSelectModel,
  O extends types.DataSelectOptions<M>,
> extends Omit<BasicSelectInputProps, "showPlaceholder" | "children">,
    Pick<
      MultiValueRendererProps<M>,
      | "chipClassName"
      | "badgeProps"
      | "chipSize"
      | "onBadgeClose"
      | "getBadgeIcon"
      | "getBadgeProps"
      | "maximumValuesToRender"
    > {
  readonly value: types.DataSelectValue<M, O>;
  readonly modelValue: types.DataSelectModelValue<M, O> | types.NotSet;
  readonly options: O;
  readonly itemValueRenderer?: (m: M) => JSX.Element;
  readonly valueRenderer?: types.DataSelectValueRenderer<M, O>;
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
      onBadgeClose,
      valueRenderer,
      itemValueRenderer,
      getItemLabel: _getItemLabel,
      getBadgeIcon,
      getBadgeProps,
      getItemId: _getItemId,
      ...props
    }: DataSelectInputProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
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
        const value = options.getItemValue?.(m);
        if (typeof value === "string" || typeof value === "number") {
          return String(value);
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
      if (showPlaceholder || modelValue === types.NOTSET) {
        // This value will be hidden in favor of the placeholder anyways.
        return <></>;
      } else if (Array.isArray(modelValue)) {
        if (valueRenderer) {
          return valueRenderer(value, { modelValue });
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
      }
      return getItemLabel(modelValue as M);
    }, [
      value,
      modelValue,
      maximumValuesToRender,
      dynamicHeight,
      showPlaceholder,
      chipClassName,
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
      <BasicSelectInput
        {...props}
        dynamicHeight={dynamicHeight}
        ref={ref}
        showPlaceholder={showPlaceholder}
      >
        <>{renderedValue}</>
      </BasicSelectInput>
    );
  },
) as {
  <M extends types.DataSelectModel, O extends types.DataSelectOptions<M>>(
    props: DataSelectInputProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
