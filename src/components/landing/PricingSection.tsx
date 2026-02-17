import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    subtitle: 'Up to 5,000 shipments/month',
    rate: '15%',
    featured: false,
    items: ['AI discrepancy detection', 'Automated dispute emails', 'Basic dashboard'],
    cta: 'Get Started',
    ctaLink: '/contact',
  },
  {
    name: 'Growth',
    subtitle: '5,000 – 50,000 shipments/month',
    rate: '12%',
    featured: true,
    items: ['Everything in Starter', 'Priority support', 'Advanced analytics', 'Custom email templates'],
    cta: 'Get Started',
    ctaLink: '/contact',
  },
  {
    name: 'Enterprise',
    subtitle: '50,000+ shipments/month',
    rate: '10%',
    featured: false,
    items: ['Everything in Growth', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            No upfront costs. Pay only when you save money.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1 ${
                plan.featured
                  ? 'border-2 border-primary bg-card shadow-card-hover scale-[1.02]'
                  : 'border border-border/60 bg-card shadow-card'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-xs font-bold tracking-wide text-primary-foreground shadow-button">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{plan.subtitle}</p>

              <div className="mb-8">
                <span className={`text-5xl font-extrabold ${plan.featured ? 'text-primary' : 'text-foreground'}`}>
                  {plan.rate}
                </span>
                <p className="text-muted-foreground text-sm mt-1">of recovered amount</p>
              </div>

              <ul className="text-left space-y-3 mb-8 text-sm">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to={plan.ctaLink}>
                <Button
                  variant={plan.featured ? 'hero' : 'outline'}
                  className="w-full font-semibold"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
