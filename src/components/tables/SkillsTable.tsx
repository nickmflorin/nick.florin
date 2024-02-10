"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

import { updateSkill } from "~/app/actions/updateSkill";
import { IconButton } from "~/components/buttons";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";
import { type Skill } from "~/prisma/model";

import { Table } from "./Table";

interface LabelCellProps {
  readonly skill: Skill;
}

const LabelCell = ({ skill }: LabelCellProps): JSX.Element => {
  const input = useReadWriteTextInput();

  return (
    <ReadWriteTextInput
      ref={input}
      initialValue={skill.label}
      onPersist={async (label, instance) => {
        /* TODO: Handle the error here, return false if there is an error to prevent persisting of
           value. */
        const updated = await updateSkill(skill.id, { label });
        instance.setValue(updated.label, { state: "reading" });
      }}
    />
  );
};

const SlugCell = ({ skill }: LabelCellProps): JSX.Element => {
  const input = useReadWriteTextInput();

  return (
    <div className="flex flex-row justify-between gap-[12px]">
      <ReadWriteTextInput
        ref={input}
        initialValue={skill.slug}
        onPersist={async (slug, instance) => {
          const updatedSkill = await updateSkill(skill.id, { slug });
          /* TODO: Handle the error here, return false if there is an error to prevent persisting of
             value. */
          instance.setValue(updatedSkill.slug, { state: "reading" });
        }}
      />
      <IconButton
        icon={{ name: "refresh" }}
        onClick={async () => {
          const updatedSkill = await updateSkill(skill.id, { refreshSlug: true });
          if (input.current) {
            input.current.setValue(updatedSkill.slug, { state: "reading" });
          }
        }}
      />
    </div>
  );
};

export interface SkillsTableProps {
  readonly skills: Skill[];
}

export const SkillsTable = ({ skills }: SkillsTableProps): JSX.Element => {
  const [data, setData] = useState(skills);

  useEffect(() => {
    setData(skills);
  }, [skills]);

  return (
    <Table
      columns={[
        {
          accessor: "label",
          title: "Label",
          render: (skill: Skill) => <LabelCell skill={skill} />,
        },
        {
          accessor: "slug",
          title: "Slug",
          render: (skill: Skill) => <SlugCell skill={skill} />,
        },
      ]}
      data={data}
    />
  );
};
export default SkillsTable;
