import dynamic from "next/dynamic";

import clsx from "clsx";

import {
  type NestedDetail,
  type FullDetail,
  isFullDetail,
  type DetailEntityType,
} from "~/prisma/model";
import { DetailsTimeline } from "~/components/timelines/DetailsTimeline";
import { type ComponentProps } from "~/components/types";

import { CreateDetailFormPlaceholder } from "./create/CreateDetailFormPlaceholder";
import { UpdateDetailFormPlaceholder } from "./UpdateDetailFormPlaceholder";

const CreateNestedDetailForm = dynamic(() => import("./create/CreateNestedDetailForm"), {
  loading: () => <CreateDetailFormPlaceholder />,
});

const CreateDetailForm = dynamic(() => import("./create/CreateDetailForm"), {
  loading: () => <CreateDetailFormPlaceholder />,
});

const UpdateDetailForm = dynamic(() => import("./UpdateDetailForm"), {
  loading: () => <UpdateDetailFormPlaceholder />,
});

type ModifyDetailsViewRecursiveProps = ComponentProps & {
  readonly details: NestedDetail[];
  readonly isNested: true;
  readonly entityId?: never;
  readonly entityType?: never;
  readonly detailId: string;
};

type ModifyDetailsViewPrimaryProps = ComponentProps & {
  readonly details: FullDetail[];
  readonly isNested?: never;
  readonly entityId: string;
  readonly detailId?: never;
  readonly entityType: DetailEntityType;
};

export type ModifyDetailsViewProps =
  | ModifyDetailsViewPrimaryProps
  | ModifyDetailsViewRecursiveProps;

export const ModifyDetailsView = ({
  details,
  entityId,
  entityType,
  isNested,
  detailId,
  ...props
}: ModifyDetailsViewProps): JSX.Element => (
  <DetailsTimeline {...props} className={clsx("h-full max-h-full w-full", props.className)}>
    {isNested ? (
      <CreateNestedDetailForm detailId={detailId} />
    ) : (
      <CreateDetailForm entityId={entityId} entityType={entityType} />
    )}
    {...details.map(detail => {
      if (isFullDetail(detail)) {
        return (
          <div className="relative flex flex-col gap-[10px]" key={detail.id}>
            <UpdateDetailForm detail={detail} />
            <ModifyDetailsView
              details={detail.nestedDetails}
              isNested={true}
              detailId={detail.id}
            />
          </div>
        );
      }
      return <UpdateDetailForm key={detail.id} detail={detail} />;
    })}
  </DetailsTimeline>
);

export default ModifyDetailsView;
