import React, { useMemo, memo } from "react";

import type * as types from "../types";

import { Badge } from "~/components/badges/Badge";

import { MultiValueRendererContainer } from "./MultiValueRendererContainer";
import { TruncatedMultiValueRenderer } from "./TruncatedMultiValueRenderer";

export type MultiValueDatumRendererComponent = {
  <M extends types.SelectModel, O extends types.SelectOptions<M>>(
    props: types.MultiValueDatumRendererProps<M, O>,
  ): JSX.Element;
};

export const MultiValueDatumRenderer = memo(
  <M extends types.SelectModel, O extends Omit<types.SelectOptions<M>, "isFiltered" | "isMulti">>({
    maximumNumBadges,
    dynamicHeight = true,
    data,
  }: types.MultiValueDatumRendererProps<M, O>) => {
    // Sort models by key for consistent ordering.
    const ms = useMemo(() => data.sort((a, b) => (a.id > b.id ? 1 : -1)), [data]);
    return (
      <TruncatedMultiValueRenderer data={ms} maximumNumBadges={maximumNumBadges}>
        {({ data }) => (
          <MultiValueRendererContainer dynamicHeight={dynamicHeight}>
            {data.map(({ label }, i) => {
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
) as MultiValueDatumRendererComponent;

export default MultiValueDatumRenderer;
