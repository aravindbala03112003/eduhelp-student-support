import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Download, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getReportsAnalytics } from '../services/api.js';
import { ReportAnalytics } from '../types/index.js';
import { Button } from '../components/common/Button.js';
import { CardSkeleton } from '../components/common/LoadingState.js';

export const ReportsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getReportsAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExportCSV = () => {
    if (!analytics) return;
    const rows = [
      ['Metric Category', 'Name / Attribute', 'Value'],
      ...analytics.byCategory.map((c) => ['Category', c.name, c.count]),
      ...analytics.byPriority.map((p) => ['Priority', p.priority, p.count]),
      ...analytics.byStatus.map((s) => ['Status', s.status, s.count]),
      ...analytics.ageingDistribution.map((a) => ['Ageing Bracket', a.bracket, a.count]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eduhelp_operations_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Institutional Operations Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historical analytics, resolution velocity benchmarks, and SLA compliance metrics.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
        >
          Export CSV Summary
        </Button>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="space-y-8">
          {/* Resolution Velocity Chart */}
          <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              14-Day Inflow vs Resolution Trajectory
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics?.volumeOverTime || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
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
                    name="Requests Raised"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Requests Completed"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2-Column Visual Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Requests by Priority Tier
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.byPriority || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Tickets" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SLA Compliance Proportion */}
            <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-4">
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                SLA Compliance Breakdown
              </h2>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.slaPerformance || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
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
        </div>
      )}
    </div>
  );
};
