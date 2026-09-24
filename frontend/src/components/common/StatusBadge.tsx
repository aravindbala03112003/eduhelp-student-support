import React from 'react';
import {
  Sparkles,
  UserCheck,
  Clock,
  HelpCircle,
  CheckCircle2,
  Archive,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { TicketStatus } from '../../types/index.js';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const configMap: Record<
    TicketStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    NEW: {
      label: 'New',
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500/25',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-500/25',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/25',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    WAITING_FOR_STUDENT: {
      label: 'Waiting for Student',
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-500/25',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/25',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-500/10 dark:bg-slate-500/20',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-500/25',
      icon: <Archive className="w-3.5 h-3.5" />,
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/25',
      icon: <RotateCcw className="w-3.5 h-3.5" />,
    },
    ESCALATED: {
      label: 'Escalated',
      bg: 'bg-red-500/15 dark:bg-red-500/25',
      text: 'text-red-700 dark:text-red-300 font-semibold',
      border: 'border-red-500/35',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
  };

  const current = configMap[status] || configMap.NEW;
  const sizeStyles = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeStyles} ${className} transition-colors`}
    >
      <span className="shrink-0">{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
};
