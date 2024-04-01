import dynamic from "next/dynamic";

import { ContextTableControlBar } from "../../generic/ContextTableControlBar";
import { DeleteManyButtonPlaceholder } from "../../generic/DeleteManyButtonPlaceholder";

const DeleteManyButton = dynamic(() => import("./DeleteManyButton"), {
  loading: () => <DeleteManyButtonPlaceholder />,
});

export const ControlBar = () => <ContextTableControlBar deleteButton={<DeleteManyButton />} />;
