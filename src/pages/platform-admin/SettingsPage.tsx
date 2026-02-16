import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    default_commission: 12,
    weight_tolerance: 0.5,
    dimension_tolerance: 1.0,
    min_dispute_amount: 10,
    default_divisor: 5000,
    rto_charge_percent: 50,
  });

  const update = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: Number(value) || 0 }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast({ title: 'Settings saved successfully' });
    setSaving(false);
  };

  const fields = [
    { key: 'default_commission', label: 'Default Commission (%)', desc: 'Applied to new tenants' },
    { key: 'weight_tolerance', label: 'Weight Tolerance (kg)', desc: 'Allowed weight variance before flagging' },
    { key: 'dimension_tolerance', label: 'Dimension Tolerance (cm)', desc: 'Allowed dimension variance' },
    { key: 'min_dispute_amount', label: 'Min Dispute Amount (₹)', desc: 'Minimum amount to raise a dispute' },
    { key: 'default_divisor', label: 'Default Divisor', desc: 'Volumetric weight divisor' },
    { key: 'rto_charge_percent', label: 'RTO Charge (%)', desc: 'RTO charge percentage of forward shipment' },
  ];

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
            {fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  type="number"
                  value={settings[f.key as keyof typeof settings]}
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
