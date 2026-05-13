import Link from "next/link"
import { ArrowRight, Search, TrendingUp, Users, Building2, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BusinessCard } from "@/components/business-card"
import { AuthAwareHeroAccess } from "@/components/auth-aware-hero-access"
import { businesses, featuredBusinessGroups, stats } from "@/lib/data"

export default function HomePage() {
  const featuredBusinesses = businesses.filter((s) => s.featured).slice(0, 4)

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative gradient-hero pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>
        
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance mb-6">
                Where Businesses Meet{" "}
                <span className="text-primary">Capital</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 text-pretty">
                Discover compelling businesses, review curated operating data, and back ventures built for durable growth. Irresistible brings premium deal flow into one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-12 px-6" asChild>
                  <Link href="/businesses">
                    <Search className="w-4 h-4 mr-2" />
                    Explore Businesses
                  </Link>
                </Button>
                <AuthAwareHeroAccess />
              </div>
            </div>

            {/* Right - Floating cards */}
            <div className="hidden lg:block relative h-[400px]">
              <div className="absolute top-0 right-0 w-[320px] rotate-3 transform hover:rotate-0 transition-transform duration-500">
                <div className="gradient-card rounded-xl border border-border p-5 shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-[#1E3A5F] text-[#60A5FA]">
                      Food & Beverages
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-[#3D1F5C] text-[#A78BFA]">
                      Series A
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">🧋</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Saffron Sips</h3>
                      <p className="text-sm text-muted-foreground">Premium ready-to-drink chai</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Growth</span>
                    <span className="text-[#10B981] font-semibold">+142%</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-24 right-20 w-[300px] -rotate-2 transform hover:rotate-0 transition-transform duration-500">
                <div className="gradient-card rounded-xl border border-border p-5 shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-[#14432A] text-[#34D399]">
                      Fashion & Retail
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-[#1E3A5F] text-[#60A5FA]">
                      Seed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">👗</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Threadline House</h3>
                      <p className="text-sm text-muted-foreground">Digitally native ethnicwear label</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Growth</span>
                    <span className="text-[#10B981] font-semibold">+89%</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-52 right-8 w-[280px] rotate-1 transform hover:rotate-0 transition-transform duration-500">
                <div className="gradient-card rounded-xl border border-border p-5 shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-[#3D1F5C] text-[#A78BFA]">
                      Laundromats
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-secondary text-muted-foreground">
                      Pre-seed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">🫧</div>
                    <div>
                      <h3 className="font-semibold text-foreground">Rinse Ritual</h3>
                      <p className="text-sm text-muted-foreground">Tech-enabled neighborhood laundromats</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Growth</span>
                    <span className="text-[#10B981] font-semibold">+215%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 md:py-16 border-y border-border bg-card">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums mb-1">{stats.deployed}</p>
              <p className="text-sm text-muted-foreground">Capital Deployed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums mb-1">{stats.businesses}</p>
              <p className="text-sm text-muted-foreground">Businesses Listed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums mb-1">{stats.investors}</p>
              <p className="text-sm text-muted-foreground">Active Investors</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums mb-1">{stats.categories}</p>
              <p className="text-sm text-muted-foreground">Featured Business Groups</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Featured Opportunities</h2>
              <p className="text-muted-foreground">Curated businesses from high-interest consumer and services categories</p>
            </div>
            <Button variant="ghost" className="hidden md:flex text-primary" asChild>
              <Link href="/businesses">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBusinesses.map((business) => (
              <BusinessCard key={business.id} {...business} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/businesses">
                View All Businesses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-card border-y border-border" id="about">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A streamlined process to connect you with high-potential investment opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line - desktop only */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-border" />
            
            {[
              { step: "01", title: "Discover", description: "Browse curated businesses across featured groups. Filter by stage, category, and growth metrics." },
              { step: "02", title: "Connect", description: "Express interest, access detailed financials, and connect directly with founders." },
              { step: "03", title: "Invest", description: "Complete due diligence with our data room and finalize investments securely." },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary mx-auto mb-6 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Groups */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Featured Business Groups</h2>
            <p className="text-muted-foreground">Start with the categories we want to lead with while keeping the platform open to more business types over time</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {featuredBusinessGroups.map((sector) => (
              <Link
                key={sector}
                href={`/businesses?sector=${encodeURIComponent(sector)}`}
                className="px-5 py-2.5 rounded-full border border-border bg-card text-foreground hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
              >
                {sector}
              </Link>
            ))}
            <Link
              href="/businesses"
              className="px-5 py-2.5 rounded-full border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              View All Businesses
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
