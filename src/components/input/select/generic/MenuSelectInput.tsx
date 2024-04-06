import dynamic from "next/dynamic";
import React, { type ForwardedRef, forwardRef, useMemo } from "react";

import type * as types from "../types";

import {
  type MenuModel,
  type MenuOptions,
  type MenuValue,
  type MenuModelValue,
  getModelLabel,
  type MenuInitialValue,
  type MenuInitialModelValue,
  getItemValueLabel,
} from "~/components/menus";

import { SelectInput, type SelectInputProps } from "./SelectInput";

const MultiValueRenderer = dynamic(
  () => import("./MultiValueRenderer"),
) as types.MultiValueRendererCompoennt;

export interface MenuSelectInputProps<M extends MenuModel, O extends MenuOptions<M>>
  extends Omit<SelectInputProps, "showPlaceholder" | "dynamicHeight" | "children"> {
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
  MenuSelectInputProps<MenuModel, MenuOptions<MenuModel>>
>(
  <M extends MenuModel, O extends MenuOptions<M>>(
    {
      isReady = true,
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
            maximumNumBadges={maximumNumBadges}
          />
        );
      } else if (valueModelRenderer) {
        return valueModelRenderer(_value, { model: _models });
      }
      const valueLabel = getItemValueLabel(_models, options);
      return valueLabel ?? getModelLabel(_models, options);
    }, [valueRenderer, valueModelRenderer, models, value, options, maximumNumBadges]);

    return (
      <SelectInput
        {...props}
        dynamicHeight={true}
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
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: MenuSelectInputProps<M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
