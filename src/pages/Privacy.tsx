import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Privacy() {
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
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm mt-1">Last updated: February 2026</p>
          </CardHeader>

          <CardContent className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as your name, email address, company name, phone number, and shipment data when you use our services or request a demo.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send communications, and detect billing discrepancies in your logistics data.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">3. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">4. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with service providers who assist us in operating our platform, subject to confidentiality agreements.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us at privacy@auditease.com.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">6. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@auditease.com" className="text-primary hover:underline">privacy@auditease.com</a>.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
