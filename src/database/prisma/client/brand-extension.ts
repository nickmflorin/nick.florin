import { Prisma } from '~/database/model';

/**
 * Reference:
 * https://github.com/prisma/prisma/issues/5315#issuecomment-1447116621
 */
export const brandExtension = Prisma.defineExtension(client => {
  type ModelKey = Exclude<keyof typeof client, `$${string}` | symbol>;
  /* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
  type Result = { [K in ModelKey]: { $kind: { compute: () => K; needs: {} } } };

  const modelKeys = Object.keys(client).filter(key => !key.startsWith('$')) as ModelKey[];
  /* Each entry computes the model key it was built from, which is what the mapped type describes
     per-key, but which cannot be expressed through the uniform entry type of 'fromEntries'. */
  const result = Object.fromEntries(
    modelKeys.map(k => [k, { $kind: { compute: () => k, needs: {} } }]),
  ) as Result;
  return client.$extends({ result });
});
