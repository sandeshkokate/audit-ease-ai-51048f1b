import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Target, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-card-hover">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">AuditEase AI</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">About AuditEase AI</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Empowering Indian e-commerce brands to recover logistics overcharges
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Our Mission</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AuditEase AI is on a mission to eliminate logistics billing discrepancies for Indian e-commerce businesses. We use artificial intelligence to automatically detect overcharges in courier billing, generate dispute emails, and track recoveries — saving brands lakhs every month.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Our Team</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We are a team of logistics experts, data scientists, and engineers passionate about bringing transparency to e-commerce shipping costs. With deep domain knowledge in Indian courier networks, we build tools that understand the nuances of weight discrepancies, zone mismatches, and RTO overcharges.
              </p>
            </section>

            <div className="rounded-xl gradient-primary p-6 text-center">
              <h3 className="text-lg font-bold text-primary-foreground mb-2">Want to learn more?</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">Get in touch with our team for a personalized demo.</p>
              <Link to="/contact">
                <Button className="bg-card text-foreground hover:bg-card/90 gap-2">
                  <Mail className="h-4 w-4" /> Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
