import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, IndianRupee, Upload, Search, BadgePercent } from "lucide-react";

const setupFeatures = [
  "Platform onboarding & configuration",
  "Rate card setup assistance",
  "Courier format mapping (up to 6 couriers)",
  "1 month free support",
];

const commissionTiers = [
  { tier: "Starter", rate: "10%", volume: "Up to ₹1L/month recovered", description: "Perfect for small D2C brands" },
  {
    tier: "Growth",
    rate: "8%",
    volume: "₹1L – ₹10L/month recovered",
    description: "For scaling e-commerce businesses",
    featured: true,
  },
  {
    tier: "Enterprise",
    rate: "Custom",
    volume: "₹10L+/month recovered",
    description: "Tailored for high-volume shippers",
  },
];

const billingSteps = [
  {
    step: "1",
    title: "Pay ₹6,999 Setup Fee",
    description: "One-time onboarding to configure your account",
    icon: IndianRupee,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    step: "2",
    title: "Upload Courier Bills",
    description: "We audit every shipment against your rate cards",
    icon: Upload,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    step: "3",
    title: "We Find Overcharges",
    description: "You pay % only on the recovered amount",
    icon: Search,
    color: "text-success",
    bg: "bg-success/10",
  },
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="relative bg-muted/30 py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
            <BadgePercent className="h-3.5 w-3.5" /> No Monthly Fee. Ever.
          </div>
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Pay Nothing Until We Recover Your Money
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
            One small setup fee. Zero subscription. We earn only when you earn.
          </p>
        </div>

        {/* Setup Fee Card + Commission Table */}
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
          {/* Setup Fee Card */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl border border-primary/30 bg-card p-6 shadow-card relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground whitespace-nowrap">
              One-Time Setup
            </div>
            <div className="mb-2 mt-2">
              <h3 className="text-lg font-bold text-foreground">Setup Fee</h3>
              <p className="text-xs text-muted-foreground">Everything you need to get started</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gradient">₹6,999</span>
              <span className="ml-1 text-sm text-muted-foreground">one-time</span>
            </div>
            <ul className="mb-6 flex-1 space-y-2.5">
              {setupFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/contact">
              <Button variant="hero" className="w-full gap-2">
                Get Started — ₹6,999 One-Time Setup <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Recovery Commission Table */}
          <div className="lg:col-span-3 flex flex-col rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-6 py-4">
              <h3 className="text-lg font-bold text-foreground">Recovery Commission</h3>
              <p className="text-xs text-muted-foreground">Pay-as-you-go — no monthly fees, no minimums</p>
            </div>
            <div className="flex-1 p-6 space-y-3">
              {commissionTiers.map((tier) => (
                <div
                  key={tier.tier}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                    tier.featured ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{tier.tier}</span>
                      {tier.featured && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{tier.description}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-extrabold text-gradient">{tier.rate}</div>
                    <div className="text-[11px] text-muted-foreground">{tier.volume}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border bg-muted/30 px-6 py-3 text-center text-xs text-muted-foreground">
              No recovery = No charge. It's that simple.
            </div>
          </div>
        </div>

        {/* How Billing Works */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h3 className="mb-8 text-center text-xl font-bold text-foreground md:text-2xl">How Billing Works</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {billingSteps.map((step, i) => (
              <div
                key={step.step}
                className="relative flex flex-col items-center text-center rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                {i < billingSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${step.bg}`}>
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Step {step.step}
                </div>
                <div className="font-semibold text-foreground">{step.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
