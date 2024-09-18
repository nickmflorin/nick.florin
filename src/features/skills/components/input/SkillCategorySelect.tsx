import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { SkillCategories } from "~/database/model";

import type { SelectBehaviorType } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

type M = EnumeratedLiteralsModel<typeof SkillCategories>;

const getItemValue = (m: M) => m.value;

export interface SkillCategorySelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<M, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "data"
  > {
  readonly behavior: B;
}

export const SkillCategorySelect = <B extends SelectBehaviorType>({
  behavior,
  ...props
}: SkillCategorySelectProps<B>): JSX.Element => (
  <DataSelect<M, { behavior: B; getItemValue: typeof getItemValue }>
    {...props}
    options={{ behavior, getItemValue }}
    getItemValueLabel={m => m.label}
    data={[...SkillCategories.models]}
    itemRenderer={m => m.label}
  />
);
