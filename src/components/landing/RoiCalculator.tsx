import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RoiCalculator() {
  return (
    <section className="border-y border-border/50 bg-muted/30 py-24 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
          See How Much You Could <span className="text-gradient">Save</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-muted-foreground md:text-lg">
          Most e-commerce businesses find 10–15% billing errors in their courier invoices. Schedule a free demo to get an estimate for your business.
        </p>
        <Link to="/contact">
          <Button variant="hero" size="lg" className="gap-2 px-10 py-7 text-lg font-semibold">
            Get a Free Analysis <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
