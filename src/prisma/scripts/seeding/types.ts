import { type User as ClerkUser } from "@clerk/nextjs/api";

import { type User } from "../../model";

export type SeedContext = {
  readonly clerkUser: ClerkUser;
  readonly user: User;
};
