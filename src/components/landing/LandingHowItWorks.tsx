import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Search, AlertTriangle, Mail, Sparkles } from 'lucide-react';

const processSteps = [
  { icon: Upload, title: 'Upload Your Invoice', description: 'Drop your courier CSV or Excel file. We support all major formats from Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, and Ekart.', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Search, title: 'System Finds Every Overcharge', description: 'Our platform compares every shipment against your rate card. Weight mismatches, zone errors, RTO overcharges — nothing slips through.', color: 'text-secondary', bg: 'bg-secondary/10' },
  { icon: AlertTriangle, title: 'Generate Dispute Emails', description: 'One-click auto-generated dispute emails tailored to each courier and discrepancy type.', color: 'text-warning', bg: 'bg-warning/10' },
  { icon: Mail, title: 'You Get Your Money Back', description: 'We generate dispute emails ready to send. Track recoveries in real-time. Average clients recover ₹2-5 lakhs in the first quarter.', color: 'text-success', bg: 'bg-success/10' },
];

export default function LandingHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep((p) => (p + 1) % 4), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Simple 4-Step Process
          </div>
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">From Invoice Upload to Recovery</h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">Our system handles the complex analysis while you focus on your business</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-3">
            {processSteps.map((step, i) => (
              <button
                key={step.title}
                onClick={() => setActiveStep(i)}
                aria-label={`Step ${i + 1}: ${step.title}`}
                className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                  activeStep === i ? 'border-primary/30 bg-primary/5 shadow-card-hover' : 'border-border bg-card hover:border-primary/20 hover:bg-muted/30'
                }`}
              >
                <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${activeStep === i ? 'bg-primary/15' : step.bg}`}>
                  <step.icon className={`h-5 w-5 ${activeStep === i ? 'text-primary' : step.color}`} />
                </div>
                <div>
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
                  </div>
                  <div className="font-semibold text-foreground">{step.title}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {processSteps[activeStep].title}
            </div>
            <div className="p-6 min-h-[220px] flex flex-col justify-center">
              {activeStep === 0 && (
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Drag &amp; drop your CSV file</div>
                    <div className="text-sm text-muted-foreground">Supports Delhivery, Blue Dart, DTDC, and more</div>
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div className="flex flex-col gap-3">
                  {['Checking weight data', 'Validating zone classifications', 'Comparing rate cards', 'Detecting RTO errors'].map((task, i) => (
                    <div key={task} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                      <span className="text-sm font-medium text-foreground">{task}</span>
                      <div className="ml-auto h-1.5 flex-1 max-w-24 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60 animate-pulse" style={{ width: `${[85, 70, 90, 65][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeStep === 2 && (
                <div className="flex flex-col gap-3">
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>AWB Number</span><span>Error Type</span><span>Est. Overcharge</span>
                  </div>
                  {[
                    { awb: 'DEL789456', type: 'Weight', amount: '₹245', color: 'text-warning bg-warning/10' },
                    { awb: 'BD456123', type: 'Zone', amount: '₹180', color: 'text-secondary bg-secondary/10' },
                    { awb: 'XB321654', type: 'RTO', amount: '₹320', color: 'text-destructive bg-destructive/10' },
                  ].map((item) => (
                    <div key={item.awb} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                      <span className="font-mono text-sm font-medium text-foreground">{item.awb}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.color}`}>{item.type}</span>
                      <span className="font-semibold text-foreground">{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispute Email Draft</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">Subject: Billing Discrepancy — AWB DEL789456</div>
                    <div className="mt-1 text-xs text-muted-foreground">Dear Support Team, We have identified a billing discrepancy on the above shipment. The charged weight (2.5 kg) exceeds the actual volumetric weight (1.8 kg)...</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="hero" className="flex-1 gap-1.5 shimmer-btn">
                      <Mail className="h-3.5 w-3.5" /> Ready to Send
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">Edit Draft</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}