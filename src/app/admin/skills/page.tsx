import dynamic from "next/dynamic";

import { Loading } from "~/components/views/Loading";

const TextInput = dynamic(() => import("~/components/input/TextInput").then(mod => mod.TextInput), {
  ssr: false,
});

const SkillsTable = dynamic(() => import("./SkillsTable"), {
  loading: () => <Loading loading={true} />,
  ssr: false,
});

export default async function SkillsPage() {
  return (
    <>
      <TextInput className="mb-[18px]" />
      <div className="grow overflow-hidden w-full">
        <SkillsTable />
      </div>
    </>
  );
}
