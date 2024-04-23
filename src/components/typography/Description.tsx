import { useMemo, type ReactNode } from "react";

import clsx from "clsx";

import { type Size, type ComponentProps } from "~/components/types";

import { Text } from "./Text";
import { type FontSize, type FontWeight, type FontFamily } from "./types";
import { getTypographyClassName } from "./types";

export interface DescriptionProps extends ComponentProps {
  readonly gap?: Size;
  readonly description?: ReactNode[] | ReactNode;
  readonly fontSize?: FontSize;
  readonly fontWeight?: FontWeight;
  readonly fontFamily?: FontFamily;
  readonly textClassName?: ComponentProps["className"];
  readonly children?: ReactNode[] | ReactNode;
  // Note: This only works when there is a single description without line breaks.
  readonly lineClamp?: number;
}

export const Description = ({
  description,
  textClassName,
  gap = "4px",
  fontSize = "md",
  fontFamily,
  fontWeight = "regular",
  lineClamp,
  children,
  ...props
}: DescriptionProps): JSX.Element => {
  const validDescriptions = useMemo(() => {
    const text = description
      ? Array.isArray(description)
        ? description
        : [description]
      : [children];

    return text.reduce((prev: Exclude<ReactNode, null | undefined>[], d) => {
      if (d !== null && d !== undefined) {
        if (typeof d === "string" && d.trim().length !== 0) {
          const parts = d.split("\n");
          return [...prev, ...parts.map(p => p.trim())];
        }
        return [...prev, d];
      }
      return prev;
    }, []);
  }, [description, children]);

  const isFlex =
    validDescriptions.length > 1 &&
    validDescriptions.filter(d => typeof d === "string").length === validDescriptions.length;

  return validDescriptions.length !== 0 ? (
    <div
      className={clsx(
        "description",
        // TODO: Improve multi-line logic.
        { "flex flex-col": isFlex },
        getTypographyClassName({ fontFamily, fontSize, fontWeight }),
        props.className,
      )}
      style={{ ...props.style, gap: isFlex ? gap : undefined }}
    >
      {validDescriptions.map((d, index) =>
        typeof d === "string" ? (
          <Text key={index} inherit lineClamp={lineClamp} className={textClassName}>
            {d}
          </Text>
        ) : (
          d
        ),
      )}
    </div>
  ) : (
    <></>
  );
};
