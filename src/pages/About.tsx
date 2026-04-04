import { Link } from 'react-router-dom';
import { ArrowRight, Package, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SEOHead from '@/components/shared/SEOHead';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="About Us – AuditEase | Courier Billing Audit Platform"
        description="Learn how AuditEase helps Indian e-commerce businesses identify and recover courier billing discrepancies with automated audits."
        path="/about"
      />
      <LandingNav />

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-16 space-y-16">

          {/* Hero */}
          <header className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">About AuditEase</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Helping Indian e-commerce businesses stop overpaying their courier partners.
            </p>
          </header>

          <Separator />

          {/* The Problem */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-2xl font-semibold text-foreground">The Problem</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Indian e-commerce businesses sometimes face billing discrepancies in their courier invoices. Common issues include weight differences between actual and billed weight, zone classification variations, and RTO billing inconsistencies.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Operations teams typically reconcile courier invoices manually using spreadsheets — a process that is time-consuming and often deprioritised as order volumes grow. This means potential billing discrepancies may go unnoticed.
            </p>
          </section>

          <Separator />

          {/* Our Solution */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Our Solution</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              AuditEase automates the courier billing audit process. Upload your shipment CSV, and the platform identifies potential weight discrepancies, zone mismatches, and RTO billing issues. It then generates dispute email templates and helps you track dispute status — all from a single dashboard.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our performance-based pricing means you only pay when we help you recover money. There's no long-term contracts — just measurable savings from day one.
            </p>
          </section>

          <Separator />

          {/* What We Support */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">What We Support</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We support all major Indian courier partners. Simply upload your shipping data in CSV format — our system will automatically process and audit it.
            </p>
          </section>

          <Separator />

          {/* CTA */}
          <section className="rounded-2xl gradient-primary p-10 text-center space-y-4">
            <h2 className="text-2xl font-bold text-primary-foreground">Ready to stop overpaying?</h2>
            <p className="text-primary-foreground/80">Start auditing your courier bills in under 5 minutes.</p>
            <Link to="/contact">
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90 gap-2 mt-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
