import { pick } from 'lodash-es';

import { ContactIcon } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { omitBookkeeping } from '../bookkeeping';
import { type ChildCollectionAdapter, reconcileChildren } from '../codecs/child-collection';
import {
  PrismaCodec,
  type PrismaWriteContext,
  type RecordWritePlan,
  targetId,
} from '../codecs/prisma-codec';
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

type CanonicalAboutParagraph = CanonicalRecord<typeof AboutParagraphFields>;
type CanonicalHighlight = CanonicalRecord<typeof HighlightFields>;
type CanonicalContact = CanonicalRecord<typeof ContactFields>;

const aboutAdapter = (profileId: string): ChildCollectionAdapter<CanonicalAboutParagraph> => ({
  create: async (tx, paragraph, order, context) => {
    await tx.profileAboutParagraph.create({
      data: {
        ...omitBookkeeping(paragraph),
        createdById: context.userId,
        order,
        profileId,
        updatedById: context.userId,
      },
    });
  },
  existing: async tx => {
    const rows = await tx.profileAboutParagraph.findMany({
      select: { id: true, slug: true },
      where: { profileId },
    });
    return new Map(rows.map(row => [row.slug, row.id]));
  },
  remove: async (tx, id) => {
    await tx.profileAboutParagraph.delete({ where: { id } });
  },
  slugOf: paragraph => paragraph.slug,
  update: async (tx, id, paragraph, order, context) => {
    await tx.profileAboutParagraph.update({
      data: { ...omitBookkeeping(paragraph), order, updatedById: context.userId },
      where: { id },
    });
  },
});

const highlightAdapter = (profileId: string): ChildCollectionAdapter<CanonicalHighlight> => ({
  create: async (tx, highlight, order, context) => {
    await tx.profileHighlight.create({
      data: {
        ...omitBookkeeping(highlight),
        createdById: context.userId,
        order,
        profileId,
        updatedById: context.userId,
      },
    });
  },
  existing: async tx => {
    const rows = await tx.profileHighlight.findMany({
      select: { id: true, slug: true },
      where: { profileId },
    });
    return new Map(rows.map(row => [row.slug, row.id]));
  },
  remove: async (tx, id) => {
    await tx.profileHighlight.delete({ where: { id } });
  },
  slugOf: highlight => highlight.slug,
  update: async (tx, id, highlight, order, context) => {
    await tx.profileHighlight.update({
      data: { ...omitBookkeeping(highlight), order, updatedById: context.userId },
      where: { id },
    });
  },
});

const contactAdapter = (profileId: string): ChildCollectionAdapter<CanonicalContact> => ({
  create: async (tx, contact, order, context) => {
    await tx.profileContactEntry.create({
      data: {
        ...omitBookkeeping(contact),
        createdById: context.userId,
        order,
        profileId,
        updatedById: context.userId,
      },
    });
  },
  existing: async tx => {
    const rows = await tx.profileContactEntry.findMany({
      select: { id: true, slug: true },
      where: { profileId },
    });
    return new Map(rows.map(row => [row.slug, row.id]));
  },
  remove: async (tx, id) => {
    await tx.profileContactEntry.delete({ where: { id } });
  },
  slugOf: contact => contact.slug,
  update: async (tx, id, contact, order, context) => {
    await tx.profileContactEntry.update({
      data: { ...omitBookkeeping(contact), order, updatedById: context.userId },
      where: { id },
    });
  },
});

/**
 * Why the profile row cannot be created from the fixture: the legacy `intro` column is required and
 * the fixture has no field that could supply it.
 */
const UncreatableProfileMessage =
  'No profile row exists to link against, and creating one from the fixture is not supported: ' +
  'the legacy `intro` column is required and the fixture cannot supply it.';

/**
 * `Profile` is a reused legacy model carrying new prose-row relations. The push links against the
 * existing row — the most recently created profile, matching how the site resolves one — and writes
 * only the additive columns, while the three prose collections are reconciled by slug so that a
 * paragraph surviving an edit keeps its row.
 */
class ProfilePrismaCodec extends PrismaCodec<CanonicalProfile> {
  public override readonly writableFields = [
    'about',
    'contacts',
    'handle',
    'highlights',
    'photoFileName',
    'slug',
  ];

  /**
   * The absent profile row is refused while the change set is still being planned, so that the run
   * fails before writing anything rather than partway through.
   */
  public override planIssues(
    plan: RecordWritePlan<CanonicalProfile>,
    issues: IssueCollector,
  ): void {
    if (plan.action === 'create') {
      issues.error('profile', plan.record.slug, UncreatableProfileMessage);
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

  public async write(
    tx: Transaction,
    plan: RecordWritePlan<CanonicalProfile>,
    context: PrismaWriteContext,
    issues: IssueCollector,
  ): Promise<void> {
    const { existing, record } = plan;
    if (existing === null) {
      issues.error('profile', record.slug, UncreatableProfileMessage);
      return;
    }
    const id = targetId('profile', existing);
    await tx.profile.update({
      data: {
        ...pick(record, ['handle', 'photoFileName', 'slug']),
        updatedById: context.userId,
      },
      where: { id },
    });
    await reconcileChildren(tx, record.about, aboutAdapter(id), context);
    await reconcileChildren(tx, record.highlights, highlightAdapter(id), context);
    await reconcileChildren(tx, record.contacts, contactAdapter(id), context);
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
