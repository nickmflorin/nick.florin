import { pick } from 'lodash-es';

import { type AnswerContext, resolveAnswer } from './answers';
import {
  type FieldValue,
  type FormReading,
  type PlannedFill,
  type ReadField,
} from './form-scripts';

/**
 * A field the plan leaves alone, and why: Nick must answer it, or it is optional and the data does
 * not answer it.
 */
export interface UnplannedField {
  readonly current: FieldValue | null;
  readonly key: string;
  readonly label: string;
  readonly required: boolean;
}

/**
 * How one reading of a form is to be filled.
 */
export interface FillPlan {
  /**
   * Fields that ask for a cover letter when no approved letter is staged: required ones keep the
   * application from being submitted until Nick approves a drafted letter.
   */
  readonly coverLetters: Pick<ReadField, 'key' | 'label' | 'required'>[];
  /**
   * The native fields, which the fill script sets.
   */
  readonly fills: PlannedFill[];
  /**
   * The comboboxes and typeaheads, each opened or typed into through the browser server before its
   * option is chosen by script.
   */
  readonly interactive: PlannedFill[];
  /**
   * Optional fields the data does not answer that already hold a value — LinkedIn remembers earlier
   * applications — which are left as they are and shown to Nick.
   */
  readonly kept: UnplannedField[];
  /**
   * Comboboxes whose options are not yet known: each is opened and probed, and the form read
   * again, before it can be planned.
   */
  readonly needsOptions: Pick<ReadField, 'key' | 'label'>[];
  /**
   * Required fields the data does not answer, which only Nick may answer.
   */
  readonly unanswered: UnplannedField[];
  readonly uploads: { readonly file: string; readonly key: string; readonly label: string }[];
}

type Decision =
  | { readonly file: string; readonly kind: 'upload' }
  | { readonly fill: PlannedFill; readonly kind: 'fill' }
  | { readonly kind: 'cover-letter' }
  | { readonly kind: 'keep' }
  | { readonly kind: 'needs-options' }
  | { readonly kind: 'skip' }
  | { readonly kind: 'unanswered' };

/**
 * A phone-number field's companion that sets the country calling code separately — Easy Apply's
 * "Phone country code", Greenhouse's "Country" — in whose presence the number is entered without
 * its code.
 */
const CountryCodeLabel = /country code|^country$/i;

const PhoneLabel = /phone|mobile/i;

const ResumeLabel = /resume|\bcv\b|curriculum/i;

const CoverLetterLabel = /cover letter/i;

/**
 * A field that asks for part of a full address, whose presence makes the form's city and state
 * fields part of that address rather than Nick's general location.
 */
const AddressLabel =
  /street|address line|^(?:home |mailing |street )?address\b|\bzip\b|postal code/i;

/**
 * An approved cover letter staged for an application: the PDF for an upload field, and the text
 * for a field that takes it typed in.
 */
export interface StagedCoverLetter {
  readonly file: string;
  readonly text: string;
}

/**
 * An option naming a document file — one of the resumes Easy Apply lists for choosing among Nick's
 * earlier uploads.
 */
const DocumentFileOption = /\.(?:pdf|docx?|rtf|txt)\b/i;

/**
 * Whether a choice field picks among uploaded documents rather than asking a question. The resume
 * upload, and the check that the approved resume is shown selected, cover it, so it is not planned.
 */
export const isDocumentPicker = ({ options, type }: ReadField): boolean =>
  type !== 'file' &&
  options !== null &&
  options.length > 0 &&
  options.every(option => DocumentFileOption.test(option));

/**
 * Reduces a phone number to its national digits: the digits, without the leading `1` of a North
 * American number written with its country code.
 */
export const nationalNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
};

const hasValue = (value: FieldValue | null): boolean =>
  value !== null &&
  value !== false &&
  value !== '' &&
  !(Array.isArray(value) && value.length === 0);

const fill = (field: ReadField, value: FieldValue): Decision => ({
  fill: { ...pick(field, ['key', 'label', 'type', 'widget']), value },
  kind: 'fill',
});

const unansweredOrKept = (field: ReadField): Decision => {
  if (field.required) {
    return { kind: 'unanswered' };
  }
  return hasValue(field.value) ? { kind: 'keep' } : { kind: 'skip' };
};

const decideCheckbox = (field: ReadField, context: AnswerContext): Decision => {
  if (/\bfollow\b/i.test(field.label)) {
    return fill(field, context.preferences.applying.followCompany);
  } else if (/top choice/i.test(field.label)) {
    return fill(field, context.preferences.applying.markTopChoice);
  }
  const answer = resolveAnswer(
    { label: field.label, options: ['Yes', 'No'], type: 'checkbox' },
    context,
  );
  return 'unanswered' in answer ? unansweredOrKept(field) : fill(field, answer.value === 'Yes');
};

const decideCoverLetter = (field: ReadField, coverLetter: null | StagedCoverLetter): Decision => {
  if (coverLetter === null) {
    return field.required ? { kind: 'cover-letter' } : { kind: 'skip' };
  }
  return field.type === 'file'
    ? { file: coverLetter.file, kind: 'upload' }
    : fill(field, coverLetter.text);
};

const decide = (
  field: ReadField,
  reading: FormReading,
  context: AnswerContext,
  { coverLetter, resumeFile }: StagedDocuments,
): Decision => {
  if (CoverLetterLabel.test(field.label) && ['file', 'text', 'textarea'].includes(field.type)) {
    return decideCoverLetter(field, coverLetter);
  } else if (field.type === 'file') {
    if (/autofill/i.test(field.label)) {
      return { kind: 'skip' };
    } else if (ResumeLabel.test(field.label)) {
      return resumeFile === null ? { kind: 'unanswered' } : { file: resumeFile, kind: 'upload' };
    }
    return field.required ? { kind: 'unanswered' } : { kind: 'skip' };
  } else if (isDocumentPicker(field)) {
    return { kind: 'skip' };
  } else if (field.type === 'checkbox' && field.options !== null && field.options.length === 0) {
    return decideCheckbox(field, context);
  } else if (field.options === null) {
    return { kind: 'needs-options' };
  }
  const answer = resolveAnswer(
    { label: field.label, options: field.options, type: field.type },
    context,
  );
  if ('unanswered' in answer) {
    return unansweredOrKept(field);
  } else if (field.type === 'checkbox') {
    return fill(field, [answer.value]);
  }
  const separateCode =
    PhoneLabel.test(field.label) &&
    reading.fields.some(other => other.key !== field.key && CountryCodeLabel.test(other.label));
  return fill(field, separateCode ? nationalNumber(answer.value) : answer.value);
};

/**
 * The documents staged for an application: the approved resume, and the approved cover letter when
 * there is one.
 */
export interface StagedDocuments {
  readonly coverLetter: null | StagedCoverLetter;
  readonly resumeFile: null | string;
}

const unplanned = ({ key, label, required, value }: ReadField): UnplannedField => ({
  current: value,
  key,
  label,
  required,
});

/**
 * Plans how to fill one reading of an application form from Nick's data.
 *
 * Every field the data answers is planned, with its value fitted to the field's options; a phone
 * number beside a separate country-code field loses its code. The approved resume is planned into
 * the resume upload, and a picker among earlier uploads is left alone, since the approved resume is
 * uploaded and then checked as selected. A cover-letter field takes the approved letter, and
 * without one is left alone when optional and reported when required. LinkedIn's follow and
 * top-choice checkboxes take Nick's settings rather than the form's defaults. A required field the
 * data does not answer is left for Nick, even when the form remembers a value for it; an optional
 * one is left as it is. A combobox whose options are not yet known is reported for probing rather
 * than guessed at.
 *
 * @param {FormReading} reading The form reader's reading of the form or step in view.
 * @param {AnswerContext} context The answers, preferences, profile and competencies.
 * @param {StagedDocuments} staged The approved resume and cover letter staged for upload.
 *
 * @returns {FillPlan} The plan for this reading.
 */
export const planFill = (
  reading: FormReading,
  context: AnswerContext,
  staged: StagedDocuments,
): FillPlan => {
  const inAddressBlock = reading.fields.some(({ label }) => AddressLabel.test(label));
  const decided = reading.fields.map(field => ({
    decision: decide(field, reading, { ...context, inAddressBlock }, staged),
    field,
  }));
  const planned = decided.flatMap(({ decision }) =>
    decision.kind === 'fill' ? [decision.fill] : [],
  );
  const fieldsWhere = (kind: Decision['kind']): ReadField[] =>
    decided.filter(({ decision }) => decision.kind === kind).map(({ field }) => field);
  return {
    coverLetters: fieldsWhere('cover-letter').map(({ key, label, required }) => ({
      key,
      label,
      required,
    })),
    fills: planned.filter(({ widget }) => widget === 'native'),
    interactive: planned.filter(({ widget }) => widget === 'combobox' || widget === 'typeahead'),
    kept: fieldsWhere('keep').map(unplanned),
    needsOptions: fieldsWhere('needs-options').map(({ key, label }) => ({ key, label })),
    unanswered: fieldsWhere('unanswered').map(unplanned),
    uploads: decided.flatMap(({ decision, field: { key, label } }) =>
      decision.kind === 'upload' ? [{ file: decision.file, key, label }] : [],
    ),
  };
};
