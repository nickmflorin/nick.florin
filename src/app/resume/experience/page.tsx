import { ResumeSection } from "~/components/resume/ResumeSection";
import { ExperienceTimeline } from "~/components/timelines/ExperienceTimeline";

export default function ExperiencePage() {
  return (
    <ResumeSection title="Experience">
      <ExperienceTimeline />
    </ResumeSection>
  );
}
