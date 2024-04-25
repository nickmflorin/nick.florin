import { Link } from "~/components/buttons";

import { Module, type ModuleProps } from "./generic";

export interface ExperienceModuleProps extends Omit<ModuleProps, "title" | "actions"> {}

export const ExperienceModule = ({ children, ...props }: ExperienceModuleProps) => (
  <Module
    {...props}
    title="Recent Experiences"
    actions={[
      <Link.Primary
        key="0"
        options={{ as: "link" }}
        href="/resume/experience"
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
