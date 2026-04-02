import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What is courier billing audit?',
    a: 'Courier billing audit is the process of verifying shipping invoices against your contracted rates to identify overcharges. Common errors include weight discrepancies (where the courier bills a higher weight than actual), zone mismatches (charging for farther delivery zones), and RTO overcharges (incorrect return shipping fees). Indian businesses lose an estimated ₹3,500 crore annually to such billing errors. AuditEase AI automates this entire process.',
  },
  {
    q: 'How much can we recover from courier overcharges?',
    a: 'Most businesses overpay couriers by 10-15% on shipping charges. The exact recovery depends on your monthly shipment volume, courier mix, and shipment types. D2C brands with fashion products see higher discrepancies due to elevated RTO rates, while banks and NBFCs face zone billing issues on high-volume document dispatches. Our AI detects discrepancies with 0.5 kg tolerance and generates dispute emails automatically.',
  },
  {
    q: 'Which couriers does AuditEase support?',
    a: 'AuditEase supports seven major Indian courier partners: Delhivery, Blue Dart, DTDC, Ecom Express, XpressBees, Shadowfax, and Ekart. This covers approximately 85% of the Indian logistics market. We can add additional courier integrations for Enterprise customers.',
  },
  {
    q: 'What types of billing errors does AuditEase detect?',
    a: 'We detect three main types of discrepancies: (1) Weight mismatches where couriers charge for higher weight than actual or volumetric weight, (2) Zone mismatches where shipments are billed for incorrect delivery zones based on pincode mapping, and (3) RTO overcharges where return shipments are billed incorrectly against your contracted RTO percentage.',
  },
  {
    q: 'How does performance-based pricing work?',
    a: "AuditEase works on a success-fee model. You pay nothing upfront and only pay a percentage of the money we actually recover for you. Our Starter plan is 10% of recovered amount, Professional is 8%, and Enterprise gets custom pricing. If we don't recover anything, you pay nothing.",
  },
  {
    q: 'Can banks and NBFCs use AuditEase?',
    a: 'Absolutely. Banks and NBFCs are among our key target segments. Financial institutions dispatch millions of documents monthly — credit cards, loan agreements, KYC documents, account statements, cheque books, and policy documents. Each of these shipments can have weight or zone billing errors. AuditEase audits all dispatches and recovers overcharges just like we do for product shipments.',
  },
  {
    q: 'How does the AI dispute email generation work?',
    a: 'When AuditEase detects a billing discrepancy, our AI automatically drafts a professional dispute email tailored to the specific courier and error type. The email references the exact AWB number, discrepancy amount, and your contracted rates. You can review, edit if needed, and send with one click. This reduces dispute handling time from hours to minutes.',
  },
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