import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Building2, Plus, Trash2 } from 'lucide-react';

const mockRateCards = [
  { id: '1', courier: 'Delhivery', zone: 'A', weight_slab: '0-0.5kg', rate: 35 },
  { id: '2', courier: 'Delhivery', zone: 'B', weight_slab: '0-0.5kg', rate: 45 },
  { id: '3', courier: 'BlueDart', zone: 'A', weight_slab: '0-0.5kg', rate: 42 },
  { id: '4', courier: 'BlueDart', zone: 'B', weight_slab: '0-0.5kg', rate: 55 },
  { id: '5', courier: 'DTDC', zone: 'A', weight_slab: '0-0.5kg', rate: 30 },
];

export default function TenantSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    name: 'FastShip Logistics', email: 'admin@fastship.in', phone: '9876543210',
    gstin: '27AABCF1234M1Z5', address: '402, Trade Center, BKC, Mumbai',
    city: 'Mumbai', state: 'Maharashtra', pincode: '400051',
    weight_tolerance: 0.5, dispute_threshold: 10,
    email_signature: 'Regards,\nFastShip Logistics Team', email_tone: 'professional',
  });
  const [notifications, setNotifications] = useState({
    email_disputes: true, email_recoveries: true, email_invoices: true,
    email_weekly_report: false, email_new_upload: true,
  });

  const update = (key: string, value: string) => setCompany(s => ({ ...s, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast({ title: 'Settings saved' });
    setSaving(false);
  };

  const rateColumns: Column<any>[] = [
    { key: 'courier', header: 'Courier', sortable: true },
    { key: 'zone', header: 'Zone' },
    { key: 'weight_slab', header: 'Weight Slab' },
    { key: 'rate', header: 'Rate (₹)', render: (r) => `₹${r.rate}` },
    { key: 'actions', header: '', render: () => <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-sm text-muted-foreground">Company profile, rate cards, and notification preferences</p></div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ratecards">Rate Cards</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
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
            <CardHeader><CardTitle className="text-lg">Email Settings</CardTitle><CardDescription>Configure dispute email defaults</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Tone</Label>
                <Select value={company.email_tone} onValueChange={(v) => update('email_tone', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="assertive">Assertive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Email Signature</Label><Textarea value={company.email_signature} onChange={e => update('email_signature', e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Audit Preferences</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Weight Tolerance (kg)</Label><Input type="number" value={company.weight_tolerance} onChange={e => update('weight_tolerance', e.target.value)} /><p className="text-xs text-muted-foreground">Variance allowed before flagging</p></div>
                <div className="space-y-2"><Label>Min Dispute Amount (₹)</Label><Input type="number" value={company.dispute_threshold} onChange={e => update('dispute_threshold', e.target.value)} /><p className="text-xs text-muted-foreground">Only flag discrepancies above this</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ratecards" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Manage your courier rate cards for accurate discrepancy detection.</p>
            <Button variant="hero" size="sm" className="gap-2" onClick={() => toast({ title: 'Add rate card form coming soon' })}><Plus className="h-4 w-4" /> Add Rate</Button>
          </div>
          <DataTable columns={rateColumns} data={mockRateCards} pageSize={10} searchable searchKeys={['courier', 'zone']} searchPlaceholder="Search rates..." />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Email Notifications</CardTitle><CardDescription>Choose which notifications you receive</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email_disputes', label: 'Dispute Updates', desc: 'Get notified when dispute status changes' },
                { key: 'email_recoveries', label: 'Recovery Alerts', desc: 'Get notified when credit notes are matched' },
                { key: 'email_invoices', label: 'Invoice Generated', desc: 'Get notified when new invoices are created' },
                { key: 'email_weekly_report', label: 'Weekly Summary', desc: 'Receive a weekly audit performance summary' },
                { key: 'email_new_upload', label: 'Upload Processed', desc: 'Get notified when CSV processing completes' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(v) => setNotifications(s => ({ ...s, [item.key]: v }))} />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Preferences
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
