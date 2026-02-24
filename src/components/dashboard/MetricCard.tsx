import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

const iconBgMap: Record<string, string> = {
  'text-primary': 'bg-primary/10',
  'text-success': 'bg-success/10',
  'text-warning': 'bg-warning/10',
  'text-accent': 'bg-accent/10',
  'text-secondary': 'bg-secondary/10',
  'text-destructive': 'bg-destructive/10',
};

export default function MetricCard({ title, value, change, icon: Icon, iconColor = 'text-primary', onClick }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        "shadow-card hover:shadow-card-hover transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden relative group",
        isClickable && "cursor-pointer hover:border-primary/30"
      )}
      onClick={onClick}
    >
      <div className={cn(
        'absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity gradient-primary'
      )} />
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
          <div className={cn('rounded-xl p-3 transition-transform group-hover:scale-105', iconBgMap[iconColor] || 'bg-primary/10')}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
