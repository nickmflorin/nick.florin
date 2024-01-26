import { Education } from "~/components/resume/Education";
import { Experience } from "~/components/resume/Experience";

export default function Home() {
  return (
    <div className="flex flex-col gap-[24px]">
      <Experience />
      <Education />
    </div>
  );
}
