import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About BC Real Estate Market | Our Story",
  description:
    "Learn about BC Real Estate Market and explore property data, historical sales, neighbourhood insights, and housing trends across British Columbia.",
  keywords:
    "BC Real Estate, British Columbia Real Estate, Real Estate Market Trends, Housing Market BC, Property Prices BC, BC Housing Market Analysis, Real Estate Statistics BC, Vancouver Real Estate Trends, Toronto Real Estate Trends, Canadian Real Estate Market",
  robots: "index, follow",
  openGraph: {
    title: "About BC Real Estate Market | Our Story",
    description:
      "Learn about BC Real Estate Market and explore property data, historical sales, neighbourhood insights, and housing trends across British Columbia.",
    images: [
      {
        url: "https://bcrealestatemarket.com/BCRealEstateMarket.svg",
        width: 1200,
        height: 630,
        alt: "BC Real Estate | Homes, Condos & Townhouses for Sale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About BC Real Estate Market | Our Story",
    description:
      "Learn about BC Real Estate Market and explore property data, historical sales, neighbourhood insights, and housing trends across British Columbia.",
    images: ["https://bcrealestatemarket.com/BCRealEstateMarket.svg"],
  },
};
const page = () => {
  return (
    <section className="my-25 max-w-6xl mx-auto w-full md:px-9 px-6 xl:space-y-15 space md:text-lg text-base">
      <Heading
        tagType="h1"
        type={IHeadingTypes.heading48}
        content="Our Story"
        customClasses="text-center"
      />
      <div className="xl:xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="What We Do"
        />
        <div className="space-y-3">
          <p>
            <a
              href="https://bcrealestatemarket.com/"
              className="text-blue-600 underline"
              target="_blank"
            >
              bcrealestatemarket.com
            </a>{" "}
            is a property intelligence platform built specifically for British
            Columbia. Our mission is straightforward: replace the empty, generic
            real estate search bar with something far more useful - a
            province-wide property encyclopedia.
          </p>
          <p>
            We bring real transparency to BC real estate by pulling together the
            information that usually lives in a dozen disconnected places - land
            parcels, historical sold data, and local market insight - and
            organizing it into a single, intuitive dashboard. We don't just show
            you what's for sale today. We give you the depth you need to
            understand what a property is actually worth.
          </p>
        </div>
      </div>
      <div className="xl:xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="Why We Do It"
        />
        <div className="space-y-3">
          <p>
            Let's be honest: most real estate websites look exactly the same.
            They're digital billboards, designed to capture your phone number
            while handing you almost no real information in return. And when
            you're making one of the biggest financial decisions of your life,
            being sent off to stitch together data from five uncooperative
            government sites, school board pages, and outdated blogs isn't just
            inconvenient - it's exhausting.
          </p>
          <p>
            We don't think looking for a home should feel like a guessing game
            or a research project. We built{" "}
            <a
              href="https://bcrealestatemarket.com/"
              className="text-blue-600 underline"
              target="_blank"
            >
              bcrealestatemarket.com
            </a>{" "}
            because British Columbians deserve a convenient, all-in-one platform
            where complex property data is open, accessible, and easy to
            understand. We exist to put the power back where it belongs - with
            the buyers, sellers, and owners - so you can navigate the BC market
            with genuine confidence instead of crossed fingers.
          </p>
        </div>
      </div>
      <div className="xl:xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="How We Do It"
        />
        <div className="space-y-3">
          <p>
            We don't do generic. We build technology that solves real problems
            deeply, pairing serious backend data mapping with a clean,
            user-first interface - so everything you need finally sits under one
            umbrella:
          </p>
          <ul className="list-disc list-outside ml-9 space-y-2">
            <li>
              <strong>True market transparency.</strong> Instant access to
              historical sold prices, pricing history, and market trends across
              BC - the context that tells you whether a listing is a fair deal
              or wishful thinking.
            </li>
            <li>
              <strong>Granular property intelligence.</strong> Detailed parcel
              boundaries and flood plain data, plus deep filters that let you
              search the way you actually think - by the details that matter to
              you, not just price and bedrooms.
            </li>
            <li>
              <strong>Community-first context.</strong> Integrated school
              rankings and neighbourhood insight, so families can weigh the
              area, not just the house, and choose where to live with the full
              picture in hand.
            </li>
          </ul>
          <p>
            This is the platform we wished existed when we were the ones with
            too many tabs open. Now it does.
          </p>
        </div>
      </div>
      <div className="xl:xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="Who's Behind It"
        />
        <div className="space-y-3">
          <p>
            <a
              href="https://bcrealestatemarket.com/"
              className="text-blue-600 underline"
              target="_blank"
            >
              bcrealestatemarket.com
            </a>{" "}
            is built and backed by <strong>The Sidhu Team</strong> at{" "}
            <strong>Planet Group Realty Inc.</strong> - a group of working
            REALTORS® who know the BC market from the inside, not from a
            distance.
          </p>
          <p>
            That's the part most data platforms miss. Technology can hand you
            the full picture, but it takes a real professional to help you act
            on it - to price an offer, read a contract, and catch the quirk of a
            particular street that no dataset will ever capture. We built this
            platform to make you genuinely informed; the team is here to put
            that information to work, representing your interests and only
            yours, from first showing to final signature.
          </p>
          <p>
            Deep data on one side, real local expertise on the other. That's the
            whole idea - and it's why we don't think you should ever have to
            choose between the two.
          </p>
          <p>
            <strong>
              Explore the real BC market - all of it, in one place. And when
              you're ready, let The Sidhu Team take it from there.
            </strong>
          </p>
          <hr />
          <p>
            <i>
              <a
                href="https://bcrealestatemarket.com/"
                className="text-blue-600 underline"
                target="_blank"
              >
                bcrealestatemarket.com
              </a>{" "}
              - The Sidhu Team. Real estate services provided by Harjit Sidhu
              Personal Real Estate Corporation, Planet Group Realty Inc.
            </i>
          </p>
        </div>
      </div>
    </section>
  );
};

export default page;
