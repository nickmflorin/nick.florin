import * as terminal from "~/application/support/terminal";

type KeyValueLineItem = {
  label: string;
  value: string;
};

type LineItem = KeyValueLineItem | string;

type MessageOptions = {
  readonly lineItems?: LineItem[];
  readonly count?: [number, number];
  readonly indexLineItems?: boolean;
};

const formatLineItem = (
  item: LineItem,
  index: number,
  options: Pick<MessageOptions, "indexLineItems">,
): string => {
  const msg = typeof item === "string" ? item : `${item.label}: ${item.value}`;
  return options.indexLineItems ? `-> ${index + 1}. ${msg}` : `-> ${msg}`;
};

export class SeedStdout {
  constructor() {}

  private formatLineItems(
    items: LineItem[],
    options: Pick<MessageOptions, "indexLineItems">,
  ): string {
    return items.map((item, i) => formatLineItem(item, i, options)).join("\n");
  }

  private formatMessage(message: string, opts?: LineItem[] | MessageOptions): string {
    let lineItems: LineItem[] = [];
    let count: [number, number] | null = null;
    let indexLineItems = false;
    if (opts) {
      if (Array.isArray(opts)) {
        lineItems = opts;
      } else {
        lineItems = opts.lineItems ?? [];
        count = opts.count ?? null;
        indexLineItems = opts.indexLineItems ?? false;
      }
    }
    let msg = message;
    if (count) {
      msg = `${msg} (${count[0] + 1}/${count[1]})`;
    }
    return lineItems ? `${msg}\n${this.formatLineItems(lineItems, { indexLineItems })}` : msg;
  }

  public complete(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.GREEN + this.formatMessage(message, opts) + terminal.RESET);
  }

  public info(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.GRAY + this.formatMessage(message, opts) + terminal.RESET);
  }

  public ok(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.BLUE + this.formatMessage(message, opts) + terminal.RESET);
  }

  public error(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.RED + this.formatMessage(message, opts) + terminal.RESET);
  }

  public begin(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.YELLOW + this.formatMessage(message, opts) + terminal.RESET);
  }
}

export const stdout = new SeedStdout();
