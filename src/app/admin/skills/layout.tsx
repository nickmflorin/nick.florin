import { type ReactNode } from "react";

interface SkillsLayoutProps {
  readonly children: ReactNode;
}

export default async function SkillsLayout({ children }: SkillsLayoutProps) {
  return <>{children}</>;
}
