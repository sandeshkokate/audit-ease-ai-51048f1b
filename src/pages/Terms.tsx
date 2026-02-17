import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-card-hover">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">AuditEase AI</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground text-sm mt-1">Last updated: February 2026</p>
          </CardHeader>

          <CardContent className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing or using AuditEase AI's services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2. Service Description</h2>
              <p>AuditEase AI provides an AI-powered logistics billing audit platform that detects courier overcharges, generates dispute communications, and tracks recoveries for e-commerce businesses.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">3. User Responsibilities</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate shipment and billing data.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">4. Fees & Payment</h2>
              <p>Our fees are based on a percentage of the recovered amount as outlined in your service agreement. Payment terms will be specified in your individual contract.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Limitation of Liability</h2>
              <p>AuditEase AI shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the fees paid by you in the preceding twelve months.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">6. Governing Law</h2>
              <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">7. Contact</h2>
              <p>For questions regarding these Terms, contact us at <a href="mailto:legal@auditease.com" className="text-primary hover:underline">legal@auditease.com</a>.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
