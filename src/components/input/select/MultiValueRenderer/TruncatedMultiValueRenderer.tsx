import React, { memo, useMemo } from "react";

import type * as types from "../types";

import { Text } from "~/components/typography";

export type TruncatedMultiValueRendererComponent = {
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >(
    props: TruncatedMultiValueRendererProps<V, M, O>,
  ): JSX.Element;
};

export interface TruncatedMultiValueRendererProps<
  V extends types.UnsafeSelectValueForm<M, O>,
  M extends types.SelectModel,
  O extends types.SelectOptions<M>,
> extends Pick<types.MultiValueRendererProps<V, M, O>, "models" | "maximumValuesToRender"> {
  readonly children: (params: {
    models: types.MultiValueRendererProps<V, M, O>["models"];
  }) => JSX.Element;
}

export const TruncatedMultiValueRenderer = memo(
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >({
    maximumValuesToRender,
    children,
    ...props
  }: TruncatedMultiValueRendererProps<V, M, O>) => {
    /* Note: The models must be sorted before being provided as a prop to this component, because
       the partition will be made assuming that the models are in a specific order. */
    const partition = useMemo(() => {
      if (maximumValuesToRender) {
        return [
          props.models.slice(0, maximumValuesToRender),
          props.models.slice(maximumValuesToRender),
        ];
      }
      return null;
    }, [props.models, maximumValuesToRender]);

    if (partition && partition[1].length !== 0) {
      return (
        <div className="flex flex-row gap-[4px] items-center overflow-hidden">
          {children({ models: partition[0] })}
          <Text fontSize="xs" className="text-gray-600">{`${partition[1].length} More...`}</Text>
        </div>
      );
    }
    return children({ models: props.models });
  },
) as TruncatedMultiValueRendererComponent;

export default TruncatedMultiValueRenderer;
