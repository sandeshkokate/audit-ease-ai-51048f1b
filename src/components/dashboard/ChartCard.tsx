import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function ChartCard({ title, children, action }: ChartCardProps) {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
