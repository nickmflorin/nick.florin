import { type JSX } from 'react';

import { InlineLink } from '~/components/buttons';
import { Description } from '~/components/typography';
import { DescriptionGroup } from '~/features/projects/components/DescriptionGroup';
import { Project, type ProjectProps } from '~/features/projects/components/Project';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';

export interface ToolTrackProps extends Omit<ProjectProps, 'children' | 'description' | 'title'> {}

export const ToolTrack = (props: ToolTrackProps): JSX.Element => (
  <Project
    description={
      <DescriptionGroup>
        <Description>
          ToolTrack is a{' '}
          <InlineLink element='a' href='https://nextjs.org/'>
            NextJS
          </InlineLink>{' '}
          application that lets users monitor, manage and configure the notifications they receive
          about inventory and price changes for products offered by the woodworking hand tool
          manufacturer{' '}
          <InlineLink element='a' href='https://lie-nielsen.com/'>
            Lie-Nielsen
          </InlineLink>
          .
        </Description>
        <Description>
          The application works by scraping publicly available data from the company&apos;s website
          at regular intervals and using that data to detect when inventory or prices change.
        </Description>
      </DescriptionGroup>
    }
    title={props.project.name}
    {...props}
  >
    <Section hasMarginBottom={false} title='Background'>
      <DescriptionGroup>
        <Description>
          As a woodworker myself, I am deeply involved in the woodworking community. I have a strong
          interest in hand tools, particularly hand planes, chisels and saws, and in how they can be
          used to create strong, beautiful joints in furniture.
        </Description>
        <Description>
          Before World War II, the highest quality hand tools were made in the United States by
          Stanley (now Stanley Black & Decker). Those tools were so well regarded that collectors
          now search the globe for old Stanley hand planes, and some of the rarer ones are worth a
          fortune. After the war, though, the quality of Stanley&apos;s tools dropped off
          significantly, and there was no leading manufacturer of high quality hand tools until the
          1980s, when a man named Thomas Lie-Nielsen began producing them.
        </Description>
        <Description>
          Today,{' '}
          <InlineLink element='a' href='https://lie-nielsen.com/'>
            Lie-Nielsen
          </InlineLink>{' '}
          is widely considered the best manufacturer of North American-style hand tools in the
          world, and their beautiful, perfectly made tools are sought after by woodworkers across
          the globe.
        </Description>
      </DescriptionGroup>
    </Section>
    <Section hasMarginBottom={false} title='The Problem'>
      <DescriptionGroup>
        <Description>
          Buying tools from{' '}
          <InlineLink element='a' href='https://lie-nielsen.com/'>
            Lie-Nielsen
          </InlineLink>{' '}
          can be difficult. The company, located in Maine, is small, somewhat intentionally so, and
          large portions of its inventory are made in small batches that sell out within hours of
          release. The company also occasionally produces small batches of very rare, custom tools
          that it never intends to make again, often out of less common materials such as white
          bronze, with handles or knobs made of exotic woods.
        </Description>
        <Description>
          That scarcity is what motivated this application: it gives users immediate notifications
          when new products are added, inventory changes or prices are updated.
        </Description>
      </DescriptionGroup>
    </Section>
    <Section hasMarginBottom={false} title='Internal Component Library'>
      <DescriptionGroup>
        <Description>
          Like this website, the application does not rely on a third-party component library.
          Instead, it uses an internal component library built with{' '}
          <InlineLink element='a' href='https://sass-lang.com/'>
            SASS
          </InlineLink>{' '}
          and{' '}
          <InlineLink element='a' href='https://tailwindcss.com/'>
            TailwindCSS
          </InlineLink>
          , along with tooling libraries such as{' '}
          <InlineLink element='a' href='https://floating-ui.com/'>
            Floating UI
          </InlineLink>{' '}
          and{' '}
          <InlineLink element='a' href='https://www.framer.com/motion/'>
            Framer Motion
          </InlineLink>
          .
        </Description>
      </DescriptionGroup>
    </Section>
    <Section hasMarginBottom={false} title='Subscribing to Events'>
      <Description>
        Users can subscribe to events for any specific product on{' '}
        <InlineLink element='a' href='https://lie-nielsen.com/'>
          Lie-Nielsen
        </InlineLink>
        &apos;s website. Currently, these include changes to a product&apos;s price and changes to
        its inventory status (&quot;In Stock&quot;, &quot;Out of Stock&quot; and so on).
      </Description>
      <Description>
        The application scrapes the company&apos;s website at regular intervals, and when it notices
        a change in the data, it adds an event to a queue. When the event is processed, a
        notification is sent to each subscribed user.
      </Description>
      <ProjectImage
        alt='Subscribing to Products'
        caption={[
          "Users can browse every product listed on the company's website and subscribe to " +
            'notifications for the events they care about.',
        ]}
        src='/projects/tooltrack/subscribing-to-products.png'
      />
    </Section>
    <Section hasMarginBottom={false} title='Managing Subscriptions'>
      <Description>
        Users can see all of their active product subscriptions in a centralized view, where they
        can modify them, disable them temporarily or unsubscribe from them entirely.
      </Description>
      <ProjectImage
        alt='Managing Subscriptions'
        caption={[
          "Subscriptions to all of the company's products can be managed in a centralized view.",
        ]}
        src='/projects/tooltrack/managing-subscriptions.png'
      />
    </Section>
    <Section hasMarginBottom={false} title='Product Detail'>
      <Description>
        Each product has a detail view with more information about the product itself, the
        user&apos;s subscriptions to it and its historical data.
      </Description>
      <ProjectImage
        alt='Product Detail'
        caption={[
          'The product detail view, where users can see historical data, manage their ' +
            'subscriptions and find current information for each product the company offers.',
        ]}
        src='/projects/tooltrack/product-detail.png'
      />
    </Section>
  </Project>
);
