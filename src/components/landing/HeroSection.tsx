import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Lock, Zap, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden section-dark pt-16">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary/15 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container relative mx-auto px-4 py-20 md:py-28 text-center">
        {/* Announcement badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Now serving 50,000+ shipments monthly
          <Sparkles className="h-3.5 w-3.5" />
        </div>

        {/* Main headline */}
        <h1 className="mb-8 text-5xl font-extrabold leading-[1.08] tracking-tight md:text-7xl lg:text-8xl animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
          <span className="section-dark-text">Stop Losing Money on</span>
          <br />
          <span className="text-gradient">Courier Overcharges</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed section-dark-muted md:text-xl animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          AI-powered audit platform that detects billing discrepancies,
          generates dispute emails, and recovers your money — automatically.
        </p>

        {/* Stats row */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-wrap items-center justify-center gap-8 md:gap-12 animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
          {[
            { value: '₹2.5Cr+', label: 'Recovered for clients' },
            { value: '15%', label: 'Avg. billing errors found' },
            { value: '72hrs', label: 'Avg. dispute resolution' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center">
              {i > 0 && <div className="hidden md:block absolute -left-6 h-8 w-px bg-[hsl(var(--section-dark-border))]" />}
              <div className="relative">
                <span className="text-3xl font-extrabold text-gradient md:text-4xl">{stat.value}</span>
              </div>
              <span className="mt-1 text-xs section-dark-muted">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: '500ms', opacity: 0 }}>
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

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm section-dark-muted animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-success" />
            SOC 2 Compliant
          </span>
          <span className="h-4 w-px bg-[hsl(var(--section-dark-border))]" />
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-success" />
            Bank-grade Security
          </span>
          <span className="h-4 w-px bg-[hsl(var(--section-dark-border))]" />
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-success" />
            99.9% Uptime
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <ChevronDown className="h-5 w-5 section-dark-muted animate-scroll-bounce" />
      </div>
    </section>
  );
}
