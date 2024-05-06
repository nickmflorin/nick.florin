import { useState, useMemo, useRef } from "react";

import isEqual from "lodash.isequal";

import {
  type SelectValue,
  type SelectModel,
  type SelectOptions,
  type SelectModeledValue,
  type SelectDataOptions,
  type SelectValueDatum,
  type SelectModelValue,
} from "~/components/input/select";
import { useReferentialCallback } from "~/hooks";

import * as types from "../types";

import { lookupModelsInData, lookupModelsInValueData } from "./lookup-models";

function getMenuModeledValue<M extends types.MenuModel, O extends types.MenuOptions<M>>(
  value: types.MenuValue<M, O>,
  props: { data: M[]; isReady?: boolean; options: O },
): types.MenuModeledValue<M, O>;

function getMenuModeledValue<
  M extends SelectModel,
  O extends SelectOptions<M>,
  D extends SelectDataOptions<M, O>,
>(
  value: SelectValue<M, O, D>,
  props: { data: M[]; dataOptions: D; isReady?: boolean; options: O },
): SelectModeledValue<M, O, D>;

function getMenuModeledValue<
  M extends SelectModel | types.MenuModel,
  O extends SelectOptions<M> | types.MenuOptions<M>,
  D extends SelectDataOptions<M, O>,
>(
  value: types.MenuValue<M, O> | SelectValue<M, O, D>,
  {
    data,
    dataOptions,
    isReady,
    options,
  }: { data: M[]; dataOptions?: D; isReady?: boolean; options: O },
) {
  if (Array.isArray(value)) {
    return value.reduce<(M | SelectValueDatum<M, O>)[]>(
      (prev, v): (M | SelectValueDatum<M, O>)[] => {
        if (dataOptions && dataOptions.valueData) {
          const models = lookupModelsInValueData(v as SelectModelValue<M, O, D>, {
            data: dataOptions.valueData,
            options,
          });
          /* The relationship between the model and value should be unique, but in case it is not -
             but, just add all of the models that correspond to the value to the set anyways.  It
             will just mean multiple models will be selected for the same value. */
          return [...prev, ...models];
        } else {
          const models = lookupModelsInData(
            v as types.MenuModelValue<M, O> | SelectModelValue<M, O, D>,
            {
              data,
              options,
              isReady,
            },
          );
          /* The relationship between the model and value should be unique, but in case it is not -
             but, just add all of the models that correspond to the value to the set anyways.  It
             will just mean multiple models will be selected for the same value. */
          return [...prev, ...models];
        }
      },
      [] as (M | SelectValueDatum<M, O>)[],
    );
  } else if (value === null) {
    return null;
  }
  const v = value as types.MenuModelValue<M, O> | SelectModelValue<M, O, D>;
  const ms = lookupModelsInData(v, { data, isReady, options });
  /* The relationship between the model and value should be unique, but in case it is not - we
     will have to assume/pick a model in the set of models that correspond to the value. This will
     lead to buggy behavior, but is better than crashing the app with an error. */
  if (ms.length === 0) {
    /* This should not happen - and means that the value is not tied to a model.  It is already
       logged, but since we are not dealing with a multi-select menu, we can only return null
       if the menu is not non-nullable... Otherwise, we have to throw an error, because a null
       model value is not expected. */
    return null as types.MenuModeledValue<M, O> | SelectModeledValue<M, O, D>;
  }
  return ms[0] as types.MenuModeledValue<M, O> | SelectModeledValue<M, O, D>;
}

type MenuValueReturnType<
  V extends boolean,
  M extends types.MenuModel,
  O extends types.MenuOptions<M>,
> = V extends true
  ? [
      types.MenuValue<M, O>,
      types.MenuModeledValue<M, O>,
      (v: types.MenuModelValue<M, O>, instance: types.MenuItemInstance) => void,
      (v: types.MenuValue<M, O>) => void,
    ]
  : [types.ValueNotApplicable, types.ValueNotApplicable, undefined, undefined];

export const useMenuValue = <
  V extends boolean,
  M extends types.MenuModel,
  O extends types.MenuOptions<M>,
>({
  initialValue,
  options,
  onChange: _onChange,
  value: _propValue,
  isReady = true,
  isValued,
  data,
}: Pick<types.MenuProps<M, O>, "data" | "options" | "isReady"> & {
  readonly value?: types.MenuValue<M, O>;
  readonly initialValue?: types.MenuValue<M, O>;
  readonly isValued: V;
  readonly onChange?: (
    value: types.MenuValue<M, O>,
    params: { item: types.MenuItemInstance; models: types.MenuModeledValue<M, O> },
  ) => void;
}): MenuValueReturnType<V, M, O> => {
  const [_value, setValue] = useState<types.MenuValue<M, O> | types.ValueNotApplicable>(() => {
    if (isValued) {
      if (initialValue === undefined) {
        if (options.isNullable === false) {
          console.log("REVISIT THIS");
          /* If the menu is non nullable and not multi-select, the initial value can still be null
             even if the menu is non nullable.  This is because non-nullability refers to the case
             that the value cannot be cleared, or changed to null, after it is set. */
          throw new Error("The initial value for a non-nullable menu must be defined.");
          // return null as types.MenuValue<M, O>;
        } else if (options.isMulti) {
          return [] as types.MenuModelValue<M, O>[] as types.MenuValue<M, O>;
        }
        return null as types.MenuValue<M, O>;
      }
      return initialValue as types.MenuValue<M, O>;
    }
    return types.VALUE_NOT_APPLICABLE;
  });

  const value = useMemo(
    () => (_propValue === undefined ? _value : _propValue),
    [_propValue, _value],
  );

  const modelValue = useMemo((): types.MenuModeledValue<M, O> | types.ValueNotApplicable => {
    if (isValued) {
      if (value === types.VALUE_NOT_APPLICABLE) {
        throw new Error("Unexpectedly encountered non applicable menu value for a valued menu.");
      }
      /* This type coercion is safe, because the AnyMenuValue is just a distributed union of the
         possible values that the conditional type MenuValue represents. */
      return getMenuModelValue(value as types.AnyMenuValue<M, O>, { data, isReady, options });
    }
    return types.VALUE_NOT_APPLICABLE;
  }, [data, value, options, isValued, isReady]);

  const selectModel = useReferentialCallback(
    (v: types.MenuModelValue<M, O>, instance: types.MenuItemInstance) => {
      const existingValue = value;
      if (existingValue === types.VALUE_NOT_APPLICABLE) {
        throw new Error("A model cannot be selected if the Menu is not valued.");
      }
      const newValue = updateMenuValueWithSelection(existingValue, v, options);
      /* At this point, since the model has already been selected, any potential initially null
         values for the Menu's value should not be present if the Menu is non nullable - because if
         the Menu is non-nullable, the value should not be able to be cleared after it was
         initialized as null. */
      if (newValue === null && types.menuIsNonNullable<M, O>(options)) {
        throw new Error("Unexpectedly encountered null model value for a non nullable menu.");
      }
      setValue(newValue);
      /* This type coercion is safe, because the AnyMenuValue is just a distributed union of the
         possible values that the conditional type MenuValue represents. */
      const modelV = getMenuModelValue(newValue as types.AnyMenuValue<M, O>, {
        data,
        isReady,
        options,
      });
      /* At this point, since the model has already been selected, any potential initially null
         values for the Menu's value should not be present if the Menu is non nullable - because if
         the Menu is non-nullable, the value should not be able to be cleared after it was
         initialized as null. */
      if (modelV === null && types.menuIsNonNullable<M, O>(options)) {
        throw new Error("Unexpectedly encountered null model value for a non nullable menu.");
        /* If the Menu allows multiple selection, there will never be a case where selecting a model
           does not result in an overall change of the Menu's value - because selecting the same
           model that is already selected will cause it to deselect.  If the Menu does not allow
           multiple selection, then clicking the same previously selected model should not trigger
           the 'onChange' handler to fire. */
      } else if (Array.isArray(existingValue) || !isEqual(existingValue, newValue)) {
        _onChange?.(newValue, {
          item: instance,
          models: modelV as types.MenuModeledValue<M, O>,
        });
      }
    },
  );

  return [
    value,
    modelValue,
    isValued ? selectModel : undefined,
    isValued ? setValue : undefined,
  ] as MenuValueReturnType<V, M, O>;
};

export const useMenu = <M extends types.MenuModel, O extends types.MenuOptions<M>>() => {
  const ref = useRef<types.MenuInstance<M, O> | null>(null);
  return ref;
};
