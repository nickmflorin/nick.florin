import dynamic from "next/dynamic";
import React, { type ForwardedRef, forwardRef, useMemo } from "react";

import type { Overwrite } from "utility-types";

import { getModelLabel } from "~/components/menus";

import { BaseSelectInput } from "./BaseSelectInput";
import * as types from "./types";

const MultiValueModelRenderer = dynamic(
  () => import("./MultiValueRenderer/MultiValueModelRenderer"),
) as types.MultiValueModelRendererCompoennt;

const MultiValueDatumRenderer = dynamic(
  () => import("./MultiValueRenderer/MultiValueDatumRenderer"),
) as types.MultiValueDatumRendererComponent;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const SelectInput = forwardRef<HTMLDivElement, types.SelectInputProps<any, any>>(
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    {
      isReady = true,
      dynamicHeight = true,
      value,
      options,
      maximumNumBadges,
      models,
      valueRenderer,
      valueModelRenderer,
      ...props
    }: types.SelectInputProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const renderedValue = useMemo(() => {
      if (types.selectIsFiltered(options)) {
        const v = value as types.SelectValueModel<
          M,
          Overwrite<O, { isFiltered: true; isMulti: true }>
        >[];
        if (v.length === 0) {
          return <></>;
        }
        return (
          <MultiValueDatumRenderer
            data={v}
            dynamicHeight={dynamicHeight}
            maximumNumBadges={maximumNumBadges}
          />
        );
      }
      const _models = models as M[];
      const _value = value as types.SelectValue<M, O>;

      if (_value === null || _models.length === 0) {
        if (options.isNullable === false && value === null) {
          /* We might have to remove this throw depending on how the initial value interacts with
             the logic. */
          throw new TypeError("Unexpectedly encountered null value for a non-nullable menu!");
        }
        return <></>;
      }

      if (options.isMulti) {
        if (valueRenderer) {
          return valueRenderer(_value, { models: _models as types.SelectModeledValue<M, O> });
        }
        return (
          <MultiValueModelRenderer
            data={_models}
            options={options}
            dynamicHeight={dynamicHeight}
            maximumNumBadges={maximumNumBadges}
          />
        );
      } else if (_models.length > 1) {
        throw new TypeError(
          `Unexpectedly encountered multiple models (${_models.length}) when rendering the ` +
            "select value for a single-select.",
        );
      } else if (valueRenderer) {
        return valueRenderer(_value, {
          // The 'models' array is guaranteed to not be empty due to the above checks.
          models: _models[0] as types.SelectModeledValue<M, O>,
        });
      } else if (valueModelRenderer) {
        // The 'models' array is guaranteed to not be empty due to the above checks.
        return valueModelRenderer(_value, { model: _models[0] });
      }
      const valueLabel = types.getSelectModelValueLabel(_models[0], options);
      return valueLabel ?? getModelLabel(_models[0], options);
    }, [
      valueRenderer,
      valueModelRenderer,
      models,
      value,
      options,
      maximumNumBadges,
      dynamicHeight,
    ]);

    return (
      <BaseSelectInput
        {...props}
        dynamicHeight={dynamicHeight}
        ref={ref}
        isLocked={props.isLocked || !isReady}
        showPlaceholder={
          value === null || models === null || (Array.isArray(models) && models.length === 0)
        }
      >
        <>{renderedValue}</>
      </BaseSelectInput>
    );
  },
) as {
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    props: types.SelectInputProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
