import { type NextRequest } from 'next/server';

import { z } from 'zod';

import { DetailEntityType, type DetailIncludes } from '~/database/model';
import { db } from '~/database/prisma';
import { parseOrdering } from '~/lib/ordering';

import {
  DetailIncludesSchema,
  DetailOrderableFields,
  DetailsDefaultOrdering,
  DetailsFiltersObj,
} from '~/actions';
import { fetchEntityDetails } from '~/actions/details/fetch-entity-details';
import { ClientResponse } from '~/api';
import { parseQueryParams } from '~/integrations/http';

export async function generateStaticParams() {
  const experiences = await db.experience.findMany();
  return experiences.map(e => ({
    id: e.id,
  }));
}

export const GET = async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = DetailIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().optional().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal('admin'), z.literal('public')])
      .default('public')
      .safeParse(query.visibility).data ?? 'public';

  let includes: DetailIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = DetailsFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: DetailsDefaultOrdering,
    fields: [...DetailOrderableFields],
  });

  const fetcher = fetchEntityDetails(includes, DetailEntityType.EXPERIENCE);

  const { data, error } = await fetcher(
    params.id,
    { filters, limit, ordering, visibility },
    { scope: 'api' },
  );
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
