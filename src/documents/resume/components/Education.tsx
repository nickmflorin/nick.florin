import { type ResolvedDegree } from '../data/types';
import { logo } from '../lib/assets';

export interface EducationProps {
  readonly degree: ResolvedDegree;
}

/**
 * One degree. Like `Role`, it receives content already resolved for the resume channel.
 *
 * A degree's prose is a single line beneath the header, so its summary nodes render as one block
 * rather than a paragraph each. There is one node today; joining keeps a second from disappearing
 * silently if one is ever added.
 */
export const Education = ({ degree }: EducationProps) => {
  const description = degree.content.summary.map(node => node.content ?? '').join(' ');
  return (
    <div className='edu'>
      <div className='edu-logo'>
        <img alt={degree.school} src={logo(degree.logo)} />
      </div>
      <div className='edu-body'>
        <p className='edu-degree'>{degree.degree}</p>
        <div className='edu-school'>{degree.school}</div>
        <div className='edu-meta'>
          <span>{degree.dates}</span>
          <span>{degree.location}</span>
          {degree.gpa !== undefined && <span>{degree.gpa}</span>}
        </div>
        <div className='edu-desc' dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </div>
  );
};
