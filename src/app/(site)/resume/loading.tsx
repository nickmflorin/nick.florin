import { ResumeTimelineSkeleton } from '~/features/resume/components/ResumeTimelineSkeleton';

/* '/resume' redirects to '/resume/experience', so the segment's fallback is shaped like the
   experience timeline. */
const Loading = () => <ResumeTimelineSkeleton numDetails={4} numItems={4} numSkills={12} />;

export default Loading;
