import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How do couriers overcharge?',
    a: 'Three main ways: (1) They weigh your package higher than actual, (2) They bill a farther delivery zone than correct, (3) They charge incorrect return-to-origin fees. These errors can add up to significant amounts over time.',
  },
  {
    q: 'Which couriers do you support?',
    a: 'We support all major Indian courier partners. Simply upload your shipping data in CSV format and our system will audit it automatically.',
  },
  {
    q: 'How do I get started?',
    a: 'Upload your courier invoice (CSV or Excel). Our platform audits it in minutes. You\'ll see exactly how much you can recover before paying anything.',
  },
  {
    q: 'What if you don\'t find any overcharges?',
    a: 'Then you pay nothing. Our model is simple — we only earn when you recover money.',
  },
  {
    q: 'How long does recovery take?',
    a: 'Resolution timelines vary by courier partner. We provide ready-to-send dispute emails and help you track the entire process.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Your data is encrypted and stored securely using industry-standard practices. We never share your data with third parties.',
  },
];

export default function LandingFAQ() {
  return (
    <section id="faq" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Frequently Asked Questions</h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">Everything you need to know about AuditEase</p>
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
