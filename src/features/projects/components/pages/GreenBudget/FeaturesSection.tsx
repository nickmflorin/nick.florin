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
      Even when in its infancy, <Emphasize>GreenBudget</Emphasize> was packed with features that
      were not available in any other production budgeting tool on the market. It is impossible to
      describe each and every feature on this page - so the following represents a brief summary of
      just <i>some</i> of the features that were available.
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
