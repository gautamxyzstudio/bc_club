export interface LinkListProps {
  title: string;
  linkList: {
    label: string;
    href: string;
  }[];
}

export const citiesWeCover: LinkListProps = {
  title: "Cities We Cover",
  linkList: [
    {
      label: "Surrey, BC",
      href: "/surrey-bc",
    },
    {
      label: "Vancouver, BC",
      href: "/vancouver-bc",
    },
    {
      label: "Burnaby, BC",
      href: "/burnaby-bc",
    },
    {
      label: "Coquitlam, BC",
      href: "/coquitlam-bc",
    },
    {
      label: "Langley, BC",
      href: "/langley-bc",
    },
  ],
};

export const buyAndSell: LinkListProps = {
  title: "Buy & Sell",
  linkList: [
    {
      label: "Search Properties",
      href: "/search-properties",
    },
    {
      label: "List Your Property",
      href: "/list-your-property",
    },
    {
      label: "Home Estimation",
      href: "/home-estimation",
    },
    {
      label: "Neighborhood Insights",
      href: "/neighborhood-insights",
    },
    {
      label: "Compare Market Trends",
      href: "/market-trends",
    },
  ],
};

export const marketTrends: LinkListProps = {
  title: "Market Trends",
  linkList: [
    {
      label: "Detached Homes Statistics",
      href: "/Detached Homes Statistics",
    },
    {
      label: "Townhouse Statistics",
      href: "/Townhouse Statistics",
    },
    {
      label: "Condo / Apartment Statistics",
      href: "/Condo Apartment Statistics",
    },
    {
      label: "Monthly Sales Report",
      href: "/Monthly Sales Report",
    },
    {
      label: "Buyer vs Seller Market",
      href: "/Buyer vs Seller Market",
    },
  ],
};

export const contactUs: LinkListProps = {
  title: "Contact Us",
  linkList: [
    {
      label: "Contact Form",
      href: "/contact",
    },
    {
      label: "info@bcclub.com",
      href: "mailto:info@bcclub.com",
    },
    {
      label: "Support / Help Center",
      href: "/Support Help Center",
    },
    {
      label: "Live Chat",
      href: "/Live Chat",
    },
    {
      label: "FAQs",
      href: "/faqs",
    },
  ],
};

export const company: LinkListProps = {
  title: "Company",
  linkList: [
    {
      label: "About BCClub",
      href: "/about",
    },
    {
      label: "Our Story",
      href: "/our-story",
    },
    {
      label: "News & Articles",
      href: "/news-and-articles",
    },
    {
      label: "Privacy Policy",
      href: "/privacy-policy",
    },
    {
      label: "Terms & Conditions",
      href: "/terms-and-conditions",
    },
  ],
};
