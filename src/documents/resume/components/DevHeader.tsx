import { icon } from '../lib/assets';

export interface DevHeaderProps {
  readonly branch?: string;
  readonly file: string;
  /**
   * Whether the header follows earlier content on the same sheet, which opens up the spacing
   * above it.
   *
   * @default false
   */
  readonly isSpaced?: boolean;
}

/**
 * The GitHub-flavored header above a run of main-column content: a branch selector and a file
 * breadcrumb (`nickmflorin / src / experience.ts`).
 */
export const DevHeader = ({ branch = 'main', file, isSpaced = false }: DevHeaderProps) => (
  <div className={isSpaced ? 'dev-header dev-header-spaced' : 'dev-header'}>
    <span className='branch-badge'>
      <img alt='' className='bb-icon-branch' src={icon('CodeBranch')} />
      <span>{branch}</span>
      <img alt='' className='bb-icon-caret' src={icon('CaretDown')} />
    </span>
    <span className='dev-path'>
      <span className='p-dir'>nickmflorin</span>
      <span className='p-sep'>/</span>
      <span className='p-dir'>src</span>
      <span className='p-sep'>/</span>
      <span className='p-file'>{file}</span>
    </span>
  </div>
);
