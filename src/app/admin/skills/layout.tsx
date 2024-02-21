import { type ReactNode } from "react";

interface SkillsLayoutProps {
  readonly children: ReactNode;
  readonly drawer: ReactNode;
}

const SkillsLayout = ({ children, drawer }: SkillsLayoutProps) => (
  <>
    {children}
    {drawer}
  </>
);

export default SkillsLayout;
