import React, { memo, useMemo, type ReactNode } from "react";

import { isFragment } from "react-is";

import { titleCase } from "~/lib/formatters";

import { classNames, type ComponentProps } from "~/components/types";
import { Text, type TextProps } from "~/components/typography/Text";

interface SelectValueTextProps extends Omit<TextProps<"div">, "fontSize" | "lineClamp"> {}

const SelectValueText = (props: SelectValueTextProps) => (
  <Text
    {...props}
    fontSize="xs"
    className={classNames("text-gray-600", props.className)}
    lineClamp={1}
  >
    {props.children}
  </Text>
);

export interface TruncatedMultiValuRendererProps {
  readonly summarizeValueAfter?: number;
  readonly summarizeValue?: boolean;
  readonly valueSummary?: ReactNode | ((params: { count: number }) => ReactNode);
  readonly content: (string | number | JSX.Element)[] | string | number | JSX.Element;
  readonly maximumValuesToRender?: number;
  readonly children: (params: { children: JSX.Element[] }) => JSX.Element;
}

interface ValueSummaryProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly count: number;
  readonly suffix?: "more" | "selected";
}

const ValueSummary = ({ children, count, suffix = "selected", ...props }: ValueSummaryProps) => {
  if (children) {
    if (typeof children === "string") {
      return <SelectValueText {...props}>{children}</SelectValueText>;
    }
    return children;
  }
  return <SelectValueText {...props}>{`${count} ${titleCase(suffix)}...`}</SelectValueText>;
};

export const TruncatedMultiValueRenderer = memo(
  ({
    maximumValuesToRender,
    content,
    summarizeValue,
    summarizeValueAfter,
    valueSummary,
    children,
  }: TruncatedMultiValuRendererProps) => {
    const contents = useMemo(
      () => (Array.isArray(content) ? content : [content]).filter(c => !isFragment(c)),
      [content],
    );

    /* Note: The models must be sorted before being provided as a prop to this component, because
       the partition will be made assuming that the models are in a specific order. */
    const partition = useMemo(() => {
      if (maximumValuesToRender !== undefined) {
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
            <ValueSummary count={partition[1].length} suffix="more">
              {typeof valueSummary === "function"
                ? valueSummary({ count: partition[1].length })
                : valueSummary}
            </ValueSummary>
          </div>
        );
      }
      return <></>;
    } else if (
      summarizeValueAfter !== undefined &&
      contents.length !== 0 &&
      contents.length > Math.max(0, summarizeValueAfter)
    ) {
      return (
        <div className="flex flex-row gap-[4px] items-center overflow-hidden">
          <ValueSummary count={contents.length} suffix="selected">
            {typeof valueSummary === "function"
              ? valueSummary({ count: contents.length })
              : valueSummary}
          </ValueSummary>
        </div>
      );
    } else if (summarizeValue && contents.length !== 0) {
      return (
        <div className="flex flex-row gap-[4px] items-center overflow-hidden">
          <ValueSummary count={contents.length} suffix="selected">
            {typeof valueSummary === "function"
              ? valueSummary({ count: contents.length })
              : valueSummary}
          </ValueSummary>
        </div>
      );
    } else if (contents.length !== 0) {
      return children({
        children: contents.map((child, i) => <React.Fragment key={i}>{child}</React.Fragment>),
      });
    }
    return <></>;
  },
);
