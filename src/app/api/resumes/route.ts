import { type NextRequest } from 'next/server';

import { z } from 'zod';

import { parseOrdering } from '~/lib/ordering';

import { ResumeOrderableFields, ResumesDefaultOrdering, ResumesFiltersObj } from '~/actions';
import { fetchResumes } from '~/actions/resumes/fetch-resumes';
import { ClientResponse } from '~/api';
import { parseQueryParams } from '~/integrations/http';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal('admin'), z.literal('public')])
      .default('public')
      .safeParse(query.visibility).data ?? 'public';

  const filters = ResumesFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: ResumesDefaultOrdering,
    fields: [...ResumeOrderableFields],
  });

  const { data, error } = await fetchResumes(
    { filters, limit, ordering, visibility },
    { scope: 'api' },
  );
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
