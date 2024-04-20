import { type ApiEducation, type ApiExperience } from "~/prisma/model";
import { SkillsSelect } from "~/components/input/select/SkillsSelect";

type Model = ApiExperience<["skills"]> | ApiEducation<["skills"]>;

interface SkillsCellProps {
  readonly model: Model;
}

export const SkillsCell = ({ model }: SkillsCellProps) => <SkillsSelect model={model} />;

export default SkillsCell;
