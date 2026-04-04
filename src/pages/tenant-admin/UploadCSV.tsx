import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download, Loader2, AlertTriangle, Settings, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import Papa from "papaparse";
import {
  applyPincodeLookup,
  buildRepresentativePincodeMap,
  getLocationLookupFilters,
  hasRowsMissingPincodes,
  type ParsedShipmentRow,
} from "@/lib/upload-location-lookup";

/** Aliases: CSV column name (normalized) → internal column name */
const COLUMN_ALIASES: Record<string, string> = {
  awb: "awb_number",
  zone: "charged_zone",
  billing_zone: "charged_zone",
  shipment_zone: "charged_zone",
  weight: "charged_weight",
  status: "shipment_status",
  courier_name: "courier",
  total_billed: "billed_amount",
  total_amount: "billed_amount",
  rto_charge: "rto_charge",
  cod_charge: "cod_amount",
  cod_amount: "cod_amount",
  pickup_pincode: "origin_pincode",
  sender_pincode: "origin_pincode",
  customer_pincode: "destination_pincode",
  delivery_pincode: "destination_pincode",
  origin_city: "origin_city",
  origin_state: "origin_state",
  destination_city: "destination_city",
  destination_state: "destination_state",
};

/** Columns always required */
const ALWAYS_REQUIRED = [
  "awb_number",
  "courier",
  "order_id",
  "shipment_status",
  "charged_weight",
  "dead_weight",
  "length",
  "width",
  "height",
  "charged_zone",
  "billed_amount",
  "payment_mode",
];

/** Optional fields that improve accuracy */
const OPTIONAL_FIELDS = [
  "origin_pincode",
  "destination_pincode",
  "is_rto",
  "rto_charge",
  "cod_amount",
  "delivery_date",
  "pickup_date",
  "product_name",
  "sku",
];

/** All fields the mapper shows */
const ALL_MAPPABLE_FIELDS = [...ALWAYS_REQUIRED, ...OPTIONAL_FIELDS];

/** Alternative groups: at least one set must be fully present */
const ALTERNATIVE_GROUPS = [
  {
    label: "Location (provide either pincodes OR city+state)",
    options: [
      { columns: ["origin_pincode", "destination_pincode"], label: "Pincodes" },
      { columns: ["origin_city", "origin_state", "destination_city", "destination_state"], label: "City + State" },
    ],
  },
  {
    label: "RTO indicator (provide either is_rto flag OR rto_charge amount)",
    options: [
      { columns: ["is_rto"], label: "is_rto (yes/no)" },
      { columns: ["rto_charge"], label: "RTO Charge (inferred: charge > 0 = RTO)" },
    ],
  },
];

/** Normalize a column name: lowercase, strip accents, remove units like (kg), collapse separators */
const normalizeCol = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "") // Remove parenthesized units like (kg), (cm)
    .replace(/[_.\s\-]+/g, "_") // Collapse whitespace/underscores/hyphens/periods
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+$/, "") // Trim trailing underscores
    .trim();

const OPTIONAL_COLUMNS = ["cod_amount", "delivery_date", "pickup_date", "product_name", "sku"];

const SAMPLE_CSV = `awb_number,courier,order_id,shipment_status,charged_weight,dead_weight,length,width,height,charged_zone,origin_pincode,destination_pincode,billed_amount,is_rto,payment_mode
AWB100001,CourierA,ORD-5001,delivered,2.5,1.8,20,15,10,B,400001,110001,125.00,no,prepaid
AWB100002,CourierB,ORD-5002,delivered,1.8,1.2,15,12,8,A,400001,400071,95.50,no,cod
AWB100003,CourierC,ORD-5003,rto,3.0,2.0,25,20,15,D,400001,560001,210.00,yes,prepaid
AWB100004,CourierD,ORD-5004,delivered,0.5,0.3,10,8,5,C,400001,700001,68.00,no,prepaid
AWB100005,CourierE,ORD-5005,delivered,4.2,3.5,30,25,20,E,400001,380001,285.00,no,cod`;

async function enrichRowsWithPincodes(rows: ParsedShipmentRow[]) {
  if (!hasRowsMissingPincodes(rows)) return rows;

  const { cities, states } = getLocationLookupFilters(rows);
  if (!cities.length || !states.length) return rows;

  const { data, error } = await supabase
    .from("pincode_zone_master")
    .select("city, state, pincode")
    .in("city", cities)
    .in("state", states)
    .order("pincode", { ascending: true })
    .range(0, 4999);

  if (error) throw error;

  return applyPincodeLookup(rows, buildRepresentativePincodeMap(data ?? []));
}

export default function UploadCSV() {
  useDocumentTitle("Upload CSV");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]); // normalised headers after auto-map
  const [rawHeaders, setRawHeaders] = useState<string[]>([]); // original CSV headers, unchanged
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if rate cards exist
  const { data: rateCards = [], isLoading: loadingRateCards } = useQuery({
    queryKey: ["rate-cards-check", user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from("rate_cards")
        .select("id, courier_name, is_active, rate_structure")
        .eq("tenant_id", user.tenant_id)
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id,
  });
  const hasActiveRateCards = rateCards.length > 0;
  const configuredCouriers = rateCards.map((r: any) => r.courier_name?.toLowerCase());

  // Column mapper state
  const [showMapper, setShowMapper] = useState(false);
  // columnMap: required_field_name → original CSV header the user selected
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});

  // Detect couriers in parsed preview that have no rate card
  // preview is a 2D string array — find courier column index from headers
  const courierColIndex = (() => {
    const idx = headers.indexOf("courier");
    if (idx >= 0) return idx;
    const mapped = columnMap["courier"];
    if (mapped) {
      const rawIdx = rawHeaders.findIndex(h => h === mapped);
      if (rawIdx >= 0) return rawIdx;
    }
    return -1;
  })();
  const couriersInPreview = preview.length > 0 && courierColIndex >= 0
    ? [...new Set(preview.map((row: string[]) => {
        const val = row[courierColIndex] || "";
        return val.trim();
      }).filter(Boolean))]
    : [];
  const missingRateCardCouriers = couriersInPreview.filter(
    (c: string) => !configuredCouriers.includes(c.toLowerCase())
  );
  const hasMissingCourierRateCards = missingRateCardCouriers.length > 0;

  // Check if rate cards have incomplete zone coverage
  const incompleteZoneCouriers = couriersInPreview
    .filter((c: string) => configuredCouriers.includes(c.toLowerCase()))
    .filter((c: string) => {
      const rc = rateCards.find((r: any) => r.courier_name?.toLowerCase() === c.toLowerCase());
      if (!rc?.rate_structure || typeof rc.rate_structure !== 'object') return true;
      const configuredZones = Object.keys(rc.rate_structure as Record<string, unknown>);
      return configuredZones.length < 3;
    });
  const hasIncompleteZones = incompleteZoneCouriers.length > 0;


  const resolveHeader = (raw: string): string => {
    const normalized = normalizeCol(raw);
    return COLUMN_ALIASES[normalized] || normalized;
  };

  const parseCSV = (text: string) => {
    const result = Papa.parse<string[]>(text, {
      skipEmptyLines: true,
      header: false,
    });
    const rawRows = result.data as string[][];
    const hdrs = rawRows[0].map((h) => resolveHeader(h));
    const rows = rawRows.slice(1, 11).map((row) => row.map((c) => c.trim()));
    return { hdrs, rows };
  };

  const handleFile = useCallback(
    (f: File) => {
      if (!f.name.endsWith(".csv")) {
        toast({ variant: "destructive", title: "Only CSV files are allowed" });
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File exceeds 10MB limit" });
        return;
      }
      setFile(f);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;

        // Capture raw (original) headers before any normalisation
        const rawResult = Papa.parse<string[]>(text, { skipEmptyLines: true, header: false });
        const raw = (rawResult.data as string[][])[0] || [];
        setRawHeaders(raw);

        // Auto-map: for each required field, find a raw header that resolves to it
        const autoMap: Record<string, string> = {};
        ALL_MAPPABLE_FIELDS.forEach((field) => {
          const match = raw.find((h) => resolveHeader(h) === field);
          if (match) autoMap[field] = match;
        });
        setColumnMap(autoMap);

        // Show mapper if any required field is still unmapped
        const unmapped = ALWAYS_REQUIRED.filter((f) => !autoMap[f]);
        setShowMapper(unmapped.length > 0);

        const { hdrs, rows } = parseCSV(text);
        setHeaders(hdrs);
        setPreview(rows);
      };
      reader.readAsText(f);
    },
    [toast],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setProcessingStep("Uploading file...");

    let batchId = "";
    try {
      if (!user?.tenant_id) throw new Error("No tenant found");
      if (!user?.id) throw new Error("Not authenticated");

      batchId = crypto.randomUUID();
      const text = await file.text();

      await supabase.from("upload_batches").insert({
        id: batchId,
        tenant_id: user.tenant_id,
        filename: file.name,
        file_size: file.size,
        total_rows: 0,
        status: "processing",
        created_by: user.id,
        started_at: new Date().toISOString(),
      });

      setProcessingStep("Analysing shipments...");

      // Build reverse map: original CSV header (lowercase) → internal field name
      // This applies any manual mappings the user set in the column mapper
      const reverseMap: Record<string, string> = {};
      Object.entries(columnMap).forEach(([field, csvHeader]) => {
        reverseMap[csvHeader.toLowerCase()] = field;
      });

      const parseResult = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => {
          // First check if user manually mapped this header
          const manualField = reverseMap[h.toLowerCase()];
          if (manualField) return manualField;
          // Fall back to auto-normalise + alias lookup
          return resolveHeader(h);
        },
        transform: (value: string) => {
          let val = value
            .trim()
            .replace(/[\x00-\x1F\x7F]/g, "")
            .slice(0, 500);
          if (/^[=+\-@\t\r]/.test(val)) val = "'" + val;
          return val;
        },
      });
      const rows = parseResult.data as ParsedShipmentRow[];
      const enrichedRows = await enrichRowsWithPincodes(rows);

      await supabase.from("upload_batches").update({ total_rows: enrichedRows.length }).eq("id", batchId);

      setProcessingStep("Calculating discrepancies...");

      const { data, error: rpcError } = await supabase.rpc("process_csv_upload", {
        p_tenant_id: user.tenant_id,
        p_uploaded_by: user.id,
        p_shipments: enrichedRows as any,
      });

      if (rpcError) throw rpcError;
      const result = data as any;
      if (!result.success) throw new Error(result.error);

      // Update batch status to completed
      if (batchId) {
        const batchUpdate: Record<string, any> = {
          status: "completed",
          processed_rows: result.processed ?? 0,
          discrepancy_rows: result.discrepancies_found ?? 0,
          failed_rows: result.failed ?? 0,
          completed_at: new Date().toISOString(),
        };
        // Store per-row errors from the RPC if any rows failed
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          batchUpdate.error_log = result.errors;
        }
        await supabase
          .from("upload_batches")
          .update(batchUpdate)
          .eq("id", batchId);
      }

      const failedMsg = result.failed > 0 ? ` ${result.failed} rows failed.` : '';
      toast({
        title: result.failed > 0 ? "⚠️ Upload completed with errors" : "✅ Upload complete!",
        description: `${result.processed} orders processed, ${result.discrepancies_found} discrepancies found.${result.duplicates_skipped ? ` ${result.duplicates_skipped} duplicates skipped.` : ''}${failedMsg}`,
        variant: result.failed > 0 ? "destructive" : "default",
      });

      // Invalidate related caches so Audit Logs, Disputes, Upload History refresh
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['audit-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-couriers'] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({ queryKey: ['upload-batches'] });

      setFile(null);
      setPreview([]);
      setHeaders([]);
      setRawHeaders([]);
      setColumnMap({});
      setShowMapper(false);
    } catch (error: any) {
      if (batchId) {
        try {
          await supabase
            .from("upload_batches")
            .update({
              status: "failed",
              error_log: { message: error.message, timestamp: new Date().toISOString() },
              completed_at: new Date().toISOString(),
            })
            .eq("id", batchId);
        } catch (_) {
          /* best effort */
        }
      }
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setProcessing(false);
      setProcessingStep("");
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_template.csv";
    link.click();
  };

  // Derive effective headers from columnMap for validation
  // A field is "found" if it's in auto-detected headers OR manually mapped
  const isMapped = (field: string) => headers.includes(field) || !!columnMap[field];

  const alwaysRequiredChecklist = ALWAYS_REQUIRED.map((col) => ({
    col,
    found: isMapped(col),
  }));

  const alternativeGroupsValid = ALTERNATIVE_GROUPS.every((group) =>
    group.options.some((option) => option.columns.every((col) => isMapped(col))),
  );

  const alternativeGroupsStatus = ALTERNATIVE_GROUPS.map((group) => ({
    label: group.label,
    options: group.options.map((option) => ({
      label: option.label,
      columns: option.columns,
      satisfied: option.columns.every((col) => isMapped(col)),
    })),
  }));

  const optionalChecklist = OPTIONAL_COLUMNS.map((col) => ({
    col,
    found: isMapped(col),
  }));

  const allValid = alwaysRequiredChecklist.every((v) => v.found) && alternativeGroupsValid;

  // Check if any required field still needs manual mapping
  const unmappedRequired = ALWAYS_REQUIRED.filter((f) => !isMapped(f));

  if (loadingRateCards) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasActiveRateCards) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload CSV</h1>
          <p className="text-sm text-muted-foreground">Upload your courier billing data for audit</p>
        </div>
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              One More Step Before Your First Audit! ☝️
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-lg">
              To find overcharges, we need to know what your courier <strong>should</strong> be charging you.
              Please add your rate card first — it only takes 2 minutes!
            </p>
            <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto mb-8">
              <h3 className="font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Why is this important?
              </h3>
              <div className="text-sm text-muted-foreground text-left space-y-2">
                <p><strong>Without a rate card:</strong> We don't know if ₹80 for a shipment is correct or overcharged.</p>
                <p><strong>With your rate card:</strong> If your contract says ₹50, we instantly know you were overcharged ₹30!</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => navigate("/tenant-admin/settings?tab=ratecards")} className="gap-2" size="lg">
                <Settings className="h-5 w-5" /> Add Rate Card Now
              </Button>
              <span className="text-muted-foreground">Takes about 2 minutes</span>
            </div>
            <p className="text-sm text-muted-foreground mt-8">
              Need help? Check your email for rate card from your courier, or ask your courier's account manager.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload CSV</h1>
          <p className="text-sm text-muted-foreground">Upload your courier billing data for audit</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={downloadSample}>
          <Download className="h-4 w-4" /> Download sample CSV
        </Button>
      </div>

      {!file ? (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div
              className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-16 transition-colors cursor-pointer",
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("csv-input")?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">Drag & drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse — CSV only, max 10MB</p>
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-base">{file.name}</CardTitle>
                    <CardDescription>
                      {(file.size / 1024).toFixed(1)} KB — {preview.length} rows previewed
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setHeaders([]);
                    setRawHeaders([]);
                    setColumnMap({});
                    setShowMapper(false);
                  }}
                >
                  Change File
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Column Mapper — shown when auto-map has gaps */}
          {showMapper && (
            <Card className="shadow-card border-warning/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-warning flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Column Mapping Required
                    </CardTitle>
                    <CardDescription>
                      {unmappedRequired.length} required column{unmappedRequired.length !== 1 ? "s" : ""} couldn't be
                      auto-detected. Map them below using the dropdowns.
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowMapper(false)}>
                    Hide
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ALL_MAPPABLE_FIELDS.map((field) => {
                    const isRequired = ALWAYS_REQUIRED.includes(field);
                    const mapped = columnMap[field];
                    const alreadyDetected = headers.includes(field) && !mapped;
                    return (
                      <div key={field} className="grid grid-cols-2 gap-3 items-center">
                        <div className="flex items-center gap-1.5">
                          {isMapped(field) ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                          ) : isRequired ? (
                            <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                          ) : (
                            <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 flex-shrink-0 inline-block" />
                          )}
                          <span
                            className={`text-sm font-mono ${isRequired && !isMapped(field) ? "text-destructive" : "text-foreground"}`}
                          >
                            {field}
                            {isRequired ? " *" : ""}
                          </span>
                          {alreadyDetected && <span className="text-xs text-success ml-1">(auto)</span>}
                        </div>
                        {!alreadyDetected && (
                          <select
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
                            value={columnMap[field] || ""}
                            onChange={(e) => setColumnMap((m) => ({ ...m, [field]: e.target.value }))}
                          >
                            <option value="">
                              {isMapped(field) ? "(clear mapping)" : "-- select your CSV column --"}
                            </option>
                            {rawHeaders.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        )}
                        {alreadyDetected && (
                          <span className="text-xs text-muted-foreground">Detected automatically</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Required. Optional fields improve discrepancy detection accuracy.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Validation Checklist */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Column Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ensure your CSV contains these required columns. Column names are case-insensitive; aliases like "Zone"
                for "charged_zone" are supported.
              </p>
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Required columns:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {alwaysRequiredChecklist.map((v) => (
                    <div key={v.col} className="flex items-center gap-2 text-sm">
                      {v.found ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className={v.found ? "text-foreground" : "text-destructive"}>{v.col}</span>
                    </div>
                  ))}
                </div>
              </div>
              {alternativeGroupsStatus.map((group, gi) => (
                <div key={gi}>
                  <p className="text-xs font-semibold text-foreground mb-2">{group.label}:</p>
                  <div className="space-y-2">
                    {group.options.map((option, oi) => (
                      <div key={oi}>
                        <div className="flex items-center gap-1 mb-1">
                          {option.satisfied ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <span className="h-4 w-4 rounded-full border border-muted-foreground/30 inline-block" />
                          )}
                          <span
                            className={cn(
                              "text-xs font-medium",
                              option.satisfied ? "text-success" : "text-muted-foreground",
                            )}
                          >
                            {option.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 ml-5">
                          {option.columns.map((col) => (
                            <div key={col} className="flex items-center gap-1 text-xs">
                              {isMapped(col) ? (
                                <CheckCircle2 className="h-3 w-3 text-success" />
                              ) : (
                                <XCircle className="h-3 w-3 text-muted-foreground/50" />
                              )}
                              <span className={isMapped(col) ? "text-foreground" : "text-muted-foreground"}>{col}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Optional columns (enhance audit accuracy):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {optionalChecklist.map((v) => (
                    <div key={v.col} className="flex items-center gap-2 text-sm">
                      {v.found ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-muted-foreground/30 inline-block" />
                      )}
                      <span className="text-muted-foreground">{v.col}</span>
                    </div>
                  ))}
                </div>
              </div>
              {!allValid && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {unmappedRequired.length > 0
                    ? `${unmappedRequired.length} required column(s) still missing — use the column mapper above`
                    : "Some required columns are missing"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Table */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Data Preview (first 10 rows)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {headers.map((h) => (
                        <TableHead key={h} className="whitespace-nowrap text-xs">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-xs">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {preview.length === 10 &&
            file &&
            (() => {
              const estimatedRows = Math.round(file.size / 150);
              if (estimatedRows > 5000) {
                return (
                  <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Large file detected (~{estimatedRows.toLocaleString()} rows). Processing may take 2–3 minutes. Do
                      not close the page.
                    </span>
                  </div>
                );
              }
              return null;
            })()}

          {hasMissingCourierRateCards && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">
                    Missing rate cards for: {missingRateCardCouriers.join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to configure rate cards for these couriers before uploading. Without rate cards, we can't calculate correct charges or detect overcharges.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                    onClick={() => navigate("/tenant-admin/settings?tab=ratecards")}
                  >
                    <Settings className="h-4 w-4" /> Add Rate Cards Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {hasIncompleteZones && !hasMissingCourierRateCards && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-warning">
                    Incomplete zone rates for: {incompleteZoneCouriers.join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your rate card only has rates for a few zones. Zone discrepancy amounts will use estimates (10% of billed amount) for zones without configured rates. For accurate results, add rates for all zones (A through E).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                    onClick={() => navigate("/tenant-admin/settings?tab=ratecards")}
                  >
                    <Settings className="h-4 w-4" /> Complete Zone Rates
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="hero"
              size="lg"
              className="gap-2"
              onClick={handleProcess}
              disabled={processing || !allValid || hasMissingCourierRateCards}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {processingStep || "Processing..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Process & Detect Discrepancies
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
