import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingProblem from '@/components/landing/LandingProblem';
import LandingStats from '@/components/landing/LandingStats';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingIndustries from '@/components/landing/LandingIndustries';
import LandingCalculator from '@/components/landing/LandingCalculator';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingFAQ from '@/components/landing/LandingFAQ';
import LandingFooter from '@/components/landing/LandingFooter';
import SEOHead from '@/components/shared/SEOHead';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <LandingNav />
      <LandingHero />
      <LandingProblem />
      <LandingStats />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingIndustries />
      <LandingCalculator />
      <LandingPricing />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
}
