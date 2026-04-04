import { AlertTriangle, Scale, MapPin, RotateCcw, Clock } from 'lucide-react';

export default function LandingProblem() {
  const stats = [
    { icon: AlertTriangle, stat: 'Common', title: 'Billing Discrepancies', desc: 'Weight, zone, and RTO billing errors occur frequently in high-volume shipping operations', note: 'Based on industry observations' },
    { icon: Clock, stat: '20+ hrs', title: 'Monthly Manual Effort', desc: 'Time operations teams spend manually checking invoices for 10K+ shipments', note: 'Varies by business size' },
    { icon: Scale, stat: 'Significant', title: 'Potential Savings', desc: 'Identifying and recovering billing discrepancies can meaningfully impact your bottom line', note: 'Results vary by business' },
  ];

  const errorTypes = [
    { emoji: '⚖️', title: 'Weight Discrepancy', desc: 'Billed weight differs from actual or volumetric weight' },
    { emoji: '📍', title: 'Zone Mismatch', desc: 'Delivery zone classification differs from expected' },
    { emoji: '↩️', title: 'RTO Billing', desc: 'Return shipments billed at unexpected rates' },
    { emoji: '📐', title: 'Dimension Errors', desc: 'Volumetric calculations that need verification' },
  ];

  return (
    <section className="relative bg-muted/30 py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="container mx-auto px-4">
        {/* Narrative block */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl leading-tight">
            Shipping invoices are complex.{' '}
            <span className="text-gradient">Billing discrepancies happen.</span>
          </h2>

          <div className="mx-auto max-w-2xl space-y-4 text-left text-base text-muted-foreground md:text-lg">
            <p className="flex items-start gap-2">
              <span className="mt-1 text-primary font-bold">→</span>
              <span>Your 1kg package? <strong className="text-foreground">Sometimes billed at a higher weight.</strong></span>
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-1 text-primary font-bold">→</span>
              <span>Mumbai to Pune? <strong className="text-foreground">Sometimes classified as a farther zone.</strong></span>
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-1 text-primary font-bold">→</span>
              <span>Customer refused delivery? <strong className="text-foreground">Return fees can be miscalculated.</strong></span>
            </p>
          </div>

          <p className="mt-8 text-lg font-semibold text-foreground md:text-xl">
            Whether these are system errors or process gaps — <span className="text-gradient">they add up.</span>
          </p>

          <p className="mt-4 text-base text-muted-foreground md:text-lg max-w-2xl mx-auto leading-relaxed">
            Most businesses don't have time to audit every invoice. The volumes are high, the data is messy. So potential discrepancies go unnoticed. ₹50 here, ₹200 there — it can add up over time.
          </p>
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
          <h3 className="mb-5 text-lg font-semibold text-foreground">Common Billing Discrepancies We Help You Identify</h3>
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
