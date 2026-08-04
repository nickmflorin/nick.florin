import { NodeType, type ResolvedNode, type ResolvedRole, TitleLayout } from '../data/types';
import { logo } from '../lib/assets';
import { formatDateRange, formatRoleLocation } from '../lib/formatters';

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
 * `Sheet`), so this component never decides what is published — only how it looks.
 */
export const Role = ({ role }: RoleProps) => {
  const { competencies, content, summary } = role.content;
  return (
    <div className='role'>
      <div className='role-logo'>
        {role.company.logoFileName === null ? null : (
          <img alt={role.company.name} src={logo(role.company.logoFileName)} />
        )}
      </div>
      <div className='role-body'>
        <p className='role-title'>{role.title}</p>
        <div className='role-company'>{role.company.name}</div>
        <div className='role-meta'>
          <span>{formatDateRange(role)}</span>
          <span>{formatRoleLocation(role)}</span>
        </div>
        {summary.map(node => (
          <p
            className='role-summary'
            dangerouslySetInnerHTML={{ __html: titled(node) }}
            key={node.slug}
          />
        ))}
        {toSections(content).map(({ list: List, node, prose }) => (
          <div className='sub' key={node.slug}>
            {node.title !== null && node.titleLayout === TitleLayout.Stacked ? (
              <h4 dangerouslySetInnerHTML={{ __html: node.title }} />
            ) : null}
            {prose === '' ? null : <p dangerouslySetInnerHTML={{ __html: prose }} />}
            {List === null ? null : (
              <List>
                {node.children.map(child => (
                  <li dangerouslySetInnerHTML={{ __html: titled(child) }} key={child.slug} />
                ))}
              </List>
            )}
          </div>
        ))}
        <Pills competencies={competencies} where='main' />
      </div>
    </div>
  );
};
