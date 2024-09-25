import { forwardRef, type ForwardedRef } from "react";

import { type ApiSkill } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

const getItemValue = (m: ApiSkill) => m.id;

export type SkillsSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiSkill,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface SkillsSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiSkill, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "itemRenderer" | "getItemValueLabel"
  > {
  readonly behavior: B;
}

export const SkillsSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, ...props }: SkillsSelectProps<B>,
    ref: ForwardedRef<SkillsSelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<ApiSkill, { behavior: B; getItemValue: typeof getItemValue }>
      summarizeValueAfter={2}
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.label}
      itemRenderer={m => m.label}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: SkillsSelectProps<B> & {
      readonly ref?: ForwardedRef<SkillsSelectInstance<B>>;
    },
  ): JSX.Element;
};
