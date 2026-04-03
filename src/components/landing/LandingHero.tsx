import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield, ArrowRight, Upload, AlertTriangle, Mail, IndianRupee,
  CheckCircle, FileSpreadsheet, Sparkles,
} from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 sm:pt-28 sm:pb-24 md:pt-36 md:pb-36">
      <div className="pointer-events-none absolute inset-0 gradient-mesh" />
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary animate-fade-in-up shadow-card" style={{ opacity: 0 }}>
              <Sparkles className="h-3.5 w-3.5" />
              Automated Courier Billing Audit for Indian Businesses
            </div>

            <h1 className="mb-6 text-3xl sm:text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-6xl animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
              Couriers Are Overcharging You.
              <br />
              <span className="text-gradient">We Get Your Money Back.</span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground lg:mx-0 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
              Helping D2C brands, e-commerce sellers, banks, NBFCs, and enterprises recover money from courier overcharges — inflated weights, wrong zones, hidden fees. AuditEase audits every invoice and recovers what's yours.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
              <Link to="/contact">
                <Button variant="hero" size="lg" className="gap-2 px-8 py-6 text-base font-semibold shadow-button hover:shadow-[0_6px_24px_0_hsl(245_58%_51%/0.4)] transition-shadow shimmer-btn">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="hero-outline" size="lg" className="px-8 py-6 text-base font-semibold hover:bg-primary/5 transition-colors shimmer-btn">
                  See How It Works
                </Button>
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-success" /> Minimal Signup fees — pay only when we recover</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-success" /> Works with Delhivery, Blue Dart, DTDC & 4 more</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-success" /> Average recovery: ₹8.50/shipment</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg animate-fade-in-up hidden sm:block" style={{ animationDelay: '300ms', opacity: 0 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-elevated overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border/50 bg-muted/40 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <div className="mx-auto flex h-6 items-center gap-1.5 rounded-md bg-background/80 px-3 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  app.auditease.ai/dashboard
                </div>
              </div>

              <div className="p-5 bg-gradient-to-b from-background/50 to-background">
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Orders Audited', value: '12,458', icon: FileSpreadsheet, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Discrepancies', value: '1,847', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
                    { label: 'Disputes Raised', value: '1,523', icon: Mail, color: 'text-secondary', bg: 'bg-secondary/10' },
                    { label: 'Recoverable', value: '₹4.2L*', icon: IndianRupee, color: 'text-success', bg: 'bg-success/10' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/50 bg-card/80 p-3 shadow-card hover:shadow-card-hover transition-shadow">
                      <div className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
                        <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                      </div>
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border/50 bg-card/80 p-3 shadow-card">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">Discrepancies by month (sample data)</div>
                  <div className="flex h-16 items-end gap-1">
                    {[30, 55, 40, 70, 50, 85, 65, 78, 55, 90, 72, 88].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary/20 transition-all hover:from-primary/70 hover:to-primary/40" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground italic">* Illustrative sample data</p>
              </div>
            </div>

            <div className="absolute -left-4 top-12 animate-float hidden lg:block" style={{ animationDelay: '500ms' }}>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 glass-card px-3 py-2 shadow-elevated text-xs font-medium">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/15">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                </div>
                <div>
                  <div className="text-foreground">Weight Error Detected</div>
                  <div className="text-muted-foreground">AWB DEL789456</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-20 animate-float hidden lg:block" style={{ animationDelay: '1500ms' }}>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 glass-card px-3 py-2 shadow-elevated text-xs font-medium">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15">
                  <CheckCircle className="h-3 w-3 text-success" />
                </div>
                <div>
                  <div className="text-foreground">Dispute Email Ready</div>
                  <div className="text-muted-foreground">Template draft</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}