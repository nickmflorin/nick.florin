import React, { forwardRef, type ForwardedRef } from "react";

import type * as types from "~/components/menus";

import { useProcessedData } from "./hooks";
import {
  ProcessedDataMenuContent,
  type ProcessedDataMenuContentProps,
} from "./ProcessedDataMenuContent";

export interface DataMenuContentProps<M extends types.DataMenuModel>
  extends Omit<ProcessedDataMenuContentProps<M>, "processedData">,
    types.DataMenuGroupProps<M>,
    types.DataMenuItemFlagProps<M> {
  readonly data: M[];
  readonly bottomItems?: (types.DataMenuCustomModel | JSX.Element)[];
}

export const DataMenuContent = forwardRef(
  <M extends types.DataMenuModel>(
    {
      data,
      hideEmptyGroups,
      hideGrouplessItems,
      bottomItems,
      groups,
      itemIsVisible,
      ...props
    }: DataMenuContentProps<M>,
    ref: ForwardedRef<types.DataMenuContentInstance>,
  ): JSX.Element => {
    const processedData = useProcessedData({
      data,
      groups,
      bottomItems,
      hideEmptyGroups,
      hideGrouplessItems,
      itemIsVisible,
    });
    return <ProcessedDataMenuContent<M> ref={ref} {...props} processedData={processedData} />;
  },
) as {
  <M extends types.DataMenuModel>(
    props: DataMenuContentProps<M> & {
      readonly ref?: ForwardedRef<types.DataMenuContentInstance>;
    },
  ): JSX.Element;
};
