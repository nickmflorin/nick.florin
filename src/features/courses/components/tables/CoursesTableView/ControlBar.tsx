import dynamic from "next/dynamic";

import { ContextTableControlBar } from "~/components/tables/generic/ContextTableControlBar";
import { DeleteManyButtonPlaceholder } from "~/components/tables/generic/DeleteManyButtonPlaceholder";

const DeleteManyButton = dynamic(() => import("./DeleteManyButton"), {
  loading: () => <DeleteManyButtonPlaceholder />,
});

export const ControlBar = () => <ContextTableControlBar deleteButton={<DeleteManyButton />} />;
