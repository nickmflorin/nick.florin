import { forwardRef, type ForwardedRef } from "react";

import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { ProgrammingLanguages } from "~/database/model";

import type { DataSelectInstance, SelectBehaviorType } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

type M = EnumeratedLiteralsModel<typeof ProgrammingLanguages>;

const getItemValue = (m: M) => m.value;

export interface ProgrammingLanguageSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<M, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "data" | "itemRenderer" | "getItemValueLabel" | "getItemIcon"
  > {
  readonly behavior: B;
}

export const ProgrammingLanguageSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, ...props }: ProgrammingLanguageSelectProps<B>,
    ref: ForwardedRef<DataSelectInstance<M, { behavior: B; getItemValue: typeof getItemValue }>>,
  ): JSX.Element => (
    <DataSelect<M, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.label}
      getItemIcon={m => m.icon}
      data={[...ProgrammingLanguages.models]}
      itemRenderer={m => m.label}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: ProgrammingLanguageSelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<M, { behavior: B; getItemValue: typeof getItemValue }>
      >;
    },
  ): JSX.Element;
};
