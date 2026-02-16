import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export default function MetricCard({ title, value, change, icon: Icon, iconColor = 'text-primary' }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change !== undefined && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-success' : 'text-destructive')}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-xl p-3 bg-primary/10', iconColor === 'text-success' && 'bg-success/10', iconColor === 'text-warning' && 'bg-warning/10', iconColor === 'text-accent' && 'bg-accent/10')}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
