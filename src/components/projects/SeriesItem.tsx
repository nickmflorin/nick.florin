import { type Size } from "~/components/types";
import { type FontSize } from "~/components/typography";
import { Text } from "~/components/typography/Text";

interface SeriesItemProps {
  readonly gap?: Size;
  readonly title: string;
  readonly children: string;
  readonly withColon?: boolean;
  readonly titleWidth: Size;
  readonly textSize?: FontSize;
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
      fontSize={textSize}
      className="text-body"
      style={{ maxWidth: titleWidth, minWidth: titleWidth }}
    >
      {title}
      {withColon && (
        <Text fontSize={textSize} as="span" className="text-body-light">
          :
        </Text>
      )}
    </Text>
    <Text fontSize={textSize} className="text-body-light">
      {children}
    </Text>
  </div>
);
