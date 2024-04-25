import { Link } from "~/components/buttons";

import { Module, type ModuleProps } from "./generic";

export interface EducationModuleProps extends Omit<ModuleProps, "title" | "actions"> {}

export const EducationModule = ({ children, ...props }: EducationModuleProps) => (
  <Module
    {...props}
    title="Education"
    actions={[
      <Link.Primary
        key="0"
        options={{ as: "link" }}
        href="/resume/education"
        fontSize="xs"
        fontWeight="medium"
      >
        View All
      </Link.Primary>,
    ]}
  >
    {children}
  </Module>
);
