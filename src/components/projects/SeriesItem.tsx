import { type Size } from "~/components/types";
import { type TypographySize } from "~/components/typography";
import { Text } from "~/components/typography/Text";

interface SeriesItemProps {
  readonly gap?: Size;
  readonly title: string;
  readonly children: string;
  readonly withColon?: boolean;
  readonly titleWidth: Size;
  readonly textSize?: TypographySize;
}

export const SeriesItem = ({
  gap = "6px",
  title,
  children,
  withColon = false,
  titleWidth,
  textSize = "md",
}: SeriesItemProps) => (
  <div className="flex flex-row items-start" style={{ gap }}>
    <Text
      fontWeight="medium"
      flex
      size={textSize}
      className="text-body"
      style={{ maxWidth: titleWidth, minWidth: titleWidth }}
    >
      {title}
      {withColon && (
        <Text size={textSize} span className="text-body-light">
          :
        </Text>
      )}
    </Text>
    <Text size={textSize} className="text-body-light">
      {children}
    </Text>
  </div>
);
