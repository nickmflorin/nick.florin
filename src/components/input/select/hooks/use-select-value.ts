import { useCallback, useState, useMemo, useEffect } from "react";

import { isEqual } from "lodash-es";

import { UnreachableCaseError } from "~/application/errors";
import { logger } from "~/internal/logger";

import * as types from "~/components/input/select/types";
import type { MenuItemInstance } from "~/components/menus";

export interface UseSelectValueParams<
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
  readonly onChange?: <E extends types.SelectEvent>(
    v: types.SelectValue<V, B>,
    params: types.SelectEventParams<E, V>,
  ) => void;
  readonly onSelect?: (
    value: types.SelectValue<V, B>,
    params: types.SelectEventParams<typeof types.SelectEvents.SELECT, V>,
  ) => void;
  readonly onDeselect?: types.IfDeselectable<
    B,
    (
      value: types.SelectValue<V, B>,
      params: types.SelectEventParams<typeof types.SelectEvents.DESELECT, V>,
    ) => void
  >;
  readonly onClear?: types.IfClearable<
    B,
    (
      value: types.SelectValue<V, B>,
      params: types.SelectEventParams<typeof types.SelectEvents.CLEAR, V>,
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
}: Pick<UseSelectValueParams<V, B>, "behavior" | "initialValue" | "__private_controlled_value__">):
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

type SelectInternalEventCallback<
  E extends types.SelectEvent,
  V extends types.AllowedSelectValue,
  B extends types.SelectBehaviorType,
> = (params: {
  readonly value: types.SelectValue<V, B>;
  readonly event: E;
  readonly params: types.SelectEventRawParams<E, V>;
}) => void;

/**
 * A hook that is responsible for maintaining the value of a Select component, based on the behavior
 * of the Select, {@link types.SelectBehaviorType}, and the value-related props provided to the
 * Select.
 */
export const useSelectValue = <
  V extends types.AllowedSelectValue,
  B extends types.SelectBehaviorType,
>({
  initialValue,
  behavior,
  __private_controlled_value__,
  isReady = true,
  onSelect,
  onClear,
  onDeselect,
  onChange,
}: UseSelectValueParams<V, B>): types.ManagedSelectValue<V, B> => {
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
      params: types.SelectEventParams<E, V>,
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
      event: E,
      params: types.SelectEventRawParams<E, V>,
      cb?: SelectInternalEventCallback<E, V, B>,
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
          return cb?.({ value: updated, event, params });
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
              "Inconsistent State: Detected duplicate values in state for the select! " +
                "Values must be unique.",
            );
            return true;
          }
        }
        case types.SelectBehaviorTypes.SINGLE: {
          if (Array.isArray(val)) {
            logger.error(
              "Corrupted State: Detected array state value for single-select! The select " +
                "behavior may be compromised.",
            );
            return INDETERMINATE;
          } else if (val === null) {
            return false;
          }
          return isEqual(val, v);
        }
        case types.SelectBehaviorTypes.SINGLE_NULLABLE: {
          if (Array.isArray(val)) {
            logger.error(
              "Corrupted State: Detected array state value for single-select! The select " +
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
    (v: V, cb?: SelectInternalEventCallback<typeof types.SelectEvents.SELECT, V, B>) => {
      if (value !== types.NOTSET) {
        switch (behavior) {
          case types.SelectBehaviorTypes.MULTI: {
            return setValue(
              (prev): types.SelectValue<V, B> | types.DoNothing => {
                const selected = _isSelected(v, prev);
                /* If the selected state is corrupted, simply return just the current value being
                   selected as a fallback. */
                if (selected === INDETERMINATE) {
                  return [v] as types.SelectValue<V, B>;
                } else if (selected) {
                  logger.warn(
                    "Inconsistent State: Cannot select an already-selected value!  This either " +
                      "indicates that there are duplicate values for the same item in the " +
                      "select or that the select is being performed for an already selected item.",
                  );
                  return types.DONOTHING;
                }
                return [...(prev as V[]), v] as types.SelectValue<V, B>;
              },
              types.SelectEvents.SELECT,
              { selected: v },
              cb,
            );
          }
          case types.SelectBehaviorTypes.SINGLE: {
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
                return v as types.SelectValue<V, B>;
              },
              types.SelectEvents.SELECT,
              { selected: v },
              cb,
            );
          }
          case types.SelectBehaviorTypes.SINGLE_NULLABLE: {
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
                return v as types.SelectValue<V, B>;
              },
              types.SelectEvents.SELECT,
              { selected: v },
              cb,
            );
          }
        }
      }
      throw new Error("Cannot select a value until the 'isReady' flag is 'true'.");
    },
    [behavior, value, _isSelected, setValue],
  );

  const __private__select__ = useCallback(
    (v: V, item: MenuItemInstance) =>
      _select(v, ({ value: updated, params, event }) => {
        const fullParams = types.convertSelectEventRawParams<typeof types.SelectEvents.SELECT, V>(
          params,
          event,
          { item },
        );
        onChange?.(updated, fullParams);
        return onAction(updated, fullParams);
      }),
    [_select, onChange, onAction],
  );

  const _deselect = useCallback(
    (v: V, cb?: SelectInternalEventCallback<typeof types.SelectEvents.DESELECT, V, B>) => {
      if (!types.isDeselectable(behavior)) {
        throw new Error(`Cannot deselect a select with behavior '${behavior}'!`);
      }
      if (value !== types.NOTSET) {
        switch (behavior) {
          case types.SelectBehaviorTypes.MULTI:
            return setValue(
              (prev): types.SelectValue<V, B> | types.DoNothing => {
                const selected = _isSelected(v, prev);
                /* If the selected state is corrupted, simply return just an empty value as a
                   fallback. */
                if (selected === INDETERMINATE) {
                  return [] as V[] as types.SelectValue<V, B>;
                } else if (!selected) {
                  logger.warn(
                    "Inconsistent State: Cannot deselect an unselected value!  This either " +
                      "indicates that there are duplicate values for the same item in the select " +
                      "or that the deselect is being performed for an unselected item.",
                  );
                  return types.DONOTHING;
                }
                /* This type coercion is safe, because if the previous value were not an array, the
                  '_isSelected' method would have returned 'INDETERMINATE'. */
                return (prev as V[]).filter(vi => !isEqual(vi, v)) as types.SelectValue<V, B>;
              },
              types.SelectEvents.DESELECT,
              { deselected: v },
              cb,
            );
          case types.SelectBehaviorTypes.SINGLE:
            return logger.warn("Cannot deselect an item in a single non-nullable select!");
          case types.SelectBehaviorTypes.SINGLE_NULLABLE:
            return setValue(
              (prev): types.SelectValue<V, B> | types.DoNothing => {
                const selected = _isSelected(v, prev);
                /* If the selected state is corrupted, simply return null as a fallback. */
                if (selected === INDETERMINATE) {
                  return null as types.SelectValue<V, B>;
                } else if (!selected) {
                  logger.warn(
                    "Inconsistent State: Cannot deselect an unselected value!  This either " +
                      "indicates that there are duplicate values for the same item in the select " +
                      "or that the deselect is being performed for an unselected item.",
                  );
                  return types.DONOTHING;
                }
                return null as types.SelectValue<V, B>;
              },
              types.SelectEvents.DESELECT,
              { deselected: v },
              cb,
            );
        }
      }
      throw new Error("Cannot deselect a value until the 'isReady' flag is 'true'.");
    },
    [behavior, value, _isSelected, setValue],
  );

  const __private__deselect__ = useCallback(
    (v: V, item?: MenuItemInstance) => {
      if (!types.isDeselectable(behavior)) {
        throw new Error(`Cannot deselect a select with behavior '${behavior}'!`);
      }
      _deselect(v, ({ value: updated, params, event }) => {
        const fullParams = types.convertSelectEventRawParams<typeof types.SelectEvents.DESELECT, V>(
          params,
          event,
          { item },
        );
        onChange?.(updated, fullParams);
        onAction(updated, fullParams);
      });
    },
    [behavior, _deselect, onChange, onAction],
  );

  const _toggle = useCallback(
    (v: V) => {
      if (isSelected(v)) {
        if (!types.isDeselectable(behavior)) {
          logger.warn(`Cannot deselect a select with behavior '${behavior}'!`);
          return;
        }
        return _deselect(v);
      }
      return _select(v);
    },
    [behavior, _deselect, _select, isSelected],
  );

  const __private__toggle__ = useCallback(
    (v: V, item: MenuItemInstance) => {
      if (isSelected(v)) {
        if (!types.isDeselectable(behavior)) {
          logger.warn(`Cannot deselect a select with behavior '${behavior}'!`);
          return;
        }
        return __private__deselect__(v, item);
      }
      return __private__select__(v, item);
    },
    [behavior, __private__deselect__, __private__select__, isSelected],
  );

  const _clear = useCallback(
    (cb?: SelectInternalEventCallback<typeof types.SelectEvents.CLEAR, V, B>) => {
      if (!types.isClearable(behavior)) {
        throw new Error(`Cannot clear a select with behavior '${behavior}'!`);
      }
      switch (behavior) {
        case types.SelectBehaviorTypes.MULTI:
          setValue([] as V[] as types.SelectValue<V, B>, types.SelectEvents.CLEAR, {});
          return;
        case types.SelectBehaviorTypes.SINGLE:
          throw new UnreachableCaseError(
            "A single, non-nullable select should not be clearable.  This code should be " +
              "considered unreachable, as whether or not the select is clearable should have " +
              "been previously checked before this code was encountered.",
          );
        case types.SelectBehaviorTypes.SINGLE_NULLABLE:
          setValue(null as types.SelectValue<V, B>, types.SelectEvents.CLEAR, {}, cb);
          return;
        default:
          throw new UnreachableCaseError(`Invalid behavior '${behavior}'!`);
      }
    },
    [behavior, setValue],
  );

  const __private__clear__ = useCallback(
    () =>
      _clear(({ value: updated, params, event }) => {
        const fullParams = types.convertSelectEventRawParams<typeof types.SelectEvents.CLEAR, V>(
          params,
          event,
          {},
        );
        onChange?.(updated, fullParams);
        onAction(updated, fullParams);
      }),
    [_clear, onChange, onAction],
  );

  return {
    value,
    __private__clear__: types.ifClearable(__private__clear__, behavior),
    __private__deselect__: types.ifDeselectable(__private__deselect__, behavior),
    __private__select__,
    __private__toggle__,
    set: _setValue,
    clear: types.ifDeselectable(() => _clear(), behavior),
    isSelected,
    deselect: types.ifDeselectable((v: V) => _deselect(v), behavior),
    select: (v: V) => _select(v),
    toggle: (v: V) => _toggle(v),
  };
};
