import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Title, Description } from "~/components/typography";

import { DrawerContent } from "../DrawerContent";

export interface DetailDrawerContentProps extends ComponentProps {
  readonly badge?: JSX.Element;
  readonly children: JSX.Element[];
  readonly description: string | null;
  readonly title: string;
}

export const DetailDrawerContent = ({
  badge,
  children,
  title,
  description,
  ...props
}: DetailDrawerContentProps) => (
  <DrawerContent {...props} className={classNames("gap-[14px] overflow-y-hidden", props.className)}>
    <div className="flex flex-col gap-[8px]">
      <div className="flex flex-col gap-[6px]">
        <Title component="h2" className="text-gray-700 max-w-fit">
          {title}
        </Title>
        {badge}
      </div>
      <Description>{description}</Description>
    </div>
    <div className="flex flex-col gap-[14px] overflow-y-auto">{children}</div>
  </DrawerContent>
);
