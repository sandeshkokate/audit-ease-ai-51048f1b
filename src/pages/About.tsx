import { Link } from 'react-router-dom';
import { ArrowRight, Package, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SEOHead from '@/components/shared/SEOHead';

const couriers = [
  'Delhivery', 'Blue Dart', 'DTDC', 'Ecom Express',
  'XpressBees', 'Shadowfax', 'Ekart',
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNav />

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-16 space-y-16">

          {/* Hero */}
          <header className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">About AuditEase AI</h1>
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
              Indian e-commerce businesses overpay courier partners by an estimated 10–15% on shipping charges. These discrepancies stem from weight mismatches between actual and billed weight, zone mismatches where shipments are charged for a farther zone than the actual destination, and RTO overcharges where return-to-origin shipments are billed at full forward rates.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Operations teams typically reconcile courier invoices manually using spreadsheets — a process that is time-consuming, error-prone, and often deprioritised as order volumes grow. The result: lakhs of rupees in recoverable overcharges go unclaimed every month.
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
              AuditEase AI automates the entire courier billing audit lifecycle. Upload your shipment CSV, and the platform instantly detects weight discrepancies, zone mismatches, and RTO overcharges. It then generates AI-powered dispute emails tailored to each courier and tracks recovery status — all from a single dashboard.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our performance-based pricing means you only pay when we save you money. There's no upfront cost, no long-term contracts — just measurable savings from day one.
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
              We support the major couriers covering approximately 85% of the Indian e-commerce logistics market.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {couriers.map((c) => (
                <Badge key={c} variant="secondary" className="px-4 py-2 text-sm font-medium">
                  {c}
                </Badge>
              ))}
            </div>
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
