import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Shield,
  Mail,
  TrendingUp,
  Truck,
  FileSpreadsheet,
  Upload,
  Search,
  SendHorizonal,
  IndianRupee,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';

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

const steps = [
  { icon: Upload, title: 'Upload CSV', description: 'Upload your courier billing CSV file' },
  { icon: Search, title: 'AI Detects', description: 'AI detects overcharges and discrepancies' },
  { icon: SendHorizonal, title: 'Send Disputes', description: 'Review and send dispute emails' },
  { icon: IndianRupee, title: 'Save Money', description: 'Track recoveries and save money' },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">
              AuditEase <span className="text-gradient">AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero" size="sm">Request Demo</Button>
            </Link>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-card p-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <Link to="/login"><Button variant="ghost" className="w-full">Log in</Button></Link>
              <Link to="/contact"><Button variant="hero" className="w-full">Request Demo</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <IndianRupee className="h-4 w-4" />
              Built for Indian E-commerce
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
              Recover 10-15% of Your Logistics Spend.{' '}
              <span className="text-gradient">Automatically.</span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              AI-powered courier billing audit that detects overcharges, generates dispute emails, and tracks recoveries — all in one platform.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact">
                <Button variant="hero" size="lg" className="gap-2 text-base px-8 py-6">
                  Schedule a Demo <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                  See How It Works
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Everything you need to <span className="text-gradient">stop overpaying</span>
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Powerful tools to audit, dispute, and recover courier billing errors.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 inline-flex rounded-lg gradient-primary p-3">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-y border-border bg-muted/50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              How it works
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Four simple steps to start recovering money.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-button">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                  Step {i + 1}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-8 translate-x-full bg-border lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground md:text-lg">
              No upfront costs. Pay only when you save money.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
              <h3 className="text-xl font-bold text-foreground mb-2">Starter</h3>
              <p className="text-muted-foreground text-sm mb-4">Up to 5,000 shipments/month</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold">15%</span>
                <p className="text-muted-foreground mt-1">of recovered amount</p>
              </div>
              <ul className="text-left space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />AI discrepancy detection</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Automated dispute emails</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Basic dashboard</li>
              </ul>
              <Link to="/contact"><Button variant="outline" className="w-full">Get Started</Button></Link>
            </div>

            {/* Growth - Featured */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 text-center shadow-card-hover relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Growth</h3>
              <p className="text-muted-foreground text-sm mb-4">5,000 - 50,000 shipments/month</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-primary">12%</span>
                <p className="text-muted-foreground mt-1">of recovered amount</p>
              </div>
              <ul className="text-left space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Everything in Starter</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Priority support</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Advanced analytics</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Custom email templates</li>
              </ul>
              <Link to="/contact"><Button variant="hero" className="w-full">Get Started</Button></Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise</h3>
              <p className="text-muted-foreground text-sm mb-4">50,000+ shipments/month</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold">10%</span>
                <p className="text-muted-foreground mt-1">of recovered amount</p>
              </div>
              <ul className="text-left space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Everything in Growth</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Dedicated account manager</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />Custom integrations</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />SLA guarantee</li>
              </ul>
              <Link to="/contact"><Button variant="outline" className="w-full">Contact Sales</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl rounded-2xl gradient-primary p-10 md:p-16 shadow-button">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to recover your logistics spend?
            </h2>
            <p className="mb-8 text-primary-foreground/80 md:text-lg">
              Start saving on your logistics costs today
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90 text-base px-8 py-6 gap-2">
                Contact Sales <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">AuditEase AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered logistics billing audit platform for Indian e-commerce businesses.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AuditEase AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
