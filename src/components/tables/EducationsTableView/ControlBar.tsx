import dynamic from "next/dynamic";

import { DeleteManyButtonPlaceholder } from "../DeleteManyButtonPlaceholder";
import { TableControlBar } from "../TableControlBar";

const DeleteManyButton = dynamic(() => import("./DeleteManyButton"), {
  loading: () => <DeleteManyButtonPlaceholder />,
});

export const ControlBar = () => <TableControlBar deleteButton={<DeleteManyButton />} />;
