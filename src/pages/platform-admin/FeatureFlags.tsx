import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { mockFeatureFlags } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function FeatureFlags() {
  const [flags, setFlags] = useState(mockFeatureFlags);
  const { toast } = useToast();

  const toggle = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, enabled: !f.enabled };
          toast({ title: `${f.label} ${updated.enabled ? 'enabled' : 'disabled'}` });
          return updated;
        }
        return f;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feature Flags</h1>
        <p className="text-sm text-muted-foreground">Toggle platform features on or off</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Flags</CardTitle>
          <CardDescription>Changes take effect immediately for all tenants</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {flags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{flag.label}</span>
                  <Badge variant="outline" className={flag.enabled ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
                    {flag.enabled ? 'ON' : 'OFF'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{flag.description}</p>
              </div>
              <Switch checked={flag.enabled} onCheckedChange={() => toggle(flag.id)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
