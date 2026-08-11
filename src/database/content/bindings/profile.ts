import { pick } from 'lodash-es';

import { ContactIcon } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import { PrismaCodec, type PrismaWriteContext } from '../codecs/prisma-codec';
import { type CanonicalRecord, RecordCodec, recordListField } from '../codecs/record-codec';
import { type FieldCodecRecord } from '../fields/field-codec';
import {
  channelsField,
  enumField,
  nullableProseField,
  nullableStringField,
  proseField,
  slugField,
  stringField,
  visibilityField,
} from '../fields/primitives';
import { type IssueCollector } from '../issues';

import { ContentBinding, type ParsedRecord } from './content-binding';

const AboutParagraphFields = {
  channels: channelsField(),
  content: proseField(),
  isVisible: visibilityField(),
  shortContent: nullableProseField(),
  slug: stringField(),
} satisfies FieldCodecRecord;

const AboutParagraphCodec = new RecordCodec(AboutParagraphFields);

const HighlightFields = {
  channels: channelsField(),
  isVisible: visibilityField(),
  shortText: nullableProseField(),
  slug: stringField(),
  text: proseField(),
} satisfies FieldCodecRecord;

const HighlightCodec = new RecordCodec(HighlightFields);

const ContactFields = {
  channels: channelsField(),
  icon: enumField(ContactIcon),
  isVisible: visibilityField(),
  shortText: nullableStringField(),
  slug: stringField(),
  text: stringField(),
} satisfies FieldCodecRecord;

const ContactCodec = new RecordCodec(ContactFields);

export const ProfileFields = {
  about: recordListField(AboutParagraphCodec),
  contacts: recordListField(ContactCodec),
  displayName: stringField(),
  emailAddress: stringField(),
  firstName: stringField(),
  githubUrl: nullableStringField(),
  handle: nullableStringField(),
  highlights: recordListField(HighlightCodec),
  intro: nullableStringField(),
  lastName: stringField(),
  linkedinUrl: nullableStringField(),
  middleName: nullableStringField(),
  phoneNumber: nullableStringField(),
  photoFileName: nullableStringField(),
  profileImageUrl: nullableStringField(),
  slug: slugField(),
  tagline: nullableStringField(),
} satisfies FieldCodecRecord;

export type CanonicalProfile = ParsedRecord<typeof ProfileFields>;

/**
 * `Profile` is a reused legacy model carrying new prose-row relations. The push direction links
 * against the existing row (the most recently created profile, matching how the site resolves
 * one) and writes only the additive columns; the prose rows are created when none exist yet and
 * left untouched — with a warning — when some already do, since replacing rows is a destructive
 * operation that belongs to the diff-and-confirm flow of the sync engine.
 */
class ProfilePrismaCodec extends PrismaCodec<CanonicalProfile> {
  public async create(
    tx: Transaction,
    record: CanonicalProfile,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void> {
    const existing = await tx.profile.findFirst({
      include: { about: true, contacts: true, highlights: true },
      orderBy: { createdAt: 'desc' },
    });
    if (existing === null) {
      issues.error(
        'profile',
        record.slug,
        'No profile row exists to link against, and creating one from the fixture is not ' +
          'supported: the legacy `intro` column is required and the fixture cannot supply it.',
      );
      return;
    }
    await tx.profile.update({
      data: {
        ...pick(record, ['handle', 'photoFileName', 'slug']),
        updatedById: context.userId,
      },
      where: { id: existing.id },
    });
    const collections = [
      { existing: existing.about.length, kind: 'about paragraphs' },
      { existing: existing.highlights.length, kind: 'highlights' },
      { existing: existing.contacts.length, kind: 'contact entries' },
    ];
    const populated = collections.filter(collection => collection.existing > 0);
    if (populated.length > 0) {
      issues.warning(
        'profile',
        record.slug,
        `Existing ${populated.map(collection => collection.kind).join(', ')} were left ` +
          'untouched: replacing rows is destructive and belongs to the sync diff flow.',
      );
    }
    if (existing.about.length === 0) {
      for (const [order, paragraph] of record.about.entries()) {
        /* eslint-disable-next-line no-await-in-loop -- Rows are created inside one interactive
           transaction, which does not support concurrent operations. */
        await tx.profileAboutParagraph.create({
          data: {
            ...omitBookkeeping(paragraph),
            createdById: context.userId,
            order,
            profileId: existing.id,
            updatedById: context.userId,
          },
        });
      }
    }
    if (existing.highlights.length === 0) {
      for (const [order, highlight] of record.highlights.entries()) {
        /* eslint-disable-next-line no-await-in-loop -- See above. */
        await tx.profileHighlight.create({
          data: {
            ...omitBookkeeping(highlight),
            createdById: context.userId,
            order,
            profileId: existing.id,
            updatedById: context.userId,
          },
        });
      }
    }
    if (existing.contacts.length === 0) {
      for (const [order, contact] of record.contacts.entries()) {
        /* eslint-disable-next-line no-await-in-loop -- See above. */
        await tx.profileContactEntry.create({
          data: {
            ...omitBookkeeping(contact),
            createdById: context.userId,
            order,
            profileId: existing.id,
            updatedById: context.userId,
          },
        });
      }
    }
  }

  public async read(tx: Transaction, issues: IssueCollector): Promise<CanonicalProfile[]> {
    const row = await tx.profile.findFirst({
      include: {
        about: { orderBy: { order: 'asc' } },
        contacts: { orderBy: { order: 'asc' } },
        highlights: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (row === null) {
      return [];
    }
    if (row.slug === null) {
      issues.warning(
        'profile',
        row.displayName,
        'The profile has no slug yet; one was derived from its display name for the fixture. ' +
          'The next push will persist it.',
      );
    }
    const { about, contacts, createdAt, highlights, id, updatedAt, ...profile } = row;
    return [
      {
        ...omitBookkeeping(profile),
        about: about.map(
          ({ createdAt: rowCreatedAt, id: rowId, updatedAt: rowUpdatedAt, ...paragraph }) => ({
            ...omitBookkeeping(paragraph),
            meta: { createdAt: rowCreatedAt, id: rowId, updatedAt: rowUpdatedAt },
          }),
        ),
        contacts: contacts.map(
          ({ createdAt: rowCreatedAt, id: rowId, updatedAt: rowUpdatedAt, ...contact }) => ({
            ...omitBookkeeping(contact),
            meta: { createdAt: rowCreatedAt, id: rowId, updatedAt: rowUpdatedAt },
          }),
        ),
        highlights: highlights.map(
          ({ createdAt: rowCreatedAt, id: rowId, updatedAt: rowUpdatedAt, ...highlight }) => ({
            ...omitBookkeeping(highlight),
            meta: { createdAt: rowCreatedAt, id: rowId, updatedAt: rowUpdatedAt },
          }),
        ),
        meta: { createdAt, id, updatedAt },
        slug: profile.slug ?? slugify(profile.displayName),
      },
    ];
  }
}

export class ProfileBinding extends ContentBinding<typeof ProfileFields> {
  public readonly dependsOn: readonly string[] = [];
  public readonly fixtureFile = 'profile.yaml';
  public readonly fixtureKey = 'profile';
  public readonly fixtureShape = 'single';
  public readonly key = 'profile';
  public readonly prisma = new ProfilePrismaCodec();
  public readonly record = new RecordCodec(ProfileFields);

  protected override deriveSlug(record: CanonicalRecord<typeof ProfileFields>): string {
    return slugify(record.displayName);
  }
}
