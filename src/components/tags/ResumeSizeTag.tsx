import { toFileSizeString } from "~/lib/fs";
import { type BrandResume } from "~/prisma/model";

import { Tag, type TagProps } from "./Tag";

export interface ResumeSizeTagProps extends Omit<TagProps, "children" | "icon"> {
  readonly resume: BrandResume;
}

export const ResumeSizeTag = ({ resume, ...props }: ResumeSizeTagProps): JSX.Element => (
  <Tag {...props} icon={{ name: "server" }}>
    {toFileSizeString(resume.size)}
  </Tag>
);
