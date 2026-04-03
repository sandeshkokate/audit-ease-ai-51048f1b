import { Search, Mail, BarChart3, FileSpreadsheet, RefreshCw, PieChart } from 'lucide-react';

const features = [
  { icon: Search, title: 'Smart Detection', description: 'Catch weight discrepancies, zone mismatches & RTO overcharges that cost you ₹2-5 per shipment — automatically.', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Mail, title: 'Dispute Email Templates', description: "Professional dispute email templates tailored to each courier's preferred format — ready to send.", color: 'text-secondary', bg: 'bg-secondary/10' },
  { icon: BarChart3, title: 'Real-time Dashboard', description: 'Recover 8-15% of your shipping spend — that\'s ₹50K-5L/month for most businesses. Track it all in real-time.', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: FileSpreadsheet, title: 'Multi-Courier Support', description: 'Works with Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, and more.', color: 'text-success', bg: 'bg-success/10' },
  { icon: RefreshCw, title: 'Automated Reconciliation', description: 'Stop your ops team from spending 20+ hours/month on Excel reconciliation. We automate credit note matching.', color: 'text-warning', bg: 'bg-warning/10' },
  { icon: PieChart, title: 'Detailed Reports', description: 'Comprehensive analytics on courier performance, error patterns, and recovery trends.', color: 'text-secondary', bg: 'bg-secondary/10' },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="relative bg-muted/30 py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Everything You Need to Recover Lost Revenue</h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">Powerful features built specifically for Indian e-commerce logistics</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
