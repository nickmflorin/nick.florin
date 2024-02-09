import dynamic from "next/dynamic";

import { TextInput } from "~/components/input/TextInput";

const SkillsTable = dynamic(() => import("~/components/tables/SkillsTable"), {
  loading: () => <>Loading...</>,
});

export default function Admin() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <TextInput />
    </div>
  );
}
