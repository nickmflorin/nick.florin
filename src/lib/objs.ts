export const parseObjDefinedValues = <T extends Record<string, unknown>>(obj: T): T => {
  const newObj: T = {} as T;
  for (const key in obj) {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

export const objIsEmpty = (obj: Record<string, unknown>): boolean => {
  const parsed = parseObjDefinedValues(obj);
  return Object.keys(parsed).length === 0;
};
