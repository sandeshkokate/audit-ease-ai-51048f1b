import { Upload, Search, SendHorizonal, IndianRupee } from 'lucide-react';

const steps = [
  { icon: Upload, title: 'Upload CSV', description: 'Upload your courier billing CSV file in seconds' },
  { icon: Search, title: 'AI Detects', description: 'AI instantly detects overcharges and discrepancies' },
  { icon: SendHorizonal, title: 'Send Disputes', description: 'Review AI-generated dispute emails and send' },
  { icon: IndianRupee, title: 'Save Money', description: 'Track recoveries and watch savings grow' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative border-y border-border/50 bg-muted/30 py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            Four simple steps to savings
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            Start recovering money from courier overcharges in minutes.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="relative mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-button">
                <step.icon className="h-8 w-8 text-primary-foreground" />
                <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs font-bold text-primary border-2 border-primary">
                  {i + 1}
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

              {i < steps.length - 1 && (
                <div className="absolute right-0 top-10 hidden h-px w-8 translate-x-full bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
