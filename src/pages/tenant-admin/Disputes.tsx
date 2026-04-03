import { useState, useMemo, useCallback } from "react";
import { logger } from "@/lib/logger";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail,
  Copy,
  ExternalLink,
  CheckCircle2,
  Edit3,
  X,
  Loader2,
  
  ChevronDown,
  Send,
  MoreHorizontal,
  Search,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Trash2,
  Calendar,
  Info,
  StickyNote,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { creditNoteSchema } from "@/lib/validation-schemas";
import type { Tables, Json } from "@/integrations/supabase/types";
import {
  DISPUTE_STATUS_LABELS as STATUS_LABELS,
  DISPUTE_STATUS_COLORS as STATUS_COLORS,
  DISPUTE_TAB_STATUSES as TAB_STATUSES,
  DISPUTE_TYPE_OPTIONS,
} from "@/lib/display-labels";
import { hasActionableDiscrepancy } from "@/lib/actionable-discrepancy";

type AuditLog = Tables<"audit_logs">;

interface DisputeViewModel {
  id: string;
  awb_number: string | null;
  order_id: string;
  courier: string | null;
  courier_name: string | null;
  discrepancy_type: string;
  amount: number | null;
  discrepancy_amount: number | null;
  discrepancy_reasons: any[] | null;
  status: string;
  courier_email: string;
  email_subject: string;
  email_body: string;
  dispute_email: Tables<"dispute_emails"> | null;
  dispute_reasoning: Record<string, any> | null;
  notes: Tables<"dispute_notes">[];
  follow_up_date: string | null;
  escalated: boolean;
  priority: string | null;
  created_at: string | null;
  tenant_id: string;
}

const PAGE_SIZE = 25;

export default function Disputes() {
  useDocumentTitle("Disputes");
  const [activeTab, setActiveTab] = useState("draft");
  const [search, setSearch] = useState("");
  const [courierFilter, setCourierFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [selectedDispute, setSelectedDispute] = useState<DisputeViewModel | null>(null);
  const [editTo, setEditTo] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [recoveryModal, setRecoveryModal] = useState<{ open: boolean; dispute: DisputeViewModel | null }>({
    open: false,
    dispute: null,
  });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; dispute: DisputeViewModel | null }>({
    open: false,
    dispute: null,
  });
  const [noteModal, setNoteModal] = useState<{ open: boolean; dispute: DisputeViewModel | null }>({
    open: false,
    dispute: null,
  });
  const [followUpModal, setFollowUpModal] = useState<{ open: boolean; dispute: DisputeViewModel | null }>({
    open: false,
    dispute: null,
  });
  const [creditNote, setCreditNote] = useState({ number: "", amount: "", date: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState<{ open: boolean; dispute: DisputeViewModel | null }>({
    open: false,
    dispute: null,
  });

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRecoverModal, setBulkRecoverModal] = useState(false);
  const [bulkCreditNote, setBulkCreditNote] = useState({ number_prefix: "", date: "" });
  const [bulkLoading, setBulkLoading] = useState(false);

  // Lightweight counts query (single column, no joins)
  const { data: counts = { draft: 0, raised: 0, recovered: 0, rejected: 0, cancelled: 0, all: 0 } } = useQuery({
    queryKey: ["dispute-counts", user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return { draft: 0, raised: 0, recovered: 0, rejected: 0, cancelled: 0, all: 0 };
      const { data, error } = await supabase
        .from("audit_logs")
        .select("dispute_status, discrepancy_amount")
        .eq("tenant_id", user.tenant_id)
        .gt("discrepancy_amount", 0);
      if (error) throw error;
      const rows = data || [];
      return {
        draft: rows.filter((r) => !r.dispute_status || ["draft", "detected", "pending", "email_copied"].includes(r.dispute_status))
          .length,
        raised: rows.filter((r) => ["raised", "disputed"].includes(r.dispute_status || "")).length,
        recovered: rows.filter((r) => r.dispute_status === "recovered").length,
        rejected: rows.filter((r) => r.dispute_status === "rejected").length,
        cancelled: rows.filter((r) => r.dispute_status === "cancelled").length,
        all: rows.length,
      };
    },
    enabled: !!user?.tenant_id,
  });

  // Couriers for filter dropdown
  const { data: couriers = [] } = useQuery({
    queryKey: ["dispute-couriers", user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data } = await supabase
        .from("audit_logs")
        .select("courier_name")
        .eq("tenant_id", user.tenant_id)
        .gt("discrepancy_amount", 0)
        .not("courier_name", "is", null);
      return [...new Set((data || []).map((r) => r.courier_name as string))].filter(Boolean).sort();
    },
    enabled: !!user?.tenant_id,
  });

  // Server-side paginated main query
  const {
    data: disputesResult,
    isLoading,
    isError,
    refetch: refetchDisputes,
  } = useQuery({
    queryKey: ["disputes", user?.tenant_id, activeTab, page, search, courierFilter, typeFilter, dateFrom, dateTo],
    queryFn: async () => {
      if (!user?.tenant_id) return { rows: [], total: 0 };

      let query = supabase
        .from("audit_logs")
        .select("*, dispute_emails(*), dispute_notes(*)", { count: "exact" })
        .eq("tenant_id", user.tenant_id)
        .gt("discrepancy_amount", 0) as any;

      // Tab filter
      const statuses = TAB_STATUSES[activeTab];
      if (statuses && statuses.length > 0) {
        if (activeTab === "draft") {
          query = query.or(`dispute_status.is.null,dispute_status.in.(${statuses.join(",")})`);
        } else {
          query = query.in("dispute_status", statuses);
        }
      }

      // Search
      if (search.trim()) {
        query = query.or(`awb.ilike.%${search}%,courier_name.ilike.%${search}%`);
      }

      // Courier
      if (courierFilter !== "all") {
        query = query.eq("courier_name", courierFilter);
      }

      // Type
      if (typeFilter !== "all") {
        const typeMap: Record<string, string> = {
          weight: "has_weight_discrepancy",
          zone: "has_zone_discrepancy",
          rto: "has_rto_overcharge",
        };
        if (typeMap[typeFilter]) {
          query = query.eq(typeMap[typeFilter], true);
        }
      }

      // Date range
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

      if (error) throw error;

      return {
        rows: (data || []).map((log) => ({
          id: log.id,
          awb_number: log.awb,
          order_id: log.order_id,
          courier: log.courier_name,
          courier_name: log.courier_name,
          discrepancy_type: log.has_weight_discrepancy
            ? "Weight"
            : log.has_zone_discrepancy
              ? "Zone"
              : log.has_rto_overcharge
                ? "RTO"
                : "Unclassified",
          amount: log.discrepancy_amount,
          discrepancy_amount: log.discrepancy_amount,
          discrepancy_reasons: Array.isArray(log.discrepancy_reasons) ? log.discrepancy_reasons : [],
          status: log.dispute_status || "draft",
          courier_email: `billing@${(log.courier_name || "courier").toLowerCase().replace(/\s+/g, "")}.com`,
          email_subject: log.dispute_emails?.[0]?.subject || "",
          email_body: log.dispute_emails?.[0]?.body || "",
          dispute_email: log.dispute_emails?.[0] || null,
          dispute_reasoning: log.dispute_emails?.[0]?.dispute_reasoning || null,
          notes: log.dispute_notes || [],
          follow_up_date: log.follow_up_date || null,
          escalated: log.escalated || false,
          priority: log.priority || null,
          created_at: log.created_at,
          tenant_id: log.tenant_id,
        })),
        total: count || 0,
      };
    },
    enabled: !!user?.tenant_id,
  });

  const paginated = disputesResult?.rows ?? [];
  const totalCount = disputesResult?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["disputes"] });
    queryClient.invalidateQueries({ queryKey: ["dispute-counts"] });
  };

  // Selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const raisedOnPage = paginated.filter((d) => ["raised", "disputed"].includes(d.status));
    const allSelected = raisedOnPage.every((d) => selectedIds.has(d.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      raisedOnPage.forEach((d) => (allSelected ? next.delete(d.id) : next.add(d.id)));
      return next;
    });
  }, [paginated, selectedIds]);

  const openEmailModal = (dispute: DisputeViewModel) => {
    setSelectedDispute(dispute);
    setEditTo(dispute.courier_email);
    setEditSubject(dispute.email_subject);
    setEditBody(dispute.email_body);

    // Auto-generate email if none exists yet
    if (!dispute.email_body) {
      (async () => {
        try {
          const { data: log } = await supabase
            .from("audit_logs")
            .select("*")
            .eq("id", dispute.id)
            .single();
          if (!log) return;
          const email = await generateEmailForDispute(log);
          if (!email) return;

          // Save to DB
          const { data: inserted } = await supabase
            .from("dispute_emails")
            .insert({
              tenant_id: dispute.tenant_id,
              audit_log_id: dispute.id,
              courier_name: log.courier_name,
              courier_email: email.courier_email,
              subject: email.subject,
              body: email.body,
              created_by: user?.id,
            })
            .select()
            .single();

          if (inserted) {
            await supabase
              .from("audit_logs")
              .update({ dispute_status: "draft" })
              .eq("id", dispute.id);
          }

          setEditTo(email.courier_email);
          setEditSubject(email.subject);
          setEditBody(email.body);
        } catch (err) {
          logger.error("Auto-generate email failed:", err);
        }
      })();
    }
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(editBody);
    if (selectedDispute?.dispute_email?.id) {
      await supabase
        .from("dispute_emails")
        .update({ is_copied: true, copied_at: new Date().toISOString() })
        .eq("id", selectedDispute.dispute_email.id);
    }
    toast({ title: "Email copied to clipboard" });
    setSelectedDispute(null);
    refetch();
  };

  const handleCopyAndGmail = async () => {
    await navigator.clipboard.writeText(editBody);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(editTo)}&su=${encodeURIComponent(editSubject)}&body=${encodeURIComponent(editBody)}`;
    window.open(gmailUrl, "_blank");
    if (selectedDispute?.dispute_email?.id) {
      await supabase
        .from("dispute_emails")
        .update({ is_copied: true, copied_at: new Date().toISOString() })
        .eq("id", selectedDispute.dispute_email.id);
    }
    toast({ title: "Copied and Gmail opened" });
    setSelectedDispute(null);
    refetch();
  };

  const handleMarkSent = async (id?: string) => {
    const disputeId = id || selectedDispute?.id;
    if (!disputeId) return;
    try {
      await supabase
        .from("audit_logs")
        .update({ dispute_status: "raised", dispute_raised_date: new Date().toISOString().split("T")[0] })
        .eq("id", disputeId);
      const emailId = id ? paginated.find((d) => d.id === id)?.dispute_email?.id : selectedDispute?.dispute_email?.id;
      if (emailId)
        await supabase
          .from("dispute_emails")
          .update({ is_marked_sent: true, marked_sent_at: new Date().toISOString(), marked_sent_by: user?.id })
          .eq("id", emailId);
      toast({ title: "Dispute marked as raised" });
      setSelectedDispute(null);
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const generateEmailForDispute = async (
    log: any,
  ): Promise<{ subject: string; body: string; courier_email: string } | null> => {
    if (!hasActionableDiscrepancy(log)) return null;

    const courierName = log.courier_name || log.courier || "Courier";
    const { data: courier } = await supabase
      .from("courier_master")
      .select("dispute_email")
      .ilike("courier_name", `%${courierName}%`)
      .maybeSingle();
    const courierEmail = courier?.dispute_email || `billing@${courierName.toLowerCase().replace(/\s+/g, "")}.com`;

    const discrepancies: string[] = [];
    if (log.has_weight_discrepancy) discrepancies.push("Weight Discrepancy");
    if (log.has_zone_discrepancy) discrepancies.push("Zone Discrepancy");
    if (log.has_rto_overcharge) discrepancies.push("RTO Overcharge");
    if (log.has_damage_misclassification) discrepancies.push("Damage Misclassification");
    const typeLabel = discrepancies.length > 0 ? discrepancies.join(", ") : "Billing Discrepancy";

    const subject = `Billing Dispute — AWB ${log.awb || "N/A"} | Order ${log.order_id} | ${typeLabel}`;
    const body = [
      `Dear ${courierName} Billing Team,`,
      "",
      `We have identified a billing discrepancy on the following shipment and request an immediate review and correction:`,
      "",
      `AWB Number: ${log.awb || "N/A"}`,
      `Order ID: ${log.order_id}`,
      `Courier: ${courierName}`,
      `Discrepancy Type: ${typeLabel}`,
      `Billed Amount: ₹${log.billed_amount ?? 0}`,
      `Expected Amount: ₹${log.expected_amount ?? 0}`,
      `Discrepancy Amount: ₹${log.discrepancy_amount ?? 0}`,
      log.charged_weight ? `Charged Weight: ${log.charged_weight} kg` : "",
      log.dead_weight ? `Actual/Dead Weight: ${log.dead_weight} kg` : "",
      log.charged_zone ? `Charged Zone: ${log.charged_zone}` : "",
      log.expected_zone ? `Expected Zone: ${log.expected_zone}` : "",
      "",
      `We request you to review this shipment and issue a credit note for the overcharged amount of ₹${log.discrepancy_amount ?? 0}.`,
      "",
      `Please revert within 7 working days. If we do not hear back, we will escalate this matter.`,
      "",
      `Regards,`,
      `AuditEase — Automated Billing Audit`,
    ]
      .filter(Boolean)
      .join("\n");

    return { subject, body, courier_email: courierEmail };
  };


  // FIX 2: Route through update_dispute_status RPC — no more client-side activity_log insert
  const handleMarkRecovered = async () => {
    const result = creditNoteSchema.safeParse(creditNote);
    if (!result.success) {
      toast({ variant: "destructive", title: "Validation error", description: result.error.errors[0]?.message });
      return;
    }
    if (!recoveryModal.dispute) return;
    setActionLoading(true);
    try {
      const recoveredAmount = parseFloat(creditNote.amount);

      // Update audit_logs directly — no RPC needed
      const { error: updateError } = await supabase
        .from("audit_logs")
        .update({
          dispute_status: "recovered",
          recovery_amount: recoveredAmount,
          recovery_date: creditNote.date || new Date().toISOString().split("T")[0],
          credit_note_number: creditNote.number,
          credit_note_date: creditNote.date || null,
        })
        .eq("id", recoveryModal.dispute.id);
      if (updateError) throw updateError;

      toast({ title: "Marked as recovered" });
      setRecoveryModal({ open: false, dispute: null });
      setCreditNote({ number: "", amount: "", date: "" });
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkRecover = async () => {
    if (!bulkCreditNote.number_prefix.trim()) {
      toast({ variant: "destructive", title: "Please enter a credit note number prefix" });
      return;
    }
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      const updates = ids.map((id, i) =>
        supabase
          .from("audit_logs")
          .update({
            dispute_status: "recovered",
            credit_note_number: `${bulkCreditNote.number_prefix}-${i + 1}`,
            credit_note_date: bulkCreditNote.date || null,
            recovery_amount: paginated.find((d) => d.id === id)?.amount || 0,
          })
          .eq("id", id),
      );
      await Promise.all(updates);
      toast({ title: `${ids.length} disputes marked as recovered` });
      setSelectedIds(new Set());
      setBulkRecoverModal(false);
      setBulkCreditNote({ number_prefix: "", date: "" });
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Bulk update failed", description: err.message });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleMarkRejected = async () => {
    if (!rejectReason.trim()) {
      toast({ variant: "destructive", title: "Please enter rejection reason" });
      return;
    }
    setActionLoading(true);
    try {
      await supabase
        .from("audit_logs")
        .update({ dispute_status: "rejected", rejection_reason: rejectReason, rejected_at: new Date().toISOString() })
        .eq("id", rejectModal.dispute.id);
      toast({ title: "Dispute marked as rejected" });
      setRejectModal({ open: false, dispute: null });
      setRejectReason("");
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast({ variant: "destructive", title: "Please enter a note" });
      return;
    }
    setActionLoading(true);
    try {
      await supabase
        .from("dispute_notes")
        .insert({
          tenant_id: noteModal.dispute.tenant_id,
          audit_log_id: noteModal.dispute.id,
          user_id: user?.id ?? "",
          note: noteText,
          note_type: "general",
        });
      toast({ title: "Note added" });
      setNoteModal({ open: false, dispute: null });
      setNoteText("");
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetFollowUp = async () => {
    if (!followUpDate) {
      toast({ variant: "destructive", title: "Please select a date" });
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase.from("audit_logs").update({ follow_up_date: followUpDate }).eq("id", followUpModal.dispute!.id);
      if (error) throw error;
      toast({ title: "Follow-up scheduled" });
      setFollowUpModal({ open: false, dispute: null });
      setFollowUpDate("");
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (dispute: any) => {
    try {
      const { error } = await supabase
        .from("audit_logs")
        .update({ escalated: true, escalated_at: new Date().toISOString(), priority: "high" })
        .eq("id", dispute.id);
      if (error) throw error;
      toast({ title: "Dispute escalated to high priority" });
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawModal.dispute) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from("audit_logs").update({ dispute_status: "cancelled" }).eq("id", withdrawModal.dispute.id);
      if (error) throw error;
      toast({ title: "Dispute withdrawn" });
      setWithdrawModal({ open: false, dispute: null });
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-24 rounded bg-muted animate-pulse" />
            <div className="h-4 w-56 rounded bg-muted animate-pulse mt-2" />
          </div>
          <div className="h-9 w-48 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-32 rounded bg-muted animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-5 w-16 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-3 w-48 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="font-semibold">Failed to load disputes</p>
        <Button variant="outline" size="sm" onClick={() => refetchDisputes()}>
          Try Again
        </Button>
      </div>
    );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Disputes</h1>
            <p className="text-sm text-muted-foreground">Manage and send dispute emails to couriers</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                className="gap-2 text-success border-success/30"
                onClick={() => setBulkRecoverModal(true)}
              >
                <CheckCircle className="h-4 w-4" /> Recover {selectedIds.size} selected
              </Button>
            )}
          </div>
        </div>

        {/* SMTP disclaimer */}
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
          <Info className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">"Mark as Raised"</strong> is self-reported. Email delivery is not
            verified via SMTP. Please confirm delivery manually with your courier's billing team.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search AWB or courier..."
              className="pl-8 w-56 text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <Select
            value={courierFilter}
            onValueChange={(v) => {
              setCourierFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Couriers</SelectItem>
              {couriers.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISPUTE_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 text-sm" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 text-sm" />
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            setPage(0);
            setSelectedIds(new Set());
          }}
        >
          <TabsList>
            <TabsTrigger value="draft">
              Draft{" "}
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {counts.draft}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="raised">
              Raised{" "}
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {counts.raised}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="recovered">
              Recovered{" "}
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {counts.recovered}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected{" "}
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {counts.rejected}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled{" "}
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {counts.cancelled}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all">
              All{" "}
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {counts.all}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {["draft", "raised", "recovered", "rejected", "cancelled", "all"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
              {/* Select all for raised tab */}
              {(tab === "raised" || tab === "all") &&
                paginated.filter((d) => ["raised", "disputed"].includes(d.status)).length > 0 && (
                  <div className="flex items-center gap-2 pb-1">
                    <Checkbox
                      checked={paginated
                        .filter((d) => ["raised", "disputed"].includes(d.status))
                        .every((d) => selectedIds.has(d.id))}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">Select all raised disputes on this page</span>
                  </div>
                )}

              {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Mail className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-foreground">No disputes found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {search || courierFilter !== "all"
                      ? "Try adjusting your filters."
                      : activeTab === "draft"
                        ? 'Click "Generate all dispute emails" to create drafts.'
                        : "Nothing in this category yet."}
                  </p>
                </div>
              ) : (
                paginated.map((dispute) => (
                  <Card key={dispute.id} className="shadow-card hover:shadow-card-hover transition-all">
                    <CardContent className="p-4">
                      {/* Main row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {["raised", "disputed"].includes(dispute.status) && (
                            <Checkbox
                              checked={selectedIds.has(dispute.id)}
                              onCheckedChange={() => toggleSelect(dispute.id)}
                              className="mt-1"
                            />
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{dispute.awb_number}</span>
                              <Badge variant="outline" className={STATUS_COLORS[dispute.status] || ""}>
                                {STATUS_LABELS[dispute.status] || dispute.status}
                              </Badge>
                              <Badge variant="outline">{dispute.discrepancy_type}</Badge>
                              {dispute.escalated && (
                                <Badge
                                  variant="outline"
                                  className="bg-destructive/10 text-destructive border-destructive/20"
                                >
                                  High Priority
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{dispute.courier}</span>
                            </div>
                            <p className="text-sm text-destructive font-medium">
                              {formatCurrency(dispute.amount)} overcharge
                            </p>
                            {dispute.created_at && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(dispute.created_at), "dd MMM yyyy")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => openEmailModal(dispute)}>
                            <Mail className="h-4 w-4" /> Review Email
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-popover">
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleMarkSent(dispute.id); }}>
                                <Send className="h-4 w-4 mr-2" />
                                Mark as Raised
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={(e) => { e.preventDefault(); setRecoveryModal({ open: true, dispute }); }}
                                className="text-success focus:text-success"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Recovered
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(e) => { e.preventDefault(); setRejectModal({ open: true, dispute }); }}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Mark as Rejected
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setNoteModal({ open: true, dispute }); }}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setFollowUpModal({ open: true, dispute }); }}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Set Follow-Up
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEscalate(dispute); }}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Escalate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setWithdrawModal({ open: true, dispute });
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Withdraw Dispute
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Notes + follow-up display */}
                      {(dispute.notes?.length > 0 || dispute.follow_up_date) && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                          {dispute.follow_up_date && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Follow-up: {format(new Date(dispute.follow_up_date), "dd MMM yyyy")}</span>
                            </div>
                          )}
                          {dispute.notes?.slice(0, 2).map((note: any) => (
                            <div key={note.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <span>{note.note}</span>
                            </div>
                          ))}
                          {dispute.notes?.length > 2 && (
                            <p className="text-xs text-muted-foreground ml-5">+{dispute.notes.length - 2} more notes</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Server-side pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Email Review Modal */}
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Review Dispute Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">To</Label>
                  <Input value={editTo} onChange={(e) => setEditTo(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Subject</Label>
                  <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
                </div>
              </div>
              {(() => {
                const reasons = Array.isArray(selectedDispute?.discrepancy_reasons)
                  ? selectedDispute.discrepancy_reasons
                  : [];
                const overcharge = selectedDispute?.discrepancy_amount ?? 0;
                if (reasons.length === 0 && overcharge === 0) return null;
                return (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                        <ChevronDown className="h-4 w-4" /> Dispute Reasoning
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 space-y-2">
                      {reasons.map((reason: any, i: number) => (
                        <div key={i} className="bg-muted/50 rounded-md p-3">
                          <p className="font-medium text-sm capitalize">{(reason.type || "").replace(/_/g, " ")}</p>
                          <p className="text-sm text-muted-foreground">{reason.detail}</p>
                        </div>
                      ))}
                      {overcharge > 0 && (
                        <p className="text-sm font-medium">
                          Total overcharge: {formatCurrency(overcharge)}
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })()}
              <div className="space-y-1.5">
                <Label className="text-xs">Email Body</Label>
                <Textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="gap-2" onClick={handleCopyEmail}>
                <Copy className="h-4 w-4" /> Copy Email
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleCopyAndGmail}>
                <ExternalLink className="h-4 w-4" /> Copy & Open Gmail
              </Button>
              <Button variant="default" className="gap-2" onClick={() => handleMarkSent()}>
                <Send className="h-4 w-4" /> Mark as Raised
              </Button>
              <Button
                variant="ghost"
                className="gap-2"
                onClick={async () => {
                  try {
                    if (!selectedDispute) return;
                    const { data: log } = await supabase
                      .from("audit_logs")
                      .select("*")
                      .eq("id", selectedDispute.id)
                      .single();
                    if (!log) throw new Error("Audit log not found");
                    const email = await generateEmailForDispute(log);
                    if (!email) throw new Error("Could not generate email");

                    if (selectedDispute.dispute_email?.id) {
                      await supabase
                        .from("dispute_emails")
                        .update({
                          subject: email.subject,
                          body: email.body,
                          courier_email: email.courier_email,
                          updated_by: user?.id,
                        })
                        .eq("id", selectedDispute.dispute_email.id);
                    } else {
                      await supabase
                        .from("dispute_emails")
                        .insert({
                          tenant_id: selectedDispute.tenant_id,
                          audit_log_id: selectedDispute.id,
                          courier_name: log.courier_name,
                          courier_email: email.courier_email,
                          subject: email.subject,
                          body: email.body,
                          created_by: user?.id,
                        });
                    }
                    toast({ title: "Email regenerated" });
                    setSelectedDispute(null);
                    refetch();
                  } catch (err: any) {
                    toast({ variant: "destructive", title: "Regeneration failed", description: err.message });
                  }
                }}
              >
                <Edit3 className="h-4 w-4" /> Regenerate
              </Button>
              <Button variant="ghost" onClick={() => setSelectedDispute(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recovery Modal */}
        <Dialog open={recoveryModal.open} onOpenChange={(o) => !o && setRecoveryModal({ open: false, dispute: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Mark as Recovered
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                AWB: <span className="font-medium text-foreground">{recoveryModal.dispute?.awb_number}</span>
              </p>
              <div className="space-y-2">
                <Label>Credit note number *</Label>
                <Input
                  placeholder="CN-12345"
                  value={creditNote.number}
                  onChange={(e) => setCreditNote({ ...creditNote, number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount recovered (₹) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={creditNote.amount}
                  onChange={(e) => setCreditNote({ ...creditNote, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Credit note date</Label>
                <Input
                  type="date"
                  value={creditNote.date}
                  onChange={(e) => setCreditNote({ ...creditNote, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecoveryModal({ open: false, dispute: null })}>
                Cancel
              </Button>
              <Button onClick={handleMarkRecovered} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Recovery"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Recovery Modal */}
        <Dialog open={bulkRecoverModal} onOpenChange={(o) => !o && setBulkRecoverModal(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Bulk Mark as Recovered
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                {selectedIds.size} disputes selected. Each will be assigned a sequential credit note number.
              </p>
              <div className="space-y-2">
                <Label>Credit note prefix *</Label>
                <Input
                  placeholder="CN-BATCH-001"
                  value={bulkCreditNote.number_prefix}
                  onChange={(e) => setBulkCreditNote({ ...bulkCreditNote, number_prefix: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Credit note date</Label>
                <Input
                  type="date"
                  value={bulkCreditNote.date}
                  onChange={(e) => setBulkCreditNote({ ...bulkCreditNote, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkRecoverModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkRecover} disabled={bulkLoading}>
                {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Recover ${selectedIds.size} disputes`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={rejectModal.open} onOpenChange={(o) => !o && setRejectModal({ open: false, dispute: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Mark as Rejected
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                AWB: <span className="font-medium text-foreground">{rejectModal.dispute?.awb_number}</span>
              </p>
              <div className="space-y-2">
                <Label>Rejection reason *</Label>
                <Textarea
                  placeholder="Enter the courier's rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectModal({ open: false, dispute: null })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleMarkRejected} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Note Modal */}
        <Dialog open={noteModal.open} onOpenChange={(o) => !o && setNoteModal({ open: false, dispute: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Add Note
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                AWB: <span className="font-medium text-foreground">{noteModal.dispute?.awb_number}</span>
              </p>
              <div className="space-y-2">
                <Label>Note *</Label>
                <Textarea
                  placeholder="Add your note or follow-up details..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteModal({ open: false, dispute: null })}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Follow-up Modal */}
        <Dialog open={followUpModal.open} onOpenChange={(o) => !o && setFollowUpModal({ open: false, dispute: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Set Follow-Up Date
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                AWB: <span className="font-medium text-foreground">{followUpModal.dispute?.awb_number}</span>
              </p>
              <div className="space-y-2">
                <Label>Follow-up date *</Label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFollowUpModal({ open: false, dispute: null })}>
                Cancel
              </Button>
              <Button onClick={handleSetFollowUp} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set Reminder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Withdraw Confirmation Modal */}
        <Dialog open={withdrawModal.open} onOpenChange={(o) => !o && setWithdrawModal({ open: false, dispute: null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Withdraw Dispute
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to withdraw the dispute for AWB{" "}
                <span className="font-medium text-foreground">{withdrawModal.dispute?.awb_number}</span>?
                This will move it to the Cancelled tab.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawModal({ open: false, dispute: null })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleWithdraw} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
