import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

const pricingPlans = [
  { name: 'Starter', subtitle: 'Up to 5,000 shipments/month', rate: '15%', rateLabel: 'of recovered amount', features: ['Discrepancy detection', 'Dispute email templates', 'Basic dashboard', 'Email support'], cta: 'Get Started', featured: false },
  { name: 'Growth', subtitle: '5,000 – 50,000 shipments/month', rate: '12%', rateLabel: 'of recovered amount', features: ['Everything in Starter', 'Priority support', 'Advanced analytics', 'Custom email templates', 'API access'], cta: 'Get Started', featured: true },
  { name: 'Enterprise', subtitle: '50,000+ shipments/month', rate: 'Custom', rateLabel: 'tailored to your volume', features: ['Everything in Growth', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'], cta: 'Contact Sales', featured: false },
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="relative bg-muted/30 py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Simple, Performance-Based Pricing</h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">You only pay when we recover money for you. No recovery, no charge.</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={`flex flex-col rounded-2xl border p-6 shadow-card transition-all duration-200 hover:shadow-card-hover ${plan.featured ? 'border-primary/30 bg-card relative' : 'border-border bg-card'}`}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gradient">{plan.rate}</span>
                <span className="ml-1 text-sm text-muted-foreground">{plan.rateLabel}</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/contact">
                <Button variant={plan.featured ? 'hero' : 'outline'} className="w-full gap-2">
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
