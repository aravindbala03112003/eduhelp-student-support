import React from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { SlaStatus } from '../../types/index.js';

interface SlaIndicatorProps {
  status: SlaStatus;
  timeRemainingFormatted: string;
  percentRemaining?: number;
  isAtRisk?: boolean;
  showBar?: boolean;
  className?: string;
}

export const SlaIndicator: React.FC<SlaIndicatorProps> = ({
  status,
  timeRemainingFormatted,
  percentRemaining,
  isAtRisk = false,
  showBar = false,
  className = '',
}) => {
  if (status === 'COMPLETED') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="truncate">{timeRemainingFormatted}</span>
      </div>
    );
  }

  if (status === 'BREACHED') {
    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
          <span className="truncate">{timeRemainingFormatted}</span>
        </div>
      </div>
    );
  }

  if (status === 'AT_RISK' || isAtRisk) {
    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="truncate">{timeRemainingFormatted}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-200/50 dark:bg-amber-900/60 px-1 rounded">
            At Risk
          </span>
        </div>
        {showBar && percentRemaining !== undefined && (
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, Math.min(100, percentRemaining))}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // ON_TRACK
  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="inline-flex items-center gap-1.5 text-xs text-foreground/80 bg-muted/60 px-2 py-0.5 rounded border border-border">
        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="truncate">{timeRemainingFormatted}</span>
      </div>
      {showBar && percentRemaining !== undefined && (
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, Math.min(100, percentRemaining))}%` }}
          />
        </div>
      )}
    </div>
  );
};
