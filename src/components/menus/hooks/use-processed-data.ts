import { useMemo } from "react";

import * as types from "~/components/menus";

export interface UseProcessedDataProps<M extends types.DataMenuModel>
  extends Pick<types.DataMenuItemFlagProps<M>, "itemIsVisible">,
    Pick<types.DataMenuGroupProps<M>, "hideEmptyGroups" | "hideGrouplessItems" | "groups"> {
  readonly data: M[];
  readonly bottomItems?: (types.DataMenuCustomModel | JSX.Element)[];
}

export const useProcessedData = <M extends types.DataMenuModel>({
  data,
  groups,
  hideEmptyGroups,
  hideGrouplessItems,
  bottomItems = [],
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
        types.evalMenuItemFlag("isVisible", model, itemIsVisible) !== false &&
        model.isVisible !== false,
    );

    return [
      ...(groups ?? []).reduce(
        (processed, group): types.DataMenuProcessedData<M> => {
          const filtered = visibleData.filter(model => group.filter(model));
          if (filtered.length !== 0 || hideEmptyGroups === false) {
            return [
              ...processed,
              filtered.reduce(
                (gp, model) => ({
                  ...gp,
                  data: [...gp.data, { model, index: getUpdatedIndex(), isCustom: false }],
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
          ? visibleData.reduce((acc, model): types.DataMenuProcessedData<M> => {
              if (!groups || groups.length === 0 || groups.every(group => !group.filter(model))) {
                return [...acc, { model, index: getUpdatedIndex(), isCustom: false }];
              }
              return acc;
            }, [] as types.DataMenuProcessedData<M>)
          : ([] as types.DataMenuProcessedData<M>),
      ),
      ...bottomItems
        .filter(item =>
          types.dataMenuModelArgIsCustomModel(item) ? item.isVisible !== false : true,
        )
        .map(
          (item): types.DataMenuProcessedCustom => ({
            model: item,
            index: getUpdatedIndex(),
            isCustom: true,
          }),
        ),
    ];
  }, [data, groups, hideGrouplessItems, bottomItems, hideEmptyGroups, itemIsVisible]);
