import { ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Card, SectionHeader } from '@/components/ui';
import { riskStudents } from '@/data';
import type { RiskStudent } from '@/types';

const riskConfig: Record<RiskStudent['risk'], { label: string; dot: string; chip: string; count: number }> = {
  high: { label: 'High Risk', dot: 'bg-danger-500', chip: 'bg-danger-50 text-danger-700 ring-danger-200', count: 12 },
  attention: { label: 'Needs Attention', dot: 'bg-warning-500', chip: 'bg-warning-50 text-warning-700 ring-warning-200', count: 18 },
  improving: { label: 'Improving', dot: 'bg-success-500', chip: 'bg-success-50 text-success-700 ring-success-200', count: 46 },
};

export function EarlyWarning() {
  return (
    <section>
      <SectionHeader
        title="Early Warning Indicators"
        subtitle="Students flagged by attendance, academic and combined-risk signals"
        icon={<ShieldAlert className="h-4.5 w-4.5" />}
      />

      {/* Risk summary tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(riskConfig) as RiskStudent['risk'][]).map((k) => {
          const cfg = riskConfig[k];
          return (
            <Card key={k} hover className="p-4">
              <div className="flex items-center gap-3">
                <span className={`relative flex h-3 w-3`}>
                  <span className={`absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-30 ${k === 'high' ? 'animate-pulse-ring' : ''}`} />
                  <span className={`relative inline-flex h-3 w-3 rounded-full ${cfg.dot}`} />
                </span>
                <span className="text-sm font-bold text-ink-700">{cfg.label}</span>
                <span className="ml-auto text-2xl font-extrabold text-ink-900">{cfg.count}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alert table */}
      <Card className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/60 px-4 py-2.5">
          <span className="text-sm font-bold text-ink-900">At-Risk Student Alerts</span>
          <span className="text-xs font-semibold text-ink-500">{riskStudents.length} flagged</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink-100 text-[10px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-bold">Student</th>
                <th className="px-4 py-2.5 font-bold">Group</th>
                <th className="px-4 py-2.5 font-bold">Section</th>
                <th className="px-4 py-2.5 font-bold">Risk Level</th>
                <th className="px-4 py-2.5 font-bold">Reason</th>
                <th className="px-4 py-2.5 font-bold">Last Result</th>
                <th className="px-4 py-2.5 font-bold">Attendance</th>
                <th className="px-4 py-2.5 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {riskStudents.map((s) => {
                const cfg = riskConfig[s.risk];
                return (
                  <tr key={s.name} className="table-row-hover">
                    <td className="px-4 py-2.5 font-semibold text-ink-800">{s.name}</td>
                    <td className="px-4 py-2.5"><span className="chip bg-brand-50 text-brand-700">{s.group}</span></td>
                    <td className="px-4 py-2.5 text-ink-600">{s.section}</td>
                    <td className="px-4 py-2.5">
                      <span className={`chip ring-1 ${cfg.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-ink-600">{s.reason}</td>
                    <td className="px-4 py-2.5">
                      <span className={`font-bold ${s.lastResult < 45 ? 'text-danger-600' : s.lastResult < 55 ? 'text-warning-600' : 'text-ink-700'}`}>{s.lastResult}%</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-bold ${s.attendance < 75 ? 'text-danger-600' : s.attendance < 85 ? 'text-warning-600' : 'text-success-600'}`}>{s.attendance}%</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-2 py-1 text-[10px] font-bold text-ink-700 transition-colors hover:bg-brand-100 hover:text-brand-700">
                        Review <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
