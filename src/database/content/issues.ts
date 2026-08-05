export type ContentIssueSeverity = 'error' | 'warning';

/**
 * One problem discovered while parsing, validating, or transferring content. Errors abort a run
 * before anything is written; warnings surface data-cleanup candidates without blocking.
 */
export interface ContentIssue {
  readonly entity: string;
  readonly message: string;
  readonly severity: ContentIssueSeverity;
  readonly slug: null | string;
}

export class ContentIssuesError extends Error {
  public readonly issues: readonly ContentIssue[];

  constructor(issues: readonly ContentIssue[]) {
    const lines = issues.map(
      issue => `[${issue.entity}${issue.slug === null ? '' : `/${issue.slug}`}] ${issue.message}`,
    );
    super(`Content validation failed with ${issues.length} error(s):\n${lines.join('\n')}`);
    this.name = 'ContentIssuesError';
    this.issues = issues;
  }
}

/**
 * Accumulates issues across an entire content set so that a run can fail with every problem
 * reported at once, rather than aborting at the first. Nothing is written to either side while
 * the collector holds an error.
 */
export class IssueCollector {
  private readonly collected: ContentIssue[] = [];

  /**
   * Throws a {@link ContentIssuesError} carrying every collected error. Call before any write, so
   * that an invalid set fails hard without committing anything.
   */
  public assertValid(): void {
    if (this.hasErrors) {
      throw new ContentIssuesError(this.errors);
    }
  }

  public error(entity: string, slug: null | string, message: string): void {
    this.collected.push({ entity, message, severity: 'error', slug });
  }

  public warning(entity: string, slug: null | string, message: string): void {
    this.collected.push({ entity, message, severity: 'warning', slug });
  }

  public get errors(): readonly ContentIssue[] {
    return this.collected.filter(issue => issue.severity === 'error');
  }

  public get hasErrors(): boolean {
    return this.collected.some(issue => issue.severity === 'error');
  }

  public get issues(): readonly ContentIssue[] {
    return [...this.collected];
  }

  public get warnings(): readonly ContentIssue[] {
    return this.collected.filter(issue => issue.severity === 'warning');
  }
}
