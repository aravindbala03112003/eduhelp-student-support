import React from 'react';
import {
  FileText,
  UserCheck,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { HistoryEvent } from '../../types/index.js';

interface TicketTimelineProps {
  events: HistoryEvent[];
  className?: string;
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ events, className = '' }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        No activity recorded yet.
      </div>
    );
  }

  const getActionDetails = (action: string, oldVal?: string | null, newVal?: string | null) => {
    switch (action) {
      case 'TICKET_CREATED':
        return {
          title: 'Ticket Created',
          description: newVal || 'Ticket registered in system',
          icon: <FileText className="w-4 h-4 text-blue-500" />,
          dotBg: 'bg-blue-500/10 border-blue-500/30',
        };
      case 'TICKET_ASSIGNED':
      case 'TICKET_REASSIGNED':
        return {
          title: action === 'TICKET_REASSIGNED' ? 'Ticket Reassigned' : 'Ticket Assigned',
          description: `Assigned to ${newVal || 'Support Staff'}`,
          icon: <UserCheck className="w-4 h-4 text-purple-500" />,
          dotBg: 'bg-purple-500/10 border-purple-500/30',
        };
      case 'STATUS_CHANGED':
        return {
          title: 'Status Updated',
          description: `${oldVal || 'Initial'} → ${newVal}`,
          icon: <RefreshCw className="w-4 h-4 text-amber-500" />,
          dotBg: 'bg-amber-500/10 border-amber-500/30',
        };
      case 'PRIORITY_CHANGED':
        return {
          title: 'Priority Changed',
          description: `Changed from ${oldVal} to ${newVal}`,
          icon: <ArrowUpDown className="w-4 h-4 text-indigo-500" />,
          dotBg: 'bg-indigo-500/10 border-indigo-500/30',
        };
      case 'TICKET_RESOLVED':
        return {
          title: 'Ticket Marked as Resolved',
          description: 'Resolution remarks posted and confirmed',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          dotBg: 'bg-emerald-500/10 border-emerald-500/30',
        };
      case 'TICKET_REOPENED':
        return {
          title: 'Ticket Reopened by Student',
          description: 'Request reactivated for further clarification',
          icon: <RotateCcw className="w-4 h-4 text-rose-500" />,
          dotBg: 'bg-rose-500/10 border-rose-500/30',
        };
      case 'TICKET_ESCALATED':
        return {
          title: 'Ticket Escalated',
          description: 'Escalated to senior administrative supervisor',
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          dotBg: 'bg-red-500/10 border-red-500/30',
        };
      case 'INTERNAL_NOTE_ADDED':
        return {
          title: 'Internal Staff Note Added',
          description: 'Private staff observation recorded',
          icon: <Lock className="w-4 h-4 text-slate-500" />,
          dotBg: 'bg-slate-500/10 border-slate-500/30',
        };
      default:
        return {
          title: action.replace(/_/g, ' '),
          description: newVal || oldVal || '',
          icon: <MessageSquare className="w-4 h-4 text-muted-foreground" />,
          dotBg: 'bg-muted border-border',
        };
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border ${className}`}>
      {events.map((event, index) => {
        const details = getActionDetails(event.action, event.old_value, event.new_value);
        return (
          <div key={event.id || index} className="relative group">
            {/* Timeline Icon Node */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center bg-card shadow-subtle ${details.dotBg}`}
            >
              {details.icon}
            </div>

            {/* Event Content */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">
                  {details.title}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(event.created_at)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {details.description}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-medium text-foreground/80">
                  {event.actor_name}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.2 rounded bg-muted">
                  {event.actor_role}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
