import {
  Shield,
  Mail,
  TrendingUp,
  Truck,
  BarChart3,
  Brain,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Detection',
    description: 'Our machine learning models analyze millions of data points to catch discrepancies humans miss.',
    large: true,
  },
  {
    icon: Shield,
    title: '98% Accuracy',
    description: 'Industry-leading detection rate across weight, zone, and RTO discrepancies.',
  },
  {
    icon: Mail,
    title: 'Smart Emails',
    description: "AI writes professional dispute emails tailored to each courier's format.",
  },
  {
    icon: BarChart3,
    title: 'Live Dashboard',
    description: 'Track disputes, recoveries, and courier performance in real-time.',
  },
  {
    icon: Truck,
    title: 'All Couriers Supported',
    description: 'Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax & more.',
    wide: true,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Powerful Features
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            Everything You Need to <span className="text-gradient">Recover Lost Revenue</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]">
          {/* Large card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 md:col-span-2 md:row-span-2">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-button">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">{features[0].title}</h3>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">{features[0].description}</p>

            {/* Mock dashboard */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <div className="h-2 w-2 rounded-full bg-warning" />
                <div className="h-2 w-2 rounded-full bg-success" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-24 rounded bg-primary/20" />
                  <div className="h-3 flex-1 rounded bg-muted" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-32 rounded bg-secondary/20" />
                  <div className="h-3 flex-1 rounded bg-muted" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-20 rounded bg-success/20" />
                  <div className="h-3 flex-1 rounded bg-muted" />
                </div>
              </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Smaller cards */}
          {features.slice(1, 4).map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary/20"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <feature.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}

          {/* Wide card */}
          <div className="flex items-center gap-6 rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 md:col-span-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl gradient-primary shadow-button">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-base font-bold text-foreground">{features[4].title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{features[4].description}</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-10 rounded-lg bg-muted/60 border border-border/50" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
