import * as clack from '@clack/prompts';

import { styled } from './styles';

/**
 * Raised when a command needs an answer the terminal cannot supply — either because the run is not
 * interactive, or because the operator cancelled the prompt.
 *
 * A command catches this only to convert it into an exit code; the message it carries names the
 * flag that would have supplied the answer non-interactively, because a run that aborts in CI is
 * one somebody has to fix from the command line rather than from the keyboard.
 */
export class OutputAbortedError extends Error {}

/**
 * A choice offered by {@link Output.select} or {@link Output.multiselect}.
 *
 * The value is constrained to a string because Clack types its own option list as a conditional
 * over the value type — the label is optional for a primitive and required otherwise — and that
 * conditional cannot be resolved against an unconstrained type parameter. Every choice the CLI
 * offers is a slug, a direction, or a step name, so the constraint costs nothing and keeps the
 * option list assignable without an assertion.
 */
export interface SelectOption<T extends string> {
  readonly hint?: string;
  readonly label: string;
  readonly value: T;
}

/**
 * The CLI's terminal surface: everything a command says, asks, or renders goes through here.
 *
 * Two properties hold across every method. Nothing below the `scripts` directory knows this class
 * exists — the domain layers return data and this decides how it reads. And every prompt is
 * answerable non-interactively, so a command that can run unattended never becomes one that
 * cannot merely because it grew a question.
 */
export class Output {
  private readonly interactive: boolean;

  constructor() {
    this.interactive = clack.isTTY(process.stdout) && !clack.isCI();
  }

  /**
   * Asks a yes/no question, throwing rather than blocking when the run is not interactive.
   *
   * @param {string} question The question to put to the operator.
   * @param {string} assumption
   *   The flag that supplies the answer without a prompt, named in the error raised when the
   *   question cannot be asked at all.
   *
   * @returns {Promise<boolean>} Whether the operator answered yes.
   */
  public async confirm(question: string, assumption: string): Promise<boolean> {
    if (!this.interactive) {
      throw new OutputAbortedError(
        `The terminal is not interactive, so '${question}' cannot be asked. Pass ` +
          `${assumption} to answer it up front.`,
      );
    }
    const answer = await clack.confirm({ initialValue: false, message: question });
    if (clack.isCancel(answer)) {
      throw new OutputAbortedError('Cancelled; nothing was written.');
    }
    return answer;
  }

  public error(message: string): void {
    clack.log.error(styled('removed', message));
  }

  public info(message: string): void {
    clack.log.info(message);
  }

  public intro(message: string): void {
    clack.intro(styled('heading', message));
  }

  public async multiselect<T extends string>(
    question: string,
    options: readonly SelectOption<T>[],
    opts?: { readonly required?: boolean },
  ): Promise<T[]> {
    if (!this.interactive) {
      throw new OutputAbortedError(
        `The terminal is not interactive, so '${question}' cannot be asked. Supply the ` +
          'choices as a command-line argument instead.',
      );
    }
    const answer = await clack.multiselect<string>({
      message: question,
      options: options.map(option => ({ ...option })),
      required: opts?.required ?? false,
    });
    if (clack.isCancel(answer)) {
      throw new OutputAbortedError('Cancelled; nothing was written.');
    }
    return options.filter(option => answer.includes(option.value)).map(option => option.value);
  }

  public note(message: string, title?: string): void {
    clack.note(message, title);
  }

  public outro(message: string): void {
    clack.outro(message);
  }

  public async select<T extends string>(
    question: string,
    options: readonly SelectOption<T>[],
  ): Promise<T> {
    if (!this.interactive) {
      throw new OutputAbortedError(
        `The terminal is not interactive, so '${question}' cannot be asked. Supply the choice as ` +
          'a command-line argument instead.',
      );
    }
    /* Clack is instantiated at `string` rather than at `T` because its option type is a
       conditional over the value type, which TypeScript will not resolve against a type parameter.
       The widening that costs is undone below by matching the answer against the supplied options,
       which is a real lookup rather than an assertion. */
    const answer = await clack.select<string>({
      message: question,
      options: options.map(option => ({ ...option })),
    });
    if (clack.isCancel(answer)) {
      throw new OutputAbortedError('Cancelled; nothing was written.');
    }
    const selected = options.find(option => option.value === answer);
    if (selected === undefined) {
      throw new OutputAbortedError(`'${answer}' is not one of the offered options.`);
    }
    return selected.value;
  }

  /**
   * Runs work behind a spinner, degrading to a single line when the run is not interactive.
   *
   * A spinner redraws its line on a timer, which in a non-TTY becomes hundreds of duplicated lines
   * in a log file rather than one animated line in a terminal.
   */
  public async spin<T>(message: string, work: () => Promise<T>): Promise<T> {
    if (!this.interactive) {
      this.info(message);
      return work();
    }
    const spinner = clack.spinner();
    spinner.start(message);
    try {
      const result = await work();
      spinner.stop(message);
      return result;
    } catch (error) {
      /* `error` rather than `stop`: it marks the line with the failure glyph, where `stop` would
         retire the spinner as though the work had succeeded. */
      spinner.error(styled('removed', `${message} — failed`));
      throw error;
    }
  }

  public success(message: string): void {
    clack.log.success(styled('added', message));
  }

  public warn(message: string): void {
    clack.log.warn(styled('warning', message));
  }

  /**
   * Writes pre-rendered, already-styled multi-line content — a diff, a report — verbatim.
   *
   * Clack's own log helpers prefix every line with their gutter, which corrupts content that is
   * already laid out in columns, so this deliberately bypasses them.
   */
  public write(content: string): void {
    process.stdout.write(`${content}\n`);
  }
}
