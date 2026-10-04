import { type AnswerContext } from '~/scripts/job-search/applying/answers';
import { nationalNumber, planFill } from '~/scripts/job-search/applying/fill-plan';
import { type FormReading, type ReadField } from '~/scripts/job-search/applying/form-scripts';
import { typeaheadQuery } from '~/scripts/job-search/applying/places';
import { AnswersSchema, PreferencesSchema } from '~/scripts/job-search/schemas';

import { MinimalPreferences } from './fixtures';

/**
 * Placeholder answers: no real contact details appear in the suite.
 */
const Context: AnswerContext = {
  answers: AnswersSchema.parse({
    availability: { noticePeriodWeeks: 0 },
    compensation: { target: 225000 },
    contact: {
      city: 'Springfield',
      country: 'United States',
      email: 'jane@example.com',
      phone: '+1 555-555-0100',
      region: 'IL',
    },
    links: { linkedin: 'https://www.linkedin.com/in/example' },
    workAuthorization: { authorizedCountries: ['US'] },
  }),
  competencies: [],
  preferences: PreferencesSchema.parse(MinimalPreferences),
  profile: { firstName: 'Jane', lastName: 'Doe' },
};

const field = (overrides: Partial<ReadField> & Pick<ReadField, 'key' | 'label'>): ReadField => ({
  options: [],
  required: false,
  type: 'text',
  value: null,
  widget: 'native',
  ...overrides,
});

const reading = (fields: ReadField[]): FormReading => ({
  buttons: [],
  challenge: false,
  fields,
  progress: null,
  text: '',
  unsupported: [],
  url: 'https://boards.example.com/apply',
});

const Resume = '/tmp/job-search-resume/4012345678/Jane-Doe-Resume.pdf';

describe('planFill()', () => {
  it('plans the native fields the data answers', () => {
    expect(
      planFill(
        reading([
          field({ key: 'f0', label: 'First Name', required: true }),
          field({ key: 'f1', label: 'Email', required: true }),
        ]),
        Context,
        Resume,
      ).fills,
    ).toStrictEqual([
      { key: 'f0', label: 'First Name', type: 'text', value: 'Jane', widget: 'native' },
      { key: 'f1', label: 'Email', type: 'text', value: 'jane@example.com', widget: 'native' },
    ]);
  });

  it('enters a phone number without its code beside a separate country-code field', () => {
    const plan = planFill(
      reading([
        field({
          key: 'f0',
          label: 'Phone country code',
          options: ['Canada (+1)', 'United States (+1)'],
          type: 'select',
        }),
        field({ key: 'f1', label: 'Mobile phone number', required: true }),
      ]),
      Context,
      Resume,
    );
    expect(plan.fills.map(({ value }) => value)).toStrictEqual([
      'United States (+1)',
      '5555550100',
    ]);
  });

  it('keeps the code of a phone number with no country-code field beside it', () => {
    expect(
      planFill(reading([field({ key: 'f0', label: 'Phone' })]), Context, Resume).fills,
    ).toMatchObject([{ value: '+1 555-555-0100' }]);
  });

  it("sets LinkedIn's follow and top-choice checkboxes from the settings", () => {
    const plan = planFill(
      reading([
        field({ key: 'f0', label: 'Mark job as a top choice', type: 'checkbox', value: false }),
        field({ key: 'f1', label: 'Follow Hooli', type: 'checkbox', value: true }),
      ]),
      Context,
      Resume,
    );
    expect(plan.fills.map(({ value }) => value)).toStrictEqual([false, false]);
  });

  it('plans the staged resume into the resume upload, and skips an autofill upload', () => {
    const plan = planFill(
      reading([
        field({
          key: 'f0',
          label: 'Autofill from resume',
          type: 'file',
          value: [],
          widget: 'file',
        }),
        field({ key: 'f1', label: 'Resume/CV', required: true, type: 'file', widget: 'file' }),
      ]),
      Context,
      Resume,
    );
    expect(plan.uploads).toStrictEqual([{ file: Resume, key: 'f1', label: 'Resume/CV' }]);
  });

  it('separates comboboxes and typeaheads from the native fills', () => {
    const plan = planFill(
      reading([
        field({
          key: 'f0',
          label: 'Gender',
          options: ['Male', 'Decline'],
          type: 'select',
          widget: 'combobox',
        }),
        field({ key: 'f1', label: 'Location (City)', widget: 'typeahead' }),
      ]),
      Context,
      Resume,
    );
    expect(plan.fills).toStrictEqual([]);
    expect(plan.interactive).toMatchObject([
      { key: 'f0', value: 'Decline', widget: 'combobox' },
      { key: 'f1', value: 'Springfield, IL', widget: 'typeahead' },
    ]);
  });

  it('reports a combobox whose options are unknown for probing, rather than guessing', () => {
    expect(
      planFill(
        reading([field({ key: 'f0', label: 'Veteran Status', options: null, widget: 'combobox' })]),
        Context,
        Resume,
      ).needsOptions,
    ).toStrictEqual([{ key: 'f0', label: 'Veteran Status' }]);
  });

  it('leaves a required question the data does not answer for Nick, even when prefilled', () => {
    expect(
      planFill(
        reading([
          field({ key: 'f0', label: 'Describe a hard bug', required: true, value: 'Remembered' }),
        ]),
        Context,
        Resume,
      ).unanswered,
    ).toStrictEqual([
      { current: 'Remembered', key: 'f0', label: 'Describe a hard bug', required: true },
    ]);
  });

  it('keeps an optional prefilled value the data does not answer', () => {
    expect(
      planFill(
        reading([field({ key: 'f0', label: 'Favorite color', value: 'Green' })]),
        Context,
        null,
      ).kept,
    ).toStrictEqual([{ current: 'Green', key: 'f0', label: 'Favorite color', required: false }]);
  });
});

describe('nationalNumber()', () => {
  it.each([
    ['+1 555-555-0100', '5555550100'],
    ['(555) 555-0100', '5555550100'],
    ['+44 20 7946 0000', '442079460000'],
  ])('reduces %j to %j', (phone, digits) => {
    expect(nationalNumber(phone)).toBe(digits);
  });
});

describe('typeaheadQuery()', () => {
  it('types the leading name, and spells out a region abbreviation as a hint', () => {
    expect(typeaheadQuery('Washington, DC')).toStrictEqual({
      hints: ['DC', 'District of Columbia'],
      text: 'Washington',
    });
  });

  it('types a value with no comma as it is', () => {
    expect(typeaheadQuery(' Remote ')).toStrictEqual({ hints: [], text: 'Remote' });
  });
});
