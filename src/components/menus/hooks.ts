import { useState, useMemo, useRef } from "react";

import isEqual from "lodash.isequal";

import { logger } from "~/application/logger";
import { useReferentialCallback } from "~/hooks";

import * as types from "./types";

export const reduceMenuValue = <M extends types.MenuModel, O extends types.MenuOptions<M>>(
  prev: types.MenuValue<M, O>,
  selected: types.ModelValue<M, O>,
  options: O,
): types.MenuValue<M, O> => {
  if (options.isMulti) {
    if (!Array.isArray(prev)) {
      throw new TypeError("");
    }
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
    return selected as types.MenuValue<M, O>;
  }
};

export const useMenuValue = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  initialValue,
  options,
  onChange: _onChange,
  value: _propValue,
  isReady = true,
  data,
}: Pick<
  types.MenuProps<M, O>,
  "data" | "value" | "onChange" | "initialValue" | "options" | "isReady"
>): [
  types.MenuValue<M, O>,
  types.MenuModelValue<M, O>,
  (v: types.ModelValue<M, O>, instance: types.MenuItemInstance) => void,
  (v: types.MenuValue<M, O>) => void,
] => {
  const [_value, setValue] = useState<types.MenuValue<M, O>>(() => {
    if (initialValue === undefined) {
      if (types.menuIsNonNullable<M, O>(options)) {
        /* TypeScript should prevent this externally to the component/hook, but just in case we
           need to validate it here as well. */
        throw new TypeError("The initial value is required for non-nullable single-select menus.");
      } else if (options.isMulti) {
        return [] as types.MenuValue<M, O>;
      }
      return null as types.MenuValue<M, O>;
    }
    return initialValue as types.MenuValue<M, O>;
  });

  const value = useMemo(
    () => (_propValue === undefined ? _value : _propValue),
    [_propValue, _value],
  );

  const modelValue = useMemo((): types.MenuModelValue<M, O> => {
    type LookupOptions = { throwIfNotAssociated?: boolean };
    type LookupRT<O extends LookupOptions> = O extends { throwIfNotAssociated: true }
      ? M | [M, ...M[]]
      : M | [M, ...M[]] | null;

    const lookup = <LO extends LookupOptions>(
      v: types.ModelValue<M, O>,
      opts?: LO,
    ): LookupRT<LO> => {
      const corresponding = data.filter(m => isEqual(types.getModelValue(m, options), v));
      if (corresponding.length > 1) {
        logger.error(
          `Multiple select models correspond to the same value, '${v}'!  This should not happen, ` +
            "the value should be unique!",
        );
        /* The relationship between the model and value should be unique, but in case it is not
           - just all of the models that correspond to the value to the set anyways.  It will
           just mean multiple models will be selected for the same value. */
        return corresponding as [M, ...M[]];
      } else if (corresponding.length === 0) {
        /* If the asynchronously loaded data has not yet been received, do not issue a warning if
           the Menu's value cannot be associated with a model in the data.  In this case, the
           Menu will be in a "locked" state, and prevent selection.  */
        if (!isReady) {
          /* Note: This may be inconsistent with whether or not the Menu is nullable or allows
             multiple selection - but since we are preventing the Menu from being used in this case,
             it is fine - since it is only temporary until the data is received. */
          return null as LookupRT<LO>;
        }
        /*
          Non Multi Menu Case
          -------------------
          In the case of a non-multi menu, if the value is not null but is not associated with any
          model in the dataset, we cannot return a null model value if the menu is also
          non-nullable.  This is because all of the callback logic in the Menu will assume that
          the model value is non-nullable (since it should be) if the value is also non-nullable.

          In this case, we have to throw an error that indicates the value is not tied to a model
          in the data, instead of logging it discretely.

          If the above case holds with the exception that the menu is nullable, we can more
          gracefully log the error, and return a null model value - since the callback logic will
          be typed such that a null model value is possible (since the value can be nullable).

          Multi Menu Case
          ---------------
          In the case of a multi menu, if a value in the value array is not associated with any
          model in the dataset, this is still an error - but we can more gracefully handle it by
          logging and simply excluding that potential model from the set of models represented by
          the array of values. */
        const msg =
          `No models correspond to the value, '${v}'!  This should not happen, the value ` +
          "should uniquely identify the model!";
        // Throw the error if the menu is non-multi and non-nullable.
        if (opts?.throwIfNotAssociated === true) {
          throw new TypeError(msg);
        }
        logger.error(msg);
        return null as LookupRT<LO>;
      }
      return corresponding[0];
    };

    if (options.isMulti) {
      if (types.valueIsMulti(value)) {
        return value.reduce<M[]>((prev, v) => {
          const ms = lookup(v);
          /* The relationship between the model and value should be unique, but in case it is not
             - but, just add all of the models that correspond to the value to the set anyways.  It
             will just mean multiple models will be selected for the same value. */
          if (Array.isArray(ms)) {
            return [...prev, ...ms];
          } else if (ms === null) {
            /* This should not happen - and means that the value is not tied to a model.  It is
               already logged, but here we will just ignore the fact that the value is not tied to
               a model and exclude it from the list of models represented by the value array. */
            return prev;
          }
          return [...prev, ms];
        }, []) as types.MenuModelValue<M, O>;
      }
      throw new TypeError("Encountered a non-array value when the menu is multi!");
    } else if (types.valueIsNotMulti(value)) {
      const ms = lookup(value, { throwIfNotAssociated: types.menuIsNonNullable<M, O>(options) });
      /* The relationship between the model and value should be unique, but in case it is not -
         we will have to assume/pick a model in the set of models that correspond to the value.
         This will lead to buggy behavior, but is better than crashing the app with an error. */
      if (Array.isArray(ms)) {
        // The array will not be empty, based on checks in the lookup method.
        return ms[0] as types.MenuModelValue<M, O>;
      } else if (ms === null) {
        /* This should not happen - and means that the value is not tied to a model.  It is already
           logged, but since we are not dealing with a multi-select menu, we can only return null
           if the menu is not non-nullable... Otherwise, we have to throw an error, because a null
           model value is not expected. */
        if (types.menuIsNonNullable<M, O>(options)) {
          // Note: We may want to log here instead?
          throw new TypeError(
            "Unexpected Condition: The value should not be returned as null if the menu is " +
              "non-nullable, a previous error should have been thrown instead!",
          );
        }
        return null as types.MenuModelValue<M, O>;
      }
      return ms as types.MenuModelValue<M, O>;
    } else if (value === null) {
      if (types.menuIsNonNullable<M, O>(options)) {
        // Note: We may want to log here instead?
        throw new TypeError("Encountered a null value when the menu is non-nullable!");
      }
      return null as types.MenuModelValue<M, O>;
    } else {
      throw new Error("Unreachable code reached!");
    }
  }, [data, value, options]);

  const selectModel = useReferentialCallback(
    (v: types.ModelValue<M, O>, instance: types.MenuItemInstance) => {
      const newValue: types.MenuValue<M, O> = reduceMenuValue(value, v, options);
      setValue(newValue);
      _onChange?.(newValue, instance);
    },
  );

  return [value, modelValue, selectModel, setValue];
};

export const useMenu = <M extends types.MenuModel, O extends types.MenuOptions<M>>() => {
  const ref = useRef<types.MenuInstance<M, O> | null>(null);
  return ref;
};
