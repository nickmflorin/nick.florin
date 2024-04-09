import type { Repository } from "./core";

import { environment } from "~/environment";

export const getRepositoryGithubUrl = (repository: Repository): string => {
  let basePath = environment.get("NEXT_PUBLIC_GITHUB_PROFILE_PREFIX");
  if (!basePath.endsWith("/")) {
    basePath = `${basePath}/`;
  }
  return `${basePath}${repository.slug}`;
};
