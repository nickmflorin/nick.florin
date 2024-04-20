import dynamic from "next/dynamic";

import { SignIn } from "@clerk/nextjs";

import { Loading } from "~/components/feedback/Loading";

const SignInWrapper = dynamic(() => import("./SignInWrapper"), {
  loading: () => <Loading isLoading={true} />,
});

export default function Page() {
  return (
    <SignInWrapper>
      <SignIn />
    </SignInWrapper>
  );
}
