import clsx from "clsx";

import { type BrandModel, type ResumeBrand } from "~/prisma/model";
import { LocationTag } from "~/components/tags/LocationTag";
import { TimePeriodTag } from "~/components/tags/TimePeriodTag";
import { type ComponentProps } from "~/components/types";

export interface ResumeModelBadgesProps<M extends BrandModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
}

export const ResumeModelBadges = <M extends BrandModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: ResumeModelBadgesProps<M, T>) => (
  <div
    {...props}
    className={clsx("flex flex-row items-center gap-[8px] h-[22px]", props.className)}
  >
    <TimePeriodTag
      fontSize="xs"
      className="h-full text-xs max-sm:text-xxs"
      iconClassName="h-[16px]"
      timePeriod={
        model.$kind === "experience"
          ? { startDate: model.startDate, endDate: model.endDate }
          : { startDate: model.startDate, endDate: model.endDate, postPoned: model.postPoned }
      }
    />
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
