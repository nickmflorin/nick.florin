import { ResumeSection } from "~/components/resume/ResumeSection";
import { EducationTimeline } from "~/components/timelines/EducationTimeline";

export default function EducationPage() {
  return (
    <ResumeSection title="Education">
      <EducationTimeline />
    </ResumeSection>
  );
}
