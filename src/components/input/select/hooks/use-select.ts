import { useCallback, useState, useMemo, useEffect } from "react";

import { isEqual } from "lodash-es";

import { UnreachableCaseError } from "~/application/errors";
import { logger } from "~/internal/logger";

import * as types from "~/components/input/select/types";

export interface UseSelectParams<
  V extends types.AllowedSelectValue,
  B extends types.SelectBehaviorType,
> {
  readonly initialValue?: types.SelectValue<V, B>;
  readonly behavior: B;
  /* This prop is only used internally to the <Select /> - related components.  It should not be
     provided to this hook directly when it is used outside of the Select or DataSelect's
     internals. */
  readonly __private_controlled_value__?: types.SelectNullableValue<V, B>;
  readonly isReady?: boolean;
  readonly onChange?: types.SelectChangeHandler<V, B>;
  readonly onSelect?: (
    value: types.SelectValue<V, B>,
    params: types.SelectEventChangeParams<typeof types.SelectEvents.SELECT, V>,
  ) => void;
  readonly onDeselect?: types.IfDeselectable<
    B,
    (
      value: types.SelectValue<V, B>,
      params: types.SelectEventChangeParams<typeof types.SelectEvents.DESELECT, V>,
    ) => void
  >;
  readonly onClear?: types.IfClearable<
    B,
    (
      value: types.SelectValue<V, B>,
      params: types.SelectEventChangeParams<typeof types.SelectEvents.CLEAR, V>,
    ) => void
  >;
}

const INDETERMINATE = "__INDETERMINATE__" as const;
type Indeterminate = typeof INDETERMINATE;

const CONTROLLED = "__CONTROLLED__" as const;
type Controlled = typeof CONTROLLED;

const getInitialValue = <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>({
  behavior,
  initialValue,
  __private_controlled_value__,
}: Pick<UseSelectParams<V, B>, "behavior" | "initialValue" | "__private_controlled_value__">):
  | types.SelectValue<V, B>
  | Controlled => {
  if (__private_controlled_value__ === undefined) {
    if (initialValue === undefined) {
      if (behavior === types.SelectBehaviorTypes.SINGLE_NULLABLE) {
        return null as types.SelectValue<V, B>;
      } else if (behavior === types.SelectBehaviorTypes.MULTI) {
        return [] as V[] as types.SelectValue<V, B>;
      }
      throw new Error(
        "For a single, non-nullable select, without a controlled value, the 'initialValue' " +
          "prop must be defined!",
      );
    }
    return initialValue;
  } else if (initialValue !== undefined) {
    logger.warn(
      "The 'initialValue' prop is ignored when the select is being used in a controlled fashion.",
      { capture: false },
    );
  }
  return CONTROLLED;
};

/**
 * A hook that is responsible for maintaining the value of a Select component, based on the behavior
 * of the Select, {@link types.SelectBehaviorType}, and the value-related props provided to the
 * Select.
 */
export const useSelect = <V extends types.AllowedSelectValue, B extends types.SelectBehaviorType>({
  initialValue,
  behavior,
  __private_controlled_value__,
  isReady = true,
  onSelect,
  onClear,
  onDeselect,
  onChange,
}: UseSelectParams<V, B>): types.ManagedSelect<V, B> => {
  const [_value, __setValue] = useState<
    types.SelectNullableValue<V, B> | Controlled | types.NotSet
  >(() =>
    isReady
      ? getInitialValue({ behavior, initialValue, __private_controlled_value__ })
      : types.NOTSET,
  );

  const _setValue = useCallback(
    (
      v:
        | types.SelectNullableValue<V, B>
        | ((curr: types.SelectNullableValue<V, B> | types.NotSet) => types.SelectValue<V, B>),
      options?: { __private_ignore_controlled_state__: boolean },
    ) => {
      __setValue(curr => {
        if (curr === CONTROLLED) {
          if (options?.__private_ignore_controlled_state__) {
            return curr;
          }
          throw new Error("Cannot set the value of a controlled select!");
        }
        return typeof v === "function" ? v(curr) : v;
      });
    },
    [],
  );

  const isControlled = useMemo(() => _value === CONTROLLED, [_value]);

  const value = useMemo(() => {
    if (_value === CONTROLLED) {
      /* This can only happen if the controlled select value is changed from a defined value to an
         undefined value after the initial render.  This means that the select's behavior is being
         changed from controlled to uncontrolled, which is not allowed in React. */
      if (__private_controlled_value__ === undefined) {
        throw new Error(
          "Cannot change the Select's behavior from controlled to uncontrolled after the " +
            "initial render!",
        );
      }
      return __private_controlled_value__;
    }
    return _value;
  }, [_value, __private_controlled_value__]);

  const onAction = useCallback(
    <E extends types.SelectEvent>(
      v: types.SelectValue<V, B>,
      params: types.SelectEventChangeParams<E, V>,
    ) => {
      switch (params.event) {
        case types.SelectEvents.SELECT:
          return onSelect?.(v, params);
        case types.SelectEvents.DESELECT:
          return onDeselect?.(v, params);
        case types.SelectEvents.CLEAR:
          return onClear?.(v, params);
      }
    },
    [onSelect, onClear, onDeselect],
  );

  const setValue = useCallback(
    <E extends types.SelectEvent>(
      v:
        | types.SelectValue<V, B>
        | ((curr: types.SelectNullableValue<V, B>) => types.SelectValue<V, B> | types.DoNothing),
      params: Omit<types.SelectEventChangeParams<E, V>, "item">,
      cb?: types.SelectEventChangeHandler<
        E,
        V,
        B,
        Omit<types.SelectEventChangeParams<E, V>, "item">
      >,
    ) => {
      if (value !== types.NOTSET) {
        let updated: types.SelectValue<V, B> | types.DoNothing;
        if (typeof v === "function") {
          updated = v(value);
        } else {
          updated = v;
        }
        if (updated !== types.DONOTHING) {
          /* If the Select is being used in a controlled fashion, do not update the value maintained
             internally in state.  It is important that the internal value be a constant value of
             type Controlled if the Select is being used in a controlled fashion. */
          if (!isControlled) {
            _setValue(updated);
          }
          return cb?.(updated, params);
        }
      }
      throw new Error("Cannot set the value of a select until the 'isReady' flag is 'true'.");
    },
    [value, isControlled, _setValue],
  );

  useEffect(() => {
    if (isReady && __private_controlled_value__ !== undefined) {
      __setValue(__private_controlled_value__);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [__private_controlled_value__, isReady]);

  const _isSelected = useCallback(
    (v: V, val: types.SelectNullableValue<V, B>): boolean | Indeterminate => {
      switch (behavior) {
        case types.SelectBehaviorTypes.MULTI: {
          if (!Array.isArray(val)) {
            logger.error(
              "Corrupted State: Detected non-array state value for multi-select! The select " +
                "behavior may be compromised.",
            );
            return INDETERMINATE;
          }
          const matches = val.filter(p => isEqual(p, v));
          if (matches.length === 0) {
            return false;
          } else if (matches.length === 1) {
            return true;
          } else {
            logger.warn(
              "Inconsistent State: Detected duplicate values in state for a multi-select! " +
                "The values of a multi-select must be unique.",
            );
            return true;
          }
        }
        case types.SelectBehaviorTypes.SINGLE: {
          if (Array.isArray(val)) {
            logger.error(
              "Corrupted State: Detected array state value for single-select! The select's " +
                "behavior may be compromised.",
            );
            return INDETERMINATE;
          } else if (val === null) {
            /* The value of a single, non-nullable Select may still be null if a selection or other
               interaction has not yet taken place. */
            return false;
          }
          return isEqual(val, v);
        }
        case types.SelectBehaviorTypes.SINGLE_NULLABLE: {
          if (Array.isArray(val)) {
            logger.error(
              "Corrupted State: Detected array state value for single-select! The select's " +
                "behavior may be compromised.",
            );
            return INDETERMINATE;
          } else if (val === null) {
            return false;
          }
          return isEqual(val, v);
        }
        default:
          throw new UnreachableCaseError();
      }
    },
    [behavior],
  );

  const isSelected = useCallback(
    (v: V): boolean => {
      if (value !== types.NOTSET) {
        const selected = _isSelected(v, value);
        /* If the selected state is indeterminate, it means there is corrupted state.  In this case,
           we have to assume that the value is not selected.  This may lead to buggy behavior, but
           it is better than allowing the inconsistent state to result in a hard error. */
        return selected === INDETERMINATE ? false : selected;
      }
      return false;
    },
    [value, _isSelected],
  );

  const _select = useCallback(
    (
      v: V,
      cb?: types.SelectEventChangeHandler<
        typeof types.SelectEvents.SELECT,
        V,
        B,
        Omit<types.SelectEventChangeParams<typeof types.SelectEvents.SELECT, V>, "item">
      >,
    ) => {
      if (value !== types.NOTSET) {
        return setValue(
          (prev): types.SelectValue<V, B> | types.DoNothing => {
            const selected = _isSelected(v, prev);
            /* If the selected state is corrupted, simply return just the current value being
               selected as a fallback. */
            if (selected === INDETERMINATE) {
              return v as types.SelectValue<V, B>;
            } else if (selected) {
              logger.warn(
                "Inconsistent State: Cannot select an already-selected value!  This either " +
                  "indicates that there are duplicate values for the same item in the " +
                  "select or that the select is being performed for an already selected item.",
              );
              return types.DONOTHING;
            }
            switch (behavior) {
              case types.SelectBehaviorTypes.MULTI: {
                return [...(prev as V[]), v] as types.SelectValue<V, B>;
              }
              case types.SelectBehaviorTypes.SINGLE: {
                return v as types.SelectValue<V, B>;
              }
              case types.SelectBehaviorTypes.SINGLE_NULLABLE: {
                return v as types.SelectValue<V, B>;
              }
              default:
                throw new UnreachableCaseError(`Invalid select behavior: '${behavior}'!`);
            }
          },
          { selected: v, event: types.SelectEvents.SELECT },
          cb,
        );
      }
      logger.error("Cannot select a value until the 'isReady' flag is 'true'.");
    },
    [behavior, value, _isSelected, setValue],
  );

  const _deselect = useCallback(
    (
      v: V,
      cb?: types.SelectEventChangeHandler<
        typeof types.SelectEvents.DESELECT,
        V,
        B,
        Omit<types.SelectEventChangeParams<typeof types.SelectEvents.DESELECT, V>, "item">
      >,
    ) => {
      if (!types.isDeselectable(behavior)) {
        throw new Error(`Cannot deselect a select with behavior '${behavior}'!`);
      }
      const IntermindateDeselectValues: {
        [key in types.DeselectableSelectBehavior]: types.SelectValue<V, B>;
      } = {
        [types.SelectBehaviorTypes.MULTI]: [] as V[] as types.SelectValue<V, B>,
        [types.SelectBehaviorTypes.SINGLE_NULLABLE]: null as types.SelectValue<V, B>,
      };

      if (value !== types.NOTSET) {
        return setValue(
          (prev): types.SelectValue<V, B> | types.DoNothing => {
            const selected = _isSelected(v, prev);
            /* If the selected state is corrupted, simply return just an empty value as a
               fallback. */
            if (selected === INDETERMINATE) {
              return IntermindateDeselectValues[behavior];
            } else if (!selected) {
              logger.warn(
                "Inconsistent State: Cannot deselect an unselected value!  This either " +
                  "indicates that there are duplicate values for the same item in the select " +
                  "or that the deselect is being performed for an unselected item.",
              );
              return types.DONOTHING;
            }
            switch (behavior) {
              case types.SelectBehaviorTypes.MULTI: {
                /* This type coercion is safe, because if the previous value were not an array, the
                   '_isSelected' method would have returned 'INDETERMINATE'. */
                return (prev as V[]).filter(vi => !isEqual(vi, v)) as types.SelectValue<V, B>;
              }
              case types.SelectBehaviorTypes.SINGLE_NULLABLE: {
                return null as types.SelectValue<V, B>;
              }
              default:
                throw new UnreachableCaseError(`Invalid select behavior: '${behavior}'!`);
            }
          },
          { deselected: v, event: types.SelectEvents.DESELECT },
          cb,
        );
      }
      logger.error("Cannot deselect a value until the 'isReady' flag is 'true'.");
    },
    [behavior, value, _isSelected, setValue],
  );

  const _clear = useCallback(
    (
      cb?: types.SelectEventChangeHandler<
        typeof types.SelectEvents.CLEAR,
        V,
        B,
        Omit<types.SelectEventChangeParams<typeof types.SelectEvents.CLEAR, V>, "item">
      >,
    ) => {
      if (!types.isClearable(behavior)) {
        throw new Error(`Cannot clear a select with behavior '${behavior}'!`);
      }
      switch (behavior) {
        case types.SelectBehaviorTypes.MULTI:
          setValue([] as V[] as types.SelectValue<V, B>, { event: types.SelectEvents.CLEAR }, cb);
          return;
        case types.SelectBehaviorTypes.SINGLE_NULLABLE:
          setValue(null as types.SelectValue<V, B>, { event: types.SelectEvents.CLEAR }, cb);
          return;
        default:
          throw new UnreachableCaseError(`Invalid behavior '${behavior}'!`);
      }
    },
    [behavior, setValue],
  );

  const deselect = useMemo(
    () =>
      types.ifDeselectable(
        (
          v: V,
          p?: types.SelectEventPublicArgs,
          cb?: types.SelectEventChangeHandler<typeof types.SelectEvents.DESELECT, V, B>,
        ) =>
          _deselect(v, (updated, params) => {
            cb?.(updated, params);
            if (p === undefined || p.dispatchChangeEvent !== false) {
              onChange?.(updated, params);
              return onAction(updated, params);
            }
          }),
        behavior,
      ),
    [_deselect, behavior, onAction, onChange],
  );

  const clear = useMemo(
    () =>
      types.ifClearable(
        (
          p?: types.SelectEventPublicArgs,
          cb?: types.SelectEventChangeHandler<typeof types.SelectEvents.CLEAR, V, B>,
        ) =>
          _clear((updated, params) => {
            cb?.(updated, params);
            if (p === undefined || p.dispatchChangeEvent !== false) {
              onChange?.(updated, params);
              return onAction(updated, params);
            }
          }),
        behavior,
      ),
    [behavior, _clear, onAction, onChange],
  );

  const select = useCallback(
    (
      v: V,
      p?: types.SelectEventPublicArgs,
      cb?: types.SelectEventChangeHandler<typeof types.SelectEvents.SELECT, V, B>,
    ) =>
      _select(v, (updated, params) => {
        cb?.(updated, params);
        if (p === undefined || p.dispatchChangeEvent !== false) {
          onChange?.(updated, params);
          return onAction(updated, params);
        }
      }),
    [_select, onChange, onAction],
  );

  const toggle = useCallback(
    (
      v: V,
      p: types.SelectEventPublicArgs,
      cb?: types.SelectEventChangeHandler<
        typeof types.SelectEvents.SELECT | typeof types.SelectEvents.DESELECT,
        V,
        B
      >,
    ) => {
      if (isSelected(v)) {
        if (!types.isDeselectable(behavior)) {
          logger.warn(`Cannot deselect a select with behavior '${behavior}'!`);
          return;
        }
        return deselect(v, p, cb);
      }
      return select(v, p, cb);
    },
    [behavior, select, deselect, isSelected],
  );

  return {
    value,
    setValue: _setValue,
    clear,
    isSelected,
    toggle,
    deselect,
    select,
  };
};
