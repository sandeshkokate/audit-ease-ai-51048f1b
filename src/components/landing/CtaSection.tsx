import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl gradient-primary p-12 md:p-20 shadow-button relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary-foreground/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-primary-foreground/5 translate-y-1/2 -translate-x-1/4" />

          <div className="relative">
            <h2 className="mb-5 text-3xl font-bold text-primary-foreground md:text-5xl">
              Ready to Stop Overpaying?
            </h2>
            <p className="mb-10 text-primary-foreground/80 md:text-lg max-w-lg mx-auto">
              Schedule a free demo and see how AuditEase AI can help your business recover courier overcharges.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact">
                <Button size="lg" className="bg-card text-foreground hover:bg-card/90 px-10 py-7 gap-2 font-semibold text-lg shadow-card-hover">
                  Schedule a Demo <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="ghost" className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 px-10 py-7 gap-2 font-semibold text-lg">
                  <Phone className="h-5 w-5" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
