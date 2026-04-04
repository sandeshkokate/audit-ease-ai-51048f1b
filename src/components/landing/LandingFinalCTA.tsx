import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingFinalCTA() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 gradient-mesh opacity-60" />
      <div className="container relative mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-5xl leading-tight">
          Stop Leaving Money <span className="text-gradient">on the Table</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed">
          Upload your first invoice. See what you're owed. Pay nothing until you recover.
        </p>
        <Link to="/contact">
          <Button variant="hero" size="lg" className="gap-2 px-10 py-6 text-base font-semibold shadow-button hover:shadow-[0_6px_24px_0_hsl(245_58%_51%/0.4)] transition-shadow shimmer-btn">
            Upload Your First Invoice <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">One-time setup fee applies. See pricing for details.</p>
      </div>
    </section>
  );
}
