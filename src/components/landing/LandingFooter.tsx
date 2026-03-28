import { Link, useLocation } from 'react-router-dom';
import { Shield, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function LandingFooter() {
  const location = useLocation();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (location.pathname !== '/') {
      window.location.href = '/' + href;
    }
  };

  return (
    <footer className="section-dark">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 – Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-white">
                AuditEase <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed opacity-60">
              Automated courier billing audit platform for Indian e-commerce. Recover overcharges. Save money. Scale faster.
            </p>
          </div>

          {/* Column 2 – Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-sm opacity-70">
              <li><a href="#features" onClick={(e) => handleAnchorClick(e, '#features')} className="hover:opacity-100 transition-opacity">Features</a></li>
              <li><a href="#pricing" onClick={(e) => handleAnchorClick(e, '#pricing')} className="hover:opacity-100 transition-opacity">Pricing</a></li>
              <li><a href="#how-it-works" onClick={(e) => handleAnchorClick(e, '#how-it-works')} className="hover:opacity-100 transition-opacity">How It Works</a></li>
              <li><a href="#calculator" onClick={(e) => handleAnchorClick(e, '#calculator')} className="hover:opacity-100 transition-opacity">Savings Calculator</a></li>
            </ul>
          </div>

          {/* Column 3 – Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-sm opacity-70">
              <li><Link to="/blog" className="hover:opacity-100 transition-opacity">Blog</Link></li>
              <li><Link to="/case-studies" className="hover:opacity-100 transition-opacity">Case Studies</Link></li>
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">About</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact</Link></li>
            </ul>
          </div>

          {/* Column 4 – Legal & Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm opacity-70">
              <li><Link to="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:opacity-100 transition-opacity">Terms of Service</Link></li>
            </ul>
            <div className="pt-2">
              <a
                href="https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%27m%20interested%20in%20AuditEase%20AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp: +91 XXXXXXXXXX
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 opacity-20" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs opacity-50 sm:flex-row">
          <p>© 2026 AuditEase AI. All rights reserved.</p>
          <p>Made in India 🇮🇳 for Indian e-commerce</p>
        </div>
      </div>
    </footer>
  );
}
