import React, { useMemo, memo, type ReactNode } from "react";

import { Badge } from "~/components/badges/Badge";
import { getModelLabel, getModelId, getMenuItemKey } from "~/components/menus";

import * as types from "../types";

import { MultiValueRendererContainer } from "./MultiValueRendererContainer";
import { TruncatedMultiValueRenderer } from "./TruncatedMultiValueRenderer";

export const MultiValueRenderer = memo(
  <
    V extends types.AllowedSelectModelValue,
    M extends types.SelectModel<V>,
    O extends types.SelectOptions<V, M>,
  >({
    maximumValuesToRender,
    models,
    dynamicHeight = true,
    options,
    valueModelRenderer,
  }: types.MultiValueRendererProps<V, M, O>) => {
    // Sort models by key for consistent ordering.
    const sorted = useMemo(
      () =>
        models
          .map((m, i) => ({ model: m, index: i }))
          .sort((a, b) => {
            const aKey = types.isSelectValueModel(a.model)
              ? getMenuItemKey({ id: a.model.id, index: a.index })
              : getMenuItemKey({ id: getModelId(a.model as M, options), index: a.index });
            const bKey = types.isSelectValueModel(b.model)
              ? getMenuItemKey({ id: b.model.id, index: b.index })
              : getMenuItemKey({ id: getModelId(b.model as M, options), index: b.index });
            return aKey > bKey ? 1 : -1;
          })
          .map((m): types.SelectDataModel<V, M, O> => m.model),
      [options, models],
    );

    return (
      <TruncatedMultiValueRenderer models={sorted} maximumValuesToRender={maximumValuesToRender}>
        {({ models: _models }) => (
          <MultiValueRendererContainer dynamicHeight={dynamicHeight}>
            {_models.map((model, i) => {
              if (valueModelRenderer) {
                return <React.Fragment key={i}>{valueModelRenderer(model)}</React.Fragment>;
              }
              let label: ReactNode;
              if (types.isSelectValueModel(model)) {
                label = model.label;
              } else {
                label =
                  types.getSelectModelValueLabel(model as M, options) ??
                  getModelLabel(model as M, options);
              }
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

export default MultiValueRenderer;
