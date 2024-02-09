import { prisma } from "~/prisma/client";

import { Table } from "./Table";

export const SkillsTable = async (): Promise<JSX.Element> => {
  const skills = await prisma.skill.findMany({});
  return (
    <Table
      columns={[
        { label: "Label", key: "label" },
        { label: "Slug", key: "slug" },
      ]}
      data={skills}
    />
  );
};

export default SkillsTable;
