import { type ReactNode } from "react";

interface EducationsLayoutProps {
  readonly children: ReactNode;
}

export default async function EducationsLayout({ children }: EducationsLayoutProps) {
  return <>{children}</>;
}
