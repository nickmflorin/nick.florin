import { Link } from "~/components/buttons";
import { Description } from "~/components/typography/Description";

import { Project, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";
import { ProjectImageWrapper } from "../ProjectImageWrapper";
import { Section } from "../Section";

export interface ToolTrackProps extends Omit<ProjectProps, "title" | "description" | "children"> {}

export const ToolTrack = (props: ToolTrackProps): JSX.Element => (
  <Project
    title={props.project.name}
    description={
      <div className="flex flex-col gap-[6px]">
        <Description>
          ToolTrack application written using&nbsp;
          <Link as="a" href="https://nextjs.org/">
            NextJS
          </Link>
          &nbsp; that allows users to monitor, manage and configure notifications and alerts that
          they will receive as it relates to inventory & price changes that occur for products
          offered by the woodworking hand tool manufacturer, &nbsp;
          <Link as="a" href="https://lie-nielsen.com/">
            Lie Nielsen
          </Link>
          .
        </Description>
        <Description>
          The application works by scraping publically available data from the company&apos;s
          website at regular intervals and then using this data to determine when changes to
          inventory and/or prices occur.
        </Description>
      </div>
    }
    {...props}
  >
    <Section title="Background" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          As a woodworker myself, I am deeply involved in the woodworking community. I have a strong
          interest in hand tools, particularly hand-planes, chisels and saws, and how they can be
          used to create strong, beautiful joints in furniture.
        </Description>
        <Description>
          Before World War 2, the highest quality hand tools were made in the United States, by the
          company Stanley (now Stanley Black & Decker). These tools were so sought after that
          collectors now search the globe for old Stanley hand-planes, causing some of the rarer
          tools the company produced to be worth a fortune. However, after the war, the quality of
          their tools dropped off significantly, and as a result, there was not a leading
          manufacturer of high quality hand tools until the 1980s - when a man named Thomas
          Lie-Nielsen started producing hand tools.
        </Description>
        <Description>
          Today, &nbsp;
          <Link as="a" href="https://lie-nielsen.com/">
            Lie Nielsen
          </Link>
          &nbsp; is considered by most to be the best manufacturer of North American-style hand
          tools in the world. Their beautiful, perfectly-made tools are sought after by woodworkers
          across the globe.
        </Description>
      </div>
    </Section>
    <Section title="The Problem" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          The problem that this application attempts to solve is that purchasing tools from&nbsp;
          <Link as="a" href="https://lie-nielsen.com/">
            Lie Nielsen
          </Link>
          &nbsp;can sometimes be difficult. The company itself - which is located in Maine, is very
          small - somewhat intentionally - and large portions of their inventory are made in small
          batches, released to the public only to be sold out within a matter of hours after they
          become available. Additionally, the company occasionally produces small batches of very
          rare, custom tools that they do not intend to make again. These tools are often made out
          of less common materials, such as white bronze, and they often have unique features such
          as handles and/or knobs made out of exotic woods.
        </Description>
        <Description>
          The difficulty in getting your hands on some&nbsp;
          <Link as="a" href="https://lie-nielsen.com/">
            Lie Nielsen
          </Link>
          &nbsp;tools has warranted the need for an application like this - one that allows users to
          receive immediate notifications when new products are added, inventory changes or prices
          are updated.
        </Description>
      </div>
    </Section>
    <Section title="Internal Component Library" marginBottom={false}>
      <div className="flex flex-col gap-[8px]">
        <Description>
          Like this website, this application does not rely on any third-party component library.
          Instead, it leverages an internal component library developed using frameworks like&nbsp;
          <Link as="a" href="https://sass-lang.com/">
            SASS
          </Link>
          &nbsp;and&nbsp;
          <Link as="a" href="https://tailwindcss.com/">
            TailwindCSS
          </Link>
          ,&nbsp;along with tooling libraries such as&nbsp;
          <Link as="a" href="https://floating-ui.com/">
            Floating UI
          </Link>
          &nbsp;and&nbsp;
          <Link as="a" href="https://www.framer.com/motion/">
            Framer Motion
          </Link>
          .
        </Description>
      </div>
    </Section>
    <Section title="Subscribing to Events" marginBottom={false}>
      <Description>
        This application was designed such that users can subscribe to various events that may occur
        as it relates to a specific product offered on&nbsp;
        <Link as="a" href="https://lie-nielsen.com/">
          Lie Nielsen
        </Link>
        &apos;s website. Currently, these events include subscribing to changes in price of a
        product or changes in inventory status of a product (i.e. &quot;In Stock&quot;, &quot;Out of
        Stock&quot;, etc.).
      </Description>
      <Description>
        The application scrapes the data from the company&apos;s website at regular intervals and
        when it notices a change in the data, it will add the appropriate event to a queue that will
        result in a notification being sent to the subscribed user when it is processed.
      </Description>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/tooltrack/subscribing-to-products.png"
          alt="Subscribing to Products"
          caption={[
            "Users can view all of the products listed on the company's website and subscribe to " +
              "receive notifications for various events that may occur for a given product.",
          ]}
        />
      </ProjectImageWrapper>
    </Section>
    <Section title="Managing Subscriptions" marginBottom={false}>
      <Description>
        Users can view all of their active product subscriptions in a centralized view. From this
        view, they can make changes to their active subscriptions, disable them temporarily or
        unsubscribe from them entirely.
      </Description>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/tooltrack/managing-subscriptions.png"
          alt="Managing Subscriptions"
          caption={[
            "Subscriptions to all products offered by the company can be managed in a " +
              "centralized view.",
          ]}
        />
      </ProjectImageWrapper>
    </Section>
    <Section title="Product Detail" marginBottom={false}>
      <Description>
        Users can get more detailed information about a specific product, their subscriptions to
        that product and historical data related to that product in the product&apos;s detail view.
      </Description>
      <ProjectImageWrapper className="mt-[8px]">
        <ProjectImage
          src="/projects/tooltrack/product-detail.png"
          alt="Product Detail"
          caption={[
            "Users can view historical data for, manage their subscriptions of and view " +
              "current up to date information for each product the company offers.",
          ]}
        />
      </ProjectImageWrapper>
    </Section>
  </Project>
);

export default ToolTrack;
