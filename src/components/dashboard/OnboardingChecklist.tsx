import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Circle, X, ArrowRight, Upload, Building2, FileText, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  tenantId: string;
}

const steps = [
  {
    key: 'company_profile',
    title: 'Complete Company Profile',
    subtitle: 'Add your business details, GSTIN, and address',
    link: '/tenant-admin/settings?tab=company',
    icon: Building2,
  },
  {
    key: 'rate_card',
    title: 'Configure Rate Cards',
    subtitle: 'Add your courier rate agreements (REQUIRED for audits)',
    link: '/tenant-admin/settings?tab=ratecards',
    icon: FileText,
    critical: true,
    dependsOn: undefined,
  },
  {
    key: 'upload_csv',
    title: 'Upload Your First CSV',
    subtitle: 'Import your courier shipment data',
    link: '/tenant-admin/upload',
    icon: Upload,
    dependsOn: 'rate_card',
  },
  {
    key: 'review_discrepancy',
    title: 'Review Discrepancies',
    subtitle: 'Check audit results and raise disputes',
    link: '/tenant-admin/audit-logs',
    icon: AlertTriangle,
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
      const [tenant, rateCards, uploads, discrepancies] = await Promise.all([
        supabase.from('tenants').select('gstin, address, contact_person').eq('id', tenantId).single(),
        supabase.from('rate_cards').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
        supabase.from('upload_batches').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).gt('discrepancy_amount', 0),
      ]);

      const tenantData = tenant.data;
      const hasProfile = !!(tenantData?.gstin || tenantData?.address || tenantData?.contact_person);

      return {
        company_profile: hasProfile,
        upload_csv: (uploads.count || 0) > 0,
        rate_card: (rateCards.count || 0) > 0,
        review_discrepancy: (discrepancies.count || 0) > 0,
      };
    },
    enabled: !!tenantId && !dismissed,
    staleTime: 1000 * 60 * 5,
  });

  const totalSteps = steps.length;
  const completedCount = completion ? Object.values(completion).filter(Boolean).length : 0;
  const remaining = totalSteps - completedCount;
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

  const progress = (completedCount / totalSteps) * 100;

  return (
    <div className="rounded-xl border border-primary/20 bg-card shadow-card p-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss checklist"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-5">
        <h3 className="text-lg font-bold text-foreground">Welcome to AuditEase</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You're <span className="font-semibold text-primary">{remaining} step{remaining !== 1 ? 's' : ''}</span> away from recovering money:
        </p>
      </div>

      <div className="mb-5">
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-2 mb-5">
        {steps.map((step, idx) => {
          const done = completion[step.key as keyof typeof completion];
          const depKey = step.dependsOn as string | undefined;
          const disabled = depKey ? !completion[depKey as keyof typeof completion] : false;
          const StepIcon = step.icon;
          const isCritical = 'critical' in step && step.critical && !done;

          return (
            <button
              key={step.key}
              onClick={() => !done && !disabled && navigate(step.link)}
              className={cn(
                'flex items-center gap-3 w-full text-left rounded-lg border p-3.5 transition-colors',
                done
                  ? 'border-success/20 bg-success/5 cursor-default'
                  : isCritical
                  ? 'border-warning/50 bg-warning/10 hover:bg-warning/20 cursor-pointer'
                  : disabled
                  ? 'border-border bg-muted/30 opacity-60 cursor-not-allowed'
                  : 'border-border bg-muted/20 hover:bg-muted/40 cursor-pointer'
              )}
              disabled={disabled}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              ) : (
                <StepIcon className={cn('h-5 w-5 shrink-0', isCritical ? 'text-warning' : 'text-muted-foreground/40')} />
              )}
              <span className={cn(
                'text-sm font-medium flex-1',
                done ? 'text-muted-foreground line-through' : disabled ? 'text-muted-foreground' : 'text-foreground'
              )}>
                {idx + 1}. {step.title}
                {step.subtitle && !done && (
                  <span className="text-muted-foreground font-normal"> — {step.subtitle}</span>
                )}
                {isCritical && (
                  <span className="ml-2 text-xs font-bold text-warning uppercase">Required</span>
                )}
              </span>
              {!done && !disabled && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </button>
          );
        })}
      </div>

      {!completion.rate_card ? (
        <Button
          variant="default"
          className="w-full gap-2"
          onClick={() => navigate('/tenant-admin/settings?tab=ratecards')}
        >
          <FileText className="h-4 w-4" /> Configure Rate Cards Now
        </Button>
      ) : !completion.upload_csv ? (
        <Button
          variant="default"
          className="w-full gap-2"
          onClick={() => navigate('/tenant-admin/upload')}
        >
          <Upload className="h-4 w-4" /> Upload Invoice Now
        </Button>
      ) : null}
    </div>
  );
}
