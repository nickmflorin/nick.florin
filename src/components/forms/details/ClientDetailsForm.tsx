"use client";
import { useState } from "react";

import clsx from "clsx";

import { type DetailEntityType, type FullDetail } from "~/prisma/model";
import { Link } from "~/components/buttons/generic";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

import { UpdateDetailsTimeline } from "./UpdateDetailsTimeline";

export interface DetailsFormProps extends ComponentProps {
  readonly details: FullDetail[];
  readonly entityId: string;
  readonly entityType: DetailEntityType;
  readonly title: string;
}

export const DetailsForm = ({
  details,
  title,
  entityId,
  entityType,
  ...props
}: DetailsFormProps): JSX.Element => {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div {...props} className={clsx("flex flex-col gap-[10px] h-full max-h-full", props.className)}>
      <div className="flex flex-col gap-[6px] pr-[18px]">
        <Title key="0" order={4}>
          {title}
        </Title>
        <div key="1" className="flex flex-row items-center justify-end">
          <Link.Primary isDisabled={isCreating} onClick={() => setIsCreating(true)}>
            Add
          </Link.Primary>
        </div>
      </div>
      <div className="grow overflow-y-scroll pr-[18px] relative">
        <UpdateDetailsTimeline
          details={details}
          entityId={entityId}
          entityType={entityType}
          onCreateSuccess={() => setIsCreating(false)}
        />
      </div>
    </div>
  );
};

export default DetailsForm;
