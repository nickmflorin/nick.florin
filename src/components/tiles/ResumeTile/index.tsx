import clsx from "clsx";

import type { BrandResume } from "~/prisma/model";
import { Icon } from "~/components/icons/Icon";
import { Actions } from "~/components/structural/Actions";
import { DateTimeTag } from "~/components/tags/DateTimeTag";
import { ResumeSizeTag } from "~/components/tags/ResumeSizeTag";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";

import { DeleteResumeButton } from "./DeleteResumeButton";

export interface ResumeTileProps extends ComponentProps {
  readonly resume: BrandResume;
}

export const ResumeTile = ({ resume, ...props }: ResumeTileProps): JSX.Element => (
  <div {...props} className={clsx("relative p-[8px] border rounded-md", props.className)}>
    <div className="flex flex-col gap-[8px]">
      <div className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-row gap-[8px] items-center">
          <Icon name="file-pdf" size="18px" className="text-gray-700" />
          <Label size="smplus" fontWeight="medium" className="leading-[28px]">
            {resume.filename}
          </Label>
        </div>
        <Actions>
          <DeleteResumeButton resume={resume} />
        </Actions>
      </div>
      <div className="flex flex-col gap-[6px] pl-[26px]">
        <DateTimeTag
          prefix="Uploaded"
          date={resume.createdAt}
          textClassName="text-body-light"
          fontWeight="regular"
          gap="6px"
        />
        <ResumeSizeTag
          resume={resume}
          size="sm"
          textClassName="text-body-light"
          fontWeight="regular"
          gap="6px"
        />
      </div>
    </div>
  </div>
);
