import { type ResumeBrand } from "~/prisma/model";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography";
import { HumanizedCourses } from "~/features/courses/components/HumanizedCourses";
import * as types from "~/features/resume/types";
import { Skills } from "~/features/skills/components/badges";

import { ResumeModelTile } from "./ResumeModelTile";

export interface ResumeModelPageTileProps<M extends types.ApiModel<T>, T extends ResumeBrand>
  extends ComponentProps {
  readonly model: M;
}

export const ResumeModelPageTile = <M extends types.ApiModel<T>, T extends ResumeBrand>({
  model,
  ...props
}: ResumeModelPageTileProps<M, T>) => (
  <ResumeModelTile {...props} className={classNames("gap-[10px] max-md:gap-[8px]")}>
    <ResumeModelTile.Header size="large" model={model}>
      <div className="flex flex-col gap-[10px] max-md:gap-[8px]">
        {(types.hasDescription(model) || model.details.length !== 0) && (
          <div className="flex flex-col gap-[10px] max-w-[700px]">
            <ResumeModelTile.ModelDescription model={model} />
            <ResumeModelTile.Details size="large" details={model.details} />
          </div>
        )}
        {model.$kind === "education" && model.courses.length !== 0 && (
          <Description className="max-w-[800px]">
            <HumanizedCourses courses={model.courses} />
          </Description>
        )}
        {model.skills.length !== 0 ? (
          model.$kind === "experience" ? (
            <ResumeModelTile.Section label="Other Skills">
              <Skills skills={model.skills} className="max-w-[800px]" />
            </ResumeModelTile.Section>
          ) : (
            <Skills skills={model.skills} className="max-w-[800px]" />
          )
        ) : (
          <></>
        )}
      </div>
    </ResumeModelTile.Header>
  </ResumeModelTile>
);
