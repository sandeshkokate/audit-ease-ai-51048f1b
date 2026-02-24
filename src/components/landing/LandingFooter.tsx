import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';

export default function LandingFooter() {
  return (
    <>
      {/* CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 gradient-mesh" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Ready to Stop Losing Money on Courier Billing?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground md:text-lg">
            Join Indian e-commerce brands who are already recovering thousands every month
          </p>
          <Link to="/contact">
            <Button variant="hero" size="lg" className="gap-2 px-10 py-6 text-base font-semibold shadow-button">
              Get Your Free Audit <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">AuditEase <span className="text-gradient">AI</span></span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AuditEase AI</p>
          </div>
        </div>
      </footer>
    </>
  );
}
