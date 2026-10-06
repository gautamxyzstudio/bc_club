export interface GetInTouchLinkListProps {
  title: string;
  linkList: {
    label: string;
    href: string;
  }[];
}

export const saleBC: GetInTouchLinkListProps = {
  title: "Homes for Sale in BC",
  linkList: [
    {
      label: "Vancouver Homes for Sale",
      href: "/Homes For Sale in Vancouver",
    },
    {
      label: "Burnaby Homes for Sale",
      href: "/Homes For Sale in Burnaby",
    },
    {
      label: "Surrey Homes for Sale",
      href: "/Homes For Sale in Surrey",
    },
    {
      label: "Richmond Homes for Sale",
      href: "/Homes For Sale in Richmond",
    },
    {
      label: "Abbotsford Homes for Sale",
      href: "/Homes For Sale in Abbotsford",
    },
    {
      label: "Coquitlam Homes for Sale",
      href: "/Homes For Sale in Coquitlam",
    },
  ],
};

export const soldBC: GetInTouchLinkListProps = {
  title: "Recently Sold Homes in BC",
  linkList: [
    {
      label: "Vancouver Homes Sold",
      href: "/Homes Sold in Vancouver",
    },
    {
      label: "Abbotsford Homes Sold",
      href: "/Homes Sold in Abbotsford",
    },
    {
      label: "White Rock Homes Sold",
      href: "/Homes Sold in White Rock",
    },
    {
      label: "Maple Ridge Homes Sold",
      href: "/Homes Sold in Maple Ridge",
    },
  ],
};

export const realEstateBC: GetInTouchLinkListProps = {
  title: "More Homes for Sale in BC",
  linkList: [
    {
      label: "Langley Homes for Sale",
      href: "/Homes For Sale in Langley",
    },
    {
      label: "Delta Homes for Sale",
      href: "/Homes For Sale in Delta",
    },
    {
      label: "North Vancouver Homes for Sale",
      href: "/Homes For Sale in North Vancouver",
    },
    {
      label: "West Vancouver Homes for Sale",
      href: "/Homes For Sale in West Vancouver",
    },
    {
      label: "Port Coquitlam Homes for Sale",
      href: "/Homes For Sale in Port Coquitlam",
    },
    {
      label: "New Westminster Homes for Sale",
      href: "/Homes For Sale in New Westminster",
    },
    {
      label: "Chilliwack Homes for Sale",
      href: "/Homes For Sale in Chilliwack",
    },
  ],
};