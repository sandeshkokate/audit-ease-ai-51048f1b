import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      {/* Soft background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

      <div className="container relative mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-semibold text-primary animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
            <Sparkles className="h-4 w-4" />
            AI-Powered Billing Audit
            <IndianRupee className="h-4 w-4" />
          </div>

          {/* Headline */}
          <h1 className="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-7xl animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
            Recover Up to{' '}
            <span className="text-gradient">10–15%</span>
            <br className="hidden sm:block" />
            {' '}of Your Logistics Spend
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
            Upload your courier invoices and let our AI detect overcharges, generate dispute emails, and help you track recoveries — all in one platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
            <Link to="/contact">
              <Button variant="hero" size="lg" className="gap-2 px-10 py-7 text-lg font-semibold">
                Schedule a Demo <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="hero-outline" size="lg" className="px-10 py-7 text-lg font-semibold">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Simple value props */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '500ms', opacity: 0 }}>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              No upfront costs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              Pay only on recovery
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              Multiple couriers supported
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
