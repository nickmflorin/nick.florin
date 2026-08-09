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
import {
  EducationSelect,
  type EducationSelectModel,
} from '~/features/educations/components/input/EducationSelect';
import { StreamedEducationSelect } from '~/features/educations/components/input/StreamedEducationSelect';
import {
  ExperienceSelect,
  type ExperienceSelectModel,
} from '~/features/experiences/components/input/ExperienceSelect';
import { StreamedExperienceSelect } from '~/features/experiences/components/input/StreamedExperienceSelect';
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
    <Form.ControlledField
      form={form}
      helpText='The professional experience(s) where the skills were acquired or used.'
      label='Experiences'
      name='experiences'
    >
      {({ onChange, value }) => (
        /* The fallback is the select in its awaiting-data state, so an open that beats the
           promise's resolution shows the menu's loading indicator instead of an inert input. */
        <Suspense
          fallback={
            <ExperienceSelect
              behavior='multi'
              data={[]}
              hasAbbreviatedLabels={false}
              inputClassName='w-full'
              isClearable
              isInPortal
              isInputLoading
              isReady={false}
              onChange={onChange}
              popoverPlacement='bottom'
              value={value}
            />
          }
        >
          <StreamedExperienceSelect
            behavior='multi'
            dataPromise={experiencesPromise}
            hasAbbreviatedLabels={false}
            inputClassName='w-full'
            isClearable
            isInPortal
            onChange={onChange}
            onError={() => form.setErrors('experiences', 'There was an error loading the data.')}
            popoverPlacement='bottom'
            value={value}
          />
        </Suspense>
      )}
    </Form.ControlledField>
    <Form.ControlledField
      form={form}
      helpText='The academic experience(s) where the skills were acquired or used.'
      label='Educations'
      name='educations'
    >
      {({ onChange, value }) => (
        <Suspense
          fallback={
            <EducationSelect
              behavior='multi'
              data={[]}
              hasAbbreviatedLabels={false}
              inputClassName='w-full'
              isClearable
              isInPortal
              isInputLoading
              isReady={false}
              onChange={onChange}
              popoverPlacement='bottom'
              value={value}
            />
          }
        >
          <StreamedEducationSelect
            behavior='multi'
            dataPromise={educationsPromise}
            hasAbbreviatedLabels={false}
            inputClassName='w-full'
            isClearable
            isInPortal
            onChange={onChange}
            onError={() => form.setErrors('educations', 'There was an error loading the data.')}
            popoverPlacement='bottom'
            value={value}
          />
        </Suspense>
      )}
    </Form.ControlledField>
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
