import { type User as ClerkUser, type EmailAddress } from '@clerk/backend';

import { type Transaction } from '~/database/prisma';
import { humanizeList } from '~/lib/formatters';

import { type User } from './prisma-client';

type RequiredClerkField = 'emailAddress' | 'firstName' | 'lastName';
type ClerkField = 'imageUrl' | RequiredClerkField;

const REQUIRED_CLERK_FIELDS: Exclude<RequiredClerkField, 'emailAddress'>[] = [
  'firstName',
  'lastName',
];

type ClerkOriginalFieldType<F extends ClerkField> = ({
  emailAddress: EmailAddress | null;
} & Pick<ClerkUser, Exclude<ClerkField, 'emailAddress'>>)[F];

type ClerkValidatedFieldType<F extends ClerkField> = F extends RequiredClerkField
  ? Exclude<ClerkOriginalFieldType<F>, null>
  : ClerkOriginalFieldType<F>;

type ClerkValidatedFields = { [key in RequiredClerkField]: ClerkValidatedFieldType<key> };

type ClerkTransformedFields = {
  [key in Exclude<ClerkField, 'emailAddress' | 'imageUrl'>]: ClerkValidatedFieldType<key>;
} & {
  emailAddress: string;
  profileImageUrl: null | string;
};

type ClerkFieldCheck<F extends RequiredClerkField = RequiredClerkField> =
  F extends RequiredClerkField ? { field: F; value: ClerkOriginalFieldType<F> } : never;

/**
 * The only reason our {@link User} model has a nullable email field is due to the fact that the
 * {@link ClerkUser}'s primary email address ID is nullable.
 */
export const getClerkEmailAddress = (u: ClerkUser): EmailAddress | null => {
  if (u.primaryEmailAddressId) {
    const email = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId);
    if (!email) {
      throw new Error(
        `No email address for Clerk user '${u.id}' matches the primary email address ID, ` +
          `'${u.primaryEmailAddressId}'.`,
      );
    }
    return email;
  }
  return null;
};

/**
 * Enforces that the `emailAddress`, `firstName` and `lastName` fields are present on our
 * {@link User} model.
 *
 * The first name, last name and email address are simultaneously enforced as required fields via
 * Clerk for signup.  That being said, even though those fields are configured to be required, they
 * are not typed that way, as corrupted Clerk settings can lead to them being undefined.
 */
export const getClerkUserValidatedFields = (u: ClerkUser): ClerkValidatedFields => {
  const clerkFields: ClerkFieldCheck[] = [
    { field: 'emailAddress', value: getClerkEmailAddress(u) },
    ...REQUIRED_CLERK_FIELDS.map((f: Exclude<RequiredClerkField, 'emailAddress'>) => ({
      field: f,
      value: u[f],
    })),
  ];
  const missingFields = clerkFields.filter(check => check.value === null).map(check => check.field);
  if (missingFields.length !== 0) {
    const missingFieldsString = humanizeList(missingFields, { conjunction: 'and' });
    throw new Error(
      `Detected a user in Clerk with missing field(s), '${missingFieldsString}', ` +
        'the user cannot be created in the database.',
    );
  }
  return clerkFields.reduce(
    (acc, check) => ({ ...acc, [check.field]: check.value }),
    {} as ClerkValidatedFields,
  );
};

export const getTransformedClerkData = (u: ClerkUser): ClerkTransformedFields => {
  const clerkFields = getClerkUserValidatedFields(u);
  return {
    ...clerkFields,
    emailAddress: clerkFields.emailAddress.emailAddress,
    profileImageUrl: u.imageUrl,
  };
};

export const upsertUserFromClerk = async (tx: Transaction, u: ClerkUser): Promise<User> =>
  await tx.user.upsert({
    create: {
      ...getTransformedClerkData(u),
      clerkId: u.id,
    },
    update: getTransformedClerkData(u),
    where: { clerkId: u.id },
  });
