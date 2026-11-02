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
      label: "Vancouver, BC",
      href: "/properties?location=Vancouver",
    },
    {
      label: "Surrey, BC",
      href: "/properties?location=Surrey",
    },
    {
      label: "Burnaby, BC",
      href: "/properties?location=Burnaby",
    },
    {
      label: "Richmond, BC",
      href: "/properties?location=Richmond",
    },
    // {
    //   label: "Victoria, BC",
    //   href: "/properties?location=Victoria",
    // },
  ],
};

export const buyAndSell: LinkListProps = {
  title: "Buy & Sell",
  linkList: [
    {
      label: "Search Properties",
      href: "/properties",
    },
    {
      label: "List Your Property",
      href: "/wishlist",
    },
    {
      label: "Home Estimation",
      href: "/home-estimation",
    },
    {
      label: "Compare Market Trends",
      href: "/market-trends/monthly-sales-reports",
    },
  ],
};

export const marketTrends: LinkListProps = {
  title: "Market Trends",
  linkList: [
    {
      label: "Detached Homes Statistics",
      href: "/market-trends/monthly-sales-reports?propertyType=detached",
    },
    {
      label: "Townhouse Statistics",
      href: "/market-trends/monthly-sales-reports?propertyType=townhouse",
    },
    {
      label: "Condo / Apartment Statistics",
      href: "/market-trends/monthly-sales-reports?propertyType=apartment",
    },
    {
      label: "Monthly Sales Report",
      href: "/market-trends/monthly-sales-reports",
    },
    {
      label: "Buyer vs Seller Market",
      href: "/market-trends/monthly-sales-chart",
    },
  ],
};

export const contactUs: LinkListProps = {
  title: "Contact Us",
  linkList: [
    {
      label: "Contact Form",
      href: "/contact-us",
    },
    // {
    //   label: "info@bcclub.com",
    //   href: "mailto:info@bcclub.com",
    // },
    {
      label: "Support / Help Center",
      href: "/contact-us",
    },
  ],
};

export const company: LinkListProps = {
  title: "Company",
  linkList: [
    {
      label: "Our Story",
      href: "/our-story",
    },
    {
      label: "Our Blogs",
      href: "/blogs",
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
