import { type z } from "zod";

type StringOrFn<T> = string | ((arg: T) => string);

type EnvironmentErrorMessageFormatOptions = {
  readonly titleFormatter?: StringOrFn<z.ZodError>;
  readonly issueFormatter?: StringOrFn<z.ZodIssue>;
  readonly indexIssues?: boolean;
};

export type ErrorMessageFormatter = StringOrFn<z.ZodError> | EnvironmentErrorMessageFormatOptions;

const defaultTitleFormatter = "Environment Configuration Error";

const defaultIssueFormatter = (issue: z.ZodIssue): string =>
  `Error at path '${issue.path}' with code '${issue.code}': ${issue.message}`;

type FormatIssueParams =
  | {
      readonly issueFormatter?: EnvironmentErrorMessageFormatOptions["issueFormatter"];
      readonly index?: never;
      readonly indexIssues?: false;
    }
  | {
      readonly issueFormatter?: EnvironmentErrorMessageFormatOptions["issueFormatter"];
      readonly index: number;
      readonly indexIssues: true;
    };

const formatIssue = (
  issue: z.ZodIssue,
  { issueFormatter = defaultIssueFormatter, indexIssues, index }: FormatIssueParams,
): string => {
  if (indexIssues) {
    return `${index + 1}. ${formatIssue(issue, { issueFormatter })}`;
  }
  return typeof issueFormatter === "string" ? issueFormatter : issueFormatter(issue);
};

const defaultFormatErrorMessage = (
  error: z.ZodError,
  {
    titleFormatter = defaultTitleFormatter,
    issueFormatter = defaultIssueFormatter,
    indexIssues = true,
  }: EnvironmentErrorMessageFormatOptions,
): string => {
  const message = error.issues
    .map((issue, i) =>
      formatIssue(issue, {
        index: i,
        titleFormatter,
        issueFormatter,
        indexIssues,
      } as FormatIssueParams),
    )
    .join("\n");
  const divider = "-".repeat(32);
  const title = typeof titleFormatter === "string" ? titleFormatter : titleFormatter(error);
  return "\n" + [divider, `${title}:`, message, divider].join("\n");
};

export const formatErrorMessage = (
  error: z.ZodError,
  formatter?: ErrorMessageFormatter,
): string => {
  if (typeof formatter === "string") {
    return formatter;
  } else if (typeof formatter === "function") {
    return formatter(error);
  }
  return defaultFormatErrorMessage(error, formatter ?? {});
};
