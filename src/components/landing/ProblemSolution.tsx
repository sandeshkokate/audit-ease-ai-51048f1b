import { AlertTriangle, XCircle, CheckCircle, TrendingUp } from 'lucide-react';

const withoutItems = [
  'Manual invoice checking takes 20+ hours/month',
  'Miss 80% of overcharges due to volume',
  'No leverage in courier negotiations',
  'Lost money = lost profit margin',
];

const withItems = [
  'Automated auditing in seconds',
  'Catch 98% of billing discrepancies',
  'AI-generated dispute emails',
  'Track recovery to completion',
];

export default function ProblemSolution() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" />
            The Hidden Problem
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            Couriers Overcharge You on <span className="text-gradient">15% of Shipments</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            Weight discrepancies, zone misclassification, RTO overcharges — they add up to lakhs every month.
          </p>
        </div>

        {/* Comparison */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {/* Without */}
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-destructive">
              Without AuditEase
            </div>
            <ul className="space-y-4">
              {withoutItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive/60" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl bg-destructive/10 p-4 text-center">
              <div className="text-2xl font-extrabold text-destructive">-₹4.2L</div>
              <div className="mt-1 text-xs text-muted-foreground">Average monthly loss (10K shipments)</div>
            </div>
          </div>

          {/* With */}
          <div className="rounded-2xl border border-success/20 bg-success/5 p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-success">
              With AuditEase AI
            </div>
            <ul className="space-y-4">
              {withItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl bg-success/10 p-4 text-center">
              <div className="text-2xl font-extrabold text-success">+₹3.8L</div>
              <div className="mt-1 text-xs text-muted-foreground">Average monthly recovery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
