export interface Startup {
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

export const startups: Startup[] = [
  {
    id: "paystack-ai",
    name: "PayStack AI",
    tagline: "AI-powered payment reconciliation for enterprises",
    logo: "💳",
    sector: "Fintech",
    stage: "Series A",
    fundingAsk: "₹25Cr",
    fundingAskNum: 250000000,
    revenueRange: "₹5-10Cr",
    growth: 142,
    fundingProgress: 68,
    founded: "2022",
    hq: "Mumbai, India",
    teamSize: 45,
    description: "PayStack AI revolutionizes how enterprises handle payment reconciliation using advanced machine learning algorithms. Our platform processes millions of transactions daily, reducing reconciliation time by 95%.",
    problem: "Traditional payment reconciliation is manual, error-prone, and time-consuming. Finance teams spend countless hours matching transactions, leading to delayed closings and increased operational costs.",
    solution: "Our AI engine automatically matches transactions across multiple payment gateways, banks, and accounting systems with 99.9% accuracy. Real-time dashboards provide instant visibility into cash flow.",
    team: [
      { name: "Arjun Mehta", role: "CEO & Co-founder", linkedin: "#" },
      { name: "Priya Sharma", role: "CTO & Co-founder", linkedin: "#" },
      { name: "Vikram Singh", role: "VP Engineering", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹8.2Cr ARR",
      users: "150+ Enterprises",
      runway: "18 months",
      mrr: "₹68L",
    },
    valuationHistory: [
      { date: "Jan 2023", value: 20 },
      { date: "Apr 2023", value: 35 },
      { date: "Jul 2023", value: 45 },
      { date: "Oct 2023", value: 65 },
      { date: "Jan 2024", value: 85 },
      { date: "Apr 2024", value: 110 },
    ],
    featured: true,
  },
  {
    id: "medisync",
    name: "MediSync",
    tagline: "Unified healthcare data platform",
    logo: "🏥",
    sector: "HealthTech",
    stage: "Seed",
    fundingAsk: "₹8Cr",
    fundingAskNum: 80000000,
    revenueRange: "₹1-3Cr",
    growth: 89,
    fundingProgress: 45,
    founded: "2023",
    hq: "Bangalore, India",
    teamSize: 22,
    description: "MediSync creates a unified healthcare data ecosystem, enabling seamless information exchange between hospitals, clinics, laboratories, and patients.",
    problem: "Healthcare data is fragmented across multiple systems, leading to poor patient outcomes, duplicate tests, and inefficient care coordination.",
    solution: "Our HIPAA-compliant platform aggregates patient data from any source, creating a comprehensive health record accessible by authorized providers.",
    team: [
      { name: "Dr. Ananya Reddy", role: "CEO & Founder", linkedin: "#" },
      { name: "Karthik Iyer", role: "CTO", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹2.1Cr ARR",
      users: "50+ Hospitals",
      runway: "14 months",
      mrr: "₹17.5L",
    },
    valuationHistory: [
      { date: "Jan 2024", value: 8 },
      { date: "Mar 2024", value: 12 },
      { date: "May 2024", value: 18 },
    ],
    featured: true,
  },
  {
    id: "learnverse",
    name: "LearnVerse",
    tagline: "Immersive VR learning experiences",
    logo: "🎓",
    sector: "EdTech",
    stage: "Pre-seed",
    fundingAsk: "₹3Cr",
    fundingAskNum: 30000000,
    revenueRange: "₹20-50L",
    growth: 215,
    fundingProgress: 30,
    founded: "2024",
    hq: "Delhi NCR, India",
    teamSize: 12,
    description: "LearnVerse transforms education through immersive VR experiences, making complex subjects tangible and engaging for students of all ages.",
    problem: "Traditional education struggles to engage digital-native students. Abstract concepts remain difficult to grasp, leading to poor retention and outcomes.",
    solution: "Our VR platform creates interactive 3D environments where students can explore everything from molecular structures to historical events firsthand.",
    team: [
      { name: "Rahul Gupta", role: "CEO & Founder", linkedin: "#" },
      { name: "Maya Krishnan", role: "Head of Product", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹35L ARR",
      users: "25 Schools",
      runway: "10 months",
      mrr: "₹2.9L",
    },
    valuationHistory: [
      { date: "Feb 2024", value: 3 },
      { date: "Apr 2024", value: 5 },
    ],
    featured: true,
  },
  {
    id: "cloudscale",
    name: "CloudScale",
    tagline: "Automated infrastructure optimization",
    logo: "☁️",
    sector: "SaaS",
    stage: "Series A",
    fundingAsk: "₹40Cr",
    fundingAskNum: 400000000,
    revenueRange: "₹12-18Cr",
    growth: 78,
    fundingProgress: 52,
    founded: "2021",
    hq: "Pune, India",
    teamSize: 68,
    description: "CloudScale helps companies reduce cloud infrastructure costs by up to 60% through intelligent workload optimization and automated resource management.",
    problem: "Cloud costs are spiraling out of control for most companies. Engineering teams lack visibility into spending and struggle to optimize resource utilization.",
    solution: "Our platform analyzes usage patterns, predicts demand, and automatically right-sizes infrastructure. One-click optimization saves companies millions annually.",
    team: [
      { name: "Sanjay Patel", role: "CEO & Co-founder", linkedin: "#" },
      { name: "Deepa Nair", role: "CTO & Co-founder", linkedin: "#" },
      { name: "Amit Joshi", role: "VP Sales", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹15.3Cr ARR",
      users: "200+ Companies",
      runway: "24 months",
      mrr: "₹1.27Cr",
    },
    valuationHistory: [
      { date: "Jan 2023", value: 40 },
      { date: "Jun 2023", value: 60 },
      { date: "Dec 2023", value: 90 },
      { date: "Jun 2024", value: 140 },
    ],
    featured: false,
  },
  {
    id: "quickkart",
    name: "QuickKart",
    tagline: "10-minute grocery delivery platform",
    logo: "🛒",
    sector: "E-commerce",
    stage: "Series B",
    fundingAsk: "₹80Cr",
    fundingAskNum: 800000000,
    revenueRange: "₹50-80Cr",
    growth: 156,
    fundingProgress: 75,
    founded: "2021",
    hq: "Hyderabad, India",
    teamSize: 450,
    description: "QuickKart delivers groceries and essentials in under 10 minutes through a network of dark stores strategically placed across major cities.",
    problem: "Traditional grocery shopping is time-consuming. Existing delivery services are slow, often taking hours or requiring advance scheduling.",
    solution: "Our hyperlocal dark store network, combined with AI-powered inventory management, enables lightning-fast delivery while maintaining profitability.",
    team: [
      { name: "Ravi Kumar", role: "CEO & Founder", linkedin: "#" },
      { name: "Sneha Agarwal", role: "COO", linkedin: "#" },
      { name: "Vivek Menon", role: "CTO", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹72Cr ARR",
      users: "2M+ Customers",
      runway: "18 months",
      mrr: "₹6Cr",
    },
    valuationHistory: [
      { date: "Jan 2023", value: 150 },
      { date: "Jun 2023", value: 220 },
      { date: "Dec 2023", value: 340 },
      { date: "Jun 2024", value: 480 },
    ],
    featured: true,
  },
  {
    id: "neuralworks",
    name: "NeuralWorks",
    tagline: "Enterprise AI model deployment platform",
    logo: "🧠",
    sector: "AI",
    stage: "Seed",
    fundingAsk: "₹12Cr",
    fundingAskNum: 120000000,
    revenueRange: "₹2-5Cr",
    growth: 320,
    fundingProgress: 40,
    founded: "2023",
    hq: "Chennai, India",
    teamSize: 28,
    description: "NeuralWorks simplifies AI model deployment for enterprises, reducing time-to-production from months to days with our managed MLOps platform.",
    problem: "Deploying ML models to production is complex and requires specialized expertise. Most models never make it past the proof-of-concept stage.",
    solution: "Our platform handles everything from model versioning to scaling to monitoring, enabling any team to deploy production-grade AI with minimal effort.",
    team: [
      { name: "Dr. Arun Subramanian", role: "CEO & Founder", linkedin: "#" },
      { name: "Kavitha Rajan", role: "VP Engineering", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹3.8Cr ARR",
      users: "80+ Enterprises",
      runway: "16 months",
      mrr: "₹31.7L",
    },
    valuationHistory: [
      { date: "Mar 2024", value: 15 },
      { date: "Jun 2024", value: 28 },
    ],
    featured: false,
  },
  {
    id: "greenpower",
    name: "GreenPower",
    tagline: "Smart solar energy management",
    logo: "⚡",
    sector: "CleanTech",
    stage: "Series A",
    fundingAsk: "₹35Cr",
    fundingAskNum: 350000000,
    revenueRange: "₹8-12Cr",
    growth: 95,
    fundingProgress: 60,
    founded: "2022",
    hq: "Ahmedabad, India",
    teamSize: 55,
    description: "GreenPower maximizes solar energy ROI for businesses through intelligent monitoring, predictive maintenance, and grid optimization.",
    problem: "Solar installations underperform by 20-30% due to poor monitoring, delayed maintenance, and suboptimal energy trading strategies.",
    solution: "Our IoT sensors and AI platform detect issues before they impact production, automatically optimize energy storage and grid selling for maximum returns.",
    team: [
      { name: "Nikhil Shah", role: "CEO & Co-founder", linkedin: "#" },
      { name: "Pooja Desai", role: "CTO & Co-founder", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹10.5Cr ARR",
      users: "300+ Sites",
      runway: "20 months",
      mrr: "₹87.5L",
    },
    valuationHistory: [
      { date: "Jun 2023", value: 25 },
      { date: "Dec 2023", value: 45 },
      { date: "Jun 2024", value: 75 },
    ],
    featured: false,
  },
  {
    id: "proptech-hub",
    name: "PropTech Hub",
    tagline: "AI-powered property management",
    logo: "🏢",
    sector: "SaaS",
    stage: "Seed",
    fundingAsk: "₹6Cr",
    fundingAskNum: 60000000,
    revenueRange: "₹80L-1.5Cr",
    growth: 180,
    fundingProgress: 55,
    founded: "2023",
    hq: "Kolkata, India",
    teamSize: 18,
    description: "PropTech Hub streamlines property management with AI-powered tenant screening, automated maintenance scheduling, and smart rent collection.",
    problem: "Property managers juggle multiple tools and manual processes, leading to missed payments, delayed maintenance, and tenant churn.",
    solution: "Our unified platform automates 80% of property management tasks, from lease signing to maintenance coordination to financial reporting.",
    team: [
      { name: "Sameer Roy", role: "CEO & Founder", linkedin: "#" },
      { name: "Anjali Bose", role: "Head of Product", linkedin: "#" },
    ],
    metrics: {
      revenue: "₹1.2Cr ARR",
      users: "5000+ Units",
      runway: "12 months",
      mrr: "₹10L",
    },
    valuationHistory: [
      { date: "Jan 2024", value: 5 },
      { date: "Apr 2024", value: 8 },
      { date: "Jul 2024", value: 12 },
    ],
    featured: false,
  },
]

export const sectors = [
  "Fintech",
  "HealthTech", 
  "EdTech",
  "SaaS",
  "E-commerce",
  "AI",
  "CleanTech",
]

export const stages = ["Pre-seed", "Seed", "Series A", "Series B"]

export const stats = {
  deployed: "₹500Cr+",
  startups: "120+",
  investors: "800+",
  sectors: "14",
}
