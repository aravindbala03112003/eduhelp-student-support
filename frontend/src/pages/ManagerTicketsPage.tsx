import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  UserCheck,
  ArrowRight,
  Inbox,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { getTickets, getCategories, getStaffWorkload, assignTicket } from '../services/api.js';
import { Ticket, Category, StaffWorkloadItem } from '../types/index.js';
import { Button } from '../components/common/Button.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { PriorityBadge } from '../components/common/PriorityBadge.js';
import { SlaIndicator } from '../components/common/SlaIndicator.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { TableSkeleton } from '../components/common/LoadingState.js';
import { Modal } from '../components/common/Modal.js';

export const ManagerTicketsPage: React.FC = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [staffList, setStaffList] = useState<StaffWorkloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Quick Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getTickets({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category_id: categoryFilter || undefined,
        assigned_to: assignedFilter || undefined,
        sla_status: slaFilter || undefined,
        page,
        limit: 15,
      });
      setTickets(res.data);
      setPagination(res.pagination || { page: 1, limit: 15, total: res.data.length, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, staff] = await Promise.all([getCategories(), getStaffWorkload()]);
        setCategories(cats);
        setStaffList(staff);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, statusFilter, priorityFilter, categoryFilter, assignedFilter, slaFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const openAssignModal = (ticketId: string, currentAssigneeId?: string | null) => {
    setSelectedTicketId(ticketId);
    setSelectedStaff(currentAssigneeId || (staffList[0]?.id ?? ''));
    setAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedTicketId || !selectedStaff) return;
    try {
      setAssignLoading(true);
      await assignTicket(selectedTicketId, selectedStaff);
      setAssignModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Institutional Ticket Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, filter, assign, and supervise all educational support requests across all departments.
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg border border-border">
          Total Requests: <strong>{pagination.total}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticket #, subject, student name, description..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="shrink-0">
            Search
          </Button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-border">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New (Unassigned/Triage)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_STUDENT">Waiting for Student</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
            <option value="ESCALATED">Escalated</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent (8h)</option>
            <option value="HIGH">High (24h)</option>
            <option value="MEDIUM">Medium (48h)</option>
            <option value="LOW">Low (72h)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Assigned Staff Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => {
              setAssignedFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned Only</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.totalOpen} open)
              </option>
            ))}
          </select>

          {/* SLA Health Filter */}
          <select
            value={slaFilter}
            onChange={(e) => {
              setSlaFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All SLA Statuses</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk (&lt;20%)</option>
            <option value="BREACHED">SLA Breached</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-8 h-8" />}
          title="No requests match your filters"
          description="Try broadening your search query or reset the category/status filters."
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground select-none">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject & Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Handler</th>
                  <th className="py-3 px-4">SLA Countdown</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/tickets/${t.id}`)}
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

                    <td
                      className="py-3.5 px-4 whitespace-nowrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAssignModal(t.id, t.assigned_to);
                      }}
                    >
                      {t.assigned_to_name ? (
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary hover:underline"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                          <span>{t.assigned_to_name}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900 hover:bg-amber-100"
                        >
                          Assign Staff
                        </button>
                      )}
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
                        Manage <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Ticket to Staff Member"
        description="Select a support staff member to take ownership. Workload metrics indicate current open burden."
      >
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-2">
            {staffList.map((s) => (
              <label
                key={s.id}
                className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  selectedStaff === s.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="assigned_staff_quick"
                    checked={selectedStaff === s.id}
                    onChange={() => setSelectedStaff(s.id)}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {s.department}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">
                    {s.totalOpen} open
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {s.overdue > 0 ? (
                      <span className="text-rose-500 font-semibold">{s.overdue} overdue</span>
                    ) : (
                      '0 overdue'
                    )}
                  </span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={assignLoading}
              onClick={handleConfirmAssignment}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
