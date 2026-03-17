import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { Separator } from '@/components/ui/separator';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <main className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

        <Separator className="my-8" />

        <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
          {/* 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the AuditEase AI platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Service Description</h2>
            <p>
              AuditEase AI is an automated courier billing audit platform that identifies discrepancies in shipping charges billed by courier partners. The platform processes shipment data uploaded by clients, detects overcharges related to weight, zone, RTO, and other parameters, generates dispute communications, and tracks recoveries.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Pricing &amp; Payment</h2>
            <p>AuditEase AI operates on a performance-based pricing model. There is no upfront cost beyond the one-time setup fee. Ongoing fees are charged only on successful recoveries:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><strong className="text-foreground">Starter Plan</strong> — 10% of recovered amount (for recoveries up to ₹1L/month).</li>
              <li><strong className="text-foreground">Growth Plan</strong> — 8% of recovered amount (for recoveries between ₹1L–₹10L/month).</li>
              <li><strong className="text-foreground">Enterprise Plan</strong> — Custom percentage based on volume (for recoveries exceeding ₹10L/month).</li>
            </ul>
            <p>
              Invoices are generated monthly based on confirmed recoveries. Payment terms are Net 15 from the date of invoice unless otherwise agreed in writing.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Data Ownership</h2>
            <p>
              Clients retain full ownership of all shipment and billing data uploaded to the AuditEase AI platform. By uploading data, you grant AuditEase AI a limited, non-exclusive license to process your data solely for the purpose of performing billing audits, generating dispute communications, and tracking recoveries.
            </p>
            <p>
              We will not use your data for any other purpose, nor will we share it with third parties without your explicit consent.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Upload fraudulent, fabricated, or intentionally misleading shipment data.</li>
              <li>Attempt to manipulate audit results or dispute outcomes.</li>
              <li>Share your account credentials with unauthorised individuals.</li>
              <li>Use the platform for any purpose that violates applicable laws or regulations.</li>
            </ul>
            <p>
              Violation of these terms may result in immediate suspension or termination of your account.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>
              AuditEase AI provides audit calculations and discrepancy detection on a best-effort basis. While we strive for accuracy, recovery amounts depend on courier partner responses and their internal dispute resolution processes.
            </p>
            <p>
              AuditEase AI shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the fees paid by you in the preceding twelve months.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Termination</h2>
            <p>
              Either party may terminate this agreement by providing <strong className="text-foreground">30 days' written notice</strong> via email.
            </p>
            <p>
              Upon termination, all outstanding invoices become immediately payable. Your shipment data will be exported and provided to you upon request, and permanently deleted from our systems within 30 days of termination.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be resolved through binding arbitration in Bengaluru, Karnataka, in accordance with the Arbitration and Conciliation Act, 1996.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
