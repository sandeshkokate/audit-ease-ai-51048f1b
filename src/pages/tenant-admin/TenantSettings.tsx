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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import DataTable, { Column } from "@/components/shared/DataTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Building2, Plus, Trash2, ArrowRight, ArrowLeft, ChevronDown, ChevronRight, Check, Info, FileText, Eye, EyeOff } from "lucide-react";

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
  const [expandedRateCard, setExpandedRateCard] = useState<string | null>(null);

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
      // Deactivate any existing active rate card for this courier (unique constraint enforced)
      await supabase
        .from("rate_cards")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("tenant_id", tenantId!)
        .eq("courier_name", rateCardForm.courier_name)
        .eq("is_active", true);

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


  const addZone = () =>
    setZones((z) => [...z, { name: `Zone${z.length + 1}`, slabs: DEFAULT_SLABS.map((s) => ({ ...s })) }]);

  const removeZone = (zi: number) => setZones((z) => z.filter((_, i) => i !== zi));

  

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
          {/* Progress indicator */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Step {wizardStep} of {TOTAL_STEPS}
              </span>
              <span className="text-sm text-muted-foreground">
                {wizardStep === 1 && "Choose Courier"}
                {wizardStep === 2 && "Basic Settings"}
                {wizardStep === 3 && "Enter Rates"}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(wizardStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: Choose Courier */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Which courier is this rate card for?
                </h2>
                <p className="text-muted-foreground">
                  Select the courier company whose rates you want to add.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COURIER_OPTIONS.filter((c) => c !== "Other").map((courier) => (
                  <button
                    key={courier}
                    type="button"
                    onClick={() => setRateCardForm((prev) => ({ ...prev, courier_name: courier }))}
                    className={`p-4 rounded-xl border-2 transition-all text-center hover:border-primary/50 ${
                      rateCardForm.courier_name === courier
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="font-medium text-foreground">{courier}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Or type courier name if not listed above..."
                  value={COURIER_OPTIONS.filter((c) => c !== "Other").includes(rateCardForm.courier_name) ? "" : rateCardForm.courier_name}
                  onChange={(e) => setRateCardForm((prev) => ({ ...prev, courier_name: e.target.value }))}
                  className="flex-1"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setWizardStep(2)}
                  disabled={!rateCardForm.courier_name}
                  className="gap-2"
                >
                  Next: Basic Settings <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Basic Settings */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  A few quick settings for {rateCardForm.courier_name}
                </h2>
                <p className="text-muted-foreground">
                  Don't worry if you're not sure — the defaults work for most businesses!
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  📅 When did these rates become active?
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={rateCardForm.effective_from}
                  onChange={(e) => setRateCardForm((prev) => ({ ...prev, effective_from: e.target.value }))}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  This is usually mentioned in the rate card email or document header
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  🔄 Return (RTO) charge percentage
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={rateCardForm.rto_percentage}
                    onChange={(e) => setRateCardForm((prev) => ({ ...prev, rto_percentage: Number(e.target.value) }))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">% of forward shipping cost</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">💡 What's this?</p>
                  <p className="text-muted-foreground">
                    When a package is returned to you (customer refused, wrong address, etc.),
                    couriers charge a percentage of the original shipping cost.
                    <strong> Most couriers charge 50%</strong>, but check your contract.
                  </p>
                </div>
              </div>

              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80 list-none flex items-center gap-1">
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  Show advanced settings (optional)
                </summary>
                <div className="mt-4 space-y-4 pl-5 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label>Volumetric Divisor</Label>
                    <Input
                      type="number"
                      value={rateCardForm.divisor}
                      onChange={(e) => setRateCardForm((prev) => ({ ...prev, divisor: Number(e.target.value) }))}
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used to calculate volumetric weight (L×W×H ÷ this number). Standard is 5000.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Chargeable Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rateCardForm.min_chargeable_weight}
                      onChange={(e) => setRateCardForm((prev) => ({ ...prev, min_chargeable_weight: Number(e.target.value) }))}
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum weight for billing even if package weighs less. Usually 0.5 kg.
                    </p>
                  </div>
                </div>
              </details>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setWizardStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => setWizardStep(3)}
                  disabled={!rateCardForm.effective_from}
                  className="gap-2"
                >
                  Next: Enter Rates <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter Zone Rates */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Enter your shipping rates 💰
                </h2>
                <p className="text-muted-foreground">
                  Copy the rates from your rate card document. We've set up common weight ranges for you.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      What are Zones?
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Couriers divide India into zones based on distance. Zone A is usually nearby
                      (same city), Zone B is within the state, Zone C is nearby states, and so on.
                      Farther zones cost more. Your rate card will show which zone each pincode falls into.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {zones.map((zone, zi) => (
                  <div key={zi} className="border border-border rounded-xl p-4 space-y-3 bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Input
                          className="h-8 w-20 font-semibold"
                          value={zone.name}
                          onChange={(e) => updateZoneName(zi, e.target.value)}
                          placeholder="Zone A"
                        />
                        <span className="text-sm text-muted-foreground">
                          {zi === 0 && "(Local/Same City)"}
                          {zi === 1 && "(Within State)"}
                          {zi === 2 && "(Rest of India)"}
                        </span>
                      </div>
                      {zones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeZone(zi)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-muted-foreground">
                            <th className="pb-2 pr-2 font-medium">Weight Range</th>
                            <th className="pb-2 font-medium">Rate per kg (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zone.slabs.map((slab, si) => (
                            <tr key={si}>
                              <td className="py-1 pr-2">
                                <div className="flex items-center gap-1">
                                  <Input
                                    className="h-8 w-16 text-center"
                                    value={slab.from}
                                    onChange={(e) => updateSlab(zi, si, "from", e.target.value)}
                                    placeholder="0"
                                  />
                                  <span className="text-muted-foreground">to</span>
                                  <Input
                                    className="h-8 w-16 text-center"
                                    value={slab.to}
                                    onChange={(e) => updateSlab(zi, si, "to", e.target.value)}
                                    placeholder="0.5"
                                  />
                                  <span className="text-muted-foreground">kg</span>
                                </div>
                              </td>
                              <td className="py-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">₹</span>
                                  <Input
                                    className="h-8 w-20"
                                    value={slab.rate}
                                    onChange={(e) => updateSlab(zi, si, "rate", e.target.value)}
                                    placeholder="45"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => addSlab(zi)}
                    >
                      + Add another weight range
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addZone}
                  className="w-full"
                >
                  + Add Another Zone
                </Button>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setWizardStep(2)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleAddRateCard} disabled={addingRate} className="gap-2">
                  {addingRate ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="h-4 w-4" /> Save Rate Card</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
