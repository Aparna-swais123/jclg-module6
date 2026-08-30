import { Bot, CheckCircle2, Info, Sparkles, AlertTriangle, AlertOctagon, ArrowUpRight } from 'lucide-react';
import { Card, SectionHeader } from '@/components/ui';
import { aiInsights } from '@/data';
import type { AIInsight } from '@/types';

const severityConfig: Record<AIInsight['severity'], { icon: React.ReactNode; ring: string; chip: string; dot: string }> = {
  positive: { icon: <CheckCircle2 className="h-4 w-4" />, ring: 'ring-success-200', chip: 'bg-success-50 text-success-700', dot: 'bg-success-500' },
  informational: { icon: <Info className="h-4 w-4" />, ring: 'ring-brand-200', chip: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, ring: 'ring-warning-200', chip: 'bg-warning-50 text-warning-700', dot: 'bg-warning-500' },
  critical: { icon: <AlertOctagon className="h-4 w-4" />, ring: 'ring-danger-200', chip: 'bg-danger-50 text-danger-700', dot: 'bg-danger-500' },
};

export function AIInsights() {
  return (
    <section>
      <SectionHeader
        title="AI Assistant / Insights"
        subtitle="Generated observations and recommended actions"
        icon={<Bot className="h-4.5 w-4.5" />}
        action={
          <span className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-brand-100">
            <Sparkles className="h-3 w-3" /> {aiInsights.length} insights
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {aiInsights.map((insight) => {
          const cfg = severityConfig[insight.severity];
          return (
            <Card key={insight.id} hover className={`p-4 ring-1 ${cfg.ring}`}>
              <div className="flex items-start justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.chip}`}>{cfg.icon}</div>
                <span className={`chip ${cfg.chip} capitalize`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {insight.severity}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold leading-snug text-ink-900 text-balance">{insight.title}</h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-ink-600">{insight.detail}</p>
              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-2.5">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-500">
                  <span className="rounded bg-ink-100 px-1.5 py-0.5 text-ink-600">{insight.scope}</span>
                  <span>{insight.date}</span>
                </div>
                <button className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 transition-colors hover:text-brand-700">
                  View Details <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
