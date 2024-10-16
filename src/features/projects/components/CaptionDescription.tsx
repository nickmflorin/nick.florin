import { classNames } from "~/components/types";
import { Description, type DescriptionProps } from "~/components/typography/Description";

export interface CaptionDescriptionProps
  extends Omit<DescriptionProps<"div">, "fontSize" | "component"> {
  readonly centered?: boolean;
}

export const CaptionDescription = ({
  children,
  centered = false,
  ...props
}: CaptionDescriptionProps): JSX.Element => (
  <Description
    {...props}
    component="div"
    className={classNames(
      "text-sm max-md:text-xs text-left text-[#a4a4a4]",
      { "w-full": !centered, "text-center": centered },
      props.className,
    )}
  >
    {children}
  </Description>
);
