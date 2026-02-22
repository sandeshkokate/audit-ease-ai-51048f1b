import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function FeatureFlags() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const toggle = async (flag: any) => {
    setTogglingId(flag.id);
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: !flag.enabled, updated_at: new Date().toISOString() })
        .eq('id', flag.id);
      if (error) throw error;
      toast({ title: `${flag.label} ${!flag.enabled ? 'enabled' : 'disabled'}` });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeFlags = flags.filter((f: any) => f.enabled);
  const inactiveFlags = flags.filter((f: any) => !f.enabled);

  const renderFlag = (flag: any) => (
    <div key={flag.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${flag.enabled ? 'bg-success' : 'bg-muted-foreground/40'}`} />
          <span className="font-medium text-sm text-foreground">{flag.label}</span>
          <Badge variant="outline" className={flag.enabled ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
            {flag.enabled ? 'ON' : 'OFF'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground ml-[18px]">{flag.description}</p>
        {flag.updated_at && (
          <p className="text-xs text-muted-foreground/70 ml-[18px]">
            Updated {formatDistanceToNow(new Date(flag.updated_at), { addSuffix: true })}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {togglingId === flag.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <Switch checked={flag.enabled} disabled={togglingId === flag.id} onCheckedChange={() => toggle(flag)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feature Flags</h1>
        <p className="text-sm text-muted-foreground">Toggle platform features on or off</p>
      </div>

      {flags.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground text-center">No feature flags configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeFlags.length > 0 && (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Features</CardTitle>
                <CardDescription>Currently enabled for all tenants</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {activeFlags.map(renderFlag)}
              </CardContent>
            </Card>
          )}

          {inactiveFlags.length > 0 && (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Coming Soon</CardTitle>
                <CardDescription>Features not yet enabled</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {inactiveFlags.map(renderFlag)}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
