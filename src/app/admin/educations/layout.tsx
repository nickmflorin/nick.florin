import { type ReactNode } from "react";

interface EducationsLayoutProps {
  readonly children: ReactNode;
  readonly drawer: ReactNode;
}

export default async function EducationsLayout({ children, drawer }: EducationsLayoutProps) {
  return (
    <>
      {children}
      {drawer}
    </>
  );
}
