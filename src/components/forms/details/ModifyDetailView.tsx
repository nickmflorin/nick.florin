import { useState } from "react";

import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";
import { IconButton } from "~/components/buttons";

import { ModifyNestedDetailsTimeline } from "./ModifyNestedDetailsTimeline";
import { CollapsedUpdateDetailForm } from "./update/CollapsedUpdateDetailForm";

export interface ModifyDetailViewProps {
  readonly detail: ApiDetail<["nestedDetails"]>;
  readonly onDeleted: () => void;
  readonly onExpand: (detail: ApiDetail<[]> | NestedApiDetail<[]>) => void;
}

export const ModifyDetailView = ({ detail, onDeleted, onExpand }: ModifyDetailViewProps) => {
  const [createFormVisible, setCreateFormVisible] = useState(false);

  return (
    <div className="relative flex flex-col gap-[10px]">
      <CollapsedUpdateDetailForm
        detail={detail}
        isExpanded={false}
        onExpand={() => onExpand(detail)}
        actions={[
          <IconButton.Bare
            key="0"
            className="text-blue-700 hover:text-blue-800"
            icon={{ name: "plus-circle" }}
            isDisabled={createFormVisible}
            onClick={() => setCreateFormVisible(true)}
          />,
        ]}
        onDeleted={onDeleted}
      />
      {(createFormVisible || detail.nestedDetails.length > 0) && (
        <ModifyNestedDetailsTimeline
          details={detail.nestedDetails}
          detailId={detail.id}
          isCreating={createFormVisible}
          onCancel={() => setCreateFormVisible(false)}
          onCreated={() => setCreateFormVisible(false)}
          onExpand={detail => onExpand(detail)}
        />
      )}
    </div>
  );
};
