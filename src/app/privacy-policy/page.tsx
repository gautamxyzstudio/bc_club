import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import React from "react";

const page = () => {
  return (
    <section className="my-25 max-w-6xl mx-auto w-full md:px-13 px-6 xl:space-y-15 space md:text-lg text-base">
      <Heading
        tagType="h1"
        type={IHeadingTypes.heading48}
        content="Privacy Policy"
        customClasses="text-center"
      />
      <div className="xl:xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="1. Introduction & Territorial Scope"
        />
        <div className="space-y-3">
          <p>
            Welcome to{" "}
            <a
              href="https://bcrealestatemarket.com/"
              className="text-blue-600 underline"
              target="_blank"
            >
              bcrealestatemarket.com
            </a>{" "}
            (the “Website” or “Platform”). We deeply value your privacy and the
            trust you place in us. This Privacy Policy transparently outlines
            our practices related to the collection, use, protection, and
            responsible disclosure of your personal information, ensuring your
            privacy rights are respected and protected.
          </p>
          <p>
            This Platform operates strictly within Canada and is uniquely built
            for residents browsing or tracking properties across British
            Columbia. We are fully dedicated to complying with the{" "}
            <i>Personal Information Protection Act</i>(PIPA) of British
            Columbia, the{" "}
            <i>Personal Information Protection and Electronic Documents Act</i>
            (PIPEDA) of Canada, and local real estate board regulatory
            guidelines.
          </p>
          <p>
            By accessing, creating an account, or using the Website, you
            acknowledge that you have read, understood, and explicitly agree to
            the terms outlined in this Privacy Policy. For disputes specifically
            related to privacy concerns, we aim for amicable resolutions.
            However, if an agreement cannot be reached, disputes will be
            resolved exclusively through final and binding arbitration in the
            City of Vancouver, BC, as detailed in our Terms of Use.
          </p>
        </div>
      </div>

      <div className="xl:xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="2. Definition of Personal Information"
        />

        <p>
          “Personal Information” means any information that identifies, relates
          to, describes, is reasonably capable of being associated with, or
          could reasonably be linked, directly or indirectly, with a specific
          individual. It does not include anonymized, de-identified, or
          aggregated market data that cannot be traced back to a specific
          person.
        </p>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="3. Information We Collect"
        />
        <div className="space-y-3">
          <p>
            To provide a high-utility provincial property intelligence engine,
            we collect info through three primary pathways:
          </p>
          <ul className="list-disc ml-7 space-y-2">
            <li>
              <strong>A. Information You Provide Directly:</strong> During
              mandatory registration to view historical market analytics,
              property boundaries, or sold data, you voluntarily provide your
              first and last name, phone number, and email address.
            </li>
            <li>
              <strong>B. Automatically Collected Information:</strong> While you
              navigate the platform, our database automatically logs your IP
              address, browser type, device specifications, operating system,
              access times, page views, search history, and tracking behavior.
              We also utilize cookies, tracking pixels, and secure system logs
              to monitor system health and detect data misuse.
            </li>
            <li>
              <strong>C. Public and Authorized Data Sources:</strong> We
              securely integrate public datasets, localized municipal
              registries, and provincial mapping systems to display property
              attributes.
            </li>
          </ul>
        </div>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="4. How We Use Your Information"
        />
        <p>
          We leverage your personal information to operate your account and
          protect our underlying data assets through the following methods:
        </p>
        <ul className="list-disc list-outside ml-7 space-y-2">
          <li>
            Providing you with uninhibited access to historical sold data,
            precise parcel metrics, and custom school catchment mapping.
          </li>
          <li>
            Responding to your direct inquiries, property search requests, or
            technical support tickets.
          </li>
          <li>
            Evaluating API call frequencies and user behavior to detect,
            prevent, and legally prosecute unauthorized commercial data scraping
            or systematic redistribution.
          </li>
          <li>
            Sending you essential transactional communications, account
            verification updates, and periodic market updates in which you have
            expressed interest.
          </li>
          <li>
            Personalizing and measuring advertising campaigns on third-party
            platforms (such as suppressing platform ads to users who already
            possess an active account, or showing relevant neighborhood trends
            to our active community).
          </li>
        </ul>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="5. Sharing Your Information & Real Estate Board Auditing"
        />
        <div className="space-y-3">
          <p>
            We are the sole owners of the information collected on this site. We
            will never sell or rent your personal information to anyone. Your
            information is only shared under the following specific parameters:
          </p>
          <ul className="list-disc ml-7 space-y-2">
            <li>
              <strong>Mandatory Board Audits & Compliance:</strong> By creating
              an account to view protected real estate metrics or historical
              sold listings, you provide your explicit consent for your
              registration data and contact information to be shared securely
              with regional real estate boards (including Greater Vancouver
              REALTORS®, Fraser Valley Real Estate Board, Chilliwack and
              District Real Estate Board, and Vancouver Island Real Estate
              Board) and their legal representatives for auditing, monitoring,
              and structural enforcement of VOW rules.
            </li>
            <li>
              <strong>Professional Transactional Facilitation:</strong> Where
              you explicitly request assistance, your information may be shared
              with your chosen real estate lawyer, mortgage professional, or our
              immediate advisory team to help fulfill your property transaction.
            </li>
            <li>
              <strong>Legal Authorities:</strong> We will disclose your
              information where legally forced to do so by court order,
              provincial regulations, or to protect the safety, structural
              integrity, and intellectual property rights of the Platform.
            </li>
          </ul>
        </div>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="6. Targeted Advertising Platforms (Matched Audiences)"
        />
        <div className="space-y-3">
          <p>
            We may share securely hashed (one-way SHA-256) versions of your
            email address or mobile phone number with third-party advertising
            platforms, including Google Ads (Customer Match) and Meta (Custom
            Audiences), for the strict purposes of:
          </p>
          <ol className="list-decimal list-outside ml-9 space-y-2">
            <li>
              Showing you relevant real estate updates on those platforms.
            </li>
            <li>
              Suppressing platform ads to users who already maintain an active
              account on{" "}
              <a
                href="https://bcrealestatemarket.com/"
                className="text-blue-600 underline"
                target="_blank"
              >
                bcrealestatemarket.com
              </a>
            </li>
            <li>
              Building lookalike or similar audiences to reach prospective users
              who resemble our existing user base.
            </li>
          </ol>

          <p className="ml-4">
            <strong>Our Privacy Guard:</strong> Hashing is entirely one-way; the
            platforms cannot recover your raw email or phone number.
            Furthermore, we do not purchase contact info from data brokers, nor
            do we ever share your name, property preferences, search history, or
            browsing activity with these advertising networks. You can easily
            opt out of hashed audience sharing at any time by contacting our
            support team.
          </p>
        </div>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="7. Cookies, Pixels, and Third-Party Tracking Tools"
        />
        <p>
          We utilize cookies, web beacons, and advanced tracking pixels to
          analyze platform traffic and measure marketing performance. The
          third-party tools deployed on this platform include Google Analytics,
          Google Ads conversion tags, Microsoft Clarity, and the Meta Pixel.
        </p>
        <p>
          These integrations may log actions you take on the platform (such as
          account sign-ups, leads, or completed searches), your IP address, and
          device parameters. You can seamlessly manage, restrict, or block
          cookies at any time through your individual browser settings or via{" "}
          <i>AdChoices Canada</i>.
        </p>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="8. Your Access to and Control Over Information"
        />
        <p>
          You maintain complete control over your personal data. You can perform
          the following actions at any time by submitting a direct request to
          our administration team via email or phone:
        </p>
        <ul className="list-disc list-outside ml-9 space-y-1.5">
          <li>
            Review exactly what data our system has stored about you, if any.
          </li>
          <li>Change, update, or correct any personal data we have on file.</li>
          <li>
            Request the permanent deletion of your account and associated
            personal data (subject to real estate board regulatory
            data-retention audit windows).
          </li>
          <li>Opt out of any future marketing contacts from us.</li>
        </ul>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="9. Data Security & Encryption Safeguards"
        />
        <div className="space-y-2">
          <p>
            We take comprehensive technical and organizational precautions to
            protect your information both online and offline. Wherever our
            platform collects sensitive personal details or access credentials,
            that information is encrypted and securely transmitted to our
            servers using industry-standard Secure Sockets Layer (SSL) and
            Hypertext Transfer Protocol Secure (HTTPS) frameworks.
          </p>
          <p>
            Offline, access to personally identifiable information is strictly
            restricted to employees or system administrators who require the
            data to perform a specific, authorized function (such as customer
            service or database auditing). The physical servers and cloud
            containers housing our databases are maintained in a secure,
            firewalled environment.
          </p>
        </div>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="10. AI and Third-Party Model Context Protocol (MCP) Integrations"
        />
        <div className="space-y-3">
          <p>
            If you choose to interface with{" "}
            <a
              href="https://bcrealestatemarket.com/"
              className="text-blue-600 underline"
              target="_blank"
            >
              bcrealestatemarket.com
            </a>{" "}
            through an authorized, secure AI assistant utilizing a Model Context
            Protocol (MCP) server configuration deployed explicitly by the
            operators of this Platform, the following strict terms apply:
          </p>
          <ul className="list-disc list-outside ml-9 space-y-2">
            <li>
              <strong>Authentication Data:</strong> Upon authentication, we
              receive only your name and email address to authorize your access
              to protected data layers.
            </li>
            <li>
              <strong> No Conversation Logging:</strong> We do not collect, log,
              read, or have access to your personal text conversations with the
              AI assistant.{" "}
            </li>
            <li>
              <strong>No Model Training:</strong> Your data, search preferences,
              and credentials are never utilized to train third-party AI models.
            </li>
            <li>
              <strong>Request Performance Metrics:</strong> We collect only
              anonymized, aggregate request counts and system response times to
              monitor system performance and safeguard our databases against
              commercial automated scraping.
            </li>
          </ul>
        </div>
      </div>

      <div className="xl:space-y-4 space-y-2 xl:mb-10 mb-6">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading32}
          content="11. Corporate Operator Identity & Contact Information"
        />
        <p>
          This real estate property intelligence platform and its
          data-collection practices are operated and overseen exclusively by:
        </p>
        <p>
          <strong>Harjit Sidhu Personal Real Estate Corporation (PREC)</strong>
        </p>
        <p>
          Representing <strong>The Sidhu Team</strong> at{" "}
          <strong>Planet Group Realty Inc.</strong>
        </p>
        <p>
          <i>Office Location: Surrey, British Columbia, Canada</i>
        </p>
        <p>
          If you have any questions or concerns regarding this Privacy Policy,
          your personal data rights, or if you feel that the platform is not
          actively abiding by the terms outlined above, you must contact our
          Surrey administration team immediately:
        </p>
        {/* <ul className="list-disc list-outside ml-9 space-y-2">
          <li>
            <strong>Email: </strong>
            <a href="mailto:info@bcrealestatemarket.com">
              info@bcrealestatemarket.com
            </a>
          </li>
        </ul> */}
      </div>
    </section>
  );
};

export default page;
