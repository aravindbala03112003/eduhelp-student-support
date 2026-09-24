import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  Inbox,
  Search,
  Filter,
  ArrowRight,
  HelpCircle,
  FileQuestion,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { getDashboardStats, getMyTickets } from '../services/api.js';
import { Ticket, StudentDashboardStats } from '../types/index.js';
import { Button } from '../components/common/Button.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { PriorityBadge } from '../components/common/PriorityBadge.js';
import { SlaIndicator } from '../components/common/SlaIndicator.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { CardSkeleton, TableSkeleton } from '../components/common/LoadingState.js';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, ticketsData] = await Promise.all([
          getDashboardStats(),
          getMyTickets(),
        ]);
        setStats(statsData as StudentDashboardStats);
        setTickets(ticketsData);
      } catch (err) {
        console.error('Failed to load student dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening with your requests and inquiries.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/student/tickets/new')}
          className="shadow-sm shrink-0"
        >
          Create New Request
        </Button>
      </div>

      {/* KPI Stats Cards */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Open Requests</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {stats?.openRequests ?? 0}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Active tickets in progress</p>
            </div>
          </div>

          <div className="p-5 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Response</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {stats?.awaitingResponse ?? 0}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Requires your input</p>
            </div>
          </div>

          <div className="p-5 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {stats?.resolved ?? 0}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Closed or resolved</p>
            </div>
          </div>

          <div className="p-5 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Requests</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {stats?.totalRequests ?? 0}
              </span>
              <p className="text-xs text-muted-foreground mt-1">All-time submissions</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Requests Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Recent Requests
            </h2>
            <p className="text-xs text-muted-foreground">
              Track the progress, assigned handler, and SLA status of your requests.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket #, subject..."
                className="pl-9 pr-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">All Open</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_STUDENT">Waiting for Student</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Requests Table / Cards */}
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={<FileQuestion className="w-8 h-8" />}
            title="No support requests yet"
            description="You haven't submitted any requests or inquiries matching your filters."
            actionLabel="Create your first request"
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
                    <th className="py-3 px-4">SLA Tracker</th>
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
    </div>
  );
};
