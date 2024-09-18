"use client";
import { useState } from "react";

import { type ApiDetail, type NestedApiDetail, type DetailEntityType } from "~/database/model";

import { Link } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography";

import { ModifyDetailsTimeline } from "./ModifyDetailsTimeline";

export interface ModifyDetailsViewProps extends ComponentProps {
  readonly details: ApiDetail<["nestedDetails", "skills"]>[];
  readonly entityId: string;
  readonly entityType: DetailEntityType;
  readonly onExpand: (detail: ApiDetail<[]> | NestedApiDetail<[]>) => void;
}

export const ModifyDetailsView = (props: ModifyDetailsViewProps): JSX.Element => {
  const [createFormVisible, setCreateFormVisible] = useState(false);

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex flex-row justify-between items-center">
        <Text fontSize="sm" fontWeight="medium">{`${props.details.length} Details`}</Text>
        <Link.Primary
          className="text-blue-800 hover:text-blue-900"
          fontSize="sm"
          fontWeight="regular"
          isDisabled={createFormVisible}
          onClick={() => setCreateFormVisible(true)}
        >
          Add
        </Link.Primary>
      </div>
      <ModifyDetailsTimeline
        {...props}
        createFormVisible={createFormVisible}
        onCancel={() => setCreateFormVisible(false)}
        onCreated={() => setCreateFormVisible(false)}
      />
    </div>
  );
};

export default ModifyDetailsView;
