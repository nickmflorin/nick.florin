import { type NextRequest } from 'next/server';

import { z } from 'zod';

import { type ProjectIncludes } from '~/database/model';
import { db } from '~/database/prisma';

import { ProjectIncludesSchema } from '~/actions';
import { fetchProject } from '~/actions/projects/fetch-project';
import { ClientResponse } from '~/api';
import { parseQueryParams } from '~/integrations/http';

export async function generateStaticParams() {
  const projects = await db.project.findMany();
  return projects.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = ProjectIncludesSchema.safeParse(query.includes);

  let includes: ProjectIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const visibility =
    z
      .union([z.literal('admin'), z.literal('public')])
      .default('public')
      .safeParse(query.visibility).data ?? 'public';

  const fetcher = fetchProject(includes);
  const { data, error } = await fetcher(params.id, { visibility }, { scope: 'api' });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
