import React, { forwardRef, type ForwardedRef } from "react";

import type * as types from "~/components/menus";

import { useProcessedData } from "./hooks";
import {
  ProcessedDataMenuContent,
  type ProcessedDataMenuContentProps,
} from "./ProcessedDataMenuContent";

export interface DataMenuContentProps<
  M extends types.DataMenuModel,
  O extends types.DataMenuOptions<M>,
> extends Omit<ProcessedDataMenuContentProps<M, O>, "processedData">,
    types.DataMenuGroupProps<M>,
    types.DataMenuItemFlagProps<M> {
  readonly data: M[];
  readonly bottomItems?: (types.DataMenuCustomModel | JSX.Element)[];
}

export const DataMenuContent = forwardRef(
  <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
    {
      data,
      hideEmptyGroups,
      hideGrouplessItems,
      bottomItems,
      groups,
      itemIsVisible,
      ...props
    }: DataMenuContentProps<M, O>,
    ref: ForwardedRef<types.DataMenuContentInstance<M, O>>,
  ): JSX.Element => {
    const processedData = useProcessedData({
      data,
      groups,
      bottomItems,
      hideEmptyGroups,
      hideGrouplessItems,
      itemIsVisible,
    });
    return <ProcessedDataMenuContent<M, O> ref={ref} {...props} processedData={processedData} />;
  },
) as {
  <M extends types.DataMenuModel, O extends types.DataMenuOptions<M>>(
    props: DataMenuContentProps<M, O> & {
      readonly ref?: ForwardedRef<types.DataMenuContentInstance<M, O>>;
    },
  ): JSX.Element;
};
