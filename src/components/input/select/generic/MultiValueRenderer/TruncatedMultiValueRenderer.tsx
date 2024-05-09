import React, { memo, useMemo } from "react";

import type * as types from "../types";

import { Text } from "~/components/typography/Text";

export type TruncatedMultiValueRendererComponent = {
  <
    D extends M | types.SelectValueModel<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >(
    props: TruncatedMultiValueRendererProps<D, M, O>,
  ): JSX.Element;
};

export interface TruncatedMultiValueRendererProps<
  D extends M | types.SelectValueModel<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> extends Pick<types.MultiValueRendererProps<D, M, O>, "data" | "maximumNumBadges"> {
  readonly children: (params: { data: D[] }) => JSX.Element;
}

export const TruncatedMultiValueRenderer = memo(
  <
    D extends M | types.SelectValueModel<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >({
    maximumNumBadges,
    children,
    ...props
  }: TruncatedMultiValueRendererProps<D, M, O>) => {
    /* Note: The models must be sorted before being provided as a prop to this component, because
       the partition will be made assuming that the models are in a specific order. */
    const partition = useMemo(() => {
      if (maximumNumBadges) {
        return [props.data.slice(0, maximumNumBadges), props.data.slice(maximumNumBadges)];
      }
      return null;
    }, [props.data, maximumNumBadges]);

    if (partition && partition[1].length !== 0) {
      return (
        <div className="flex flex-row gap-[4px] items-center overflow-hidden">
          {children({ data: partition[0] })}
          <Text fontSize="xs" className="text-gray-600">{`${partition[1].length} More...`}</Text>
        </div>
      );
    }
    return children({ data: props.data });
  },
) as TruncatedMultiValueRendererComponent;

export default TruncatedMultiValueRenderer;
