import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How does AuditEase detect discrepancies?',
    a: 'Our AI analyzes your shipment data against courier rate cards, checking for weight mismatches, zone classification errors, RTO overcharges, and COD discrepancies. We compare billed amounts with expected amounts based on your contracted rates.',
  },
  {
    q: 'Which couriers do you support?',
    a: 'We support all major Indian couriers including Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, Ekart, and more. Custom courier integration is available for Enterprise plans.',
  },
  {
    q: 'How long does it take to see results?',
    a: 'Most customers start seeing discrepancies identified within 24 hours of their first upload. Dispute resolution typically takes 48-72 hours depending on the courier.',
  },
  {
    q: 'What if couriers reject the disputes?',
    a: 'Our AI generates evidence-backed disputes with supporting documentation. We see an 85%+ success rate. For rejected disputes, we provide escalation templates and can assist with courier negotiations.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We use bank-grade encryption, are SOC 2 compliant, and never share your data with third parties. Your shipment data is only used for auditing purposes.',
  },
];

export default function FaqSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-xl border border-border/60 bg-card px-6 shadow-card"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
