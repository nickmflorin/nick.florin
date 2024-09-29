export const removeUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.keys(obj).reduce((prev: T, key: string) => {
    const v = obj[key as keyof T];
    if (v !== undefined) {
      return { ...prev, [key as keyof T]: v } as T;
    }
    return prev;
  }, {} as T);
