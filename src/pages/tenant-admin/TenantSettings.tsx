import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import DataTable, { Column } from "@/components/shared/DataTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Building2, Plus, Trash2, ArrowRight, ArrowLeft, ChevronDown, Check, Info, FileText } from "lucide-react";

const COURIER_OPTIONS = ["Delhivery", "BlueDart", "DTDC", "Ecom Express", "XpressBees", "Shadowfax", "Ekart", "Other"];

// Wizard types
type WeightSlab = { from: string; to: string; rate: string };
type ZoneEntry = { name: string; slabs: WeightSlab[] };

const DEFAULT_SLABS: WeightSlab[] = [
  { from: "0", to: "0.5", rate: "" },
  { from: "0.5", to: "1", rate: "" },
  { from: "1", to: "2", rate: "" },
  { from: "2", to: "5", rate: "" },
];

const EMPTY_ZONES: ZoneEntry[] = [
  { name: "A", slabs: DEFAULT_SLABS.map((s) => ({ ...s })) },
  { name: "B", slabs: DEFAULT_SLABS.map((s) => ({ ...s })) },
  { name: "C", slabs: DEFAULT_SLABS.map((s) => ({ ...s })) },
];

// Converts wizard zones → rate_structure JSON object
function buildRateStructure(zones: ZoneEntry[]): Record<string, Record<string, number>> {
  const obj: Record<string, Record<string, number>> = {};
  zones.forEach((z) => {
    const zoneName = z.name.trim();
    if (!zoneName) return;
    obj[zoneName] = {};
    z.slabs.forEach((s) => {
      const from = s.from.trim();
      const to = s.to.trim();
      const rate = parseFloat(s.rate);
      if (from && to && !isNaN(rate) && rate >= 0) {
        obj[zoneName][`${from}-${to}`] = rate;
      }
    });
    if (Object.keys(obj[zoneName]).length === 0) delete obj[zoneName];
  });
  return obj;
}

export default function TenantSettings() {
  useDocumentTitle("Settings");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.tenant_id;

  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    company_name: "",
    contact_email: "",
    contact_phone: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [notifications, setNotifications] = useState({
    email_disputes: true,
    email_recoveries: true,
    email_invoices: true,
    email_weekly_report: false,
    email_new_upload: true,
  });

  // Rate card modal state
  const [rateCardModal, setRateCardModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const TOTAL_STEPS = 3;
  const [rateCardForm, setRateCardForm] = useState({
    courier_name: "",
    effective_from: "",
    effective_to: "",
    divisor: 5000,
    min_chargeable_weight: 0.5,
    rto_percentage: 50,
  });
  const [zones, setZones] = useState<ZoneEntry[]>(
    EMPTY_ZONES.map((z) => ({ ...z, slabs: z.slabs.map((s) => ({ ...s })) })),
  );
  const [addingRate, setAddingRate] = useState(false);

  // Fetch tenant profile
  const { data: tenantData, isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-settings", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data, error } = await supabase.from("tenants").select("*").eq("id", tenantId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  // Fetch rate cards
  const { data: rateCards = [], isLoading: loadingRates } = useQuery({
    queryKey: ["tenant-rate-cards", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("rate_cards")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("courier_name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Hydrate form when tenant data loads
  useEffect(() => {
    if (!tenantData) return;
    setCompany({
      company_name: tenantData.company_name || "",
      contact_email: tenantData.contact_email || "",
      contact_phone: tenantData.contact_phone || "",
      gstin: tenantData.gstin || "",
      address: tenantData.address || "",
      city: tenantData.city || "",
      state: tenantData.state || "",
      pincode: tenantData.pincode || "",
    });
  }, [tenantData]);

  const update = (key: string, value: string) => setCompany((s) => ({ ...s, [key]: value }));

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const oldValues = tenantData
        ? {
            company_name: tenantData.company_name,
            contact_email: tenantData.contact_email,
            contact_phone: tenantData.contact_phone,
            gstin: tenantData.gstin,
          }
        : null;

      const newValues = {
        company_name: company.company_name.trim(),
        contact_email: company.contact_email.trim(),
        contact_phone: company.contact_phone.trim() || null,
        gstin: company.gstin.trim() || null,
        address: company.address.trim() || null,
        city: company.city.trim() || null,
        state: company.state.trim() || null,
        pincode: company.pincode.trim() || null,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      };

      const { error } = await supabase.from("tenants").update(newValues).eq("id", tenantId);
      if (error) throw error;

      supabase
        .rpc("log_activity", {
          p_action: "settings_updated",
          p_entity_type: "tenant",
          p_entity_id: tenantId,
          p_details: "Tenant settings updated",
          p_old_values: oldValues,
          p_new_values: newValues,
        })
        .then(() => {});

      toast({ title: "Settings saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["tenant-settings", tenantId] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const resetModal = () => {
    setWizardStep(1);
    setRateCardForm({
      courier_name: "",
      effective_from: "",
      effective_to: "",
      divisor: 5000,
      min_chargeable_weight: 0.5,
      rto_percentage: 50,
    });
    setZones(EMPTY_ZONES.map((z) => ({ ...z, slabs: z.slabs.map((s) => ({ ...s })) })));
  };

  const handleAddRateCard = async () => {
    if (!rateCardForm.courier_name || !rateCardForm.effective_from) {
      toast({ variant: "destructive", title: "Oops! Missing information", description: "Please select a courier and enter when these rates became active." });
      return;
    }

    const rateStructure = buildRateStructure(zones);
    if (Object.keys(rateStructure).length === 0) {
      toast({ variant: "destructive", title: "No rates entered", description: "Please add at least one zone with shipping rates. Check your rate card document for the numbers." });
      return;
    }

    const { rateStructureSchema } = await import("@/lib/validation-schemas");
    const validation = rateStructureSchema.safeParse(rateStructure);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Some rates look incomplete",
        description: "Make sure every weight range has a rate filled in. Leave no blank boxes in the rates you've added.",
      });
      return;
    }

    setAddingRate(true);
    try {
      const { error } = await supabase.from("rate_cards").insert({
        tenant_id: tenantId,
        courier_name: rateCardForm.courier_name,
        effective_from: rateCardForm.effective_from,
        effective_to: rateCardForm.effective_to || null,
        divisor: rateCardForm.divisor,
        min_chargeable_weight: rateCardForm.min_chargeable_weight,
        rto_percentage: rateCardForm.rto_percentage,
        rate_structure: rateStructure,
        is_active: true,
        created_by: user?.id,
      });
      if (error) throw error;
      toast({ title: "🎉 Rate card saved!", description: "You can now upload your courier bills and we'll find any overcharges." });
      setRateCardModal(false);
      resetModal();
      queryClient.invalidateQueries({ queryKey: ["tenant-rate-cards", tenantId] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    } finally {
      setAddingRate(false);
    }
  };

  // Zone helpers
  const updateZoneName = (zi: number, name: string) =>
    setZones((z) => z.map((x, i) => (i === zi ? { ...x, name } : x)));

  const updateSlab = (zi: number, si: number, field: keyof WeightSlab, value: string) =>
    setZones((z) =>
      z.map((x, i) =>
        i === zi ? { ...x, slabs: x.slabs.map((s, j) => (j === si ? { ...s, [field]: value } : s)) } : x,
      ),
    );

  const addSlab = (zi: number) =>
    setZones((z) => z.map((x, i) => (i === zi ? { ...x, slabs: [...x.slabs, { from: "", to: "", rate: "" }] } : x)));

  const removeSlab = (zi: number, si: number) =>
    setZones((z) => z.map((x, i) => (i === zi ? { ...x, slabs: x.slabs.filter((_, j) => j !== si) } : x)));

  const addZone = () =>
    setZones((z) => [...z, { name: `Zone${z.length + 1}`, slabs: DEFAULT_SLABS.map((s) => ({ ...s })) }]);

  const removeZone = (zi: number) => setZones((z) => z.filter((_, i) => i !== zi));

  const updateRate = (key: string, value: any) => setRateCardForm((s) => ({ ...s, [key]: value }));

  const rateColumns: Column<any>[] = [
    { key: "courier_name", header: "Courier", sortable: true },
    {
      key: "effective_from",
      header: "Effective From",
      render: (r) => (r.effective_from ? new Date(r.effective_from).toLocaleDateString() : "-"),
    },
    { key: "divisor", header: "Divisor", render: (r) => r.divisor ?? "-" },
    {
      key: "rto_percentage",
      header: "RTO %",
      render: (r) => (r.rto_percentage != null ? `${r.rto_percentage}%` : "-"),
    },
    {
      key: "is_active",
      header: "Status",
      render: (r) => (
        <Badge
          variant="outline"
          className={
            r.is_active
              ? "bg-success/10 text-success border-success/20"
              : "bg-muted text-muted-foreground border-border"
          }
        >
          {r.is_active ? "Active" : "Inactive"}
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Company profile, rate cards, and notification preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ratecards">Rate Cards</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={company.company_name} onChange={(e) => update("company_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={company.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={company.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input value={company.gstin} onChange={(e) => update("gstin", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea value={company.address} onChange={(e) => update("address", e.target.value)} rows={2} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={company.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={company.state} onChange={(e) => update("state", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input value={company.pincode} onChange={(e) => update("pincode", e.target.value)} />
                </div>
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
            <p className="text-sm text-muted-foreground">
              Manage your courier rate cards for accurate discrepancy detection.
            </p>
            {rateCards.length > 0 && (
              <Button variant="hero" size="sm" className="gap-2" onClick={() => setRateCardModal(true)}>
                <Plus className="h-4 w-4" /> Add Rate Card
              </Button>
            )}
          </div>
          {loadingRates ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rateCards.length === 0 ? (
            <Card className="shadow-card border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Let's Set Up Your First Rate Card! 🎉
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  A rate card tells us what your courier <strong>should</strong> charge you.
                  We compare this against what they <strong>actually</strong> charged to find overcharges.
                </p>
                <div className="bg-card rounded-lg p-4 max-w-sm mx-auto mb-6 text-left border">
                  <p className="text-sm font-medium text-foreground mb-2">📄 Where to find your rate card:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Check your email for "Rate Card" or "Pricing" from your courier</li>
                    <li>• Look in your courier's seller portal under "Billing" or "Rates"</li>
                    <li>• Ask your courier account manager to send it</li>
                  </ul>
                </div>
                <Button onClick={() => setRateCardModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Your First Rate Card
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={rateColumns}
              data={rateCards}
              pageSize={10}
              searchable
              searchKeys={["courier_name"]}
              searchPlaceholder="Search rates..."
            />
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
            <span className="text-warning mt-0.5 shrink-0">⚠️</span>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Email delivery is not yet integrated.</strong> These preferences are
              saved for future use. In-app notifications work as expected. Email notifications will be enabled once SMTP
              integration is configured by your administrator.
            </p>
          </div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Email Notifications</CardTitle>
              <CardDescription>Choose which notifications you receive (email delivery coming soon)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "email_disputes", label: "Dispute Updates", desc: "Get notified when dispute status changes" },
                {
                  key: "email_recoveries",
                  label: "Recovery Alerts",
                  desc: "Get notified when credit notes are matched",
                },
                {
                  key: "email_invoices",
                  label: "Invoice Generated",
                  desc: "Get notified when new invoices are created",
                },
                {
                  key: "email_weekly_report",
                  label: "Weekly Summary",
                  desc: "Receive a weekly audit performance summary",
                },
                {
                  key: "email_new_upload",
                  label: "Upload Processed",
                  desc: "Get notified when CSV processing completes",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications((s) => ({ ...s, [item.key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button
              variant="hero"
              onClick={async () => {
                if (!user?.id) return;
                setSaving(true);
                try {
                  const { error } = await supabase
                    .from("users")
                    .update({ notification_preferences: notifications, updated_at: new Date().toISOString() })
                    .eq("id", user.id);
                  if (error) throw error;
                  toast({ title: "Notification preferences saved" });
                } catch (err: any) {
                  toast({ variant: "destructive", title: "Failed to save", description: err.message });
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Preferences
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Rate Card Wizard Modal */}
      <Dialog
        open={rateCardModal}
        onOpenChange={(open) => {
          setRateCardModal(open);
          if (!open) resetModal();
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Rate Card</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Fill in rates for each zone and weight slab. No JSON needed.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Courier + dates */}
            <div className="space-y-1.5">
              <Label>Courier Name *</Label>
              <Select value={rateCardForm.courier_name} onValueChange={(v) => updateRate("courier_name", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select courier" />
                </SelectTrigger>
                <SelectContent>
                  {COURIER_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Effective From *</Label>
                <Input
                  type="date"
                  value={rateCardForm.effective_from}
                  onChange={(e) => updateRate("effective_from", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Effective To</Label>
                <Input
                  type="date"
                  value={rateCardForm.effective_to}
                  onChange={(e) => updateRate("effective_to", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Volumetric Divisor</Label>
                <Input
                  type="number"
                  value={rateCardForm.divisor}
                  onChange={(e) => updateRate("divisor", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Usually 5000</p>
              </div>
              <div className="space-y-1.5">
                <Label>Min Chargeable (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={rateCardForm.min_chargeable_weight}
                  onChange={(e) => updateRate("min_chargeable_weight", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>RTO %</Label>
                <Input
                  type="number"
                  value={rateCardForm.rto_percentage}
                  onChange={(e) => updateRate("rto_percentage", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">e.g. 50 = 50% of forward</p>
              </div>
            </div>

            {/* Zone wizard */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Zone Rates (₹ per kg) *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addZone}>
                  + Add Zone
                </Button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {zones.map((zone, zi) => (
                  <div key={zi} className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
                    {/* Zone name row */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground w-20 shrink-0">Zone name</Label>
                      <Input
                        className="h-7 text-sm w-28"
                        value={zone.name}
                        onChange={(e) => updateZoneName(zi, e.target.value)}
                        placeholder="e.g. A"
                      />
                      {zones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive ml-auto"
                          onClick={() => removeZone(zi)}
                        >
                          Remove zone
                        </Button>
                      )}
                    </div>

                    {/* Slab header */}
                    <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground px-1">
                      <span>From (kg)</span>
                      <span>To (kg)</span>
                      <span className="col-span-2">Rate (₹/kg)</span>
                    </div>

                    {/* Slab rows */}
                    {zone.slabs.map((slab, si) => (
                      <div key={si} className="grid grid-cols-4 gap-1 items-center">
                        <Input
                          className="h-7 text-sm"
                          value={slab.from}
                          placeholder="0"
                          onChange={(e) => updateSlab(zi, si, "from", e.target.value)}
                        />
                        <Input
                          className="h-7 text-sm"
                          value={slab.to}
                          placeholder="0.5"
                          onChange={(e) => updateSlab(zi, si, "to", e.target.value)}
                        />
                        <Input
                          className="h-7 text-sm col-span-2"
                          value={slab.rate}
                          placeholder="e.g. 45"
                          onChange={(e) => updateSlab(zi, si, "rate", e.target.value)}
                        />
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => addSlab(zi)}
                      >
                        + Add weight slab
                      </Button>
                      {zone.slabs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => removeSlab(zi, zone.slabs.length - 1)}
                        >
                          Remove last slab
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Add one row per weight range per zone. Example: Zone A, 0–0.5 kg = ₹30/kg, 0.5–1 kg = ₹40/kg.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRateCardModal(false);
                resetModal();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRateCard} disabled={addingRate}>
              {addingRate ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Rate Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
