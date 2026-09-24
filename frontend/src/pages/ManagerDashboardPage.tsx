import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  ArrowUpDown,
  UserCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { getDashboardStats, getReportsAnalytics, getStaffWorkload } from '../services/api.js';
import {
  ManagerDashboardStats,
  ReportAnalytics,
  StaffWorkloadItem,
} from '../types/index.js';
import { Button } from '../components/common/Button.js';
import { CardSkeleton } from '../components/common/LoadingState.js';

export const ManagerDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);
  const [workload, setWorkload] = useState<StaffWorkloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Workload table sorting
  const [sortField, setSortField] = useState<keyof StaffWorkloadItem>('totalOpen');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, analyticsData, workloadData] = await Promise.all([
          getDashboardStats(),
          getReportsAnalytics(),
          getStaffWorkload(),
        ]);
        setStats(statsData as ManagerDashboardStats);
        setAnalytics(analyticsData);
        setWorkload(workloadData);
      } catch (err) {
        console.error('Failed to load manager executive dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const sortedWorkload = [...workload].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const handleSort = (field: keyof StaffWorkloadItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];
  const PRIORITY_COLORS: Record<string, string> = {
    LOW: '#64748B',
    MEDIUM: '#3B82F6',
    HIGH: '#F59E0B',
    URGENT: '#EF4444',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Executive Operations Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Institutional overview of support request volumes, staff capacity, and SLA compliance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/manager/tickets')}
          >
            Manage All Tickets
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/manager/reports')}
          >
            Detailed Reports
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Tickets */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Volume
            </span>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-foreground tracking-tight">
                {stats?.totalTickets ?? 0}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Recorded requests</p>
            </div>
          </div>

          {/* Open Tickets */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Open Queue
            </span>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                {stats?.open ?? 0}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active uncompleted</p>
            </div>
          </div>

          {/* SLA At Risk */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              SLA At Risk
            </span>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {stats?.slaAtRisk ?? 0}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">&lt; 20% window left</p>
            </div>
          </div>

          {/* SLA Breached */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              SLA Breached
            </span>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {stats?.slaBreached ?? 0}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Overdue open tickets</p>
            </div>
          </div>

          {/* Resolved */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Resolved
            </span>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {stats?.resolved ?? 0}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Completed tickets</p>
            </div>
          </div>

          {/* Avg Resolution Time */}
          <div className="p-4 bg-card rounded-xl border border-border shadow-card flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Avg Resolution
            </span>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                {stats?.avgResolutionHours ?? 0}h
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">From creation to fix</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Charts Grid 1: Volume Over Time & SLA Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Volume Over Time (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Ticket Volume & Resolution Velocity (Last 14 Days)
              </h2>
              <p className="text-xs text-muted-foreground">
                Inflow of new student requests vs resolved items.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.volumeOverTime || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="New Requests"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Requests"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Performance Distribution (1 col) */}
        <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              SLA Health Breakdown
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time proportion of tickets on track vs breached.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.slaPerformance || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {(analytics?.slaPerformance || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid 2: Category Breakdown & Ageing Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Ticket Volume by Departmental Category
            </h2>
            <p className="text-xs text-muted-foreground">
              Helps identify institutional bottlenecks across departments.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.byCategory || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 11 }} width={55} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Tickets" fill="#6366F1" radius={[0, 4, 4, 0]}>
                  {(analytics?.byCategory || []).map((_, index) => (
                    <Cell key={`cell-cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ageing Distribution */}
        <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Ticket Ageing Distribution
            </h2>
            <p className="text-xs text-muted-foreground">
              Categorized age brackets (0–1d, 1–3d, 3–7d, 7+d) to highlight stagnant tickets.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.ageingDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Active Tickets" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 21: Staff Workload Table */}
      <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              Support Staff Workload & Capacity Overview
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitor individual staff assignments, active items, and overdue tickets to balance load.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            Click column headers to sort
          </span>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground select-none">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center gap-1.5">
                    Staff Member <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('assigned')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    Assigned <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('inProgress')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    In Progress <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('waiting')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    Waiting <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('overdue')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    Overdue <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('resolved')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    Resolved <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalOpen')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Total Open Load <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedWorkload.map((staff) => {
                // Highlight high workload (> 5 open tickets) neutrally
                const isHighLoad = staff.totalOpen >= 5;

                return (
                  <tr
                    key={staff.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {staff.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-foreground block">
                            {staff.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {staff.department}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-xs text-foreground whitespace-nowrap">
                      {staff.assigned}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {staff.inProgress}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-xs text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      {staff.waiting}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {staff.overdue > 0 ? (
                        <span className="font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                          {staff.overdue}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {staff.resolved}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`font-bold text-xs px-2 py-0.5 rounded ${
                            isHighLoad
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'text-foreground'
                          }`}
                        >
                          {staff.totalOpen} tickets
                        </span>
                        {isHighLoad && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
                            High Load
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
