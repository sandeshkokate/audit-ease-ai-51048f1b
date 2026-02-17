import { Link } from 'react-router-dom';
import { ArrowRight, IndianRupee, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="container relative mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl animate-fade-in">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Billing Audit
            <IndianRupee className="h-4 w-4" />
          </div>

          <h1 className="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-7xl">
            Recover{' '}
            <span className="text-gradient">10–15%</span>
            <br className="hidden sm:block" />
            {' '}of Your Logistics Spend
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            AI-powered courier billing audit that detects overcharges, generates dispute emails, and tracks recoveries — all in one platform built for Indian e-commerce.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/contact">
              <Button variant="hero" size="lg" className="gap-2 text-base px-10 py-7 text-lg font-semibold">
                Schedule a Demo <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="hero-outline" size="lg" className="text-base px-10 py-7 text-lg font-semibold">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              No upfront costs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              Results in 48 hours
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              10+ couriers supported
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
