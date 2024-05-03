"use client";
import { useMemo } from "react";

import clsx from "clsx";

import { ResumeShowMoreLink } from "~/components/buttons/resume";
import * as types from "~/components/types";

import { useControlledTypographyVisibility } from "./hooks";
import { Text, type TextProps } from "./Text";

const descriptionNodeCanRender = (
  node: types.SingleTextNode,
): node is types.RenderableSingleTextNode => {
  if (typeof node === "string") {
    return node.trim().length !== 0;
  }
  return types.singleTextNodeCanRender(node);
};

const splitChildNodeString = (
  child: string,
  options: { lineBreakHeight?: types.QuantitativeSize },
) => {
  if (child.includes("\n")) {
    const filtered = child.split("\n").filter(p => descriptionNodeCanRender(p));
    return filtered.flatMap((c, index) =>
      index !== filtered.length - 1
        ? [
            c.trim(),
            <span
              key={`break_${index}`}
              className="block"
              style={{ height: types.sizeToString(options.lineBreakHeight ?? 6, "px") }}
            />,
          ]
        : c.trim(),
    );
  }
  return [child];
};

const WithShowMore = ({
  includeShowMoreLink = false,
  state,
  children,
  isTruncated,
  onToggle,
}: {
  includeShowMoreLink?: boolean;
  state: types.TypographyVisibilityState;
  children: JSX.Element;
  isTruncated: boolean;
  onToggle: () => void;
}) =>
  includeShowMoreLink && isTruncated ? (
    <div className="flex flex-col gap-[2px]">
      {children}
      <ResumeShowMoreLink state={state} onClick={onToggle} />
    </div>
  ) : (
    children
  );

export interface DescriptionProps extends Omit<TextProps, "flex" | "children"> {
  readonly lineBreakHeight?: types.QuantitativeSize;
  readonly includeShowMoreLink?: boolean;
  /* It is important that we do not use RestrictedNode here because we do not want infinitely nested
     iterables of children, only one level of nesting deep. */
  readonly children: types.SingleTextNode | types.SingleTextNode[];
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
        (acc: types.RenderableSingleTextNode[], child): types.RenderableSingleTextNode[] => {
          if (Array.isArray(child)) {
            return [
              ...acc,
              ...child
                .filter((c): c is types.RenderableSingleTextNode => descriptionNodeCanRender(c))
                .reduce(
                  (acc: types.RenderableSingleTextNode[], c) => [
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
        [] as types.RenderableSingleTextNode[],
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
        <Text
          {...props}
          ref={ref}
          lineClamp={state === "expanded" ? undefined : props.lineClamp}
          className={clsx(
            "description text-body-light",
            {
              [types.withoutOverridingClassName(
                "text-sm",
                props.className,
                ({ prefix, value, modifier }) =>
                  !modifier && prefix === "text" && types.isTailwindFontSizeValue(value),
              )]: props.fontSize === undefined,
              [types.withoutOverridingClassName(
                "max-sm:text-xs",
                props.className,
                /* If there is any responsive modifier on the text size, do not apply the
                   max-sm:text-xs class. */
                ({ prefix, value, modifier }) =>
                  modifier !== undefined &&
                  types.isTailwindScreenSizeModifier(modifier) &&
                  prefix === "text" &&
                  types.isTailwindFontSizeValue(value),
              )]: props.fontSize === undefined,
            },
            props.className,
          )}
        >
          {nodes}
        </Text>
      </WithShowMore>
    );
  }
  return <></>;
};
