import React, { memo, useMemo } from "react";

import { isFragment } from "react-is";

import { Text } from "~/components/typography/Text";

export interface TruncatedMultiValuRendererProps {
  readonly content: (string | number | JSX.Element)[] | string | number | JSX.Element;
  readonly maximumValuesToRender?: number;
  readonly children: (params: { children: JSX.Element[] }) => JSX.Element;
}

export const TruncatedMultiValueRenderer = memo(
  ({ maximumValuesToRender, content, children }: TruncatedMultiValuRendererProps) => {
    const contents = useMemo(
      () => (Array.isArray(content) ? content : [content]).filter(c => !isFragment(c)),
      [content],
    );

    /* Note: The models must be sorted before being provided as a prop to this component, because
       the partition will be made assuming that the models are in a specific order. */
    const partition = useMemo(() => {
      if (maximumValuesToRender) {
        return [contents.slice(0, maximumValuesToRender), contents.slice(maximumValuesToRender)];
      }
      return null;
    }, [contents, maximumValuesToRender]);

    if (partition && partition[1].length !== 0) {
      if (partition[0].length !== 0) {
        return (
          <div className="flex flex-row gap-[4px] items-center overflow-hidden">
            {children({
              children: partition[0].map((child, i) => (
                <React.Fragment key={i}>{child}</React.Fragment>
              )),
            })}
            <Text
              fontSize="xs"
              className="text-gray-600"
              lineClamp={1}
            >{`${partition[1].length} More...`}</Text>
          </div>
        );
      }
      return <></>;
    } else if (contents.length !== 0) {
      return children({
        children: contents.map((child, i) => <React.Fragment key={i}>{child}</React.Fragment>),
      });
    }
    return <></>;
  },
);
