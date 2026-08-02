import { z } from 'zod';

export type ImageProp = {
  readonly size: `${number}` | number;
  readonly url?: null | string;
};

export const ImagePropSchema = z.object({
  /* We could be more strict on the string form of the size, but since this schema is mostly used
     for a typeguard it might be less bug-prone to simply allow any string that is indexed by the
     'size' key. */
  size: z.union([z.number().int(), z.string()]),
  url: z.string().optional().nullable(),
});

export const isImageProp = (value: unknown): value is ImageProp =>
  ImagePropSchema.safeParse(value).success;
