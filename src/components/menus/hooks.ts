import { useState, useMemo, useRef } from "react";

import isEqual from "lodash.isequal";

import { logger } from "~/application/logger";
import { useReferentialCallback } from "~/hooks";

import * as types from "./types";

export const reduceMenuValue = <M extends types.MenuModel, O extends types.MenuOptions<M>>(
  prev: types.MenuValue<M, O> | types.MenuInitialValue<M, O>,
  selected: types.ModelValue<M, O>,
  options: O,
): types.MenuValue<M, O> => {
  if (Array.isArray(prev)) {
    const exists = (prev as types.MenuValue<M, O>[]).filter(v => isEqual(v, selected)).length > 0;
    if (exists) {
      return (prev as types.MenuValue<M, O>[]).filter(
        v => !isEqual(v, selected),
      ) as types.MenuValue<M, O>;
    }
    return [...prev, selected] as types.MenuValue<M, O>;
  } else if (options.isNullable !== false) {
    if (isEqual(prev, selected)) {
      return null as types.MenuValue<M, O>;
    }
    return selected as types.MenuValue<M, O>;
  } else {
    if (selected === null) {
      throw new TypeError("Unexpectedly encountered null selected value for a non nullable menu.");
    }
    return selected as types.MenuValue<M, O>;
  }
};

type LookupOptions = { throwIfNotAssociated?: boolean };
type LookupRT<Opts extends LookupOptions, M extends types.MenuModel> = Opts extends {
  throwIfNotAssociated: true;
}
  ? M | [M, ...M[]]
  : M | [M, ...M[]] | null;

const lookupMenuModel = <
  Opts extends LookupOptions,
  M extends types.MenuModel,
  O extends types.MenuOptions<M>,
>(
  v: types.MenuInitialValue<M, O> | types.MenuValue<M, O>,
  { data, isReady, options }: { data: M[]; isReady?: boolean; options: O },
  opts?: Opts,
): LookupRT<Opts, M> => {
  const corresponding = data.filter(m => isEqual(types.getModelValue(m, options), v));
  if (corresponding.length > 1) {
    logger.error(
      `Multiple select models correspond to the same value, '${v}'!  This should not happen, ` +
        "the value should be unique!",
    );
    /* The relationship between the model and value should be unique, but in case it is not - just
       all of the models that correspond to the value to the set anyways.  It will just mean
       multiple models will be selected for the same value. */
    return corresponding as [M, ...M[]];
  } else if (corresponding.length === 0) {
    /* If the asynchronously loaded data has not yet been received, do not issue a warning if the
       Menu's value cannot be associated with a model in the data.  In this case, the Menu will be
       in a "locked" state, and prevent selection.  */
    if (!isReady) {
      /* Note: This may be inconsistent with whether or not the Menu is nullable or allows multiple
         selection - but since we are preventing the Menu from being used in this case, it is fine
         - since it is only temporary until the data is received. */
      return null as LookupRT<Opts, M>;
    }
    /*
    Non Multi Menu Case
    -------------------
    In the case of a non-multi menu, if the value is not null but is not associated with any model
    in the dataset, we cannot return a null model value if the menu is also non-nullable.  This is
    because all of the callback logic in the Menu will assume that the model value is non-nullable
    (since it should be) if the value is also non-nullable.

    In this case, we have to throw an error that indicates the value is not tied to a model in the
    data, instead of logging it discretely.

    If the above case holds with the exception that the menu is nullable, we can more gracefully log
    the error, and return a null model value - since the callback logic will be typed such that a
    null model value is possible (since the value can be nullable).

    Multi Menu Case
    ---------------
    In the case of a multi menu, if a value in the value array is not associated with any model in
    the dataset, this is still an error - but we can more gracefully handle it by logging and simply
    excluding that potential model from the set of models represented by the array of values. */
    const msg =
      `No models correspond to the value, '${v}'!  This should not happen, the value ` +
      "should uniquely identify the model!";
    // Throw the error if the menu is non-multi and non-nullable.
    if (opts?.throwIfNotAssociated === true) {
      throw new TypeError(msg);
    }
    logger.error(msg);
    return null as LookupRT<Opts, M>;
  }
  return corresponding[0];
};

const getMenuModelValue = <M extends types.MenuModel, O extends types.MenuOptions<M>>(
  value: types.MenuInitialValue<M, O> | types.MenuValue<M, O>,
  { data, isReady, options }: { data: M[]; isReady?: boolean; options: O },
): types.MenuInitialModelValue<M, O> | types.MenuModelValue<M, O> => {
  if (Array.isArray(value)) {
    return value.reduce<M[]>((prev, v) => {
      const ms = lookupMenuModel(v, { data, isReady, options });
      /* The relationship between the model and value should be unique, but in case it is not - but,
         just add all of the models that correspond to the value to the set anyways.  It will just
         mean multiple models will be selected for the same value. */
      if (Array.isArray(ms)) {
        return [...prev, ...ms];
      } else if (ms === null) {
        /* This should not happen - and means that the value is not tied to a model.  It is already
           logged, but here we will just ignore the fact that the value is not tied to a model and
           exclude it from the list of models represented by the value array. */
        return prev;
      }
      return [...prev, ms];
    }, []) as types.MenuInitialModelValue<M, O> | types.MenuModelValue<M, O>;
  } else if (value === null) {
    return null as types.MenuInitialModelValue<M, O> | types.MenuModelValue<M, O>;
  } else {
    const ms = lookupMenuModel(
      value,
      { data, isReady, options },
      { throwIfNotAssociated: types.menuIsNonNullable<M, O>(options) },
    );
    /* The relationship between the model and value should be unique, but in case it is not - we
       will have to assume/pick a model in the set of models that correspond to the value. This will
       lead to buggy behavior, but is better than crashing the app with an error. */
    if (Array.isArray(ms)) {
      // The array will not be empty, based on checks in the lookup method.
      return ms[0] as types.MenuInitialModelValue<M, O> | types.MenuModelValue<M, O>;
    } else if (ms === null) {
      /* This should not happen - and means that the value is not tied to a model.  It is already
         logged, but since we are not dealing with a multi-select menu, we can only return null
         if the menu is not non-nullable... Otherwise, we have to throw an error, because a null
         model value is not expected. */
      return null as types.MenuInitialModelValue<M, O> | types.MenuModelValue<M, O>;
    }
    return ms as types.MenuInitialModelValue<M, O> | types.MenuModelValue<M, O>;
  }
};

type MenuValueReturnType<
  V extends boolean,
  M extends types.MenuModel,
  O extends types.MenuOptions<M>,
> = V extends true
  ? [
      types.MenuInitialValue<M, O> | types.MenuValue<M, O>,
      types.MenuInitialModelValue<M, O> | types.MenuModelValue<M, O>,
      (v: types.ModelValue<M, O>, instance: types.MenuItemInstance) => void,
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
  readonly value?: V extends true ? types.MenuValue<M, O> : types.ValueNotApplicable;
  readonly initialValue?: V extends true ? types.MenuInitialValue<M, O> : types.ValueNotApplicable;
  readonly isValued: V;
  readonly onChange?: (
    value: types.MenuValue<M, O>,
    params: { item: types.MenuItemInstance; models: types.MenuModelValue<M, O> },
  ) => void;
}): MenuValueReturnType<V, M, O> => {
  const [_value, setValue] = useState<
    types.MenuInitialValue<M, O> | types.MenuValue<M, O> | types.ValueNotApplicable
  >(() => {
    if (isValued) {
      if (initialValue === undefined) {
        if (types.menuIsNonNullable<M, O>(options)) {
          /* If the menu is non nullable and not multi-select, the initial value can still be null
             even if the menu is non nullable.  This is because non-nullability refers to the case
             that the value cannot be cleared, or changed to null, after it is set. */
          return null as types.MenuInitialValue<M, O>;
        } else if (options.isMulti) {
          return [] as types.MenuInitialValue<M, O>;
        }
        return null as types.MenuInitialValue<M, O>;
      }
      return initialValue as types.MenuInitialValue<M, O>;
    }
    return types.VALUE_NOT_APPLICABLE;
  });

  const value = useMemo(
    () => (_propValue === undefined ? _value : _propValue),
    [_propValue, _value],
  );

  const modelValue = useMemo(():
    | types.MenuInitialModelValue<M, O>
    | types.MenuModelValue<M, O>
    | types.ValueNotApplicable => {
    if (value !== types.VALUE_NOT_APPLICABLE) {
      return getMenuModelValue(value, { data, isReady, options });
    }
    return types.VALUE_NOT_APPLICABLE;
  }, [data, value, options, isReady]);

  const selectModel = useReferentialCallback(
    (v: types.ModelValue<M, O>, instance: types.MenuItemInstance) => {
      if (value === types.VALUE_NOT_APPLICABLE) {
        throw new Error("A model cannot be selected if the Menu is not valued.");
      }
      const newValue: types.MenuValue<M, O> = reduceMenuValue(value, v, options);
      /* At this point, since the model has already been selected, any potential initially null
         values for the Menu's value should not be present if the Menu is non nullable - because if
         the Menu is non-nullable, the value should not be able to be cleared after it was
         initialized as null. */
      if (newValue === null && types.menuIsNonNullable<M, O>(options)) {
        throw new Error("Unexpectedly encountered null model value for a non nullable menu.");
      }
      setValue(newValue);

      const modelV = getMenuModelValue(newValue, { data, isReady, options });
      /* At this point, since the model has already been selected, any potential initially null
         values for the Menu's value should not be present if the Menu is non nullable - because if
         the Menu is non-nullable, the value should not be able to be cleared after it was
         initialized as null. */
      if (modelV === null && types.menuIsNonNullable<M, O>(options)) {
        throw new Error("Unexpectedly encountered null model value for a non nullable menu.");
      }
      _onChange?.(newValue, {
        item: instance,
        models: modelV as types.MenuModelValue<M, O>,
      });
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
