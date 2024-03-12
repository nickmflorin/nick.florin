import { type ReactNode } from "react";

interface ExperiencesLayoutProps {
  readonly children: ReactNode;
}

export default async function ExperiencesLayout({ children }: ExperiencesLayoutProps) {
  return <>{children}</>;
}
