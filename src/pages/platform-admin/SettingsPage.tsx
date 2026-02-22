import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2 } from 'lucide-react';

const FIELDS = [
  { key: 'default_commission', label: 'Default Commission (%)', desc: 'Applied to new tenants', default: 12 },
  { key: 'weight_tolerance', label: 'Weight Tolerance (kg)', desc: 'Allowed weight variance before flagging', default: 0.5 },
  { key: 'dimension_tolerance', label: 'Dimension Tolerance (cm)', desc: 'Allowed dimension variance', default: 1.0 },
  { key: 'min_dispute_amount', label: 'Min Dispute Amount (₹)', desc: 'Minimum amount to raise a dispute', default: 10 },
  { key: 'default_divisor', label: 'Default Divisor', desc: 'Volumetric weight divisor', default: 5000 },
  { key: 'rto_charge_percent', label: 'RTO Charge (%)', desc: 'RTO charge percentage of forward shipment', default: 50 },
] as const;

type SettingsMap = Record<string, number>;

const DEFAULTS: SettingsMap = Object.fromEntries(FIELDS.map((f) => [f.key, f.default]));

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsMap>({ ...DEFAULTS });

  const { data: dbRows, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Populate form from DB rows
  useEffect(() => {
    if (!dbRows) return;
    const merged = { ...DEFAULTS };
    dbRows.forEach((row: any) => {
      if (row.setting_key in merged) {
        merged[row.setting_key] = Number(row.setting_value) || DEFAULTS[row.setting_key] || 0;
      }
    });
    setSettings(merged);
  }, [dbRows]);

  const update = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: Number(value) || 0 }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const existingKeys = new Set((dbRows || []).map((r: any) => r.setting_key));

      for (const field of FIELDS) {
        const val = settings[field.key];
        if (existingKeys.has(field.key)) {
          const { error } = await supabase
            .from('platform_settings')
            .update({
              setting_value: val as any,
              updated_at: new Date().toISOString(),
              updated_by: user?.id || null,
            })
            .eq('setting_key', field.key);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('platform_settings')
            .insert({
              setting_key: field.key,
              setting_value: val as any,
              description: field.desc,
              created_by: user?.id || null,
            });
          if (error) throw error;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({ title: 'Settings saved successfully' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to save settings', description: err.message });
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Platform-wide configuration</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Platform Settings</CardTitle>
          <CardDescription>Configure default values for audit calculations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  type="number"
                  value={settings[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
