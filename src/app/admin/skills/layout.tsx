import { type ReactNode } from "react";

interface SkillsLayoutProps {
  readonly children: ReactNode;
  readonly drawer: ReactNode;
}

export default async function SkillsLayout({ children, drawer }: SkillsLayoutProps) {
  return (
    <>
      {children}
      {drawer}
    </>
  );
}
