import { Suspense } from 'react';

import { z } from 'zod';

import {
  type ApiSkill,
  ProgrammingDomain,
  ProgrammingLanguage,
  SkillCategory,
} from '~/database/model';

import { Form, type FormProps } from '~/components/forms-v2/Form';
import { RadioGroup } from '~/components/input/RadioGroup';
import { ButtonFooter } from '~/components/structural/ButtonFooter';
import { type EducationSelectModel } from '~/features/educations/components/input/EducationSelect';
import { type ExperienceSelectModel } from '~/features/experiences/components/input/ExperienceSelect';
import { SkillsChartEducationsField } from '~/features/skills/components/forms/SkillsChartEducationsField';
import { SkillsChartExperiencesField } from '~/features/skills/components/forms/SkillsChartExperiencesField';
import { ProgrammingDomainSelect } from '~/features/skills/components/input/ProgrammingDomainSelect';
import { ProgrammingLanguageSelect } from '~/features/skills/components/input/ProgrammingLanguageSelect';
import { SkillCategorySelect } from '~/features/skills/components/input/SkillCategorySelect';

const SHOW_TOP_SKILLS = [5, 8, 12, 'all'] as const;

export const ShowTopSkillsSchema = z.union([
  z.literal(5),
  z.literal(8),
  z.literal(12),
  z.literal('all'),
]);
export type ShowTopSkills = z.infer<typeof ShowTopSkillsSchema>;

export type ShowTopSkillsString = `${ShowTopSkills}`;

export const SkillsChartFilterFormSchema = z.object({
  categories: z.array(z.nativeEnum(SkillCategory)),
  educations: z.array(z.string().uuid()),
  experiences: z.array(z.string().uuid()),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)),
  showTopSkills: ShowTopSkillsSchema,
});

export type SkillsChartFilterFormValues = z.infer<typeof SkillsChartFilterFormSchema>;

/**
 * The pause in filter form activity after which pending changes are applied to the chart, so a
 * burst of select toggles produces a single refetch rather than one per change.
 *
 * Both surfaces that render the form (`SkillsFilterPopover` and `SkillsFilterDrawer`) debounce
 * their change propagation by this delay, and each flushes whatever is pending when it closes so
 * no change is ever lost to the pause.
 */
export const SkillsChartFilterDebounceDelay = 500;

const ShowTopSkillsLabels: Record<ShowTopSkillsString, string> = {
  '5': '5',
  '8': '8',
  '12': '12',
  all: 'All',
};

export interface SkillsChartFilterFormProps extends Omit<
  FormProps<SkillsChartFilterFormValues>,
  'children'
> {
  /**
   * The education options for the educations select, started on the server by the `@chart` page
   * without being awaited and resolved by the select's `use()` inside its `Suspense` boundary.
   */
  readonly educationsPromise: Promise<EducationSelectModel[] | null>;
  /**
   * The experience options for the experiences select, started on the server by the `@chart` page
   * without being awaited and resolved by the select's `use()` inside its `Suspense` boundary.
   */
  readonly experiencesPromise: Promise<ExperienceSelectModel[] | null>;
  readonly isClearDisabled?: boolean;
  readonly onClear: () => void;
  /**
   * The skills that are available to filter by.
   *
   * This is currently unused, but is accepted so that the form's select options can later be
   * restricted to skills that would not otherwise result in empty data being shown.
   */
  readonly skills: ApiSkill<[]>[];
}

export const SkillsChartFilterForm = ({
  educationsPromise,
  experiencesPromise,
  form,
  isClearDisabled,
  onClear,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars -- See note above in props. */
  skills,
  ...props
}: SkillsChartFilterFormProps) => (
  <Form
    {...props}
    footer={
      <ButtonFooter
        isSubmitDisabled={isClearDisabled}
        onSubmit={() => onClear()}
        submitButtonType='button'
        submitText='Clear Filters'
      />
    }
    form={form}
  >
    <Form.ControlledField
      form={form}
      helpText='The number of skills that should be shown in the chart.'
      helpTextClassName='!mt-[10px]'
      label='Show Skills'
      name='showTopSkills'
    >
      {({ onChange: _onChange, value }) => (
        <RadioGroup
          data={[...SHOW_TOP_SKILLS].map((v): { label: string; value: ShowTopSkillsString } => ({
            label: ShowTopSkillsLabels[String(v) as ShowTopSkillsString],
            value: String(v) as ShowTopSkillsString,
          }))}
          onChange={v =>
            _onChange(v === 'all' ? v : (parseInt(v) as (typeof SHOW_TOP_SKILLS)[number]))
          }
          value={String(value) as ShowTopSkillsString}
        />
      )}
    </Form.ControlledField>
    {/* Each field owns the resolution of its streamed options, so the whole field — label,
        select and error slot — is the unit that suspends, and the fallback is the same field in
        its awaiting-data variant: an open that beats the promise's resolution shows the menu's
        loading indicator instead of an inert input. */}
    <Suspense fallback={<SkillsChartExperiencesField form={form} />}>
      <SkillsChartExperiencesField dataPromise={experiencesPromise} form={form} />
    </Suspense>
    <Suspense fallback={<SkillsChartEducationsField form={form} />}>
      <SkillsChartEducationsField dataPromise={educationsPromise} form={form} />
    </Suspense>
    <Form.ControlledField
      form={form}
      helpText='The specific development stack(s) that the skill pertains to, if applicable.'
      label='Domains'
      name='programmingDomains'
    >
      {({ onChange, value }) => (
        <ProgrammingDomainSelect
          behavior='multi'
          inputClassName='w-full'
          isClearable
          isInPortal
          onChange={onChange}
          popoverPlacement='bottom'
          value={value}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      form={form}
      helpText='The programming language(s) that the skills pertain to, if applicable.'
      label='Languages'
      name='programmingLanguages'
    >
      {({ onChange, value }) => (
        <ProgrammingLanguageSelect
          behavior='multi'
          inputClassName='w-full'
          isClearable
          isInPortal
          onChange={onChange}
          popoverPlacement='bottom'
          value={value}
        />
      )}
    </Form.ControlledField>
    <Form.ControlledField
      form={form}
      helpText='The category or categories that the skills belong to.'
      label='Categories'
      name='categories'
    >
      {({ onChange, value }) => (
        <SkillCategorySelect
          behavior='multi'
          inputClassName='w-full'
          isClearable
          isInPortal
          onChange={onChange}
          popoverPlacement='bottom'
          value={value}
        />
      )}
    </Form.ControlledField>
  </Form>
);
