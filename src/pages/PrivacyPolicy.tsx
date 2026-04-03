import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { Separator } from '@/components/ui/separator';
import SEOHead from '@/components/shared/SEOHead';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy – AuditEase"
        description="Learn how AuditEase collects, uses, and protects your shipment data. We never sell or share your courier billing data."
        path="/privacy-policy"
      />
      <LandingNav />

      <main className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

        <Separator className="my-8" />

        <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
          {/* 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>When you use AuditEase we may collect the following information:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Your name, email address, phone number, and company details provided during signup or contact form submissions.</li>
              <li>Courier shipment and billing data uploaded via CSV files for audit processing.</li>
              <li>Usage analytics data such as pages visited, feature usage patterns, and session duration.</li>
            </ul>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Data</h2>
            <p>
              Your shipment and billing data is processed solely to identify courier billing discrepancies, generate dispute emails, and track recoveries on your behalf.
            </p>
            <p className="font-medium text-foreground">
              We do not sell, rent, or share your courier billing data with any third party — ever.
            </p>
            <p>
              Contact information is used to communicate audit results, send invoices, and provide customer support.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Data Retention</h2>
            <p>
              Shipment and billing data uploaded to the platform is retained for a maximum of <strong className="text-foreground">24 months</strong> from the date of upload.
            </p>
            <p>
              You may request deletion of your data at any time by emailing{' '}
              <a href="mailto:support@auditease.com" className="text-primary hover:underline">
                support@auditease.com
              </a>
              . We will process deletion requests within 15 business days.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Cookies &amp; Analytics</h2>
            <p>
              We use <strong className="text-foreground">Google Analytics 4</strong> to understand how users interact with our platform and improve the experience.
            </p>
            <p>
              We may also use <strong className="text-foreground">Hotjar</strong> for heatmaps and session recordings to identify usability improvements. No sensitive shipment data is captured in these recordings.
            </p>
            <p>
              You can disable cookies at any time through your browser settings. Disabling cookies may limit some platform functionality.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Contact</h2>
            <p>
              For any privacy-related inquiries, data deletion requests, or concerns, please reach out to us at{' '}
              <a href="mailto:support@auditease.com" className="text-primary hover:underline">
                support@auditease.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
