import { type Education, type School } from "~/prisma/model";

import { Select, type SelectProps } from "./Select";

type Edu = Pick<Education, "major" | "id"> & {
  readonly school: Pick<School, "id" | "name">;
};

const options = {
  getItemValue: (m: Edu) => m.id,
  getItemLabel: (m: Edu) => m.major,
  isMulti: true,
} as const;

export const EducationSelect = <E extends Edu>(
  props: Omit<SelectProps<E, typeof options>, "options">,
): JSX.Element => <Select<E, typeof options> {...props} options={options} />;
