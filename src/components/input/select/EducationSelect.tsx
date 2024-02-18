import { type Education, type School } from "~/prisma/model";
import { ModelImage } from "~/components/images/ModelImage";

import { Select, type SelectProps } from "./Select";

type Edu = Pick<Education, "major" | "id"> & {
  readonly school: Pick<School, "id" | "logoImageUrl">;
};

const options = {
  getItemValue: (m: Edu) => m.id,
  getItemLabel: (m: Edu) => m.major,
  isMulti: true,
} as const;

export const EducationSelect = <E extends Edu>(
  props: Omit<SelectProps<E, typeof options>, "options">,
): JSX.Element => (
  <Select<E, typeof options>
    {...props}
    options={options}
    valueRenderer={(v, { models }) => (
      <div className="flex flex-row gap-[4px] items-center">
        {models
          // Sort to prevent reordering when data is refetched from server.
          .sort((a, b) => (a.id > b.id ? 1 : -1))
          .map((m, i) => (
            <ModelImage key={i} size={18} url={m.school.logoImageUrl} />
          ))}
      </div>
    )}
  />
);
