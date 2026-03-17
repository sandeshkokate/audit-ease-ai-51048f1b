import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
'@/components/ui/accordion';
import {
  Shield,
  ArrowRight,
  Upload,
  Search,
  AlertTriangle,
  Mail,
  IndianRupee,
  CheckCircle,
  TrendingUp,
  Clock,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  RefreshCw,
  Menu,
  X,
  Sparkles,
  Target,
  Calculator } from
'lucide-react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingProblem from '@/components/landing/LandingProblem';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingFeatures from '@/components/landing/LandingFeatures';
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
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingCalculator />
      <LandingPricing />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
}
