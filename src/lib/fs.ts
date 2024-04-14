const K_UNIT = 1024;

export const FILE_SIZE_UNITS = ["b", "kb", "mb", "gb", "tb", "pb"] as const;

export type FileSizeUnit = (typeof FILE_SIZE_UNITS)[number];

export const getFileSize = (value: bigint | number): [FileSizeUnit, number] => {
  if (value < K_UNIT) {
    return [FILE_SIZE_UNITS[0], Number(value)];
  }
  for (let i = 1; i < FILE_SIZE_UNITS.length - 1; i++) {
    const bytes = K_UNIT ** i;
    const nextBytes = K_UNIT ** (i + 1);
    if (value > bytes && value < nextBytes) {
      return [FILE_SIZE_UNITS[i], Number(value) / bytes];
    }
  }
  return [
    FILE_SIZE_UNITS[FILE_SIZE_UNITS.length - 1],
    Number(value) / K_UNIT ** (FILE_SIZE_UNITS.length - 1),
  ];
};

export const toFileSizeString = (value: bigint | number): string => {
  const [unit, bytes] = getFileSize(value);
  return `${bytes.toFixed(2)} ${unit.toUpperCase()}`;
};
