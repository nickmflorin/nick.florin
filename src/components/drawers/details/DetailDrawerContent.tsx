import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";
import { Title } from "~/components/typography/Title";

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
        <Title order={2} className="text-gray-700 max-w-fit">
          {title}
        </Title>
        {badge}
      </div>
      <Description>{description}</Description>
    </div>
    <div className="flex flex-col gap-[14px] overflow-y-auto">{children}</div>
  </DrawerContent>
);
