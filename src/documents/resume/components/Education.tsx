import { type ResolvedDegree } from '../data/types';
import { logo } from '../lib/assets';
import { formatDateRange, formatDegreeTitle } from '../lib/formatters';

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
        {degree.school.logoFileName === null ? null : (
          <img alt={degree.school.name} src={logo(degree.school.logoFileName)} />
        )}
      </div>
      <div className='edu-body'>
        <p className='edu-degree'>{formatDegreeTitle(degree)}</p>
        <div className='edu-school'>{degree.school.name}</div>
        <div className='edu-meta'>
          <span>{formatDateRange(degree)}</span>
          <span>{`${degree.school.city}, ${degree.school.state}`}</span>
          {degree.gpa === null ? null : <span>{`GPA ${degree.gpa}`}</span>}
        </div>
        <div className='edu-desc' dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </div>
  );
};
