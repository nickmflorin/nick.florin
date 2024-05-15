import { SignIn } from "@clerk/nextjs";

export default async function Page() {
  return <SignIn afterSignInUrl="/admin/skills" />;
}
