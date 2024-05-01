import { redirect } from "next/navigation";

import { SignIn } from "@clerk/nextjs";

import { getAuthAdminUser } from "~/application/auth";

export default function Page() {
  const user = getAuthAdminUser({ strict: false });
  if (!user) {
    return <SignIn />;
  }
  return redirect("/admin");
}
