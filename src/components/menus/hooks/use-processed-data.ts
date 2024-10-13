import { useMemo } from "react";

import * as types from "~/components/menus";

export interface UseProcessedDataProps<M extends types.DataMenuModel>
  extends Pick<types.DataMenuItemFlagProps<M>, "itemIsVisible">,
    Pick<types.DataMenuGroupProps<M>, "hideEmptyGroups" | "hideGrouplessItems" | "groups"> {
  readonly data: M[];
  readonly customItems?: (Omit<types.DataMenuCustomModel, "isCustom"> | JSX.Element)[];
}

const processCustomItems = (
  custom: (Omit<types.DataMenuCustomModel, "isCustom"> | JSX.Element)[],
  { location, getIndex }: { location: types.DataMenuCustomModelLocation; getIndex: () => number },
): types.DataMenuProcessedCustom[] => {
  const defaultLocation = "after-content";
  return custom
    .filter(item =>
      types.dataMenuCustomModelIsObj(item)
        ? item.isVisible !== false && (item.location ?? defaultLocation) === location
        : true,
    )
    .map(
      (item): types.DataMenuProcessedCustom => ({
        model: types.dataMenuCustomModelIsObj(item) ? { ...item, isCustom: true } : item,
        index: getIndex(),
        isCustom: true,
      }),
    );
};

export const useProcessedData = <M extends types.DataMenuModel>({
  data,
  groups,
  hideEmptyGroups,
  hideGrouplessItems,
  customItems = [],
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
        [
          ...processCustomItems(customItems, {
            location: "before-content",
            getIndex: getUpdatedIndex,
          }),
          ...(!hideGrouplessItems
            ? visibleData.reduce((acc, model): types.DataMenuProcessedData<M> => {
                if (!groups || groups.length === 0 || groups.every(group => !group.filter(model))) {
                  return [...acc, { model, index: getUpdatedIndex(), isCustom: false }];
                }
                return acc;
              }, [] as types.DataMenuProcessedData<M>)
            : ([] as types.DataMenuProcessedData<M>)),
        ],
      ),
      ...processCustomItems(customItems, { location: "after-content", getIndex: getUpdatedIndex }),
    ];
  }, [data, groups, hideGrouplessItems, customItems, hideEmptyGroups, itemIsVisible]);
