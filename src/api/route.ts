import { type NextRequest, type NextResponse } from "next/server";

import { getAuthedUser } from "~/application/auth/server";
import type { User } from "~/prisma/model";

import { ApiClientGlobalError } from "./errors";
import { parseApiQuery, type ApiParsedQuery } from "./query";
import { type ApiClientErrorJson } from "./types";

type Target<R> = (
  req: NextRequest,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  params: any,
  query: ApiParsedQuery,
  user: User | null,
) => Promise<R>;

type Result<R> = (
  req: NextRequest,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  params: any,
) => Promise<R | NextResponse<ApiClientErrorJson>>;

export function apiRoute<R>(target: Target<R>): Result<R> {
  return async function GET(request: NextRequest, params) {
    const parsed = parseApiQuery(request.nextUrl.searchParams);
    const { clerkUserId, user, hasCMSAccess } = await getAuthedUser({ request, strict: false });
    if (!clerkUserId && parsed.visibility === "admin") {
      return ApiClientGlobalError.NotAuthenticated().response;
    } else if (clerkUserId && !hasCMSAccess && parsed.visibility === "admin") {
      return ApiClientGlobalError.Forbidden().response;
    }
    return target(request, params, parsed, user);
  };
}
