import { type Experience, type Company } from "~/prisma/model";
import { ModelImage } from "~/components/images/ModelImage";

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
            <ModelImage key={i} size={18} url={m.company.logoImageUrl} />
          ))}
      </div>
    )}
  />
);
