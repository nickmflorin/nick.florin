import { Prisma } from '~/database/model';

/**
 * The Prisma error codes that the application distinguishes between when handling a
 * {@link Prisma.PrismaClientKnownRequestError}.
 *
 * The codes are defined as string literals rather than as members of an enum because the `code`
 * field on {@link Prisma.PrismaClientKnownRequestError} is typed as a `string`, and comparing a
 * `string` against an enum member is never type-safe.
 */
export const PrismaErrorCode = {
  DOES_NOT_EXIST: 'P2025',
  INVALID_ID: 'P2023',
  UNIQUE_CONSTRAINT_VIOLATED: 'P2002',
} as const;

export type PrismaErrorCode = (typeof PrismaErrorCode)[keyof typeof PrismaErrorCode];

export const isPrismaDoesNotExistError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === PrismaErrorCode.DOES_NOT_EXIST;

export const isPrismaInvalidIdError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === PrismaErrorCode.INVALID_ID;

export const isPrismaUniqueConstraintError = (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATED
  ) {
    return true;
  }
  return false;
};

export const getUniqueConstraintFields = (error: unknown): null | string[] => {
  if (isPrismaUniqueConstraintError(error)) {
    return (error as { meta: { target: string[] } }).meta.target;
  }
  return null;
};
