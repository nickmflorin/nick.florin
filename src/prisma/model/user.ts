import { type EmailAddress, type User as ClerkUser } from "@clerk/clerk-sdk-node";

import { humanizeList } from "~/lib/formatters";
import { type Transaction } from "~/prisma/client";

import { type User } from "./generated";

type RequiredClerkField = "emailAddress" | "firstName" | "lastName";
type ClerkField = RequiredClerkField | "imageUrl";

const REQUIRED_CLERK_FIELDS: Exclude<RequiredClerkField, "emailAddress">[] = [
  "firstName",
  "lastName",
];

type ClerkOriginalFieldType<F extends ClerkField> = (Pick<
  ClerkUser,
  Exclude<ClerkField, "emailAddress">
> & {
  emailAddress: EmailAddress | null;
})[F];

type ClerkValidatedFieldType<F extends ClerkField> = F extends RequiredClerkField
  ? Exclude<ClerkOriginalFieldType<F>, null>
  : ClerkOriginalFieldType<F>;

type ClerkValidatedFields = { [key in RequiredClerkField]: ClerkValidatedFieldType<key> };

type ClerkTransformedFields = {
  [key in Exclude<ClerkField, "emailAddress" | "imageUrl">]: ClerkValidatedFieldType<key>;
} & {
  emailAddress: string;
  profileImageUrl: string | null;
};

type ClerkFieldCheck<F extends RequiredClerkField = RequiredClerkField> =
  F extends RequiredClerkField ? { field: F; value: ClerkOriginalFieldType<F> } : never;

export const getClerkEmailAddress = (u: ClerkUser): EmailAddress | null => {
  /* The only reason our User model has a nullable email field is due to the fact that the
     ClerkUser's primary email address ID is nullable.  Eventually, we will need to find a way to
     enforce that the User model always has a valid email address. */
  if (u.primaryEmailAddressId) {
    const email = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId);
    if (!email) {
      throw new Error(
        `No email address for Clerk user '${u.id}' matches the primary email address ID, '${u.primaryEmailAddressId}'.`,
      );
    }
    return email;
  }
  return null;
};

export const getClerkUserValidatedFields = (u: ClerkUser): ClerkValidatedFields => {
  /* We may have to revisit whether or not this makes sense - but for now we are enforcing that the
     emailAddress, firstName and lastName are on our User model, and have simultaneously also
     enforced that the first name, last name and email address are required fields via Clerk for
     signup.  That being said, even though those fields are configured to be required, it is not
     typed that way - as corrupted Clerk settings can lead to them being undefined. */
  const clerkFields: ClerkFieldCheck[] = [
    { field: "emailAddress", value: getClerkEmailAddress(u) },
    ...REQUIRED_CLERK_FIELDS.map((f: Exclude<RequiredClerkField, "emailAddress">) => ({
      field: f,
      value: u[f],
    })),
  ];
  const missingFields = clerkFields.filter(check => check.value === null).map(check => check.field);
  if (missingFields.length !== 0) {
    const missingFieldsString = humanizeList(missingFields, { conjunction: "and" });
    /* TODO: We might have to log here instead, and simply assume empty strings for the values.
       Throwing an error here may introduce problems if the fields were ever optional and then
       subsequently changed to being required in Clerk. */
    throw new Error(
      `Detected a user in Clerk with missing field(s), '${missingFieldsString}', ` +
        "the user cannot be created in the database.",
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
    profileImageUrl: u.imageUrl,
    emailAddress: clerkFields.emailAddress.emailAddress,
  };
};

export const upsertUserFromClerk = async (tx: Transaction, u: ClerkUser): Promise<User> =>
  await tx.user.upsert({
    where: { clerkId: u.id },
    update: getTransformedClerkData(u),
    create: {
      ...getTransformedClerkData(u),
      clerkId: u.id,
    },
  });
