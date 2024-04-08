import { Prisma } from "~/prisma/model";

/**
 * Reference:
 * https://github.com/prisma/prisma/issues/5315#issuecomment-1447116621
 */
export const brandExtension = Prisma.defineExtension(client => {
  type ModelKey = Exclude<keyof typeof client, `$${string}` | symbol>;
  /* eslint-disable-next-line @typescript-eslint/ban-types */
  type Result = { [K in ModelKey]: { __kind__: { needs: {}; compute: () => K } } };

  const result = {} as Result;
  const modelKeys = Object.keys(client).filter(key => !key.startsWith("$")) as ModelKey[];
  modelKeys.forEach(k => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    result[k] = { __kind__: { needs: {}, compute: () => k as any } };
  });
  return client.$extends({ result });
});
