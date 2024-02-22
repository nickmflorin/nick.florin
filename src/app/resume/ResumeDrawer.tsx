"use client";
import { useSearchParams } from "next/navigation";

import { SkillDrawer } from "./SkillDrawer";

export const ResumeDrawer = () => {
  const searchParams = useSearchParams();

  const skillId = searchParams?.get("skillId");
  if (skillId) {
    return <SkillDrawer skillId={skillId} />;
  }
  return <></>;
};

export default ResumeDrawer;
