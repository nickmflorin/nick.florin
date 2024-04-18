import React, { useMemo } from "react";

import { Badge } from "~/components/badges/Badge";
import { getModelLabel, getModelValue, getModelId } from "~/components/menus";
import { getMenuItemKey } from "~/components/menus/util";
import { Text } from "~/components/typography/Text";

import * as types from "../types";

export const MultiValueRenderer = <M extends types.SelectModel, O extends types.SelectOptions<M>>({
  maximumNumBadges,
  ...props
}: types.MultiValueRendererProps<M, O>) => {
  // Sort models by key for consistent ordering.
  const ms = useMemo(
    () =>
      props.models
        .map((m, i) => ({
          value: getModelValue(m, props.options),
          model: m,
          index: i,
          id: getModelId(m, props.options),
        }))
        .sort((a, b) => (getMenuItemKey(a) > getMenuItemKey(b) ? 1 : -1)),
    [props.options, props.models],
  );

  if (maximumNumBadges) {
    const partition = [ms.slice(0, maximumNumBadges), ms.slice(maximumNumBadges)];
    if (partition[1].length !== 0) {
      return (
        <div className="flex flex-row gap-[4px] items-center">
          <MultiValueRenderer {...props} models={partition[0].map(m => m.model)} />
          <Text size="xs" className="text-gray-600">{`${partition[1].length} More...`}</Text>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-wrap gap-y-[4px] gap-x-[4px] overflow-hidden">
      {ms.map(({ model }, i) => {
        if (props.valueModelRenderer) {
          return (
            <React.Fragment key={i}>
              {props.valueModelRenderer(props.value, { model })}
            </React.Fragment>
          );
        }
        const label =
          types.getModelValueLabel(model, props.options) ?? getModelLabel(model, props.options);
        if (typeof label === "string") {
          return (
            <Badge fontSize="xxs" key={i}>
              {label}
            </Badge>
          );
        }
        return label;
      })}
    </div>
  );
};

export default MultiValueRenderer;
