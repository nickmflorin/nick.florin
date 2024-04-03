import { useMemo, type ReactNode } from "react";

import clsx from "clsx";

import { type Size, type ComponentProps } from "~/components/types";

import { Text } from "./Text";
import { type TypographySize, type FontWeight, type FontFamily } from "./types";
import { getTypographyClassName } from "./types";

export interface DescriptionProps extends ComponentProps {
  readonly gap?: Size;
  readonly description?: ReactNode[] | ReactNode;
  readonly fontSize?: TypographySize;
  readonly fontWeight?: FontWeight;
  readonly fontFamily?: FontFamily;
  readonly children?: ReactNode[] | ReactNode;
}

export const Description = ({
  description,
  gap = "4px",
  fontSize = "md",
  fontFamily,
  fontWeight = "regular",
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

  return validDescriptions.length !== 0 ? (
    <div
      className={clsx(
        "description",
        // TODO: Improve multi-line logic.
        {
          "flex flex-col":
            validDescriptions.length > 1 &&
            validDescriptions.filter(d => typeof d === "string").length ===
              validDescriptions.length,
        },
        getTypographyClassName({ fontFamily, fontSize, fontWeight }),
        props.className,
      )}
      style={{ ...props.style, gap }}
    >
      {validDescriptions.map((d, index) =>
        typeof d === "string" ? (
          <Text key={index} inherit>
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
