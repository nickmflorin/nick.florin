"use client";
import { useMemo, type ReactNode } from "react";

import { type QuantitativeSize, sizeToString } from "~/components/types/sizes";
import { useControlledTypographyVisibility } from "~/components/typography/hooks";

import {
  DescriptionNode,
  type DescriptionNodeProps,
  type DescriptionComponent,
} from "./DescriptionNode";
import { WithShowMore } from "./WithShowMore";

const splitChildNodeString = (child: string, options: { lineBreakHeight?: QuantitativeSize }) => {
  if (child.includes("\n")) {
    const filtered = child.split("\n").filter(p => Boolean(p));
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

export type DescriptionProps<C extends DescriptionComponent> = DescriptionNodeProps<C> & {
  readonly lineBreakHeight?: QuantitativeSize;
  readonly includeShowMoreLink?: boolean;
};

export const Description = <C extends DescriptionComponent>({
  children,
  lineBreakHeight = 6,
  includeShowMoreLink = false,
  ...props
}: DescriptionProps<C>): JSX.Element => {
  const { ref, state, isTruncated, toggle } = useControlledTypographyVisibility({});

  const nodes = useMemo(
    () =>
      (Array.isArray(children) ? children : [children]).reduce(
        (acc: ReactNode[], child): ReactNode[] => {
          if (Array.isArray(child)) {
            return [
              ...acc,
              ...child
                .filter((c): c is ReactNode => Boolean(c))
                .reduce(
                  (acc: ReactNode[], c) => [
                    ...acc,
                    ...(typeof c === "string" ? splitChildNodeString(c, { lineBreakHeight }) : [c]),
                  ],
                  [],
                ),
            ];
          } else if (typeof child === "string") {
            return [...acc, ...splitChildNodeString(child, { lineBreakHeight })];
          } else if (child) {
            return [...acc, child];
          }
          return acc;
        },
        [] as ReactNode[],
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
