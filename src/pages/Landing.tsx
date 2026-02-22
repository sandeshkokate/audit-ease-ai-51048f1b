import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Shield,
  ArrowRight,
  Upload,
  Search,
  AlertTriangle,
  Mail,
  IndianRupee,
  CheckCircle,
  TrendingUp,
  Clock,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  RefreshCw,
  Menu,
  X,
  Sparkles,
  Target,
  Calculator,
} from 'lucide-react';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // ROI Calculator state
  const [monthlyShipments, setMonthlyShipments] = useState(5000);
  const [avgShippingCost, setAvgShippingCost] = useState(80);

  // Industry-average based estimates (clearly labeled as estimates)
  const industryErrorRate = 0.12;
  const avgOverchargePercent = 0.15;
  const estimatedErrors = Math.round(monthlyShipments * industryErrorRate);
  const potentialOvercharge = Math.round(estimatedErrors * avgShippingCost * avgOverchargePercent);
  const annualPotential = potentialOvercharge * 12;

  const formatCurrency = (amount: number) =>
    amount >= 100000
      ? `₹${(amount / 100000).toFixed(1)}L`
      : `₹${amount.toLocaleString('en-IN')}`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(p => (p + 1) % 4), 3000);
    return () => clearInterval(interval);
  }, []);

  const processSteps = [
    {
      icon: Upload,
      title: 'Upload Invoice Data',
      description: 'Export your courier invoices and upload as CSV',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Search,
      title: 'System Audits Every Shipment',
      description: 'Each shipment is checked against your contracted rate cards',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: AlertTriangle,
      title: 'Discrepancies Flagged',
      description: 'Weight errors, zone mismatches and RTO overcharges identified',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      icon: Mail,
      title: 'Dispute & Track Recovery',
      description: 'Ready-made dispute emails and a recovery tracker',
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  const features = [
    {
      icon: Search,
      title: 'Smart Detection',
      description: 'Advanced algorithms check every shipment against your rate cards to spot discrepancies instantly.',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Mail,
      title: 'Dispute Email Templates',
      description: "Professional dispute email templates tailored to each courier's preferred format — ready to send.",
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: BarChart3,
      title: 'Real-time Dashboard',
      description: 'Track all disputes, recoveries, and courier performance trends in one clear dashboard.',
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: FileSpreadsheet,
      title: 'Multi-Courier Support',
      description: 'Works with Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, and more.',
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      icon: RefreshCw,
      title: 'Automated Reconciliation',
      description: 'Automatically match credit notes to disputes for complete, hassle-free reconciliation.',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      icon: PieChart,
      title: 'Detailed Reports',
      description: 'Comprehensive analytics on courier performance, error patterns, and recovery trends.',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
  ];

  const faqs = [
    {
      q: 'How does AuditEase detect billing discrepancies?',
      a: 'Our system analyses your shipment data against your courier rate cards, checking for weight mismatches (billed vs actual/volumetric weight), zone classification errors, RTO overcharges, and COD discrepancies. Any shipment where the billed amount exceeds the expected amount is flagged for review.',
    },
    {
      q: 'Which courier partners do you support?',
      a: 'We support all major Indian courier partners including Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, Ekart, and more. If your courier isn\'t listed, we can add support for them.',
    },
    {
      q: 'How long does it take to see results?',
      a: 'Once you upload your invoice data, our AI typically identifies discrepancies within minutes. Actual recovery timeline depends on courier response times — typically 48-72 hours.',
    },
    {
      q: 'What if I\'m not satisfied with the service?',
      a: 'Since you only pay a percentage of what we actually recover for you, there is no financial risk. If we don\'t recover anything, you don\'t pay anything.',
    },
    {
      q: 'Is my data secure?',
      a: 'All data is encrypted in transit and at rest. We only access shipment data required for auditing and never share your data with third parties.',
    },
    {
      q: 'Do I need to change my existing workflow?',
      a: 'No. Simply export your courier invoices as CSV files and upload them. You can continue using all your existing systems and processes.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      subtitle: 'Up to 5,000 shipments/month',
      rate: '15%',
      rateLabel: 'of recovered amount',
      features: ['Discrepancy detection', 'Dispute email templates', 'Basic dashboard', 'Email support'],
      cta: 'Get Started',
      featured: false,
    },
    {
      name: 'Growth',
      subtitle: '5,000 – 50,000 shipments/month',
      rate: '12%',
      rateLabel: 'of recovered amount',
      features: ['Everything in Starter', 'Priority support', 'Advanced analytics', 'Custom email templates', 'API access'],
      cta: 'Get Started',
      featured: true,
    },
    {
      name: 'Enterprise',
      subtitle: '50,000+ shipments/month',
      rate: 'Custom',
      rateLabel: 'tailored to your volume',
      features: ['Everything in Growth', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
      cta: 'Contact Sales',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card/95 shadow-card backdrop-blur-xl border-b border-border' : 'bg-transparent'}`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-button">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              AuditEase <span className="text-gradient">AI</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {[
              { href: '#how-it-works', label: 'How It Works' },
              { href: '#features', label: 'Features' },
              { href: '#calculator', label: 'Calculator' },
              { href: '#pricing', label: 'Pricing' },
            ].map(l => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/contact"><Button variant="hero" size="sm">Request Demo <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-foreground p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card px-4 py-4 md:hidden animate-fade-in">
            <div className="flex flex-col gap-3">
              {[
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#features', label: 'Features' },
                { href: '#calculator', label: 'Calculator' },
                { href: '#pricing', label: 'Pricing' },
              ].map(l => (
                <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full">Sign In</Button></Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}><Button variant="hero" className="w-full">Request Demo</Button></Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 md:py-36 gradient-hero">
        {/* Soft background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/6 blur-[100px]" />
          <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] rounded-full bg-secondary/6 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[80px]" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Left — copy */}
            <div className="text-center lg:text-left">
              {/* Launch badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary animate-fade-in-up" style={{ opacity: 0 }}>
                <Sparkles className="h-3.5 w-3.5" />
                Introducing AuditEase AI for Indian E-commerce
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
                Stop Overpaying on{' '}
                <span className="text-gradient">Courier Billing</span>
              </h1>

              {/* Sub */}
              <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
                What if I told you ₹12 out of every ₹100 you spend on shipping is an error — and we can prove it in 3 minutes with your data?
              </p>

              {/* CTAs */}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
                <Link to="/contact">
                  <Button variant="hero" size="lg" className="gap-2 px-8 py-6 text-base font-semibold shadow-button">
                    Request a Demo <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="hero-outline" size="lg" className="px-8 py-6 text-base font-semibold">
                    See How It Works
                  </Button>
                </a>
              </div>

            </div>

            {/* Right — mock dashboard */}
            <div className="relative mx-auto w-full max-w-lg animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
              {/* Browser chrome */}
              <div className="rounded-2xl border border-border bg-card shadow-card-hover overflow-hidden">
                {/* Chrome bar */}
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/50" />
                    <div className="h-3 w-3 rounded-full bg-warning/50" />
                    <div className="h-3 w-3 rounded-full bg-success/50" />
                  </div>
                  <div className="mx-auto flex h-6 items-center gap-1.5 rounded-md bg-background px-3 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    app.auditease.ai/dashboard
                  </div>
                </div>

                {/* Dashboard body */}
                <div className="p-5">
                  {/* Stat cards */}
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Orders Audited', value: '12,458', icon: FileSpreadsheet, color: 'text-primary', bg: 'bg-primary/10' },
                      { label: 'Discrepancies', value: '1,847', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
                      { label: 'Disputes Raised', value: '1,523', icon: Mail, color: 'text-secondary', bg: 'bg-secondary/10' },
                      { label: 'Recoverable', value: '₹4.2L*', icon: IndianRupee, color: 'text-success', bg: 'bg-success/10' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl border border-border bg-background p-3">
                        <div className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
                          <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                        </div>
                        <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mini bar chart */}
                  <div className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">Discrepancies by month (sample data)</div>
                    <div className="flex h-16 items-end gap-1">
                      {[30, 55, 40, 70, 50, 85, 65, 78, 55, 90, 72, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-primary/30 transition-all hover:bg-primary/60"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-center text-xs text-muted-foreground italic">* Illustrative sample data</p>
                </div>
              </div>

              {/* Floating notification chips */}
              <div className="absolute -left-4 top-12 animate-float" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-card-hover text-xs font-medium">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/15">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                  </div>
                  <div>
                    <div className="text-foreground">Weight Error Detected</div>
                    <div className="text-muted-foreground">AWB DEL789456</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-20 animate-float" style={{ animationDelay: '1500ms' }}>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-card-hover text-xs font-medium">
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

      {/* ── PROBLEM STATEMENT ───────────────────────────────── */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">The Hidden Cost of Courier Billing Errors</h2>
            <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
              Most e-commerce businesses don't realise they're losing money on every invoice
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Target,
                stat: '10–15%',
                title: 'Invoices Have Errors',
                desc: 'Industry studies show this is the average billing error rate across couriers',
                note: 'Source: Industry Research',
              },
              {
                icon: Clock,
                stat: '20+ hrs',
                title: 'Monthly Manual Effort',
                desc: 'Time spent by operations teams manually checking invoices for 10K shipments',
                note: 'Average for mid-size D2C brands',
              },
              {
                icon: TrendingUp,
                stat: '2–5%',
                title: 'Of Shipping Costs Lost',
                desc: 'Typical overpayment due to undetected billing errors — fully recoverable',
                note: 'Industry estimate',
              },
            ].map(item => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mb-1 text-3xl font-extrabold text-gradient">{item.stat}</div>
                <div className="mb-2 font-semibold text-foreground">{item.title}</div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                <p className="mt-2 text-xs italic text-muted-foreground/70">* {item.note}</p>
              </div>
            ))}
          </div>

          {/* Common error types */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            <h3 className="mb-5 text-lg font-semibold text-foreground">Common Billing Errors We Help You Catch</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { emoji: '⚖️', title: 'Weight Discrepancy', desc: 'Billed weight higher than actual or volumetric weight' },
                { emoji: '📍', title: 'Zone Mismatch', desc: 'Incorrect zone classification for the delivery location' },
                { emoji: '↩️', title: 'RTO Overcharge', desc: 'Return shipments billed at incorrect rates' },
                { emoji: '💵', title: 'COD Errors', desc: 'Incorrect cash-on-delivery handling fees charged' },
              ].map(e => (
                <div key={e.title} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <span className="text-2xl">{e.emoji}</span>
                  <div>
                    <div className="mb-0.5 font-medium text-foreground text-sm">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Simple 4-Step Process
            </div>
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">From Invoice Upload to Recovery</h2>
            <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
              Our system handles the complex analysis while you focus on your business
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Step buttons */}
            <div className="flex flex-col gap-3">
              {processSteps.map((step, i) => (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(i)}
                  className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                    activeStep === i
                      ? 'border-primary/30 bg-primary/5 shadow-card-hover'
                      : 'border-border bg-card hover:border-primary/20 hover:bg-muted/30'
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

            {/* Visual panel */}
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
                    ].map(item => (
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
                      <Button size="sm" variant="hero" className="flex-1 gap-1.5">
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

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Everything You Need to Recover Lost Revenue</h2>
            <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
              Powerful features built specifically for Indian e-commerce logistics
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
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

      {/* ── ROI CALCULATOR ──────────────────────────────────── */}
      <section id="calculator" className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
              <Calculator className="h-3.5 w-3.5" /> Savings Calculator
            </div>
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Estimate Your Potential Recovery</h2>
            <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
              Based on publicly available industry averages — not our own claims
            </p>
          </div>

          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Inputs */}
              <div className="border-b border-border p-6 md:border-b-0 md:border-r md:p-8">
                <h3 className="mb-6 font-semibold text-foreground">Your Shipping Volume</h3>

                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Monthly Shipments</label>
                    <span className="text-sm font-bold text-primary">{monthlyShipments.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min="500" max="50000" step="500"
                    value={monthlyShipments}
                    onChange={e => setMonthlyShipments(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>500</span><span>25,000</span><span>50,000</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Avg. Shipping Cost (₹)</label>
                    <span className="text-sm font-bold text-primary">₹{avgShippingCost}</span>
                  </div>
                  <input
                    type="range" min="30" max="200" step="5"
                    value={avgShippingCost}
                    onChange={e => setAvgShippingCost(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>₹30</span><span>₹100</span><span>₹200</span>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 border border-border p-4 text-xs text-muted-foreground">
                  <div className="mb-1 font-semibold text-foreground">How this is calculated:</div>
                  <ul className="space-y-0.5">
                    <li>• Industry avg. error rate: ~12%</li>
                    <li>• Avg. overcharge per error: ~15%</li>
                    <li>• These figures are industry estimates, not our guarantees</li>
                  </ul>
                </div>
              </div>

              {/* Results */}
              <div className="flex flex-col justify-center p-6 md:p-8">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Estimated Potential Recovery</h3>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Monthly Potential</div>
                    <div className="text-2xl font-extrabold text-gradient">{formatCurrency(potentialOvercharge)}</div>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Annual Potential</div>
                    <div className="text-2xl font-extrabold text-gradient">{formatCurrency(annualPotential)}</div>
                  </div>
                </div>

                <div className="mb-6 space-y-2 text-sm">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Est. errors/month</span>
                    <span className="font-semibold text-foreground">~{estimatedErrors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. overcharge per error</span>
                    <span className="font-semibold text-foreground">~₹{Math.round(avgShippingCost * avgOverchargePercent)}</span>
                  </div>
                </div>

                <Link to="/contact">
                  <Button variant="hero" className="w-full gap-2 shadow-button">
                    Get Detailed Analysis <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="mt-2 text-center text-xs text-muted-foreground">Free analysis • No commitment required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Simple Pricing
            </div>
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Pay Only When We Recover Your Money</h2>
            <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
              Minimal setup fees. No monthly commitments. Low risk.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {pricingPlans.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 transition-all duration-200 hover:-translate-y-0.5 ${
                  plan.featured
                    ? 'border-2 border-primary bg-card shadow-card-hover md:scale-105'
                    : 'border border-border bg-card shadow-card'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-xs font-bold tracking-wide text-primary-foreground shadow-button">
                    RECOMMENDED
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                </div>
                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${plan.featured ? 'text-gradient' : 'text-foreground'}`}>{plan.rate}</span>
                  <div className="text-sm text-muted-foreground">{plan.rateLabel}</div>
                </div>
                <ul className="mb-6 space-y-2.5 text-sm">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button variant={plan.featured ? 'hero' : 'outline'} className="w-full font-semibold">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="mx-auto max-w-3xl space-y-3">
            {faqs.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-6 shadow-card">
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="gradient-hero border-t border-border py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            Ready to Stop Overpaying on Shipping?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground md:text-lg">
            Get a free analysis of your courier invoices and see how much you could recover
          </p>
          <Link to="/contact">
            <Button variant="hero" size="lg" className="gap-2 px-10 py-6 text-base font-semibold shadow-button">
              Request a Demo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Free analysis • No commitment required • Results in 24 hours
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-border bg-card py-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">AuditEase AI</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI-powered courier billing audit platform for Indian e-commerce businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Product</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#calculator" className="hover:text-foreground transition-colors">Calculator</a></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Request Demo</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
            <span>© {new Date().getFullYear()} AuditEase AI. All rights reserved.</span>
            <span>Made with ❤️ in India 🇮🇳</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
