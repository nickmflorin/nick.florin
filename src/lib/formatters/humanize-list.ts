type HumanizeListIteree = number | string;

type HumanizeListOptions<T extends HumanizeListIteree> = {
  readonly conjunction?: 'and' | 'or';
  readonly delimiter?: string;
  readonly formatter?: (value: T) => string;
  readonly oxfordComma?: boolean;
};

export const humanizeList = <T extends HumanizeListIteree>(
  values: T[],
  options?: HumanizeListOptions<T>,
) => {
  const {
    conjunction = 'and',
    delimiter = ',',
    formatter = (value: T) => value.toString(),
    oxfordComma = true,
  } = options ?? {};
  if (values.length === 0) {
    return '';
  } else if (values.length === 1) {
    return formatter(values[0]);
  }
  let humanized = values
    .slice(0, values.length - 1)
    .map(v => formatter(v))
    .join(delimiter.trim() + ' ');
  if (values.length >= 3 && oxfordComma) {
    humanized += delimiter.trim();
  }
  return [humanized, conjunction.trim(), formatter(values[values.length - 1])].join(' ');
};
