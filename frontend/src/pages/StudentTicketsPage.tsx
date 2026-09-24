import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Inbox, ArrowRight, FileQuestion } from 'lucide-react';
import { getMyTickets } from '../services/api.js';
import { Ticket } from '../types/index.js';
import { Button } from '../components/common/Button.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { PriorityBadge } from '../components/common/PriorityBadge.js';
import { SlaIndicator } from '../components/common/SlaIndicator.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { TableSkeleton } from '../components/common/LoadingState.js';

export const StudentTicketsPage: React.FC = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await getMyTickets();
        setTickets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category_name && t.category_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'OPEN'
        ? ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_STUDENT', 'REOPENED', 'ESCALATED'].includes(t.status)
        : t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Support Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete history and current real-time status of all your institutional inquiries.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/student/tickets/new')}
        >
          Create New Request
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card rounded-xl border border-border shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket #, subject, category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-1.5 px-3 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">All Active Open</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_FOR_STUDENT">Waiting for Student</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REOPENED">Reopened</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="w-8 h-8" />}
          title="No requests found"
          description="You don't have any support requests matching this criteria."
          actionLabel="Create a new request"
          onAction={() => navigate('/student/tickets/new')}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Subject & Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Countdown</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-xs text-primary group-hover:underline whitespace-nowrap">
                      {t.ticket_number}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {t.subject}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t.category_name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SlaIndicator
                        status={t.slaStatus}
                        timeRemainingFormatted={t.slaRemainingFormatted}
                        percentRemaining={t.slaPercentRemaining}
                        isAtRisk={t.slaIsAtRisk}
                      />
                    </td>

                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {t.ageFormatted}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-xs text-muted-foreground group-hover:text-primary inline-flex items-center gap-1 font-medium transition-colors">
                        View <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
