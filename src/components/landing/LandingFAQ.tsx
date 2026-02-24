import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How does AuditEase detect billing discrepancies?', a: 'Our system analyses your shipment data against your courier rate cards, checking for weight mismatches (billed vs actual/volumetric weight), zone classification errors, RTO overcharges, and COD discrepancies. Any shipment where the billed amount exceeds the expected amount is flagged for review.' },
  { q: 'Which courier partners do you support?', a: "We support all major Indian courier partners including Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, Ekart, and more. If your courier isn't listed, we can add support for them." },
  { q: 'How long does it take to see results?', a: 'Once you upload your invoice data, our AI typically identifies discrepancies within minutes. Actual recovery timeline depends on courier response times — typically 48-72 hours.' },
  { q: "What if I'm not satisfied with the service?", a: "Since you only pay a percentage of what we actually recover for you, there is no financial risk. If we don't recover anything, you don't pay anything." },
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
