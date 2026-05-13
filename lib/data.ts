export interface Business {
  id: string
  name: string
  tagline: string
  logo: string
  sector: string
  stage: string
  fundingAsk: string
  fundingAskNum: number
  revenueRange: string
  growth: number
  fundingProgress: number
  founded: string
  hq: string
  teamSize: number
  description: string
  problem: string
  solution: string
  team: {
    name: string
    role: string
    image?: string
    linkedin?: string
  }[]
  metrics: {
    revenue: string
    users: string
    runway: string
    mrr: string
  }
  valuationHistory: {
    date: string
    value: number
  }[]
  featured: boolean
}

export const sectors = [
  "Food & Beverages",
  "Fashion & Retail",
  "Laundromats",
  "Pet Industry",
]

export const featuredBusinessGroups = [...sectors]

export const stages = ["Pre-seed", "Seed", "Series A", "Series B"]

export const stats = {
  deployed: "₹500Cr+",
  businesses: "120+",
  investors: "800+",
  categories: "4",
}

export const businesses: Business[] = [
  {
    id: "saffron-sips",
    name: "Saffron Sips",
    tagline: "Premium bottled chai and cold brew for modern retail shelves",
    logo: "🧋",
    sector: "Food & Beverages",
    stage: "Series A",
    fundingAsk: "₹18Cr",
    fundingAskNum: 180000000,
    revenueRange: "₹4-7Cr",
    growth: 118,
    fundingProgress: 62,
    founded: "2021",
    hq: "Mumbai, India",
    teamSize: 38,
    description:
      "Saffron Sips builds premium Indian beverage brands for modern trade, quick commerce, and corporate pantry programs.",
    problem:
      "Most heritage-inspired beverage brands struggle to scale beyond boutique distribution while maintaining quality and shelf consistency.",
    solution:
      "Saffron Sips combines central production, strong retail distribution, and data-led merchandising to scale repeatable beverage SKUs nationwide.",
    team: [
      { name: "Aarav Bedi", role: "CEO & Co-founder", linkedin: "#" },
      { name: "Nisha Kapoor", role: "COO & Co-founder", linkedin: "#" },
      { name: "Ritu Sharma", role: "Head of Retail Growth", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹5.4Cr ARR",
      users: "1,200+ Stores",
      runway: "20 months",
      mrr: "₹45L",
    },
    valuationHistory: [
      { date: "Jan 2023", value: 18 },
      { date: "Jul 2023", value: 28 },
      { date: "Jan 2024", value: 39 },
      { date: "Jul 2024", value: 54 },
    ],
    featured: true,
  },
  {
    id: "crumb-co",
    name: "Crumb & Co",
    tagline:
      "Fast-growing artisanal bakery chain with cloud-kitchen efficiency",
    logo: "🥐",
    sector: "Food & Beverages",
    stage: "Seed",
    fundingAsk: "₹7Cr",
    fundingAskNum: 70000000,
    revenueRange: "₹1-2Cr",
    growth: 86,
    fundingProgress: 41,
    founded: "2023",
    hq: "Bengaluru, India",
    teamSize: 19,
    description:
      "Crumb & Co operates neighborhood bakery cafes with centralized prep and strong delivery economics.",
    problem:
      "Independent bakeries face margin pressure from fragmented sourcing, uneven demand, and poor fulfillment systems.",
    solution:
      "Crumb & Co standardizes production, reduces wastage, and improves repeat demand through memberships, catering, and omnichannel delivery.",
    team: [
      { name: "Mihika Rao", role: "Founder & CEO", linkedin: "#" },
      { name: "Kabir Sethi", role: "Operations Lead", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹1.6Cr ARR",
      users: "48K Annual Orders",
      runway: "15 months",
      mrr: "₹13L",
    },
    valuationHistory: [
      { date: "Feb 2024", value: 5 },
      { date: "May 2024", value: 8 },
      { date: "Aug 2024", value: 12 },
    ],
    featured: false,
  },
  {
    id: "threadline-house",
    name: "Threadline House",
    tagline: "Digitally native ethnicwear label with high repeat purchase",
    logo: "👗",
    sector: "Fashion & Retail",
    stage: "Series A",
    fundingAsk: "₹22Cr",
    fundingAskNum: 220000000,
    revenueRange: "₹6-9Cr",
    growth: 132,
    fundingProgress: 57,
    founded: "2022",
    hq: "Jaipur, India",
    teamSize: 44,
    description:
      "Threadline House designs premium ethnicwear collections sold through D2C, marketplaces, and select experience stores.",
    problem:
      "Fashion brands often lose margin and demand visibility due to poor inventory planning and disconnected sales channels.",
    solution:
      "Threadline House runs small-batch drops, fast replenishment loops, and channel-aware merchandising to improve sell-through and cash cycles.",
    team: [
      { name: "Sara Malhotra", role: "CEO & Creative Director", linkedin: "#" },
      { name: "Dev Oberoi", role: "COO", linkedin: "#" },
      { name: "Tanvi Kulkarni", role: "Retail Partnerships", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹7.1Cr ARR",
      users: "95K Customers",
      runway: "18 months",
      mrr: "₹59L",
    },
    valuationHistory: [
      { date: "Jan 2023", value: 14 },
      { date: "Jul 2023", value: 24 },
      { date: "Jan 2024", value: 37 },
      { date: "Jul 2024", value: 52 },
    ],
    featured: true,
  },
  {
    id: "aisleone",
    name: "AisleOne",
    tagline:
      "Specialty retail chain for home, gifting, and seasonal merchandise",
    logo: "🛍️",
    sector: "Fashion & Retail",
    stage: "Seed",
    fundingAsk: "₹9Cr",
    fundingAskNum: 90000000,
    revenueRange: "₹2-4Cr",
    growth: 74,
    fundingProgress: 33,
    founded: "2023",
    hq: "Delhi NCR, India",
    teamSize: 24,
    description:
      "AisleOne operates compact high-turn retail stores blending home accents, festive gifting, and private-label accessories.",
    problem:
      "Offline specialty retail lacks reliable merchandising data, causing overstocks, markdowns, and low conversion from walk-ins.",
    solution:
      "AisleOne uses centralized assortment planning, private-label margins, and store-level analytics to improve inventory turns and conversion.",
    team: [
      { name: "Rohan Taneja", role: "Founder & CEO", linkedin: "#" },
      { name: "Megha Arora", role: "Merchandising Lead", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹2.8Cr ARR",
      users: "12 Stores",
      runway: "14 months",
      mrr: "₹23L",
    },
    valuationHistory: [
      { date: "Mar 2024", value: 6 },
      { date: "Jun 2024", value: 9 },
      { date: "Sep 2024", value: 13 },
    ],
    featured: false,
  },
  {
    id: "rinse-ritual",
    name: "Rinse Ritual",
    tagline: "Tech-enabled premium laundromat chain for urban neighborhoods",
    logo: "🫧",
    sector: "Laundromats",
    stage: "Series A",
    fundingAsk: "₹16Cr",
    fundingAskNum: 160000000,
    revenueRange: "₹3-6Cr",
    growth: 109,
    fundingProgress: 49,
    founded: "2022",
    hq: "Hyderabad, India",
    teamSize: 31,
    description:
      "Rinse Ritual runs branded laundromat stores with subscription plans, pick-up/drop, and machine utilization analytics.",
    problem:
      "Traditional laundromats remain operationally fragmented, with weak customer retention and poor visibility into throughput and service quality.",
    solution:
      "Rinse Ritual combines app-led convenience, standardized store operations, and subscription loyalty to create a scalable neighborhood services brand.",
    team: [
      { name: "Ishaan Verma", role: "CEO & Founder", linkedin: "#" },
      { name: "Pallavi Jain", role: "Head of Operations", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹4.4Cr ARR",
      users: "22K Subscribers",
      runway: "19 months",
      mrr: "₹36L",
    },
    valuationHistory: [
      { date: "Jan 2023", value: 12 },
      { date: "Aug 2023", value: 19 },
      { date: "Apr 2024", value: 28 },
      { date: "Sep 2024", value: 41 },
    ],
    featured: true,
  },
  {
    id: "spin-cycle-co",
    name: "Spin Cycle Co",
    tagline:
      "Compact laundromat franchise model for apartment-first catchments",
    logo: "🧺",
    sector: "Laundromats",
    stage: "Pre-seed",
    fundingAsk: "₹4Cr",
    fundingAskNum: 40000000,
    revenueRange: "₹60L-1.2Cr",
    growth: 68,
    fundingProgress: 27,
    founded: "2024",
    hq: "Pune, India",
    teamSize: 11,
    description:
      "Spin Cycle Co is building a franchise-ready laundromat format optimized for apartment clusters and gated communities.",
    problem:
      "Community laundry services are inconsistent, under-branded, and operationally difficult to monitor across micro-locations.",
    solution:
      "Spin Cycle Co offers compact store design, remote machine telemetry, and franchise dashboards that simplify rollout and service reliability.",
    team: [
      { name: "Anmol Khanna", role: "Founder", linkedin: "#" },
      { name: "Vidhi Suri", role: "Franchise Ops", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹82L ARR",
      users: "9 Pilot Locations",
      runway: "11 months",
      mrr: "₹6.8L",
    },
    valuationHistory: [
      { date: "Apr 2024", value: 3 },
      { date: "Jul 2024", value: 5 },
      { date: "Oct 2024", value: 8 },
    ],
    featured: false,
  },
  {
    id: "tailtrail",
    name: "TailTrail",
    tagline: "Subscription-led pet wellness, grooming, and essentials platform",
    logo: "🐾",
    sector: "Pet Industry",
    stage: "Series B",
    fundingAsk: "₹28Cr",
    fundingAskNum: 280000000,
    revenueRange: "₹10-14Cr",
    growth: 144,
    fundingProgress: 71,
    founded: "2021",
    hq: "Mumbai, India",
    teamSize: 63,
    description:
      "TailTrail serves pet parents through subscriptions, clinic partnerships, grooming centers, and a high-repeat essentials catalog.",
    problem:
      "Pet care spending is fragmented across grooming, nutrition, accessories, and care providers, limiting brand trust and recurring revenue.",
    solution:
      "TailTrail integrates recurring commerce, wellness reminders, and offline care fulfillment into one consumer pet ecosystem.",
    team: [
      { name: "Zoya Merchant", role: "CEO & Co-founder", linkedin: "#" },
      { name: "Harshad Vora", role: "COO & Co-founder", linkedin: "#" },
      { name: "Neeraj Bahl", role: "Growth Lead", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹11.8Cr ARR",
      users: "140K Pet Families",
      runway: "21 months",
      mrr: "₹98L",
    },
    valuationHistory: [
      { date: "Jan 2023", value: 30 },
      { date: "Jul 2023", value: 46 },
      { date: "Jan 2024", value: 63 },
      { date: "Sep 2024", value: 88 },
    ],
    featured: true,
  },
  {
    id: "paws-and-play",
    name: "Paws & Play",
    tagline:
      "Neighborhood pet retail and daycare brand with recurring memberships",
    logo: "🐶",
    sector: "Pet Industry",
    stage: "Seed",
    fundingAsk: "₹8Cr",
    fundingAskNum: 80000000,
    revenueRange: "₹1.5-3Cr",
    growth: 91,
    fundingProgress: 38,
    founded: "2023",
    hq: "Chennai, India",
    teamSize: 21,
    description:
      "Paws & Play combines pet retail, daycare, grooming, and weekend community events in neighborhood-first formats.",
    problem:
      "Pet parents often juggle multiple disconnected local providers for food, care, grooming, and boarding.",
    solution:
      "Paws & Play creates a trusted local pet-services brand with repeat visits, memberships, and higher-margin ancillary services.",
    team: [
      { name: "Ira Menon", role: "Founder & CEO", linkedin: "#" },
      { name: "Sarthak Nair", role: "Operations Head", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹2.2Cr ARR",
      users: "18K Members",
      runway: "13 months",
      mrr: "₹18L",
    },
    valuationHistory: [
      { date: "Feb 2024", value: 4 },
      { date: "Jun 2024", value: 7 },
      { date: "Oct 2024", value: 11 },
    ],
    featured: false,
  },
]
