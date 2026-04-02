import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
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
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1 – Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-button shrink-0 logo-glow">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                AuditEase <span className="text-gradient">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed opacity-60">
              Automated courier billing audit platform for Indian businesses. Recover overcharges. Save money. Scale faster.
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

          {/* Column 4 – Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2.5 text-sm opacity-70">
              <li>
                <Link to="/contact" className="hover:opacity-100 transition-opacity">
                  Get a Demo
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%27m%20interested%20in%20AuditEase%20AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 transition-opacity"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@auditease.com"
                  className="hover:opacity-100 transition-opacity"
                >
                  support@auditease.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5 – Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm opacity-70">
              <li><Link to="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:opacity-100 transition-opacity">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 opacity-20" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs opacity-50 sm:flex-row">
          <p>© {new Date().getFullYear()} AuditEase Technologies. All rights reserved.</p>
          <p>Built for D2C brands, enterprises, banks, and NBFCs</p>
        </div>
      </div>
    </footer>
  );
}