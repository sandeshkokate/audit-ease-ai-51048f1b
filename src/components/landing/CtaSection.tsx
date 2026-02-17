import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl gradient-primary p-12 md:p-20 shadow-button relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary-foreground/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-primary-foreground/5 translate-y-1/2 -translate-x-1/4" />

          <div className="relative">
            <h2 className="mb-5 text-3xl font-bold text-primary-foreground md:text-5xl">
              Ready to recover your logistics spend?
            </h2>
            <p className="mb-10 text-primary-foreground/80 md:text-lg max-w-lg mx-auto">
              Join leading e-commerce brands that are saving lakhs every month with AuditEase AI.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90 text-base px-10 py-7 gap-2 font-semibold text-lg shadow-card-hover">
                Contact Sales <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
