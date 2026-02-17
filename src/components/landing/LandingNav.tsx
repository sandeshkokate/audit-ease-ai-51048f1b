import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

export default function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/10 bg-[hsl(var(--section-dark-bg)/0.8)] backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight section-dark-text">
            AuditEase <span className="text-gradient">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium section-dark-muted transition-colors hover:text-primary-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="section-dark-muted hover:section-dark-text hover:bg-[hsl(var(--section-dark-border))]">
              Log in
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="hero" size="sm">Request Demo</Button>
          </Link>
        </div>

        <button
          className="md:hidden section-dark-text"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[hsl(var(--section-dark-border))] section-dark p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium section-dark-muted hover:section-dark-text transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/login"><Button variant="ghost" className="w-full section-dark-muted">Log in</Button></Link>
              <Link to="/contact"><Button variant="hero" className="w-full">Request Demo</Button></Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
