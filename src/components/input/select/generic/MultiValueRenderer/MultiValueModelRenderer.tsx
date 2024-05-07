import React, { useMemo, memo } from "react";

import { Badge } from "~/components/badges/Badge";
import { getModelLabel, getModelId, getMenuItemKey } from "~/components/menus";

import * as types from "../types";

import { MultiValueRendererContainer } from "./MultiValueRendererContainer";
import { TruncatedMultiValueRenderer } from "./TruncatedMultiValueRenderer";

export type MultiValueModelRendererComponent = {
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    props: MultiValueModelRendererProps<M, O>,
  ): JSX.Element;
};

export interface MultiValueModelRendererProps<
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> extends types.MultiValueModelRendererProps<M, O> {}

export const MultiValueModelRenderer = memo(
  <M extends types.SelectModel, O extends Omit<types.SelectOptions<M>, "isFiltered">>({
    maximumNumBadges,
    data,
    dynamicHeight = true,
    options,
    valueModelRenderer,
  }: MultiValueModelRendererProps<M, O>) => {
    // Sort models by key for consistent ordering.
    const ms = useMemo(
      () =>
        data
          .map((m, i) => ({ ...m, index: i }))
          .sort((a, b) =>
            getMenuItemKey({ id: getModelId(a, options), index: a.index }) >
            getMenuItemKey({ id: getModelId(b, options), index: b.index })
              ? 1
              : -1,
          ),
      [options, data],
    );

    return (
      <TruncatedMultiValueRenderer data={ms} maximumNumBadges={maximumNumBadges}>
        {({ data }) => (
          <MultiValueRendererContainer dynamicHeight={dynamicHeight}>
            {data.map((model, i) => {
              if (valueModelRenderer) {
                return <React.Fragment key={i}>{valueModelRenderer(model)}</React.Fragment>;
              }
              const label =
                types.getSelectModelValueLabel(model, options) ?? getModelLabel(model, options);
              if (typeof label === "string") {
                return (
                  <Badge fontSize="xxs" key={i}>
                    {label}
                  </Badge>
                );
              }
              return label;
            })}
          </MultiValueRendererContainer>
        )}
      </TruncatedMultiValueRenderer>
    );
  },
);

export default MultiValueModelRenderer;
