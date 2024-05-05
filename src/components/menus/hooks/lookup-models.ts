import type { ReactNode } from "react";

import isEqual from "lodash.isequal";

import { logger } from "~/application/logger";
import {
  type MenuOptions,
  type AllowedMenuModelValue,
  MenuValue,
  type MenuModel,
  getModelValue,
} from "~/components/menus";

export const lookupModelsInData = <M extends MenuModel, O extends MenuOptions<M>>(
  v: MenuModelValue<M>,
  {
    data,
    isReady,
    options: { isNullable = true, isMulti = false, getModelValue: _getModelValue },
  }: {
    data: M[];
    isReady: boolean | undefined;
    options: Pick<MenuOptions<M>, "isNullable" | "isMulti" | "getModelValue">;
  },
): M[] => {
  const corresponding = data.filter(m =>
    isEqual(getModelValue(m, { getModelValue: _getModelValue }), v),
  );
  if (corresponding.length > 1) {
    logger.error(
      `Multiple models correspond to the same value, '${v}'!  This should not happen, the value ` +
        "should uniquely identify a model in the data!",
    );
    /* The relationship between the model and value should be unique, but in case it is not - we
       do not want to throw an error, but rather log it.  The effect will be slightly buggy
       behavior, in the sense that multiple models will be selected for the same value. */
    return corresponding as [M, ...M[]];
  } else if (corresponding.length === 0) {
    /* If the asynchronously loaded data has not yet been received, do not issue a warning if the
       value cannot be associated with a model in the data. */
    if (!isReady) {
      /* Note: This may be inconsistent with typings on either the Menu or the Select, in cases
         where the Menu or the Seelct is not nullable or allows multiple selection - but since the
         Menu or Select should be in a "locked" state anyways - this null value is only temporary,
         and will revert to a non-nullable, valid value once the data is received. */
      return [];
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
    let msg: string;
    if (typeof v === "string" && v.trim() === "") {
      msg =
        "The value is an empty string, which is not associated with any model in the data!\n" +
        "Did you forget to set the 'isReady' flag?";
    } else {
      msg =
        `No models correspond to the value, '${v}'!  This should not happen, the value ` +
        "should uniquely identify the model!\n" +
        "Did you forget to set the 'isReady' flag?";
    }
    // Throw the error if the menu is non-multi and non-nullable.
    if (!isNullable && !isMulti) {
      throw new TypeError(msg);
    }
    logger.error(msg);
    return [];
  }
  return corresponding;
};

export const lookupModelsInValueData = <
  V extends AllowedMenuModelValue,
  M extends { value: V; label: ReactNode },
>(
  v: V,
  {
    data,
    options: { isNullable = true, isMulti = false },
  }: {
    data: M[];
    options: Pick<MenuOptions<M>, "isNullable" | "isMulti">;
  },
): M[] => {
  const corresponding = data.filter(m => isEqual(m.value, v));
  if (corresponding.length > 1) {
    logger.error(
      `Multiple models correspond to the same value, '${v}'!  This should not happen, the value ` +
        "should uniquely identify a model in the data!",
    );
    /* The relationship between the model and value should be unique, but in case it is not - we
       do not want to throw an error, but rather log it.  The effect will be slightly buggy
       behavior, in the sense that multiple models will be selected for the same value. */
    return corresponding as [M, ...M[]];
  } else if (corresponding.length === 0) {
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
    let msg: string;
    if (typeof v === "string" && v.trim() === "") {
      msg = "The value is an empty string, which is not associated with any model in the data!";
    } else {
      msg =
        `No models correspond to the value, '${v}'!  This should not happen, the value ` +
        "should uniquely identify the model!";
    }
    // Throw the error if the menu is non-multi and non-nullable.
    if (!isNullable && !isMulti) {
      throw new TypeError(msg);
    }
    logger.error(msg);
    return [];
  }
  return corresponding;
};
