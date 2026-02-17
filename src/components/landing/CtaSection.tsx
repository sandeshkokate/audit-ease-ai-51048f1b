import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="relative section-dark py-24 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4 text-center">
        <h2 className="mb-6 text-4xl font-extrabold section-dark-text md:text-6xl">
          Ready to Recover Your <span className="text-gradient">Lost Revenue</span>?
        </h2>
        <p className="mx-auto mb-10 max-w-xl section-dark-muted md:text-lg">
          Join 100+ D2C brands who have recovered ₹2.5Cr+ in courier overcharges.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/contact">
            <Button variant="hero" size="lg" className="gap-2 px-10 py-7 text-lg font-semibold">
              Schedule a Demo <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="hero-outline" size="lg" className="gap-2 px-10 py-7 text-lg font-semibold">
              <Phone className="h-5 w-5" />
              Talk to Sales
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm section-dark-muted">
          No credit card required • Free analysis of your first 1,000 shipments
        </p>
      </div>
    </section>
  );
}
