import { type ApiEducation } from "~/prisma/model";
import { Link } from "~/components/buttons";
import { useDrawers } from "~/components/drawers/hooks";

interface DetailsCellProps {
  readonly model: ApiEducation<{ details: true }>;
}

export const DetailsCell = ({ model }: DetailsCellProps) => {
  const { open, ids } = useDrawers();
  return (
    <Link.Primary
      onClick={() => open(ids.UPDATE_EDUCATION_DETAILS, { entityId: model.id })}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};

export default DetailsCell;
