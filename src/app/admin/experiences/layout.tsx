import { type ReactNode } from "react";

interface ExperiencesLayoutProps {
  readonly children: ReactNode;
  readonly drawer: ReactNode;
}

export default async function ExperiencesLayout({ children, drawer }: ExperiencesLayoutProps) {
  return (
    <>
      {children}
      {drawer}
    </>
  );
}
