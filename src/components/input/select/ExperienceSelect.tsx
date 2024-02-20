import { type Experience, type Company } from "~/prisma/model";

import { Select, type SelectProps } from "./Select";

type Exp = Pick<Experience, "title" | "id"> & {
  readonly company: Pick<Company, "id" | "logoImageUrl">;
};

const options = {
  getItemValue: (m: Exp) => m.id,
  getItemLabel: (m: Exp) => m.title,
  isMulti: true,
} as const;

export const ExperienceSelect = <E extends Exp>(
  props: Omit<SelectProps<E, typeof options>, "options">,
): JSX.Element => <Select<E, typeof options> {...props} options={options} />;
