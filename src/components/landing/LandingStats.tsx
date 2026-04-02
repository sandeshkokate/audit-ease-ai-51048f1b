import { IndianRupee, Percent, RefreshCw, Weight } from 'lucide-react';

const stats = [
  {
    icon: IndianRupee,
    number: '₹3,500 Cr',
    label: 'Annual losses to Indian e-commerce',
    context: 'from courier billing errors',
  },
  {
    icon: Percent,
    number: '10-15%',
    label: 'Average shipping overcharge',
    context: 'across D2C brands',
  },
  {
    icon: RefreshCw,
    number: '30-40%',
    label: 'RTO rates in fashion',
    context: 'each return has billing risk',
  },
  {
    icon: Weight,
    number: '0.5 kg',
    label: 'Standard weight tolerance',
    context: 'often exceeded by couriers',
  },
];

export default function LandingStats() {
  return (
    <section
      aria-label="The courier billing problem in numbers"
      className="relative bg-muted/40 py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            The Courier Billing Problem
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            Indian e-commerce is leaking money through shipping overcharges
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.number}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-card"
            >
              <stat.icon className="mb-3 h-8 w-8 text-primary" aria-hidden="true" />
              <span className="text-3xl font-bold text-primary md:text-4xl">{stat.number}</span>
              <span className="mt-2 text-sm font-semibold text-foreground">{stat.label}</span>
              <span className="mt-1 text-xs text-muted-foreground">{stat.context}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}