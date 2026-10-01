export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  iconType: "music" | "property" | "tax" | "trends" | "agent";
  summary: string;
  content: string[];
}

export const QUICK_ARTICLES: HelpArticle[] = [
  {
    id: "presale-guide",
    title: "How to Buy Your First Presale Home in BC",
    category: "Buyer Guide",
    readTime: "5 min read",
    iconType: "property",
    summary: "Step-by-step walkthrough of deposits, rescission period, and completion dates in British Columbia.",
    content: [
      "Presale properties allow you to purchase a home before construction is completed. In British Columbia, this is governed under the Real Estate Development Marketing Act (REDMA).",
      "Key Benefits: Lock in today's price with a phased deposit (typically 10-20% spread over 12-18 months), brand new construction, and full 2-5-10 Home Warranty coverage.",
      "7-Day Rescission Period: BC law gives buyers a mandatory 7-day cooling-off period after receiving the Disclosure Statement to cancel the contract without penalty.",
      "Assignment Clauses: Ensure you understand if the developer permits assignments (selling your contract before completion) and the associated fees.",
    ],
  },
  {
    id: "bc-ptt-tax",
    title: "Understanding Property Transfer Tax (PTT) in BC",
    category: "Tax & Finance",
    readTime: "4 min read",
    iconType: "tax",
    summary: "Calculate standard PTT rates, First-Time Home Buyers exemption thresholds, and newly built home rebates.",
    content: [
      "When you purchase real estate in British Columbia, Property Transfer Tax (PTT) is paid upon registration at the Land Title Office.",
      "Standard PTT Rates: 1% on the first $200,000, 2% on the portion between $200,000 and $2,000,000, and 3% on the portion exceeding $2,000,000.",
      "First-Time Home Buyers Exemption: Eligible first-time buyers are exempt from PTT on qualifying homes with a fair market value up to $500,000 (with partial exemption up to $525,000 for standard, or up to $835,000 for qualifying newly built homes).",
      "Newly Built Home Exemption: Principal residences that are newly constructed under $1,100,000 may also qualify for substantial PTT exemptions.",
    ],
  },
  {
    id: "market-trends-2026",
    title: "BC & Vancouver Real Estate Market Trends",
    category: "Market Insights",
    readTime: "6 min read",
    iconType: "trends",
    summary: "Overview of benchmark prices, inventory levels, and interest rate impacts across Greater Vancouver & Fraser Valley.",
    content: [
      "The Greater Vancouver and Fraser Valley markets continue to exhibit strong demand in family townhomes and transit-oriented condo hubs (such as Brentwood, Metrotown, and Surrey Central).",
      "Single-family detached homes remain historically resilient with low active listings in premium pockets like West Vancouver, Vancouver West, and South Surrey.",
      "Key indicators to watch: Sales-to-Active Listings Ratio (balanced market between 12% and 20%), average days on market, and Bank of Canada overnight policy rates.",
    ],
  },
  {
    id: "agent-matching",
    title: "How BC Club Matches You With Top Local Specialists",
    category: "Support",
    readTime: "3 min read",
    iconType: "agent",
    summary: "Connect with neighborhood-specific experts across Vancouver, Burnaby, Richmond, Surrey & Kelowna.",
    content: [
      "BC Club provides verified market intelligence and connects you with licensed, high-performing REALTORS® tailored to your specific community and budget.",
      "Whether you're looking for presale VIP access, detached residential acreage, or high-yield investment condos, our advisors guide you from evaluation to final key handover.",
      "Schedule a free home estimation or 1-on-1 consultation directly through our website.",
    ],
  },
];

export const FREQUENT_QUESTIONS = [
  {
    q: "How does the home evaluation tool work on BC Club?",
    a: "Our evaluation model analyzes recent verified MLS® sales, active competitive listings, square footage, age, and neighborhood price trends to give you an accurate market valuation within minutes.",
  },
  {
    q: "Can I search foreclosures and court-ordered sales?",
    a: "Yes! BC Club includes specialized property categories including court-ordered sales, foreclosures, open houses, and recently sold records across British Columbia.",
  },
  {
    q: "How do I save properties and get price drop alerts?",
    a: "Click the heart icon on any property listing to add it to your Wishlist. Sign up or log in to receive instant email notifications whenever prices change or similar units hit the market.",
  },
  {
    q: "Are the property listings updated in real-time?",
    a: "Yes, our MLS® feed synchronizes regularly to provide the most up-to-date active listings, price revisions, and pending statuses across BC.",
  },
];
