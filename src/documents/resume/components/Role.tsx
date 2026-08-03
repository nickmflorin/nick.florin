import { NodeType, type ResolvedNode, type ResolvedRole, TitleLayout } from '../data/types';
import { logo } from '../lib/assets';

import { Pills } from './Pills';

/**
 * A node's title and content as one string of HTML. Both are HTML — titles carry entities such
 * as `Bundle Size &amp; First Load Performance` — so both are emitted via
 * `dangerouslySetInnerHTML` rather than as text nodes.
 *
 * An INLINE title runs into the content after a dash, which is how every list item reads. A
 * STACKED title sits above its content; at the top level that is the `<h4>` rendered by `Role`,
 * and inside a list it is a line break.
 */
const titled = (node: Pick<ResolvedNode, 'content' | 'title' | 'titleLayout'>): string => {
  const body = node.content ?? '';
  if (node.title === null) {
    return body;
  }
  const title = `<strong>${node.title}</strong>`;
  if (body === '') {
    return title;
  }
  return node.titleLayout === TitleLayout.Inline ? `${title} - ${body}` : `${title}<br />${body}`;
};

/**
 * A role's content nodes precomputed into flat render sections. `list` is the element a
 * section's children render into, null when it has none; `prose` is the section's own paragraph,
 * empty when the section is nothing but a titled list.
 */
const toSections = (content: readonly ResolvedNode[]) =>
  content.map(node => ({
    list:
      node.children.length === 0
        ? null
        : node.type === NodeType.BulletedList
          ? ('ul' as const)
          : ('ol' as const),
    node,
    prose: node.titleLayout === TitleLayout.Inline ? titled(node) : (node.content ?? ''),
  }));

export interface RoleProps {
  readonly role: ResolvedRole;
}

/**
 * One role. The prose arrives already normalized and resolved for the resume channel (see
 * `rolesByKey`), so this component never decides what is published — only how it looks.
 */
export const Role = ({ role }: RoleProps) => {
  const { content, skills, summary } = role.content;
  return (
    <div className='role'>
      <div className='role-logo'>
        <img alt={role.company} src={logo(role.logo)} />
      </div>
      <div className='role-body'>
        <p className='role-title'>{role.title}</p>
        <div className='role-company'>{role.company}</div>
        <div className='role-meta'>
          <span>{role.dates}</span>
          <span>{role.location}</span>
        </div>
        {summary.map(node => (
          <p
            className='role-summary'
            dangerouslySetInnerHTML={{ __html: titled(node) }}
            key={node.id}
          />
        ))}
        {toSections(content).map(({ list: List, node, prose }) => (
          <div className='sub' key={node.id}>
            {node.title !== null && node.titleLayout === TitleLayout.Stacked && (
              <h4 dangerouslySetInnerHTML={{ __html: node.title }} />
            )}
            {prose !== '' && <p dangerouslySetInnerHTML={{ __html: prose }} />}
            {List !== null && (
              <List>
                {node.children.map(child => (
                  <li dangerouslySetInnerHTML={{ __html: titled(child) }} key={child.id} />
                ))}
              </List>
            )}
          </div>
        ))}
        <Pills pills={skills} where='main' />
      </div>
    </div>
  );
};
