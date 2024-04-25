import React, { useMemo } from "react";

import clsx from "clsx";

import { Badge } from "~/components/badges/Badge";
import { getModelLabel, getModelValue, getModelId } from "~/components/menus";
import { getMenuItemKey } from "~/components/menus/util";
import { Text } from "~/components/typography/Text";

import * as types from "../types";

export const MultiValueRenderer = <M extends types.SelectModel, O extends types.SelectOptions<M>>({
  maximumNumBadges,
  dynamicHeight = true,
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
        <div className="flex flex-row gap-[4px] items-center overflow-hidden">
          <MultiValueRenderer
            {...props}
            dynamicHeight={dynamicHeight}
            models={partition[0].map(m => m.model)}
          />
          <Text fontSize="xs" className="text-gray-600">{`${partition[1].length} More...`}</Text>
        </div>
      );
    }
  }

  /* If the 'dynamicHeight' prop is set to false, it means that the Select input should only show
     one "row" of badges, or text, and badges that cause the inner content to exceed the width of
     the Select should not cause the Select to expand in height, but rather, the badges to truncate
     with ellipsis overflow.  This means that the 'flex-wrap' should only be set if the
     'dynamicHeight' prop is true. */
  return (
    <div
      className={clsx("flex gap-x-[4px] overflow-hidden", {
        "flex-wrap gap-y-[4px]": dynamicHeight,
        "flex-row": !dynamicHeight,
      })}
    >
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
