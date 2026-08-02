import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

export const ApiClientGlobalErrorCodes = enumeratedLiterals(
  [
    {
      message: 'You must be authenticated to perform this action.',
      status: 401,
      value: 'NOT_AUTHENTICATED',
    },
    {
      message: 'The requested resource could not be found.',
      status: 404,
      value: 'NOT_FOUND',
    },
    { message: 'Bad request.', status: 400, value: 'BAD_REQUEST' },
    {
      message: 'You do not have permission to perform this action.',
      status: 403,
      value: 'FORBIDDEN',
    },
    {
      message: 'There was an internal server error.',
      status: 500,
      value: 'INTERNAL_SERVER',
    },
    {
      message: 'There was an unknown error.',
      status: null,
      value: 'UNKNOWN',
    },
  ] as const,
  {},
);

export type ApiClientGlobalErrorCode = EnumeratedLiteralsMember<typeof ApiClientGlobalErrorCodes>;

/**
 * The user-facing message associated with the 'does_not_exist' error code. Since the message is
 * user facing, it does not give specific information about why the field is invalid - just that
 * it is invalid.
 */
const DoesNotExistUserFacingMessage = (field: string) => `The field ${field} is invalid.`;

export const ApiClientFieldErrorCodes = enumeratedLiterals(
  [
    {
      internalMessage: (field: string) => `The field ${field} must be unique.`,
      message: (field: string) => `The field ${field} must be unique.`,
      value: 'unique',
    },
    {
      internalMessage: (field: string) => `The field ${field} is invalid.`,
      message: (field: string) => `The field ${field} is invalid.`,
      value: 'invalid',
    },
    {
      internalMessage: (field: string) => `The field ${field} is invalid.`,
      message: DoesNotExistUserFacingMessage,
      value: 'does_not_exist',
    },
  ] as const,
  {},
);

export type ApiClientFieldErrorCode = EnumeratedLiteralsMember<typeof ApiClientFieldErrorCodes>;
