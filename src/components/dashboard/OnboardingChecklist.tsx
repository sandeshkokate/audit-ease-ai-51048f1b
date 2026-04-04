import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Circle, X, ArrowRight, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Props {
  tenantId: string;
}

const steps = [
  {
    key: 'rate_card',
    title: 'Add your rate card',
    subtitle: 'so we know what you should pay',
    link: '/tenant-admin/settings?tab=ratecards',
  },
  {
    key: 'upload_csv',
    title: 'Upload your first courier invoice',
    link: '/tenant-admin/upload',
    dependsOn: 'rate_card',
  },
  {
    key: 'review_discrepancy',
    title: 'Review your first audit results',
    link: '/tenant-admin/audit-logs',
    dependsOn: 'upload_csv',
  },
];

export default function OnboardingChecklist({ tenantId }: Props) {
  const navigate = useNavigate();
  const storageKey = `onboarding_dismissed_${tenantId}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === 'true');

  const { data: completion, isLoading } = useQuery({
    queryKey: ['onboarding-checklist', tenantId],
    queryFn: async () => {
      const [rateCards, uploads, discrepancies] = await Promise.all([
        supabase.from('rate_cards').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('upload_batches').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).gt('discrepancy_amount', 0),
      ]);

      return {
        upload_csv: (uploads.count || 0) > 0,
        rate_card: (rateCards.count || 0) > 0,
        review_discrepancy: (discrepancies.count || 0) > 0,
      };
    },
    enabled: !!tenantId && !dismissed,
    staleTime: 1000 * 60 * 5,
  });

  const completedCount = completion ? Object.values(completion).filter(Boolean).length : 0;
  const remaining = 3 - completedCount;
  const allComplete = remaining === 0;

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

  const progress = (completedCount / 3) * 100;

  return (
    <div className="rounded-xl border border-primary/20 bg-card shadow-card p-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss checklist"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-bold text-foreground">Welcome to AuditEase</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You're <span className="font-semibold text-primary">{remaining} step{remaining !== 1 ? 's' : ''}</span> away from recovering money:
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-5">
        {steps.map((step, idx) => {
          const done = completion[step.key as keyof typeof completion];
          return (
            <button
              key={step.key}
              onClick={() => !done && navigate(step.link)}
              className={`flex items-center gap-3 w-full text-left rounded-lg border p-3.5 transition-colors ${
                done
                  ? 'border-success/20 bg-success/5 cursor-default'
                  : 'border-border bg-muted/20 hover:bg-muted/40 cursor-pointer'
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
              )}
              <span className={`text-sm font-medium flex-1 ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {idx + 1}. {step.title}
                {step.subtitle && !done && (
                  <span className="text-muted-foreground font-normal"> ({step.subtitle})</span>
                )}
              </span>
              {!done && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      {!completion.upload_csv && (
        <Button
          variant="default"
          className="w-full gap-2"
          onClick={() => navigate('/tenant-admin/upload')}
        >
          <Upload className="h-4 w-4" /> Upload Invoice Now
        </Button>
      )}
    </div>
  );
}
