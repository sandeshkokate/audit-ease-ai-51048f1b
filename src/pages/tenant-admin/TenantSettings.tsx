import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2, Building2, Plus } from 'lucide-react';

export default function TenantSettings() {
  useDocumentTitle('Settings');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.tenant_id;

  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    company_name: '', contact_email: '', contact_phone: '', gstin: '',
    address: '', city: '', state: '', pincode: '',
    email_signature: '', email_tone: 'professional',
  });
  const [notifications, setNotifications] = useState({
    email_disputes: true, email_recoveries: true, email_invoices: true,
    email_weekly_report: false, email_new_upload: true,
  });

  // Fetch tenant profile
  const { data: tenantData, isLoading: loadingTenant } = useQuery({
    queryKey: ['tenant-settings', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  // Fetch rate cards
  const { data: rateCards = [], isLoading: loadingRates } = useQuery({
    queryKey: ['tenant-rate-cards', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('courier_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Hydrate form when tenant data loads
  useEffect(() => {
    if (!tenantData) return;
    setCompany({
      company_name: tenantData.company_name || '',
      contact_email: tenantData.contact_email || '',
      contact_phone: tenantData.contact_phone || '',
      gstin: tenantData.gstin || '',
      address: tenantData.address || '',
      city: tenantData.city || '',
      state: tenantData.state || '',
      pincode: tenantData.pincode || '',
      email_signature: tenantData.email_signature || '',
      email_tone: tenantData.email_tone || 'professional',
    });
  }, [tenantData]);

  const update = (key: string, value: string) => setCompany(s => ({ ...s, [key]: value }));

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          company_name: company.company_name.trim(),
          contact_email: company.contact_email.trim(),
          contact_phone: company.contact_phone.trim() || null,
          gstin: company.gstin.trim() || null,
          address: company.address.trim() || null,
          city: company.city.trim() || null,
          state: company.state.trim() || null,
          pincode: company.pincode.trim() || null,
          email_signature: company.email_signature.trim() || null,
          email_tone: company.email_tone,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        })
        .eq('id', tenantId);
      if (error) throw error;
      toast({ title: 'Settings saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['tenant-settings', tenantId] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to save', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const rateColumns: Column<any>[] = [
    { key: 'courier_name', header: 'Courier', sortable: true },
    { key: 'effective_from', header: 'Effective From', render: (r) => r.effective_from ? new Date(r.effective_from).toLocaleDateString() : '-' },
    { key: 'divisor', header: 'Divisor', render: (r) => r.divisor ?? '-' },
    { key: 'rto_percentage', header: 'RTO %', render: (r) => r.rto_percentage != null ? `${r.rto_percentage}%` : '-' },
    {
      key: 'is_active', header: 'Status',
      render: (r) => (
        <Badge variant="outline" className={r.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
          {r.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  if (loadingTenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <div className="space-y-2"><Label>Company Name</Label><Input value={company.company_name} onChange={e => update('company_name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={company.contact_email} onChange={e => update('contact_email', e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={company.contact_phone} onChange={e => update('contact_phone', e.target.value)} /></div>
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
          {loadingRates ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <DataTable columns={rateColumns} data={rateCards} pageSize={10} searchable searchKeys={['courier_name']} searchPlaceholder="Search rates..." />
          )}
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
