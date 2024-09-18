import { type BrandModel, type ResumeBrand } from "~/database/model";

import { Icon } from "~/components/icons/Icon";
import { LocationTag } from "~/components/tags/LocationTag";
import { TimePeriodTag } from "~/components/tags/TimePeriodTag";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface ResumeModelTagsProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
}

export const ResumeModelTags = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: ResumeModelTagsProps<M, T>) => (
  <div
    {...props}
    className={classNames("flex flex-row gap-[2px] h-[16px] items-center", props.className)}
  >
    <TimePeriodTag
      className="h-full text-xs max-sm:text-xxs"
      iconClassName="h-[16px]"
      timePeriod={
        model.$kind === "experience"
          ? { startDate: model.startDate, endDate: model.endDate }
          : { startDate: model.startDate, endDate: model.endDate, postPoned: model.postPoned }
      }
    />
    <Icon icon="pipe" className="h-[14px] text-body" />
    <LocationTag
      className="h-full text-xs max-sm:text-xxs"
      iconClassName="h-[16px]"
      location={
        model.$kind === "education"
          ? {
              city: model.school.city,
              state: model.school.state,
            }
          : {
              city: model.company.city,
              state: model.company.state,
              isRemote: model.isRemote,
            }
      }
    />
  </div>
);
