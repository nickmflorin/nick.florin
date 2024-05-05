"use client";
import { useMemo } from "react";

import { type QuantitativeSize, sizeToString } from "~/components/types/sizes";
import {
  type SingleTextNode,
  type RenderableSingleTextNode,
  singleTextNodeCanRender,
} from "~/components/types/typography";
import { useControlledTypographyVisibility } from "~/components/typography/hooks";

import { DescriptionNode, type DescriptionNodeProps } from "./DescriptionNode";
import { WithShowMore } from "./WithShowMore";

const descriptionNodeCanRender = (node: SingleTextNode): node is RenderableSingleTextNode => {
  if (typeof node === "string") {
    return node.trim().length !== 0;
  }
  return singleTextNodeCanRender(node);
};

const splitChildNodeString = (child: string, options: { lineBreakHeight?: QuantitativeSize }) => {
  if (child.includes("\n")) {
    const filtered = child.split("\n").filter(p => descriptionNodeCanRender(p));
    return filtered.flatMap((c, index) =>
      index !== filtered.length - 1
        ? [
            c.trim(),
            <span
              key={`break_${index}`}
              className="block"
              style={{ height: sizeToString(options.lineBreakHeight ?? 6, "px") }}
            />,
          ]
        : c.trim(),
    );
  }
  return [child];
};

export interface DescriptionProps extends DescriptionNodeProps {
  readonly lineBreakHeight?: QuantitativeSize;
  readonly includeShowMoreLink?: boolean;
}

export const Description = ({
  children,
  lineBreakHeight = 6,
  includeShowMoreLink = false,
  ...props
}: DescriptionProps): JSX.Element => {
  const { ref, state, isTruncated, toggle } = useControlledTypographyVisibility({});

  const nodes = useMemo(
    () =>
      (Array.isArray(children) ? children : [children]).reduce(
        (acc: RenderableSingleTextNode[], child): RenderableSingleTextNode[] => {
          if (Array.isArray(child)) {
            return [
              ...acc,
              ...child
                .filter((c): c is RenderableSingleTextNode => descriptionNodeCanRender(c))
                .reduce(
                  (acc: RenderableSingleTextNode[], c) => [
                    ...acc,
                    ...(typeof c === "string" ? splitChildNodeString(c, { lineBreakHeight }) : [c]),
                  ],
                  [],
                ),
            ];
          } else if (descriptionNodeCanRender(child)) {
            if (typeof child === "string") {
              return [...acc, ...splitChildNodeString(child, { lineBreakHeight })];
            }
            return [...acc, child];
          }
          return acc;
        },
        [] as RenderableSingleTextNode[],
      ),
    [children, lineBreakHeight],
  );

  if (nodes.length !== 0) {
    return (
      <WithShowMore
        state={state}
        onToggle={toggle}
        isTruncated={isTruncated}
        includeShowMoreLink={includeShowMoreLink}
      >
        <DescriptionNode
          {...props}
          ref={ref}
          lineClamp={state === "expanded" ? undefined : props.lineClamp}
        >
          {nodes}
        </DescriptionNode>
      </WithShowMore>
    );
  }
  return <></>;
};
