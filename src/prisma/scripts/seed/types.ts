import { type User as ClerkUser } from "@clerk/clerk-sdk-node";

import { type User } from "~/prisma/model";

export type SeedContext = {
  readonly clerkUser: ClerkUser;
  readonly user: User;
};
