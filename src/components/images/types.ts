import { z } from "zod";

export type ImageProp = {
  readonly url?: string | null;
  readonly size: number | `${number}`;
};

export const ImagePropSchema = z.object({
  url: z.string().optional().nullable(),
  /* We could be more strict on the string form of the size, but since this schema is mostly used
     for a typeguard it might be less bug-prone to simply allow any string that is indexed by the
     'size' key. */
  size: z.union([z.number().int(), z.string()]),
});

export const isImageProp = (value: unknown): value is ImageProp =>
  ImagePropSchema.safeParse(value).success;
