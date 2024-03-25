import { type NextRequest } from "next/server";

export type Visibility = "public" | "admin";

export const parseVisibility = (request: NextRequest): Visibility => {
  const params = request.nextUrl.searchParams;
  const v = params.get("visibility");
  return v?.toLowerCase() === "admin" ? "admin" : "public";
};
