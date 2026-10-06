import {
  type AnswerContext,
  type FormQuestion,
  resolveAnswer,
} from '~/scripts/job-search/applying/answers';
import { AnswersSchema, PreferencesSchema } from '~/scripts/job-search/schemas';

import { MinimalPreferences } from './fixtures';

/**
 * Placeholder answers: no real contact details appear in the suite.
 */
const Answers = AnswersSchema.parse({
  availability: { start: 'immediately' },
  compensation: { target: 225000 },
  contact: {
    city: 'Springfield',
    country: 'United States',
    email: 'jane@example.com',
    phone: '+1 555-0100',
    region: 'IL',
  },
  custom: [
    {
      addedAt: '2026-10-04T12:00:00.000Z',
      answer: 'No',
      question: 'Are you willing to relocate?',
    },
  ],
  links: { github: 'https://github.com/example', linkedin: 'https://www.linkedin.com/in/example' },
  workAuthorization: { authorizedCountries: ['US'] },
});

const Context: AnswerContext = {
  answers: Answers,
  competencies: [
    { label: 'React', months: 117, proficiency: 'EXPERT', slug: 'react', years: 8 },
    { label: 'React Native', months: 12, proficiency: null, slug: 'react-native', years: 1 },
    { label: 'TypeScript', months: 72, proficiency: 'EXPERT', slug: 'typescript', years: 5 },
  ],
  now: new Date('2026-10-05T12:00:00'),
  preferences: PreferencesSchema.parse(MinimalPreferences),
  profile: { firstName: 'Jane', lastName: 'Doe' },
};

const text = (label: string): FormQuestion => ({ label, options: [], type: 'text' });

const choice = (label: string, options: string[]): FormQuestion => ({
  label,
  options,
  type: 'select',
});

describe('resolveAnswer()', () => {
  it.each([
    ['First name', 'Jane', 'profile'],
    ['Last Name', 'Doe', 'profile'],
    ['Email address', 'jane@example.com', 'answers'],
    ['Mobile phone number', '+1 555-0100', 'answers'],
    ['LinkedIn Profile URL', 'https://www.linkedin.com/in/example', 'answers'],
    ['Location (city)', 'Springfield, IL', 'answers'],
    ['Will you now or in the future require sponsorship?', 'No', 'preferences'],
    ['Are you legally authorized to work in the United States?', 'Yes', 'answers'],
    ['When can you start?', 'Immediately', 'answers'],
    ['What are your salary expectations?', '225000', 'answers'],
    ['How many years of experience do you have with TypeScript?', '5', 'digest'],
    ['Years of professional experience using React Native', '1', 'digest'],
    ['Are you willing to relocate?', 'No', 'custom'],
  ])('answers %j with %j from %s', (label, value, source) => {
    expect(resolveAnswer(text(label), Context)).toStrictEqual({ label, source, value });
  });

  it('fills a start-date field with the date the availability works out to', () => {
    expect([
      resolveAnswer(text('Date Available'), Context),
      resolveAnswer({ label: 'Earliest start date', options: [], type: 'date' }, Context),
    ]).toMatchObject([{ value: '10/05/2026' }, { value: '2026-10-05' }]);
  });

  it('answers an address block from the mailing address, and a location from the city', () => {
    const configured: AnswerContext = {
      ...Context,
      answers: {
        ...Answers,
        contact: {
          ...Answers.contact,
          address: { city: 'Aurora', postalCode: '62565', region: 'IL', street: '1 Main St' },
        },
      },
    };
    const inAddressBlock: AnswerContext = { ...configured, inAddressBlock: true };
    expect([
      resolveAnswer(text('Address'), Context),
      resolveAnswer(text('Address'), configured),
      resolveAnswer(text('ZIP'), configured),
      resolveAnswer(text('City'), inAddressBlock),
      resolveAnswer(text('City'), configured),
      resolveAnswer(text('Where are you located?'), inAddressBlock),
    ]).toMatchObject([
      { unanswered: true },
      { value: '1 Main St' },
      { value: '62565' },
      { value: 'Aurora' },
      { value: 'Springfield, IL' },
      { value: 'Springfield, IL' },
    ]);
  });

  it('fits an answer to the shortest option beginning with it', () => {
    expect(
      resolveAnswer(
        choice('Country', ['United States Minor Outlying Islands', 'United States of America']),
        Context,
      ),
    ).toMatchObject({ value: 'United States of America' });
  });

  it('fits a state abbreviation to a dropdown that spells it out', () => {
    expect(resolveAnswer(choice('State', ['Idaho', 'Illinois', 'Indiana']), Context)).toMatchObject(
      {
        value: 'Illinois',
      },
    );
  });

  it('reports a question none of the data answers, rather than guessing', () => {
    expect(resolveAnswer(text('Describe a project you are proud of'), Context)).toStrictEqual({
      label: 'Describe a project you are proud of',
      unanswered: true,
    });
  });

  it('reports a years question about a competency the digest does not hold', () => {
    expect(
      resolveAnswer(text('How many years of experience do you have with Rust?'), Context),
    ).toMatchObject({ unanswered: true });
  });

  it('does not mistake a sentence that says "state" for a state question', () => {
    expect(resolveAnswer(text('Please state your salary expectations'), Context)).toMatchObject({
      value: '225000',
    });
  });

  it('fits a yes-or-no answer to the options a choice field offers', () => {
    expect(
      resolveAnswer(
        choice('Do you require sponsorship?', ['Yes, I will', 'No, I will not']),
        Context,
      ),
    ).toMatchObject({ value: 'No, I will not' });
  });

  it('chooses the declining option of a voluntary self-identification question', () => {
    expect(
      resolveAnswer(choice('Gender', ['Male', 'Female', 'I decline to self-identify']), Context),
    ).toMatchObject({ source: 'answers', value: 'I decline to self-identify' });
  });

  it('answers an authorization question that names where the role is based', () => {
    expect(
      resolveAnswer(
        choice(
          'Are you legally authorized to work in the country where this role is based without ' +
            'restriction?',
          ['Yes', 'No'],
        ),
        Context,
      ),
    ).toMatchObject({ source: 'answers', value: 'Yes' });
  });

  it.each([
    'Are you able to work in the US without sponsorship?',
    'Do you require work authorization to work in the US?',
    'Are you not authorized to work in the US?',
    "Aren't you eligible to work in the US?",
  ])('leaves %j, whose wording inverts the question, for Nick', label => {
    expect(resolveAnswer(choice(label, ['Yes', 'No']), Context)).toMatchObject({
      unanswered: true,
    });
  });

  it('falls through to the next matching category when an answer does not fit the options', () => {
    expect(
      resolveAnswer(
        choice('How did you hear about us: LinkedIn, a referral or elsewhere?', [
          'LinkedIn',
          'Referral',
          'Other',
        ]),
        Context,
      ),
    ).toMatchObject({ value: 'LinkedIn' });
  });

  it('reports a choice field whose options do not admit the answer', () => {
    expect(resolveAnswer(choice('When can you start?', ['Within 30 days']), Context)).toMatchObject(
      { unanswered: true },
    );
  });
});
