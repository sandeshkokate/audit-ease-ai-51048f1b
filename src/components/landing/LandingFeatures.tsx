import { Search, Mail, BarChart3, PieChart } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Dashboard',
    description: 'Track all disputes, recoveries, and courier performance trends in one clear dashboard. See overcharge patterns, recovery rates, and pending actions at a glance.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    screenshotLabel: 'Dashboard Screenshot',
    alt: 'Courier billing audit dashboard with recovery charts and dispute tracking',
  },
  {
    icon: Search,
    title: 'Smart Discrepancy Detection',
    description: 'Advanced algorithms check every shipment against your rate cards to spot weight errors, zone mismatches, and RTO overcharges instantly.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    screenshotLabel: 'Audit Log Screenshot',
    alt: 'Shipping discrepancy detection table with weight and zone mismatch status badges',
  },
  {
    icon: Mail,
    title: 'AI Dispute Emails',
    description: "Professional dispute email templates tailored to each courier's preferred format — auto-filled with shipment data and ready to send in one click.",
    color: 'text-accent',
    bg: 'bg-accent/10',
    screenshotLabel: 'Dispute Email Screenshot',
    alt: 'AI-generated courier dispute email modal with shipment billing details',
  },
  {
    icon: PieChart,
    title: 'Detailed Reports & Analytics',
    description: 'Comprehensive analytics on courier performance, error patterns, recovery trends, and billing insights to help you negotiate better rates.',
    color: 'text-success',
    bg: 'bg-success/10',
    screenshotLabel: 'Reports Screenshot',
    alt: 'Courier audit reports page with recovery analytics and billing trend charts',
  },
];

function ScreenshotPlaceholder({ label, alt }: { label: string; alt: string }) {
  return (
    <div
      className="rounded-xl border border-border bg-muted/40 shadow-card overflow-hidden"
      role="img"
      aria-label={alt}
    >
      <div className="aspect-[16/10] flex items-center justify-center">
        <span className="text-sm font-medium text-muted-foreground/60 select-none">{label}</span>
      </div>
    </div>
  );
}

export default function LandingFeatures() {
  return (
    <section id="features" className="relative bg-muted/30 py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need to Recover Lost Revenue
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            Powerful features built specifically for Indian e-commerce logistics
          </p>
        </div>

        <div className="flex flex-col gap-20 md:gap-28">
          {features.map((f, i) => {
            const isReversed = i % 2 !== 0;
            return (
              <div
                key={f.title}
                className={`grid items-center gap-8 md:gap-14 lg:grid-cols-2 ${isReversed ? 'lg:[direction:rtl]' : ''}`}
              >
                {/* Text column */}
                <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>
                    <f.icon className={`h-5.5 w-5.5 ${f.color}`} />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                </div>

                {/* Screenshot placeholder */}
                <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
                  <ScreenshotPlaceholder label={f.screenshotLabel} alt={f.alt} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
