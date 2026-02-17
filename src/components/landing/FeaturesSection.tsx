import {
  Shield,
  Mail,
  TrendingUp,
  Truck,
  FileSpreadsheet,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'AI-Powered Detection',
    description: 'Automatically detects weight, zone, and RTO discrepancies across all your courier invoices.',
  },
  {
    icon: Mail,
    title: 'One-Click Disputes',
    description: 'AI generates professional dispute emails with detailed reasoning and supporting data.',
  },
  {
    icon: TrendingUp,
    title: 'Recovery Tracking',
    description: 'Match credit notes, track recoveries, and see ROI in real-time dashboards.',
  },
  {
    icon: Truck,
    title: 'Multi-Courier Support',
    description: 'Works with Delhivery, BlueDart, DTDC, Ecom Express, Shadowfax, and more.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Detailed Reports',
    description: 'Download CSV reports for any date range, courier, or discrepancy type.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            Everything you need to{' '}
            <span className="text-gradient">stop overpaying</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            Powerful tools to audit, dispute, and recover courier billing errors.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border/60 bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-button">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
