import { useMemo } from "react";

import * as types from "~/components/menus";

export interface UseProcessedDataProps<M extends types.DataMenuModel>
  extends Pick<types.MenuItemFlagProps<M>, "itemIsVisible">,
    Pick<types.DataMenuGroupProps<M>, "hideEmptyGroups" | "hideGrouplessItems" | "groups"> {
  readonly data: M[];
}

export const useProcessedData = <M extends types.DataMenuModel>({
  data,
  groups,
  hideEmptyGroups,
  hideGrouplessItems,
  itemIsVisible,
}: UseProcessedDataProps<M>) =>
  useMemo<types.DataMenuProcessedData<M>>(() => {
    let index = 0;

    const getUpdatedIndex = () => {
      const updated = index;
      index += 1;
      return updated;
    };

    const visibleData = data.filter(
      model =>
        types.evalMenuItemFlag("isVisible", itemIsVisible, model) !== false &&
        model.isVisible !== false,
    );

    return (groups ?? []).reduce(
      (processed, group): types.DataMenuProcessedData<M> => {
        const filtered = visibleData.filter(model => group.filter(model));
        if (filtered.length !== 0 || hideEmptyGroups === false) {
          return [
            ...processed,
            filtered.reduce(
              (gp, model) => ({
                ...gp,
                data: [...gp.data, { model, index: getUpdatedIndex() }],
              }),
              {
                isGroup: true,
                label: group.label,
                data: [] as types.DataMenuProcessedGroup<M>["data"],
              },
            ),
          ];
        }
        return processed;
      },
      !hideGrouplessItems
        ? visibleData.reduce((acc, model) => {
            if (!groups || groups.length === 0 || groups.every(group => !group.filter(model))) {
              return [...acc, { model, index: getUpdatedIndex() }];
            }
            return acc;
          }, [] as types.DataMenuProcessedData<M>)
        : ([] as types.DataMenuProcessedData<M>),
    );
  }, [data, groups, hideGrouplessItems, hideEmptyGroups, itemIsVisible]);
