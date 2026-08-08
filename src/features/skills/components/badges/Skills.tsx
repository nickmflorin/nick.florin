'use client';
import { type JSX } from 'react';

import { clamp } from 'lodash-es';

import { type Skill } from '~/database/model';

import {
  BadgeCollection,
  type BadgeCollectionChildrenProps,
} from '~/components/badges/BadgeCollection';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';

import { SkillBadge } from './SkillBadge';

export interface SkillsProps extends Omit<
  BadgeCollectionChildrenProps,
  'children' | 'maximumBadges'
> {
  readonly skills: Pick<Skill, 'id' | 'label' | 'prioritized'>[];
}

export const Skills = ({ skills, ...props }: SkillsProps): JSX.Element => {
  const { ids, open } = useDrawers();
  return (
    <BadgeCollection
      {...props}
      data={[...skills.filter(sk => sk.prioritized), ...skills.filter(sk => !sk.prioritized)]}
      maximumBadges={{
        '0:300': clamp(skills.filter(sk => sk.prioritized).length, 4, 8),
        '300:500': clamp(skills.filter(sk => sk.prioritized).length, 6, 14),
        '500:700': 20,
        '700:inf': Infinity,
      }}
    >
      {skill => (
        <SkillBadge
          key={skill.id}
          onClick={() => open(ids.VIEW_SKILL, { skillId: skill.id })}
          skill={skill}
        />
      )}
    </BadgeCollection>
  );
};
