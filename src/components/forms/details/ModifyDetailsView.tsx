import dynamic from "next/dynamic";

import { Title } from "~/components/typography/Title";
import { Loading } from "~/components/views/Loading";

import { type ModifyDetailsTimelineProps } from "./ModifyDetailsTimeline";

const ModifyDetailsViewTimeline = dynamic(() => import("./ModifyDetailsTimeline"), {
  loading: () => <Loading loading={true} spinnerSize="sm" />,
});

export interface ModifyDetailsViewProps extends ModifyDetailsTimelineProps {
  readonly title: string;
}

export const ModifyDetailsView = ({ title, ...props }: ModifyDetailsViewProps) => (
  <div className="flex flex-col gap-[10px] h-full max-h-full w-full relative">
    <div className="flex flex-col gap-[4px]">
      <Title order={4}>{title}</Title>
    </div>
    <div className="relative grow w-full max-h-full overflow-y-scroll pr-[18px]">
      <ModifyDetailsViewTimeline {...props} />
    </div>
  </div>
);
