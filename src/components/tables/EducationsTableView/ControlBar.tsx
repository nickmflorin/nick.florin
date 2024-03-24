import dynamic from "next/dynamic";

import { ContextTableControlBar } from "../ContextTableControlBar";
import { DeleteManyButtonPlaceholder } from "../DeleteManyButtonPlaceholder";

const DeleteManyButton = dynamic(() => import("./DeleteManyButton"), {
  loading: () => <DeleteManyButtonPlaceholder />,
});

export const ControlBar = () => <ContextTableControlBar deleteButton={<DeleteManyButton />} />;
