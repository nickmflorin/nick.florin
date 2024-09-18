import { Prisma } from "~/database/model";

export enum PrismaErrorCode {
  DOES_NOT_EXIST = "P2025",
  INVALID_ID = "P2023",
  UNIQUE_CONSTRAINT_VIOLATED = "P2002",
}

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

export const getUniqueConstraintFields = (error: unknown): string[] | null => {
  if (isPrismaUniqueConstraintError(error)) {
    return (error as { meta: { target: string[] } }).meta.target;
  }
  return null;
};
