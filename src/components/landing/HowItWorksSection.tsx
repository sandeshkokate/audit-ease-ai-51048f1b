import { Upload, Search, Mail, IndianRupee, Layers } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload CSV',
    description: 'Export your courier invoices and upload to AuditEase',
  },
  {
    step: '02',
    icon: Search,
    title: 'AI Audits',
    description: 'Our AI scans every shipment for weight, zone & RTO errors',
  },
  {
    step: '03',
    icon: Mail,
    title: 'Auto Dispute',
    description: 'AI generates professional dispute emails ready to send',
  },
  {
    step: '04',
    icon: IndianRupee,
    title: 'Get Refunds',
    description: 'Track recoveries and credit notes in one dashboard',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative border-y border-border/50 bg-muted/30 py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Layers className="h-4 w-4" />
            Simple 4-Step Process
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            From Upload to Recovery in <span className="text-gradient">Days</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            Our AI handles the heavy lifting while you focus on growing your business.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.title} className="relative text-center">
              {index < 3 && (
                <div className="absolute right-0 top-12 hidden h-px w-8 translate-x-full bg-border lg:block" />
              )}

              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-primary/20">
                <div className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
                  {item.step}
                </div>
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary shadow-button">
                  <item.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
