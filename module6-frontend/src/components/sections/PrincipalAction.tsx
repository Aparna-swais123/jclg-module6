import { ListChecks, ArrowUpRight } from 'lucide-react';
import { Card, SectionHeader } from '@/components/ui';
import { actionItems } from '@/data';
import type { ActionItem } from '@/types';

const severityConfig: Record<ActionItem['severity'], { bar: string; chip: string; dot: string }> = {
  critical: { bar: 'bg-danger-500', chip: 'bg-danger-50 text-danger-700 ring-danger-200', dot: 'bg-danger-500' },
  warning: { bar: 'bg-warning-500', chip: 'bg-warning-50 text-warning-700 ring-warning-200', dot: 'bg-warning-500' },
  informational: { bar: 'bg-brand-500', chip: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  positive: { bar: 'bg-success-500', chip: 'bg-success-50 text-success-700 ring-success-200', dot: 'bg-success-500' },
};

export function PrincipalAction() {
  return (
    <section>
      <SectionHeader
        title="Needs Principal Attention"
        subtitle="What requires your action today"
        icon={<ListChecks className="h-4.5 w-4.5" />}
        action={
          <span className="chip bg-danger-50 text-danger-700 ring-1 ring-danger-200">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500 animate-pulse" />
            {actionItems.filter((a) => a.severity === 'critical').length} critical
          </span>
        }
      />

      <div className="space-y-2.5">
        {actionItems.map((item) => {
          const cfg = severityConfig[item.severity];
          return (
            <Card key={item.id} hover className="overflow-hidden">
              <div className="flex items-stretch gap-0">
                <div className={`w-1 shrink-0 ${cfg.bar}`} />
                <div className="flex flex-1 items-center gap-3 px-4 py-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.chip} ring-1`}>
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`chip ${cfg.chip} capitalize ring-1`}>{item.severity}</span>
                      <span className="text-[11px] font-semibold text-ink-400">{item.scope}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-ink-900 text-balance">{item.title}</h3>
                    <p className="mt-0.5 text-xs font-medium text-ink-500">{item.detail}</p>
                  </div>
                  <button className="shrink-0 self-center inline-flex items-center gap-1 rounded-lg bg-ink-100 px-3 py-1.5 text-[11px] font-bold text-ink-700 transition-colors hover:bg-brand-100 hover:text-brand-700">
                    View Details <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
