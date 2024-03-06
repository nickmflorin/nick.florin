"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

import clsx from "clsx";

import { type DetailEntityType, type Detail } from "~/prisma/model";
import { Link } from "~/components/buttons/generic";
import { DetailsTimeline } from "~/components/timelines/DetailsTimeline";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

import { CreateDetailForm } from "./CreateDetailForm";
import { UpdateDetailForm } from "./UpdateDetailForm";

export interface DetailsFormProps extends ComponentProps {
  readonly details: Detail[];
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
  const [_, transition] = useTransition();
  const { refresh } = useRouter();

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
      <DetailsTimeline
        className="grow overflow-y-scroll pr-[18px]"
        items={[
          isCreating ? (
            <CreateDetailForm
              entityId={entityId}
              entityType={entityType}
              onSuccess={() => {
                setIsCreating(false);
                transition(() => {
                  refresh();
                });
              }}
            />
          ) : null,
          ...details.map(detail => (
            <UpdateDetailForm
              key={detail.id}
              detail={detail}
              onSuccess={() => {
                /* Note: We may not need this transition, since this is just updating a detail and
                  \ we only currently show the number of details in the table. */
                transition(() => {
                  refresh();
                });
              }}
            />
          )),
        ]}
      />
    </div>
  );
};

export default DetailsForm;
