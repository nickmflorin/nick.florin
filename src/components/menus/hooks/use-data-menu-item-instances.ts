import { useRef, useCallback } from "react";

import { cloneDeep } from "lodash-es";

import { logger } from "~/internal/logger";

import * as types from "~/components/menus/types";
import { useDeepEqualEffect } from "~/hooks";

export interface UseMenuItemInstancesParams<
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
> {
  readonly data: (M | types.DataMenuCustomModel)[];
  readonly options: O;
}

const createInitialMenuItemInstance = (): types.DisconnectedMenuItemInstance => ({
  isConnected: false,
  setDisabled: () => {
    logger.warn(
      "The method 'setDisabled' will not have an affect because the menu item instance " +
        "is not yet attached to the UI.",
    );
  },
  setLoading: () => {
    logger.warn(
      "The method 'setLoading' will not have an affect because the menu item instance " +
        "is not yet attached to the UI.",
    );
  },
  setLocked: () => {
    logger.warn(
      "The method 'setLocked' will not have an affect because the menu item instance is " +
        "not yet attached to the UI.",
    );
  },
});

export const useDataMenuItemInstances = <
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
>({
  data,
  options,
}: UseMenuItemInstancesParams<M, O>): types.MenuModelInstancesManager<M, O> => {
  const refs = useRef<types.DataMenuItemInstances<M, O>>({} as types.DataMenuItemInstances<M, O>);

  const getKey = useCallback(
    (m: types.DataMenuItemInstanceLookupArg<M, O>) => {
      if (types.menuItemInstanceLookupArgIsModel(m)) {
        if (m.isCustom) {
          return `custom-${m.id}` as const;
        }
        return types.getDataMenuModelRefKey(m, options, { strict: true });
      }
      return m;
    },
    [options],
  );

  const get = useCallback(
    (m: types.DataMenuItemInstanceLookupArg<M, O>) => refs.current[getKey(m)] ?? null,
    [getKey],
  );

  const set = useCallback(
    <I extends types.MenuItemInstance>(
      m: types.DataMenuItemInstanceLookupArg<M, O>,
      instance: I,
    ): I => {
      refs.current[getKey(m)] = instance;
      return instance;
    },
    [getKey],
  );

  const createIfNecessary = useCallback(
    (m: types.DataMenuItemInstanceLookupArg<M, O>): types.DisconnectedMenuItemInstance | null => {
      const instance = get(m);
      if (!instance) {
        const result = set(m, createInitialMenuItemInstance());
        return result;
      }
      return null;
    },
    [get, set],
  );

  const sync = useCallback(
    (data: (M | types.DataMenuCustomModel)[]) => {
      const cloned = cloneDeep(refs.current);
      refs.current = data.reduce(
        (acc, m) => {
          const k = getKey(m);
          const r = cloned[k];
          if (acc[k] !== undefined) {
            logger.error(
              `Encountered a duplicate menu item ref key '${k}'!  The 'getRefKey' ` +
                "function should point to a unique key for each model in the data! The behavior " +
                "of the menu may be compromised.",
              { key: k },
            );
            return acc;
          } else if (r === undefined) {
            return { ...acc, [k]: createInitialMenuItemInstance() };
          }
          return { ...acc, [k]: r };
        },
        {} as types.DataMenuItemInstances<M, O>,
      );
    },
    [getKey],
  );

  useDeepEqualEffect(() => {
    sync(data);
  }, [data, sync]);

  return {
    connect: (
      m: types.DataMenuItemInstanceLookupArg<M, O>,
      instance: types.ConnectedMenuItemInstance,
    ) => set(getKey(m), instance),
    getKey: <A extends types.DataMenuItemInstanceLookupArg<M, O>>(m: A) =>
      getKey(m) as types.MenuModelInstancesManagerGetKeyRT<A, M, O>,
    exists: (m: types.DataMenuItemInstanceLookupArg<M, O>) => get(m) !== null,
    get,
    createIfNecessary,
    create: <CO extends types.CreateDataMenuItemInstanceOptions>(
      m: types.DataMenuItemInstanceLookupArg<M, O>,
      opts?: CO,
    ): types.CreateDataMenuItemInstanceRT<CO> => {
      const ref = get(m);
      if (!ref) {
        return set(m, createInitialMenuItemInstance());
      } else if (opts?.strict) {
        throw new Error(`A menu item ref object already exists for key '${m}'!`);
      }
      return null as types.CreateDataMenuItemInstanceRT<CO>;
    },
    getOrCreate: (m: types.DataMenuItemInstanceLookupArg<M, O>): types.MenuItemInstance => {
      const ref = get(m);
      if (!ref) {
        return set(m, createInitialMenuItemInstance());
      }
      return ref;
    },
  };
};
