import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Card className="shadow-card-hover">
          <CardHeader className="text-center pb-2">
            <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
