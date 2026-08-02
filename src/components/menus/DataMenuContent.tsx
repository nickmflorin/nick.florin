import { type ForwardedRef, type JSX } from 'react';

import type * as types from '~/components/menus';

import { useProcessedData } from './hooks';
import {
  ProcessedDataMenuContent,
  type ProcessedDataMenuContentProps,
} from './ProcessedDataMenuContent';

export interface DataMenuContentProps<
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
>
  extends
    Omit<ProcessedDataMenuContentProps<M, O>, 'processedData'>,
    types.DataMenuGroupProps<M>,
    Pick<types.DataMenuItemFlagProps<M>, 'itemIsVisible'> {
  readonly customItems?: (JSX.Element | Omit<types.DataMenuCustomModel, 'isCustom'>)[];
  readonly data: M[];
}

export const DataMenuContent = <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>({
  customItems,
  data,
  groups,
  hideEmptyGroups,
  hideGrouplessItems,
  itemIsVisible,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<types.DataMenuContentInstance<M, O>>;
} & DataMenuContentProps<M, O>): JSX.Element => {
  const processedData = useProcessedData({
    customItems,
    data,
    groups,
    hideEmptyGroups,
    hideGrouplessItems,
    itemIsVisible,
  });
  return <ProcessedDataMenuContent<M, O> ref={ref} {...props} processedData={processedData} />;
};
