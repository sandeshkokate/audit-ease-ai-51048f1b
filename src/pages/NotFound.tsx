import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SEOHead from '@/components/shared/SEOHead';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="Page Not Found | AuditEase" description="The page you are looking for does not exist." />
      <LandingNav />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md mx-auto space-y-8">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-button">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-7xl font-extrabold text-gradient">404</h1>
            <p className="text-xl font-semibold text-foreground">Page not found</p>
            <p className="text-muted-foreground leading-relaxed">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button variant="hero" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="gap-2">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default NotFound;
