import { useMemo } from "react";

import clsx from "clsx";

import { type Size, type ComponentProps } from "~/components/types";

import { Text } from "./Text";
import { type TypographySize, type FontWeight, type FontFamily } from "./types";

type DescriptionText = string | null | undefined;

export interface DescriptionProps extends ComponentProps {
  readonly gap?: Size;
  readonly description?: DescriptionText[] | DescriptionText;
  readonly fontSize?: TypographySize;
  readonly fontWeight?: FontWeight;
  readonly textClassName?: ComponentProps["className"];
  readonly fontFamily?: FontFamily;
}

export const Description = ({
  description,
  gap = "4px",
  fontSize = "md",
  textClassName = "text-body-light",
  fontFamily,
  fontWeight = "regular",
  ...props
}: DescriptionProps): JSX.Element => {
  const validDescriptions = useMemo(
    () =>
      (Array.isArray(description) ? description : [description]).filter(
        d => d !== null && d !== undefined && d.trim().length !== 0,
      ),
    [description],
  );

  return validDescriptions.length !== 0 ? (
    <div className={clsx("flex flex-col", props.className)} style={{ ...props.style, gap }}>
      {validDescriptions.map((d, index) => (
        <Text
          key={index}
          fontWeight={fontWeight}
          size={fontSize}
          className={textClassName}
          fontFamily={fontFamily}
        >
          {d}
        </Text>
      ))}
    </div>
  ) : (
    <></>
  );
};
