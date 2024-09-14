import { DetailEntityType } from "~/prisma/model";

import {
  type UpdateDetailsDrawerProps,
  UpdateDetailsDrawer,
} from "~/features/resume/components/drawers/UpdateDetailsDrawer";

interface UpdateExperienceDetailsDrawerProps
  extends Omit<UpdateDetailsDrawerProps<typeof DetailEntityType.EXPERIENCE>, "entityType"> {}

export const UpdatExperienceDetailsDrawer = (
  props: UpdateExperienceDetailsDrawerProps,
): JSX.Element => <UpdateDetailsDrawer {...props} entityType={DetailEntityType.EXPERIENCE} />;

export default UpdatExperienceDetailsDrawer;
