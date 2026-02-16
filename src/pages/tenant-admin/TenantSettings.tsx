import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Building2 } from 'lucide-react';

export default function TenantSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    name: 'FastShip Logistics',
    email: 'admin@fastship.in',
    phone: '9876543210',
    gstin: '27AABCF1234M1Z5',
    address: '402, Trade Center, BKC, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    weight_tolerance: 0.5,
    dispute_threshold: 10,
  });

  const update = (key: string, value: string) => setCompany(s => ({ ...s, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast({ title: 'Settings saved' });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-sm text-muted-foreground">Company profile and preferences</p></div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Company Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Company Name</Label><Input value={company.name} onChange={e => update('name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={company.email} onChange={e => update('email', e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={company.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="space-y-2"><Label>GSTIN</Label><Input value={company.gstin} onChange={e => update('gstin', e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Textarea value={company.address} onChange={e => update('address', e.target.value)} rows={2} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label>City</Label><Input value={company.city} onChange={e => update('city', e.target.value)} /></div>
            <div className="space-y-2"><Label>State</Label><Input value={company.state} onChange={e => update('state', e.target.value)} /></div>
            <div className="space-y-2"><Label>Pincode</Label><Input value={company.pincode} onChange={e => update('pincode', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">Audit Preferences</CardTitle><CardDescription>Configure thresholds for your audits</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Weight Tolerance (kg)</Label><Input type="number" value={company.weight_tolerance} onChange={e => update('weight_tolerance', e.target.value)} /><p className="text-xs text-muted-foreground">Variance allowed before flagging</p></div>
            <div className="space-y-2"><Label>Min Dispute Amount (₹)</Label><Input type="number" value={company.dispute_threshold} onChange={e => update('dispute_threshold', e.target.value)} /><p className="text-xs text-muted-foreground">Only flag discrepancies above this</p></div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
