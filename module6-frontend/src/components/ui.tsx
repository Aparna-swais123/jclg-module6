import type { ReactNode } from 'react';
import type { Status, Trend } from '@/types';

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>{children}</div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            {icon}
          </div>
        )}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const statusStyles: Record<Status, string> = {
  healthy: 'bg-success-50 text-success-700 ring-success-200',
  stable: 'bg-brand-50 text-brand-700 ring-brand-200',
  attention: 'bg-warning-50 text-warning-700 ring-warning-200',
  critical: 'bg-danger-50 text-danger-700 ring-danger-200',
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const map = {
    healthy: { text: 'Healthy', dot: 'bg-success-500' },
    stable: { text: 'Stable', dot: 'bg-brand-500' },
    attention: { text: 'Needs Attention', dot: 'bg-warning-500' },
    critical: { text: 'Critical', dot: 'bg-danger-500' },
  };
  const m = map[status];
  return (
    <span className={`chip ring-1 ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {label ?? m.text}
    </span>
  );
}

export function TrendIndicator({ trend, className = '' }: { trend: Trend; className?: string }) {
  const map = {
    up: { icon: '↑', cls: 'text-success-600 bg-success-50' },
    stable: { icon: '→', cls: 'text-ink-500 bg-ink-100' },
    down: { icon: '↓', cls: 'text-danger-600 bg-danger-50' },
  };
  const m = map[trend];
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold ${m.cls} ${className}`}>
      {m.icon}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = 'brand',
  customColor,
  height = 'h-2',
  track = 'bg-ink-100',
}: {
  value: number;
  max?: number;
  color?: 'brand' | 'teal' | 'success' | 'warning' | 'danger';
  customColor?: string;
  height?: string;
  track?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorMap = {
    brand: 'bg-brand-500',
    teal: 'bg-teal-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };
  return (
    <div className={`w-full ${track} rounded-full overflow-hidden ${height}`}>
      <div
        className={`${height} ${customColor ? '' : colorMap[color]} rounded-full transition-all duration-700 ease-out`}
        style={{
          width: `${pct}%`,
          ...(customColor ? { backgroundColor: customColor } : {}),
        }}
      />
    </div>
  );
}

export function Delta({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-success-600' : 'text-danger-600'}`}>
      {up ? '↑' : '↓'} {Math.abs(value)}{suffix}
    </span>
  );
}

export function Pill({
  children,
  color = 'ink',
}: {
  children: ReactNode;
  color?: 'ink' | 'brand' | 'teal' | 'success' | 'warning' | 'danger';
}) {
  const map = {
    ink: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-50 text-brand-700',
    teal: 'bg-teal-50 text-teal-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    danger: 'bg-danger-50 text-danger-700',
  };
  return <span className={`chip ${map[color]}`}>{children}</span>;
}
