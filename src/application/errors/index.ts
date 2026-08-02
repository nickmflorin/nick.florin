export * from './unreachable-case-error';

export const isError = (e: unknown): e is Error =>
  typeof e === 'object' &&
  e !== null &&
  'stack' in e &&
  e.stack !== undefined &&
  'message' in e &&
  e.message !== undefined;
