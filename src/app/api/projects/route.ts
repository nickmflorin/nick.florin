import { type NextRequest } from 'next/server';

import { z } from 'zod';

import { type ProjectIncludes } from '~/database/model';
import { parseOrdering } from '~/lib/ordering';

import {
  ProjectIncludesSchema,
  ProjectOrderableFields,
  ProjectsDefaultOrdering,
  ProjectsFiltersObj,
} from '~/actions';
import { fetchProjects } from '~/actions/projects/fetch-projects';
import { ClientResponse } from '~/api';
import { parseQueryParams } from '~/integrations/http';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = ProjectIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal('admin'), z.literal('public')])
      .default('public')
      .safeParse(query.visibility).data ?? 'public';

  let includes: ProjectIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = ProjectsFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: ProjectsDefaultOrdering,
    fields: [...ProjectOrderableFields],
  });

  const fetcher = fetchProjects(includes);
  const { data, error } = await fetcher({ filters, limit, ordering, visibility }, { scope: 'api' });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
