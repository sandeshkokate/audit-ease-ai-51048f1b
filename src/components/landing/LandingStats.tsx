import { Percent, IndianRupee, Clock, Shield } from 'lucide-react';

const stats = [
  {
    icon: Percent,
    number: '10-15%',
    label: 'Average overcharge on courier invoices',
  },
  {
    icon: IndianRupee,
    number: '₹8.50',
    label: 'Average recovery per shipment',
  },
  {
    icon: Clock,
    number: '< 5 min',
    label: 'Time to upload and start audit',
  },
  {
    icon: Shield,
    number: '0%',
    label: 'What you pay if we don\'t recover',
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
            Indian businesses are leaking money through shipping overcharges
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}