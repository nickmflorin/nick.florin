"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { updateSkill } from "~/app/actions/updateSkill";
import { slugify } from "~/lib/formatters";
import { IconButton } from "~/components/buttons";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";
import { type Skill } from "~/prisma/model";

import { Table } from "./Table";

interface LabelCellProps {
  readonly skill: Skill;
}

const LabelCell = ({ skill }: LabelCellProps): JSX.Element => {
  const input = useReadWriteTextInput();
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <ReadWriteTextInput
      ref={input}
      initialValue={skill.label}
      onPersist={async (label, instance) => {
        instance.setLoading(true);
        let updatedSkill: Skill;
        try {
          updatedSkill = await updateSkill(skill.id, { label });
        } catch (e) {
          /* eslint-disable-next-line no-console -- Need to handle the error better! */
          console.error(e);
          return false;
        } finally {
          instance.setLoading(false);
        }
        instance.setValue(updatedSkill.label, { state: "reading" });
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

const SlugCell = ({ skill }: LabelCellProps): JSX.Element => {
  const input = useReadWriteTextInput();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <div className="flex flex-row justify-between gap-[12px]">
      <ReadWriteTextInput
        ref={input}
        initialValue={skill.slug}
        onPersist={async (slug, instance) => {
          instance.setLoading(true);
          let updatedSkill: Skill;
          try {
            updatedSkill = await updateSkill(skill.id, { slug });
          } catch (e) {
            /* eslint-disable-next-line no-console -- Need to handle the error better! */
            console.error(e);
            return false;
          } finally {
            instance.setLoading(false);
          }
          instance.setValue(updatedSkill.slug, { state: "reading" });
          transition(() => {
            router.refresh();
          });
        }}
      />
      <IconButton.Transparent
        icon={{ name: "refresh" }}
        className="text-blue-600"
        disabledClassName="text-disabled"
        isLoading={loading}
        isDisabled={skill.slug === slugify(skill.label)}
        onClick={async () => {
          setLoading(true);
          await new Promise(resolve => setTimeout(resolve, 2000));
          let updatedSkill: Skill;
          try {
            updatedSkill = await updateSkill(skill.id, { refreshSlug: true });
          } catch (e) {
            /* eslint-disable-next-line no-console -- Need to handle the error better! */
            console.error(e);
            return false;
          } finally {
            setLoading(false);
          }
          input.current.setValue(updatedSkill.slug, { state: "reading" });
          transition(() => {
            router.refresh();
          });
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
