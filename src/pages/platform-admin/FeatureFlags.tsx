import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function FeatureFlags() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: ['feature-flags'] });
      const previous = queryClient.getQueryData(['feature-flags']);
      queryClient.setQueryData(['feature-flags'], (old: any[]) =>
        old?.map((f) => (f.id === id ? { ...f, enabled } : f))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['feature-flags'], context?.previous);
      toast({ title: 'Failed to update flag', variant: 'destructive' });
    },
    onSuccess: (_data, vars) => {
      const flag = flags.find((f) => f.id === vars.id);
      toast({ title: `${flag?.label} ${vars.enabled ? 'enabled' : 'disabled'}` });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['feature-flags'] }),
  });

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
              <Switch
                checked={flag.enabled ?? false}
                onCheckedChange={(checked) => toggleMutation.mutate({ id: flag.id, enabled: checked })}
              />
            </div>
          ))}
          {flags.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No feature flags configured.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
