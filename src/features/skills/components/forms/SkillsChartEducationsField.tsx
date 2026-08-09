import { type FC, use } from 'react';

import { Form } from '~/components/forms-v2/Form';
import { type FormInstance } from '~/components/forms-v2/types';
import {
  EducationSelect,
  type EducationSelectModel,
} from '~/features/educations/components/input/EducationSelect';

import { type SkillsChartFilterFormValues } from './SkillsChartFilterForm';

export interface SkillsChartEducationsFieldProps {
  /**
   * The education options, started on the server without being awaited and resolved here with
   * `use()`, which suspends until the promise settles. The promise never rejects: a failed
   * server read resolves to `null`, which disables the select and renders the error on the
   * field. When the prop is omitted the field renders its awaiting-data variant — the shape the
   * form mounts as this field's `Suspense` fallback.
   */
  readonly dataPromise?: Promise<EducationSelectModel[] | null>;
  readonly form: FormInstance<SkillsChartFilterFormValues>;
}

/**
 * The chart filter form's educations field, which owns the resolution of its streamed options:
 * the whole field — label, select and error slot — is the unit that suspends, so a failed load
 * is derived during render and displayed through the field's `errors` prop rather than being
 * imperatively written into form state.
 */
export const SkillsChartEducationsField: FC<SkillsChartEducationsFieldProps> = ({
  dataPromise,
  form,
}) => {
  /* Unlike hooks, 'use' may be called conditionally: with no promise the field renders its
     awaiting-data variant instead of suspending. */
  const data = dataPromise === undefined ? undefined : use(dataPromise);
  return (
    <Form.ControlledField
      errors={data === null ? ['There was an error loading the data.'] : undefined}
      form={form}
      helpText='The academic experience(s) where the skills were acquired or used.'
      label='Educations'
      name='educations'
    >
      {({ onChange, value }) => (
        <EducationSelect
          behavior='multi'
          data={data ?? []}
          hasAbbreviatedLabels={false}
          inputClassName='w-full'
          isClearable
          isDisabled={data === null}
          isInPortal
          isInputLoading={data === undefined}
          isReady={data !== undefined}
          onChange={onChange}
          popoverPlacement='bottom'
          value={value}
        />
      )}
    </Form.ControlledField>
  );
};
