import { type ModelLocation, stringifyLocation } from "~/prisma/model";

import { Tag, type TagProps } from "./Tag";

export interface LocationTagProps extends Omit<TagProps, "children" | "icon"> {
  readonly location: ModelLocation;
}

export const LocationTag = ({ location, ...props }: LocationTagProps): JSX.Element => (
  <Tag {...props}>{stringifyLocation(location)}</Tag>
);
