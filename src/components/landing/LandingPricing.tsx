import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, IndianRupee, Upload, Search, BadgePercent } from "lucide-react";

const setupFeatures = [
  "Complete platform onboarding & configuration",
  "Rate card setup for up to 6 couriers",
  "Courier CSV format mapping",
  "1 month free onboarding support",
  "Sample dispute email templates",
];

const commissionTiers = [
  {
    tier: "Starter",
    setup: "₹2,999",
    rate: "15%",
    volume: "Perfect for: New D2C brands, small online stores",
    description: "Ideal volume: 500–2,000 shipments/month",
    featured: false,
  },
  {
    tier: "Growth",
    setup: "₹6,999",
    rate: "10%",
    volume: "Perfect for: Growing sellers, mid-size banks & NBFCs",
    description: "Ideal volume: 2,000–10,000 shipments/month",
    featured: true,
  },
  {
    tier: "Enterprise",
    setup: "Custom",
    rate: "Flat annual fee",
    volume: "Perfect for: Large enterprises, 3PLs, financial institutions",
    description: "Ideal volume: 10,000+ shipments/month",
    featured: false,
  },
];

const billingSteps = [
  {
    step: "1",
    title: "Pay One-Time Setup Fee",
    description: "Starting from ₹2,999",
    icon: IndianRupee,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    step: "2",
    title: "Upload Courier Bills",
    description: "We audit every shipment",
    icon: Upload,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    step: "3",
    title: "Pay Only on Recovery",
    description: "Commission on recovered amount only",
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
            <BadgePercent className="h-3.5 w-3.5" /> Performance-Based
          </div>
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Simple, Performance-Based Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
            No monthly fees. Minimal setup costs. No risk. You pay a percentage only when money lands back in your account.
          </p>
        </div>

        {/* Setup Features + Commission Tiers */}
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
          {/* What's Included Card */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl border border-primary/30 bg-card p-6 shadow-card relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground whitespace-nowrap">
              Included in All Plans
            </div>
            <div className="mb-2 mt-2">
              <h3 className="text-lg font-bold text-foreground">What's Included</h3>
              <p className="text-xs text-muted-foreground">Every plan comes with full onboarding</p>
            </div>
            <ul className="mb-6 mt-4 flex-1 space-y-3">
              {setupFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/contact">
              <Button variant="hero" className="w-full gap-2 shimmer-btn">
                Get Started — Choose Your Plan <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Pricing Tiers */}
          <div className="lg:col-span-3 flex flex-col rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-6 py-4">
              <h3 className="text-lg font-bold text-foreground">Choose Your Plan</h3>
              <p className="text-xs text-muted-foreground">One-time setup + pay-as-you-recover commission</p>
            </div>
            <div className="flex-1 p-6 space-y-3">
              {commissionTiers.map((tier) => (
                <div
                  key={tier.tier}
                  className={`rounded-xl border p-4 transition-all ${
                    tier.featured ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{tier.tier}</span>
                        {tier.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                            <CheckCircle className="h-3 w-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{tier.description}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-extrabold text-gradient">{tier.setup}</div>
                      <div className="text-[11px] text-muted-foreground">one-time setup</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="text-xs text-muted-foreground">{tier.volume}</span>
                    <span className="text-sm font-bold text-foreground">
                      {tier.rate} <span className="text-xs font-normal text-muted-foreground">of recovered amount</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border bg-muted/30 px-6 py-5 text-center">
              <p className="text-sm font-semibold text-foreground">
                No recovery = No commission. It's that simple.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Recovery amounts vary by business. Results depend on courier mix, order volume, and rate card accuracy.
              </p>
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
