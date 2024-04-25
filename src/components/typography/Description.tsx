import { useMemo } from "react";

import clsx from "clsx";

import { Text, type TextProps } from "./Text";
import * as types from "./types";

const descriptionNodeCanRender = (
  node: types.SingleTextNode,
): node is types.RenderableSingleTextNode => {
  if (typeof node === "string") {
    return node.trim().length !== 0;
  }
  return types.singleTextNodeCanRender(node);
};

const splitChildNodeString = (child: string, options: { lineBreakSize: types.LineBreakSize }) => {
  if (child.includes("\n")) {
    const filtered = child.split("\n").filter(p => descriptionNodeCanRender(p));
    return filtered.flatMap((c, index) =>
      index !== filtered.length - 1
        ? options.lineBreakSize === 1
          ? [c.trim(), <br key={`${c}_break`} />]
          : [c.trim(), <br key={`${c}_break_1`} />, <br key={`${c}_break_2`} />]
        : c.trim(),
    );
  }
  return child;
};

export interface DescriptionProps extends Omit<TextProps, "flex" | "children"> {
  readonly lineBreakSize?: types.LineBreakSize;
  /* It is important that we do not use RestrictedNode here because we do not want infinitely nested
     iterables of children, only one level of nesting deep. */
  readonly children: types.SingleTextNode | types.SingleTextNode[];
}

export const Description = ({
  fontSize = "md",
  fontWeight = "regular",
  children,
  lineBreakSize = 2,
  ...props
}: DescriptionProps): JSX.Element => {
  const nodes = useMemo(
    () =>
      (Array.isArray(children) ? children : [children]).reduce(
        (acc: types.RenderableSingleTextNode[], child): types.RenderableSingleTextNode[] => {
          if (Array.isArray(child)) {
            return [
              ...acc,
              ...child
                .filter((c): c is types.RenderableSingleTextNode => descriptionNodeCanRender(c))
                .reduce(
                  (acc: types.RenderableSingleTextNode[], c) => [
                    ...acc,
                    ...(typeof c === "string" ? splitChildNodeString(c, { lineBreakSize }) : [c]),
                  ],
                  [],
                ),
            ];
          } else if (descriptionNodeCanRender(child)) {
            if (typeof child === "string") {
              return [...acc, ...splitChildNodeString(child, { lineBreakSize })];
            }
            return [...acc, child];
          }
          return acc;
        },
        [] as types.RenderableSingleTextNode[],
      ),
    [children, lineBreakSize],
  );
  if (nodes.length !== 0) {
    return (
      <Text
        {...props}
        fontSize={fontSize}
        fontWeight={fontWeight}
        className={clsx("text-body-light", props.className)}
      >
        {nodes}
      </Text>
    );
  }
  return <></>;
};
