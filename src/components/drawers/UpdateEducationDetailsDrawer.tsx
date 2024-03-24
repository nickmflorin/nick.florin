import { DetailEntityType } from "~/prisma/model";

import { type UpdateDetailsDrawerProps, UpdateDetailsDrawer } from "./UpdateDetailsDrawer";

interface UpdateEducationDetailsDrawerProps
  extends Omit<UpdateDetailsDrawerProps<typeof DetailEntityType.EDUCATION>, "entityType"> {}

export const UpdatEducationDetailsDrawer = (
  props: UpdateEducationDetailsDrawerProps,
): JSX.Element => <UpdateDetailsDrawer {...props} entityType={DetailEntityType.EDUCATION} />;

export default UpdatEducationDetailsDrawer;
