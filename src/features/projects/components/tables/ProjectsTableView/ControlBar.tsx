import dynamic from "next/dynamic";

import { ContextTableControlBar } from "~/components/tables/ContextTableControlBar";
import { DeleteManyButtonPlaceholder } from "~/components/tables/DeleteManyButtonPlaceholder";

const DeleteManyButton = dynamic(() => import("./DeleteManyButton"), {
  loading: () => <DeleteManyButtonPlaceholder />,
});

export const ControlBar = () => <ContextTableControlBar deleteButton={<DeleteManyButton />} />;
