import dynamic from "next/dynamic";
import React, { type ForwardedRef, forwardRef, useMemo } from "react";

import {
  type MenuValue,
  getModelLabel,
  type MenuInitialValue,
  type MenuInitialModelValue,
  type MenuModelValue,
} from "~/components/menus";

import * as types from "../types";

import { SelectInput, type SelectInputProps } from "./SelectInput";

const MultiValueRenderer = dynamic(
  () => import("./MultiValueRenderer"),
) as types.MultiValueRendererCompoennt;

export interface MenuSelectInputProps<M extends types.SelectModel, O extends types.SelectOptions<M>>
  extends Omit<SelectInputProps, "showPlaceholder" | "children"> {
  readonly isReady?: boolean;
  readonly options: O;
  readonly maximumNumBadges?: number;
  readonly models: MenuInitialModelValue<M, O> | MenuModelValue<M, O>;
  readonly value: MenuInitialValue<M, O> | MenuValue<M, O>;
  readonly valueRenderer?: types.SelectValueRenderer<M, O, { models: MenuModelValue<M, O> }>;
  readonly valueModelRenderer?: types.SelectValueModelRenderer<M, O, { model: M }>;
}

export const MenuSelectInput = forwardRef<
  HTMLDivElement,
  MenuSelectInputProps<types.SelectModel, types.SelectOptions<types.SelectModel>>
>(
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
    }: MenuSelectInputProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const renderedValue = useMemo(() => {
      /* The models and/or value may be null regardless of whether or not the Menu is nullable.
         If the Menu is non-nullable, the value and/or models can be null on initialization,
         before any selection has occurred. */
      if (value === null || models === null || (Array.isArray(models) && models.length === 0)) {
        return <></>;
      }
      /* Coercion of the models here is safe, because we already checked if the models is null. If
         the models is not null, it is safe to assume that the models is a MenuModelValue, not the
         MenuInitialModelValue. */
      const _models = models as MenuModelValue<M, O>;
      /* Coercion of the value here is safe, because we already checked if the value is null. If the
         value is not null, it is safe to assume that the value is a MenuValue, not the
         MenuInitialValue. */
      const _value = value as MenuValue<M, O>;

      if (valueRenderer) {
        return valueRenderer(_value, { models: _models });
      } else if (Array.isArray(_models)) {
        return (
          <MultiValueRenderer
            models={_models as M[]}
            value={_value}
            options={options}
            dynamicHeight={dynamicHeight}
            maximumNumBadges={maximumNumBadges}
          />
        );
        /* TODO: Figure out how to allow the 'valueModelRenderer' to be specified for each model
           in the array, and then assemble them in a fashion similar to the MultiValueRenderer. */
      } else if (valueModelRenderer) {
        return valueModelRenderer(_value, { model: _models });
      }
      const valueLabel = types.getModelValueLabel(_models, options);
      return valueLabel ?? getModelLabel(_models, options);
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
      <SelectInput
        {...props}
        dynamicHeight={dynamicHeight}
        ref={ref}
        isLocked={props.isLocked || !isReady}
        showPlaceholder={
          value === null || models === null || (Array.isArray(models) && models.length === 0)
        }
      >
        <>{renderedValue}</>
      </SelectInput>
    );
  },
) as {
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    props: MenuSelectInputProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
