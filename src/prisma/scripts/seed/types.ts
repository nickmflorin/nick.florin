import { type User as ClerkUser } from "@clerk/nextjs/api";

import { type User } from "~/prisma/model";

export type SeedContext = {
  readonly clerkUser: ClerkUser;
  readonly user: User;
};
