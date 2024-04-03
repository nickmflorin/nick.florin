import { type ApiExperience } from "~/prisma/model";
import { Link } from "~/components/buttons";
import { useDrawers } from "~/components/drawers/hooks";

interface DetailsCellProps {
  readonly model: ApiExperience<["details"]>;
}

export const DetailsCell = ({ model }: DetailsCellProps) => {
  const { open, ids } = useDrawers();
  return (
    <Link.Primary
      onClick={() => open(ids.UPDATE_EXPERIENCE_DETAILS, { entityId: model.id })}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};

export default DetailsCell;
