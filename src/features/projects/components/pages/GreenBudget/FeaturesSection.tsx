import { Description } from '~/components/typography';
import { Emphasize } from '~/features/projects/components/Emphasize';
import { Section } from '~/features/projects/components/Section';

import { ActualizationSection } from './ActualizationSection';
import { AttachmentsSection } from './AttachmentsSection';
import { ExportingSection } from './ExportingSection';
import { FringesSection } from './FringesSection';
import { IntelligentAutocompleteSection } from './IntelligentAutocompleteSection';
import { MarkupSection } from './MarkupSection';
import { MobileSection } from './MobileSection';
import { ReorderingSection } from './ReorderingSection';
import { SharingSection } from './SharingSection';
import { SubTotalingSection } from './SubTotalingSection';

export const FeaturesSection = () => (
  <Section hasMarginBottom={false} title='Features'>
    <Description>
      Even in its infancy, <Emphasize>GreenBudget</Emphasize> was packed with features that no other
      production budgeting tool on the market offered. Describing all of them here would be
      impractical, so what follows is a brief look at <i>some</i> of them.
    </Description>
    <ActualizationSection />
    <FringesSection />
    <SubTotalingSection />
    <ReorderingSection />
    <MarkupSection />
    <IntelligentAutocompleteSection />
    <AttachmentsSection />
    <ExportingSection />
    <SharingSection />
    <MobileSection />
  </Section>
);
