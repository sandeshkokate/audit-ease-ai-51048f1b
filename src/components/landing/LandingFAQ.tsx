import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How does AuditEase detect billing discrepancies?', a: 'Our system analyses your shipment data against your courier rate cards, checking for weight mismatches (billed vs actual/volumetric weight), zone classification errors, RTO overcharges, and COD discrepancies. Any shipment where the billed amount exceeds the expected amount is flagged for review.' },
  { q: 'What does the ₹4,999 setup fee cover?', a: 'The one-time setup fee covers complete platform onboarding, rate card configuration for up to 6 couriers, courier format mapping, and 1 month of free support. There are no recurring subscription fees after this — you only pay a percentage of amounts we actually recover for you.' },
  { q: 'Are there any monthly subscription fees?', a: 'No. AuditEase has zero monthly fees. After the one-time ₹4,999 setup, you only pay a commission on the amount we successfully recover. No recovery means no charge.' },
  { q: 'How does the pay-as-you-go commission work?', a: 'We charge a percentage of the amount recovered from courier overcharges: 10% for recoveries up to ₹1L/month, 8% for ₹1L–₹10L/month, and custom rates for ₹10L+/month. You are only billed when money is actually recovered — if we don\'t recover anything, you pay nothing.' },
  { q: 'Which courier partners do you support?', a: "We support all major Indian courier partners including Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, Ekart, and more. The setup fee includes mapping for up to 6 couriers, with additional couriers available on request." },
  { q: 'How long does it take to see results?', a: 'Once you upload your invoice data, our system typically identifies discrepancies within minutes. Actual recovery timeline depends on courier response times — typically 48-72 hours. Most clients recover their ₹4,999 setup fee within the first audit cycle.' },
  { q: 'Is my data secure?', a: 'All data is encrypted in transit and at rest. We only access shipment data required for auditing and never share your data with third parties.' },
  { q: 'Do I need to change my existing workflow?', a: 'No. Simply export your courier invoices as CSV files and upload them. You can continue using all your existing systems and processes.' },
];

export default function LandingFAQ() {
  return (
    <section id="faq" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Frequently Asked Questions</h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">Everything you need to know about AuditEase AI</p>
        </div>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border bg-card px-5 shadow-card">
                <AccordionTrigger className="py-4 text-left font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
