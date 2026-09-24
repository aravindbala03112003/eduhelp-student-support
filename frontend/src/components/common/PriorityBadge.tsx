import React from 'react';
import { ArrowDown, Minus, ArrowUp, Flame } from 'lucide-react';
import { TicketPriority } from '../../types/index.js';

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md', className = '' }) => {
  const configMap: Record<
    TicketPriority,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    LOW: {
      label: 'Low',
      bg: 'bg-slate-100 dark:bg-slate-800/80',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <ArrowDown className="w-3.5 h-3.5 text-slate-500" />,
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Minus className="w-3.5 h-3.5 text-blue-500" />,
    },
    HIGH: {
      label: 'High',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <ArrowUp className="w-3.5 h-3.5 text-amber-500" />,
    },
    URGENT: {
      label: 'Urgent',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300 font-semibold',
      border: 'border-rose-200 dark:border-rose-800',
      icon: <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
    },
  };

  const current = configMap[priority] || configMap.MEDIUM;
  const sizeStyles = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeStyles} ${className}`}
    >
      <span className="shrink-0">{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
};
