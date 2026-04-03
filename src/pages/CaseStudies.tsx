import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SEOHead from '@/components/shared/SEOHead';

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SEOHead
         title="Case Studies – AuditEase | Real Recovery Results"
         description="See how Indian e-commerce brands recovered lakhs in courier overcharges using AuditEase automated billing audits."
        path="/case-studies"
      />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Card className="shadow-card-hover">
          <CardHeader className="text-center pb-2">
            <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-foreground">Case Studies</h1>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
