import { Suspense } from "react";

import { TextInput } from "~/components/input/TextInput";
import { Loading } from "~/components/views/Loading";

import SkillsTable from "./SkillsTable";

export default async function SkillsPage() {
  return (
    <>
      <TextInput className="mb-[18px]" />
      <div className="grow overflow-hidden w-full relative">
        <Suspense fallback={<Loading loading={true} />}>
          <SkillsTable />
        </Suspense>
      </div>
    </>
  );
}
