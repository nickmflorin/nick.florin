import { type JSX, useMemo } from 'react';

import * as types from '~/components/menus';

export interface UseProcessedDataProps<M extends types.DataMenuModel>
  extends
    Pick<types.DataMenuItemFlagProps<M>, 'itemIsVisible'>,
    Pick<types.DataMenuGroupProps<M>, 'groups' | 'hideEmptyGroups' | 'hideGrouplessItems'> {
  readonly customItems?: (JSX.Element | Omit<types.DataMenuCustomModel, 'isCustom'>)[];
  readonly data: M[];
}

/**
 * Assigns each processed datum an index that is unique across the entire menu, not just within the
 * collection it belongs to.
 *
 * The index positions a datum inside the menu's flattened representation, which interleaves custom
 * items, groupless models and the models of every group.  Each collection is therefore processed
 * with the offset at which it begins in that flattened representation, so that the indices of the
 * collections form a single contiguous sequence once they are concatenated.
 */
const processCustomItems = (
  custom: (JSX.Element | Omit<types.DataMenuCustomModel, 'isCustom'>)[],
  { location, startIndex }: { location: types.DataMenuCustomModelLocation; startIndex: number },
): types.DataMenuProcessedCustom[] => {
  const defaultLocation = 'after-content';
  return custom
    .filter(item =>
      types.dataMenuCustomModelIsObj(item)
        ? item.isVisible !== false && (item.location ?? defaultLocation) === location
        : true,
    )
    .map((item, i): types.DataMenuProcessedCustom => ({
      index: startIndex + i,
      isCustom: true,
      model: types.dataMenuCustomModelIsObj(item) ? { ...item, isCustom: true } : item,
    }));
};

/**
 * Assigns each of the provided models an index, beginning at the offset at which the models appear
 * in the menu's flattened representation (see {@link processCustomItems}).
 */
const processModels = <M extends types.DataMenuModel>(
  models: M[],
  startIndex: number,
): types.DataMenuProcessedModel<M>[] =>
  models.map((model, i): types.DataMenuProcessedModel<M> => ({
    index: startIndex + i,
    isCustom: false,
    model,
  }));

export const useProcessedData = <M extends types.DataMenuModel>({
  customItems = [],
  data,
  groups,
  hideEmptyGroups,
  hideGrouplessItems,
  itemIsVisible,
}: UseProcessedDataProps<M>) =>
  useMemo<types.DataMenuProcessedData<M>>(() => {
    const visibleData = data.filter(
      model =>
        types.evalMenuItemFlag('isVisible', model, itemIsVisible) !== false &&
        model.isVisible !== false,
    );

    const beforeContentItems = processCustomItems(customItems, {
      location: 'before-content',
      startIndex: 0,
    });

    const grouplessItems = processModels(
      hideGrouplessItems
        ? []
        : visibleData.filter(
            model => !groups || groups.length === 0 || groups.every(group => !group.filter(model)),
          ),
      beforeContentItems.length,
    );

    const { nextIndex, processedGroups } = (groups ?? [])
      .map(group => ({ group, models: visibleData.filter(model => group.filter(model)) }))
      .filter(({ models }) => models.length !== 0 || hideEmptyGroups === false)
      .reduce<{ nextIndex: number; processedGroups: types.DataMenuProcessedGroup<M>[] }>(
        (acc, { group, models }) => ({
          nextIndex: acc.nextIndex + models.length,
          processedGroups: [
            ...acc.processedGroups,
            { data: processModels(models, acc.nextIndex), isGroup: true, label: group.label },
          ],
        }),
        {
          nextIndex: beforeContentItems.length + grouplessItems.length,
          processedGroups: [],
        },
      );

    return [
      ...beforeContentItems,
      ...grouplessItems,
      ...processedGroups,
      ...processCustomItems(customItems, { location: 'after-content', startIndex: nextIndex }),
    ];
  }, [data, groups, hideGrouplessItems, customItems, hideEmptyGroups, itemIsVisible]);
