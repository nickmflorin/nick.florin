import { Label, Text, Description } from "~/components/typography";

interface SeriesItemProps {
  readonly title: string;
  readonly children: string;
}

export const SeriesItem = ({ title, children }: SeriesItemProps) => (
  <div className="flex flex-row max-md:flex-col items-start gap-[6px]">
    <Label fontWeight="medium" className="md:max-w-[70px] md:min-w-[70px] text-sm max-sm:text-xs">
      {title}
      <Text className="max-md:hidden" component="span">
        :
      </Text>
    </Label>
    <Description>{children}</Description>
  </div>
);
