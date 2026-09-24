import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Clock,
  HelpCircle,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { getDashboardStats, getAssignedTickets, getCategories } from '../services/api.js';
import { Ticket, StaffDashboardStats, Category } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { PriorityBadge } from '../components/common/PriorityBadge.js';
import { SlaIndicator } from '../components/common/SlaIndicator.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { CardSkeleton, TableSkeleton } from '../components/common/LoadingState.js';

export const StaffDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<StaffDashboardStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, ticketsData, catsData] = await Promise.all([
          getDashboardStats(),
          getAssignedTickets(),
          getCategories(),
        ]);
        setStats(statsData as StaffDashboardStats);
        setTickets(ticketsData);
        setCategories(catsData);
      } catch (err) {
        console.error('Failed to load staff dashboard', err);
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
      (t.student_name && t.student_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' ? true : t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' ? true : t.priority === priorityFilter;
    const matchesSla = slaFilter === 'ALL' ? true : t.slaStatus === slaFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesSla;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          My Work Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Support Officer: <strong>{user?.name}</strong> • {user?.department || 'Student Helpdesk'}
        </p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <CardSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Assigned */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Assigned</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-foreground">{stats?.assigned ?? 0}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active tickets</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-foreground">{stats?.inProgress ?? 0}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Under investigation</p>
            </div>
          </div>

          {/* Waiting for Student */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Waiting</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-foreground">{stats?.waiting ?? 0}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Student info needed</p>
            </div>
          </div>

          {/* Due Soon (At Risk) */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Due Soon</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats?.dueSoon ?? 0}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">&lt; 20% SLA left</p>
            </div>
          </div>

          {/* SLA Breached */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Overdue</span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {stats?.slaBreached ?? 0}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">SLA breached</p>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Assigned Tickets Queue
            </h2>
            <p className="text-xs text-muted-foreground">
              Review, diagnose, add internal notes, and resolve requests assigned to you.
            </p>
          </div>

          {/* Multi-Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket, student..."
                className="pl-9 pr-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_STUDENT">Waiting</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ESCALATED">Escalated</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All SLA States</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
              <option value="BREACHED">Breached</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-8 h-8" />}
            title="No tickets in this view"
            description="All clear! No tickets currently match your active search or filter selection."
          />
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Student</th>
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

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-xs text-foreground">
                          {t.student_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {t.student_dept}
                        </div>
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
                          Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
