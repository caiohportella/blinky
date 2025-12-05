import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavButtons } from "@/components/nav-buttons";
import {
  ArrowRight,
  BarChart3,
  Link2,
  Lock,
  Zap,
  Users,
  Globe,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <NavButtons />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-24 md:py-36 flex flex-col items-center text-center">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center rounded-full border-2 border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 fill-primary" />
            {"Shorten an URL in a blink of an eye!"}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-tight">
            Shorten Links, <br />
            <span className="text-primary relative inline-block">
              Expand Reach
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Create, manage, and track your links with a smile. Blinky makes URL shortening fun and powerful.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap pt-16">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 px-6 md:px-8 h-12 md:h-14 text-base md:text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                {"Start for free"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="px-6 md:px-8 h-12 md:h-14 text-base md:text-lg border-2">
                {"View Live Demo"}
              </Button>
            </Link>
          </div>
          
          <div className="pt-8 text-sm font-medium text-muted-foreground">
            {"✨ No credit card required • Free forever plan • Set up in minutes"}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/30 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <StatCard number="10M+" label="Links Shortened" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="50K+" label="Active Users" />
            <StatCard number="<50ms" label="Redirect Time" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
              {"Features that make you "}
              <span className="text-primary">wink</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {"Everything you need to create, manage, and analyze your links at scale."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Link2 className="w-6 h-6" />}
              title="Custom Short Links"
              description="Create branded short links with custom aliases. Make your URLs memorable and trustworthy."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Real-time Analytics"
              description="Track clicks, locations, devices, and referrers with detailed, real-time insights."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Lightning Fast"
              description="Built for speed with global CDN. Your links redirect in milliseconds with 99.9% uptime."
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Enterprise Security"
              description="End-to-end encryption and secure data handling. GDPR and CCPA compliant."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Team Collaboration"
              description="Share link collections, manage permissions, and collaborate seamlessly with your team."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Global Performance"
              description="Multiple data centers worldwide ensure fast redirects for your global audience."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-card rounded-[2.5rem] p-6 md:p-12 border-2 border-border shadow-xl relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
          
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
              {"Ready to start blinking?"}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {"Join 50,000+ developers and marketers who trust Blinky for their link management."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap relative z-10">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 px-6 md:px-8 h-12 text-lg rounded-full shadow-lg">
                {"Create your account"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="https://github.com/caiohportella/blinky" target="_blank">
              <Button size="lg" variant="outline" className="px-6 md:px-8 h-12 text-lg rounded-full border-2">
                {"Read Documentation"}
              </Button>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground pt-4 relative z-10">
            {"Get started in 2 minutes • No credit card required"}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-muted-foreground">
              <Link href="https://github.com/caiohportella/blinky" target="_blank" className="hover:text-primary transition-colors">Documentation</Link>
              <Link href="https://github.com/caiohportella/blinky" target="_blank" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="https://github.com/caiohportella/blinky" target="_blank" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="https://github.com/caiohportella/blinky" target="_blank" className="hover:text-primary transition-colors">Terms</Link>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              {`© ${new Date().getFullYear()} Blinky. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-6 md:p-8 rounded-3xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-2 p-4 rounded-2xl hover:bg-background/50 transition-colors">
      <div className="text-3xl md:text-5xl font-extrabold text-primary">{number}</div>
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}
