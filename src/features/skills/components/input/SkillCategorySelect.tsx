import { forwardRef, type ForwardedRef } from "react";

import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { SkillCategories } from "~/database/model";

import type { DataSelectInstance, SelectBehaviorType } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

type M = EnumeratedLiteralsModel<typeof SkillCategories>;

const getModelValue = (m: M) => m.value;

export interface SkillCategorySelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<M, { behavior: B; getModelValue: typeof getModelValue }>,
    "options" | "data" | "getModelValueLabel" | "itemRenderer"
  > {
  readonly behavior: B;
}

export const SkillCategorySelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, ...props }: SkillCategorySelectProps<B>,
    ref: ForwardedRef<DataSelectInstance<M, { behavior: B; getModelValue: typeof getModelValue }>>,
  ): JSX.Element => (
    <DataSelect<M, { behavior: B; getModelValue: typeof getModelValue }>
      {...props}
      ref={ref}
      options={{ behavior, getModelValue }}
      getModelValueLabel={m => m.label}
      data={[...SkillCategories.models]}
      itemRenderer={m => m.label}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: SkillCategorySelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<M, { behavior: B; getModelValue: typeof getModelValue }>
      >;
    },
  ): JSX.Element;
};
