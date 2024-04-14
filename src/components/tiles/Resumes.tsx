import clsx from "clsx";

import type { BrandResume } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { ResumeTile } from "./ResumeTile";

export interface ResumesProps extends ComponentProps {
  readonly resumes: BrandResume[];
}

export const Resumes = ({ resumes, ...props }: ResumesProps) => (
  <div {...props} className={clsx("relative w-full flex flex-col gap-[4px]", props.className)}>
    {resumes.map(resume => (
      <ResumeTile key={resume.id} resume={resume} />
    ))}
  </div>
);
