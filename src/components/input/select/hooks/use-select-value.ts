import { useCallback, useState, useMemo } from "react";

import { isEqual } from "lodash-es";

import { UnreachableCaseError } from "~/application/errors";
import { logger } from "~/internal/logger";

import {
  type SelectBehaviorType,
  type SelectValue,
  type IfDeselectable,
  SelectBehaviorTypes,
  type AllowedSelectValue,
  type ManagedSelectValue,
  type SelectEvent,
  type SelectEventParams,
} from "~/components/input/select/types";
import type { MenuItemInstance } from "~/components/menus";

export interface UseSelectValueParams<V extends AllowedSelectValue, B extends SelectBehaviorType> {
  readonly initialValue?: SelectValue<V, B>;
  readonly behavior: B;
  /* This prop is only used internally to the <Select /> - related components.  It should not be
     provided to this hook directly when it is used outside of the Select or DataSelect's
     internals. */
  readonly __private_controlled_value__?: SelectValue<V, B>;
  readonly onChange?: (value: SelectValue<V, B>, item?: MenuItemInstance) => void;
  readonly onSelect?: (value: SelectValue<V, B>, params: SelectEventParams<"select", V>) => void;
  readonly onDeselect?: (
    value: SelectValue<V, B>,
    params: SelectEventParams<"deselect", V>,
  ) => void;
  readonly onClear?: (value: SelectValue<V, B>) => void;
  readonly onEvent?: <E extends SelectEvent>(
    event: E,
    value: SelectValue<V, B>,
    params: SelectEventParams<E, V>,
  ) => void;
}

const INDETERMINATE = "__INDETERMINATE__" as const;
type Indeterminate = typeof INDETERMINATE;

const CONTROLLED = "__CONTROLLED__" as const;
type Controlled = typeof CONTROLLED;

const getInitialValue = <V extends AllowedSelectValue, B extends SelectBehaviorType>({
  behavior,
  initialValue,
  __private_controlled_value__,
}: Omit<UseSelectValueParams<V, B>, "onSelect" | "onChange" | "onClear" | "onDeselect" | "on">):
  | SelectValue<V, B>
  | Controlled => {
  if (__private_controlled_value__ === undefined) {
    if (initialValue === undefined) {
      if (behavior === SelectBehaviorTypes.SINGLE_NULLABLE) {
        return null as SelectValue<V, B>;
      } else if (behavior === SelectBehaviorTypes.MULTI) {
        return [] as V[] as SelectValue<V, B>;
      }
      throw new Error(
        "For a single, non-nullable select with, the 'initialValue' prop must be defined!",
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
 * of the Select, {@link SelectBehaviorType}, and the value-related props provided to the
 * Select.
 */
export const useSelectValue = <V extends AllowedSelectValue, B extends SelectBehaviorType>({
  initialValue,
  behavior,
  __private_controlled_value__,
  onEvent,
  onSelect,
  onClear,
  onDeselect,
  onChange,
}: UseSelectValueParams<V, B>): ManagedSelectValue<V, B> => {
  const [_value, __setValue] = useState<SelectValue<V, B> | Controlled>(() =>
    getInitialValue({ behavior, initialValue, __private_controlled_value__ }),
  );

  const _setValue = useCallback(
    (
      v: SelectValue<V, B> | ((curr: SelectValue<V, B>) => SelectValue<V, B>),
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
    <E extends SelectEvent>(event: E, v: SelectValue<V, B>, params: SelectEventParams<E, V>) => {
      onEvent?.(event, v, params);
      switch (event) {
        case "select":
          return onSelect?.(v, params as SelectEventParams<"select", V>);
        case "deselect":
          return onDeselect?.(v, params as SelectEventParams<"deselect", V>);
        case "clear":
          return onClear?.(v);
      }
    },
    [onEvent, onSelect, onClear, onDeselect],
  );

  const setValue = useCallback(
    <E extends SelectEvent>(
      v: SelectValue<V, B> | ((curr: SelectValue<V, B>) => SelectValue<V, B>),
      event: E,
      params: SelectEventParams<E, V>,
      item?: MenuItemInstance,
    ) => {
      let updated: SelectValue<V, B>;
      if (typeof v === "function") {
        updated = v(value);
      } else {
        updated = v;
      }
      /* If the Select is being used in a controlled fashion, do not update the value maintained
         internally in state.  It is important that the internal value be a constant value of
         type Controlled if the Select is being used in a controlled fashion. */
      if (!isControlled) {
        _setValue(updated);
      }
      onChange?.(updated, item);
      return onAction(event, updated, params);
    },
    [value, isControlled, _setValue, onAction, onChange],
  );

  const _isSelected = useCallback(
    (v: V, val: SelectValue<V, B>): boolean | Indeterminate => {
      switch (behavior) {
        case SelectBehaviorTypes.MULTI: {
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
        case SelectBehaviorTypes.SINGLE: {
          if (Array.isArray(val)) {
            logger.error(
              "Corrupted State: Detected array state value for single-select! The select " +
                "behavior may be compromised.",
            );
            return INDETERMINATE;
          } else if (val === null) {
            logger.error(
              "Corrupted State: Detected null state value for non-nullable select! The select " +
                "behavior may be compromised.",
            );
            return INDETERMINATE;
          }
          return isEqual(val, v);
        }
        case SelectBehaviorTypes.SINGLE_NULLABLE: {
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
      const selected = _isSelected(v, value);
      /* If the selected state is indeterminate, it means there is corrupted state.  In this case,
         we have to assume that the value is not selected.  This may lead to buggy behavior, but
         it is better than allowing the inconsistent state to result in a hard error. */
      return selected === INDETERMINATE ? false : selected;
    },
    [value, _isSelected],
  );

  const select = useCallback(
    (v: V, item?: MenuItemInstance) => {
      switch (behavior) {
        case SelectBehaviorTypes.MULTI: {
          const selected = _isSelected(v, value);
          /* If the selected state is corrupted, simply return just the current value being
             selected as a fallback. */
          if (selected === INDETERMINATE) {
            return setValue([v] as SelectValue<V, B>, "select", { selected: v }, item);
          } else if (selected) {
            logger.warn(
              "Inconsistent State: Cannot select an already-selected value!  This either " +
                "indicates that there are duplicate values for the same item in the select or " +
                "that the select is being performed for an already selected item.",
            );
            return;
          }
          /* This type coercion is safe, because if the previous value were not an array, the
             '_isSelected' method would have returned 'INDETERMINATE'. */
          return setValue(
            [...(value as V[]), v] as SelectValue<V, B>,
            "select",
            { selected: v },
            item,
          );
        }
        case SelectBehaviorTypes.SINGLE: {
          const selected = _isSelected(v, value);
          /* If the selected state is corrupted, simply return just the current value being
             selected as a fallback. */
          if (selected === INDETERMINATE) {
            return setValue(v as SelectValue<V, B>, "select", { selected: v }, item);
          } else if (selected) {
            logger.warn(
              "Inconsistent State: Cannot select an already-selected value!  This either " +
                "indicates that there are duplicate values for the same item in the select or " +
                "that the select is being performed for an already selected item.",
            );
            return;
          }
          return setValue(v as SelectValue<V, B>, "select", { selected: v }, item);
        }
        case SelectBehaviorTypes.SINGLE_NULLABLE: {
          const selected = _isSelected(v, value);
          /* If the selected state is corrupted, simply return just the current value being
             selected as a fallback. */
          if (selected === INDETERMINATE) {
            return setValue(v as SelectValue<V, B>, "select", { selected: v }, item);
          } else if (selected) {
            logger.warn(
              "Inconsistent State: Cannot select an already-selected value!  This either " +
                "indicates that there are duplicate values for the same item in the select or " +
                "that the select is being performed for an already selected item.",
            );
            return;
          }
          return setValue(v as SelectValue<V, B>, "select", { selected: v }, item);
        }
      }
    },
    [behavior, value, _isSelected, setValue],
  );

  const deselect = useCallback(
    (v: V, item?: MenuItemInstance) => {
      switch (behavior) {
        case SelectBehaviorTypes.MULTI:
          return setValue(
            (prev): SelectValue<V, B> => {
              const selected = _isSelected(v, prev);
              /* If the selected state is corrupted, simply return just an empty value as a
                 fallback. */
              if (selected === INDETERMINATE) {
                return [] as V[] as SelectValue<V, B>;
              } else if (!selected) {
                logger.warn(
                  "Inconsistent State: Cannot deselect an unselected value!  This either " +
                    "indicates that there are duplicate values for the same item in the select " +
                    "or that the deselect is being performed for an unselected item.",
                );
                return prev;
              }
              /* This type coercion is safe, because if the previous value were not an array, the
               '_isSelected' method would have returned 'INDETERMINATE'. */
              return (prev as V[]).filter(vi => !isEqual(vi, v)) as SelectValue<V, B>;
            },
            "deselect",
            { deselected: v },
            item,
          );
        case SelectBehaviorTypes.SINGLE:
          return logger.warn("Cannot deselect an item in a single non-nullable select!");
        case SelectBehaviorTypes.SINGLE_NULLABLE:
          return setValue(
            (prev): SelectValue<V, B> => {
              const selected = _isSelected(v, prev);
              /* If the selected state is corrupted, simply return null as a fallback. */
              if (selected === INDETERMINATE) {
                return null as SelectValue<V, B>;
              } else if (!selected) {
                logger.warn(
                  "Inconsistent State: Cannot deselect an unselected value!  This either " +
                    "indicates that there are duplicate values for the same item in the select " +
                    "or that the deselect is being performed for an unselected item.",
                );
                return prev;
              }
              return null as SelectValue<V, B>;
            },
            "deselect",
            { deselected: v },
            item,
          );
      }
    },
    [behavior, _isSelected, setValue],
  );

  const toggle = useCallback(
    (v: V, item?: MenuItemInstance) => {
      if (isSelected(v)) {
        return deselect(v, item);
      }
      return select(v, item);
    },
    [isSelected, select, deselect],
  );

  const clear = useCallback(() => {
    switch (behavior) {
      case SelectBehaviorTypes.MULTI:
        return setValue([] as V[] as SelectValue<V, B>, "clear", {});
      case SelectBehaviorTypes.SINGLE:
        return logger.warn("Cannot clear a single non-nullable select!");
      case SelectBehaviorTypes.SINGLE_NULLABLE:
        return setValue(null as SelectValue<V, B>, "clear", {});
      default:
        throw new UnreachableCaseError();
    }
  }, [behavior, setValue]);

  return {
    value,
    set: _setValue,
    clear,
    isSelected,
    deselect: deselect as IfDeselectable<B, (value: V) => void, never>,
    select,
    toggle,
  };
};
