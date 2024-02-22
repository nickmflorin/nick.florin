"use client";
import { Drawer } from "~/components/drawers/Drawer";
import { ResponseRenderer } from "~/components/views/ResponseRenderer";
import { useSkill } from "~/hooks/api";

export interface SkillDrawerProps {
  readonly skillId: string;
}

export const SkillDrawer = ({ skillId }: SkillDrawerProps) => {
  const { data, isLoading, error } = useSkill(skillId);
  return (
    <Drawer open={true}>
      <ResponseRenderer error={error} data={data} isLoading={isLoading}>
        {skill => <div>{skill.label}</div>}
      </ResponseRenderer>
    </Drawer>
  );
};

export default SkillDrawer;
