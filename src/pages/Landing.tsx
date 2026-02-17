import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import LogoCloud from '@/components/landing/LogoCloud';
import ProblemSolution from '@/components/landing/ProblemSolution';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import RoiCalculator from '@/components/landing/RoiCalculator';
import FaqSection from '@/components/landing/FaqSection';
import CtaSection from '@/components/landing/CtaSection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <LogoCloud />
      <ProblemSolution />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <RoiCalculator />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
