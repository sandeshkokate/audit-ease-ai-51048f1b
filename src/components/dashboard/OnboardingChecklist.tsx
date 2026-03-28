import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Circle, X, ArrowRight, Rocket } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Props {
  tenantId: string;
}

const steps = [
  {
    key: 'rate_card',
    title: 'Add your first rate card',
    description: 'Configure courier rate cards so we can calculate expected charges.',
    link: '/tenant-admin/settings',
  },
  {
    key: 'upload_csv',
    title: 'Upload your first shipment CSV',
    description: 'Upload a courier billing file to start auditing shipments.',
    link: '/tenant-admin/upload',
  },
  {
    key: 'review_discrepancy',
    title: 'Review your first discrepancy',
    description: 'Check flagged overcharges found in your billing data.',
    link: '/tenant-admin/audit-logs',
  },
  {
    key: 'raise_dispute',
    title: 'Raise your first dispute',
    description: 'Generate and send a dispute email to recover overcharges.',
    link: '/tenant-admin/disputes',
  },
];

export default function OnboardingChecklist({ tenantId }: Props) {
  const navigate = useNavigate();
  const storageKey = `onboarding_dismissed_${tenantId}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === 'true');

  const { data: completion, isLoading } = useQuery({
    queryKey: ['onboarding-checklist', tenantId],
    queryFn: async () => {
      const [rateCards, uploads, discrepancies, disputes] = await Promise.all([
        supabase.from('rate_cards').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('upload_batches').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).gt('discrepancy_amount', 0),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('dispute_status', 'raised'),
      ]);

      return {
        rate_card: (rateCards.count || 0) > 0,
        upload_csv: (uploads.count || 0) > 0,
        review_discrepancy: (discrepancies.count || 0) > 0,
        raise_dispute: (disputes.count || 0) > 0,
      };
    },
    enabled: !!tenantId && !dismissed,
    staleTime: 1000 * 60 * 5,
  });

  // Auto-hide when all complete
  const completedCount = completion ? Object.values(completion).filter(Boolean).length : 0;
  const allComplete = completedCount === 4;

  useEffect(() => {
    if (allComplete && !dismissed) {
      localStorage.setItem(storageKey, 'true');
      setDismissed(true);
    }
  }, [allComplete, dismissed, storageKey]);

  if (dismissed || isLoading || !completion) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  const progress = (completedCount / 4) * 100;

  return (
    <div className="rounded-xl border border-primary/20 bg-card shadow-card p-5 relative">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss checklist"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Get started with AuditEase</h3>
          <p className="text-xs text-muted-foreground">Complete these steps to start recovering overpayments</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">{completedCount} of 4 steps complete</span>
          <span className="text-xs font-medium text-primary">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => {
          const done = completion[step.key as keyof typeof completion];
          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                done
                  ? 'border-success/20 bg-success/5'
                  : 'border-border bg-muted/20 hover:bg-muted/40'
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{step.description}</p>
              </div>
              {!done && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary gap-1 shrink-0"
                  onClick={() => navigate(step.link)}
                >
                  Go <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
