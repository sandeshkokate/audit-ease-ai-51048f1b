import { Target, Clock, TrendingUp } from 'lucide-react';

export default function LandingProblem() {
  const stats = [
    { icon: Target, stat: '10–15%', title: 'Invoices Have Errors', desc: 'Industry studies show this is the average billing error rate across couriers', note: 'Source: Industry Research' },
    { icon: Clock, stat: '20+ hrs', title: 'Monthly Manual Effort', desc: 'Time spent by operations teams manually checking invoices for 10K shipments', note: 'Average for mid-size D2C brands' },
    { icon: TrendingUp, stat: '2–5%', title: 'Of Shipping Costs Lost', desc: 'Typical overpayment due to undetected billing errors — fully recoverable', note: 'Industry estimate' },
  ];

  const errorTypes = [
    { emoji: '⚖️', title: 'Weight Discrepancy', desc: 'Billed weight higher than actual or volumetric weight' },
    { emoji: '📍', title: 'Zone Mismatch', desc: 'Incorrect zone classification for the delivery location' },
    { emoji: '↩️', title: 'RTO Overcharge', desc: 'Return shipments billed at incorrect rates' },
    { emoji: '💵', title: 'COD Errors', desc: 'Incorrect cash-on-delivery handling fees charged' },
  ];

  return (
    <section className="relative bg-muted/30 py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">The Hidden Cost of Courier Billing Errors</h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">Most e-commerce businesses don't realise they're losing money on every invoice</p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="mb-1 text-3xl font-extrabold text-gradient">{item.stat}</div>
              <div className="mb-2 font-semibold text-foreground">{item.title}</div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
              <p className="mt-2 text-xs italic text-muted-foreground/70">* {item.note}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
          <h3 className="mb-5 text-lg font-semibold text-foreground">Common Billing Errors We Help You Catch</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {errorTypes.map((e) => (
              <div key={e.title} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <span className="text-2xl">{e.emoji}</span>
                <div>
                  <div className="mb-0.5 font-medium text-foreground text-sm">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
