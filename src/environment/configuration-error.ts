import { z } from 'zod';

import type * as types from './types';

type FieldErrorObj<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> = {
  readonly field: types.EnvKey<R, V>;
  readonly issue?: z.ZodIssue;
  readonly message?: string;
};

const FieldErrorObjSchema = z.object({
  field: z.string(),
  issue: z.any(),
  message: z.string().optional(),
});

type FieldError<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> =
  FieldErrorObj<R, V> | types.EnvKey<R, V>;

type FieldMessage<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> = (
  v: FieldErrorObj<R, V>,
) => string;

type FieldName<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> = (
  v: FieldErrorObj<R, V>,
) => string;

export type ConfigurationErrorFormattingOptions<
  R extends types.RuntimeEnv<V>,
  V extends types.Validators<R>,
> = {
  readonly fieldMessage?: FieldMessage<R, V>;
  readonly fieldName?: FieldName<R, V>;
  readonly indexFieldMessages?: boolean;
  readonly message?: (v: FieldErrorObj<R, V>[]) => string;
  readonly title?: string;
};

type IssueMessage = {
  conditional: (issue: z.ZodIssue) => boolean;
  message: string;
};

const DEFAULT_FIELD_MESSAGES: IssueMessage[] = [
  {
    conditional: issue => issue.code === 'invalid_type' && issue.message === 'Required',
    message: 'The environment variable is required but was not found in the environment.',
  },
];

const getIssueMessage = (issue: z.ZodIssue) => {
  for (const f of DEFAULT_FIELD_MESSAGES) {
    if (f.conditional(issue)) {
      return f.message;
    }
  }
  return issue.message;
};

export type ConfiguredError<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> =
  (FieldError<R, V> | null)[] | FieldError<R, V> | z.ZodError;

const isFieldErrorObj = <R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
  err: FieldError<R, V> | z.ZodIssue,
): err is FieldErrorObj<R, V> => FieldErrorObjSchema.safeParse(err).success;

const isZodError = <R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
  err: ConfiguredError<R, V>,
): err is z.ZodError => Array.isArray((err as z.ZodError).issues);

export class _ConfigurationError<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> {
  private readonly error: ConfiguredError<R, V>;
  private readonly options?: ConfigurationErrorFormattingOptions<R, V>;

  constructor(error: ConfiguredError<R, V>, options?: ConfigurationErrorFormattingOptions<R, V>) {
    this.error = error;
    this.options = options;
  }

  private formatLineItem(err: FieldError<R, V> | z.ZodIssue, index: number): string {
    const obj = this.toFieldErrorObj(err);
    if (this.indexFieldMessages) {
      return `${index + 1}. ${this.fieldName(obj)}: ${this.fieldMessage(obj)}`;
    }
    return `${this.fieldName(obj)}: ${this.fieldMessage(obj)}`;
  }

  private toFieldErrorObj(err: FieldError<R, V> | z.ZodIssue): FieldErrorObj<R, V> {
    if (typeof err === 'string') {
      return { field: err };
    } else if (isFieldErrorObj(err)) {
      return err;
    }
    const field = err.path[0] as types.EnvKey<R, V>;
    return { field, issue: err };
  }

  private get errors(): FieldErrorObj<R, V>[] {
    if (Array.isArray(this.error)) {
      return this.error
        .filter((v): v is FieldError<R, V> => v !== null)
        .map(err => this.toFieldErrorObj(err));
    } else if (typeof this.error === 'string') {
      return [this.toFieldErrorObj(this.error)];
    } else if (isZodError(this.error)) {
      return this.error.issues.map(err => this.toFieldErrorObj(err));
    }
    return [this.toFieldErrorObj(this.error)];
  }

  private get fieldMessage(): FieldMessage<R, V> {
    return (
      this.options?.fieldMessage ??
      (({ issue, message }) => {
        const msg = message
          ? message
          : issue
            ? getIssueMessage(issue)
            : 'The environment variable is invalid.';

        if (issue) {
          return `${msg} (code = '${issue.code}')`;
        }
        return msg;
      })
    );
  }

  private get fieldName(): FieldName<R, V> {
    return this.options?.fieldName ?? (({ field }) => field);
  }

  private get indexFieldMessages(): boolean {
    return this.options?.indexFieldMessages ?? true;
  }

  public get message(): string {
    if (this.options?.message) {
      return this.options.message(this.errors);
    }
    const message = this.errors.map((err, i) => this.formatLineItem(err, i)).join('\n');
    const divider = '-'.repeat(32);
    return '\n' + [divider, `${this.title}:`, message, divider].join('\n');
  }

  private get title(): string {
    return this.options?.title ?? 'Configuration Error';
  }
}

export class ConfigurationError<
  R extends types.RuntimeEnv<V>,
  V extends types.Validators<R>,
> extends Error {
  constructor(error: ConfiguredError<R, V>, options?: ConfigurationErrorFormattingOptions<R, V>) {
    const err = new _ConfigurationError(error, options);
    super(err.message);
    this.name = 'ConfigurationError';
  }
}
