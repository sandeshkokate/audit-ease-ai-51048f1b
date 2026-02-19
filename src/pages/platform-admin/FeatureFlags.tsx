import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function FeatureFlags() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch feature flags from database
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
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ 
          enabled: !flag.enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', flag.id);

      if (error) throw error;

      toast({ title: `${flag.label} ${!flag.enabled ? 'enabled' : 'disabled'}` });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No feature flags configured</p>
          ) : (
            flags.map((flag: any) => (
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
                <Switch checked={flag.enabled} onCheckedChange={() => toggle(flag)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
