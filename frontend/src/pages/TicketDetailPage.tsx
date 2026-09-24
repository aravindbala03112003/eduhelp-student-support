import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Calendar,
  User as UserIcon,
  Tag,
  Paperclip,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import {
  getTicketById,
  addComment,
  addInternalNote,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  resolveTicket,
  escalateTicket,
  reopenTicket,
  getStaffWorkload,
} from '../services/api.js';
import { Ticket, TicketStatus, TicketPriority, StaffWorkloadItem } from '../types/index.js';
import { Button } from '../components/common/Button.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { PriorityBadge } from '../components/common/PriorityBadge.js';
import { SlaIndicator } from '../components/common/SlaIndicator.js';
import { TicketTimeline } from '../components/common/TicketTimeline.js';
import { Modal } from '../components/common/Modal.js';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab for Main Area: Conversation vs History/Timeline
  const [activeTab, setActiveTab] = useState<'conversation' | 'timeline'>('conversation');

  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Modals for actions
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);

  // Modal form states
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffList, setStaffList] = useState<StaffWorkloadItem[]>([]);
  const [newStatus, setNewStatus] = useState<TicketStatus>('IN_PROGRESS');
  const [newPriority, setNewPriority] = useState<TicketPriority>('HIGH');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [escalationReason, setEscalateReason] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const role = user?.role || 'STUDENT';
  const isStudent = role === 'STUDENT';
  const isStaff = role === 'STAFF';
  const isManager = role === 'MANAGER';

  const loadTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getTicketById(id);
      setTicket(data);
      setNewStatus(data.status);
      setNewPriority(data.priority);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadStaffMembers = async () => {
    try {
      const data = await getStaffWorkload();
      setStaffList(data);
      if (data.length > 0 && !selectedStaff) {
        setSelectedStaff(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    try {
      setCommentSubmitting(true);
      if (isInternalNote && !isStudent) {
        await addInternalNote(id, commentText.trim());
      } else {
        await addComment(id, commentText.trim());
      }
      setCommentText('');
      await loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!id || !selectedStaff) return;
    try {
      setActionLoading(true);
      await assignTicket(id, selectedStaff);
      setAssignModalOpen(false);
      await loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to assign ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await updateTicketStatus(id, newStatus);
      setStatusModalOpen(false);
      await loadTicket();
    } catch (err: any) {
      alert(err.message || 'Status transition failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityUpdate = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await updateTicketPriority(id, newPriority);
      setPriorityModalOpen(false);
      await loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to update priority.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!id || !resolutionRemarks.trim()) return;
    try {
      setActionLoading(true);
      await resolveTicket(id, resolutionRemarks.trim());
      setResolveModalOpen(false);
      setResolutionRemarks('');
      await loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await escalateTicket(id, escalationReason.trim() || undefined);
      setEscalateModalOpen(false);
      setEscalateReason('');
      await loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to escalate ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!id || !reopenReason.trim()) return;
    try {
      setActionLoading(true);
      await reopenTicket(id, reopenReason.trim());
      setReopenModalOpen(false);
      setReopenReason('');
      await loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to reopen ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Access Restricted or Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error || 'The requested ticket could not be loaded.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Return to previous screen
        </Button>
      </div>
    );
  }

  const isTerminal = ['RESOLVED', 'CLOSED'].includes(ticket.status);
  const canReopen = isStudent && ticket.status === 'RESOLVED';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Navigation & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-0.5"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-sm font-bold text-primary">
                {ticket.ticket_number}
              </span>
              <StatusBadge status={ticket.status} size="sm" />
              <PriorityBadge priority={ticket.priority} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Action Buttons Toolbar depending on Role */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Reopen Action for Student */}
          {canReopen && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4 text-rose-500" />}
              onClick={() => setReopenModalOpen(true)}
            >
              Reopen Request
            </Button>
          )}

          {/* Staff & Manager Actions */}
          {!isStudent && (
            <>
              {isManager && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<UserCheck className="w-4 h-4 text-purple-500" />}
                  onClick={() => {
                    loadStaffMembers();
                    setAssignModalOpen(true);
                  }}
                >
                  {ticket.assigned_to ? 'Reassign' : 'Assign Staff'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4 text-amber-500" />}
                onClick={() => setStatusModalOpen(true)}
              >
                Change Status
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowUpDown className="w-4 h-4 text-indigo-500" />}
                onClick={() => setPriorityModalOpen(true)}
              >
                Priority
              </Button>

              {ticket.status !== 'ESCALATED' && !isTerminal && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<AlertTriangle className="w-4 h-4 text-red-500" />}
                  onClick={() => setEscalateModalOpen(true)}
                >
                  Escalate
                </Button>
              )}

              {!isTerminal && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => setResolveModalOpen(true)}
                >
                  Resolve
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Layout Grid: Left Content (2 cols) & Right Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description, Conversation & Timeline Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Issue Description Card */}
          <div className="p-6 bg-card rounded-xl border border-border shadow-card space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
              <span className="font-semibold uppercase tracking-wider text-foreground">
                Original Request Statement
              </span>
              <span>Raised by {ticket.student_name || 'Student'}</span>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>

            {/* Resolution note banner if resolved */}
            {ticket.resolution_notes && (
              <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Resolution Remarks
                </span>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  {ticket.resolution_notes}
                </p>
              </div>
            )}
          </div>

          {/* Conversation Thread & Activity Timeline Tabs */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center border-b border-border px-4 bg-muted/40">
              <button
                onClick={() => setActiveTab('conversation')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'conversation'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Conversation ({ticket.comments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Audit History ({ticket.history?.length || 0})
              </button>
            </div>

            {/* Tab 1: Conversation Messages */}
            {activeTab === 'conversation' && (
              <div className="p-6 space-y-6">
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div className="space-y-4">
                    {ticket.comments.map((comment) => {
                      const isInternal = comment.is_internal;
                      const isOwn = comment.user_id === user?.id;

                      return (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-xl border transition-colors ${
                            isInternal
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : isOwn
                              ? 'bg-primary/5 border-primary/20'
                              : 'bg-muted/40 border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-foreground">
                                {comment.author_name}
                              </span>
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.2 rounded uppercase ${
                                  comment.author_role === 'STUDENT'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                }`}
                              >
                                {comment.author_role}
                              </span>

                              {isInternal && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-200/50 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">
                                  <Lock className="w-3 h-3" />
                                  Internal Staff Note
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    No comments in this thread yet.
                  </p>
                )}

                {/* Comment Box */}
                {!isTerminal || canReopen ? (
                  <form onSubmit={handlePostComment} className="pt-4 border-t border-border space-y-3">
                    {/* Toggle Internal Note for Staff / Manager */}
                    {!isStudent && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsInternalNote(!isInternalNote)}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                            isInternalNote
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                              : 'bg-card border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          {isInternalNote ? 'Writing Internal Note (Hidden from Student)' : 'Make Note Private'}
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      <textarea
                        rows={3}
                        required
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={
                          isInternalNote
                            ? 'Enter private staff note (will strictly NOT be visible to student)...'
                            : isStudent
                            ? 'Type your reply or additional information here...'
                            : 'Post a public reply to the student...'
                        }
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed bg-card text-foreground ${
                          isInternalNote ? 'border-amber-500/50 bg-amber-500/5' : 'border-border'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {isStudent && ticket.status === 'WAITING_FOR_STUDENT' && (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Replying will automatically mark ticket as IN PROGRESS.
                        </span>
                      )}
                      <div className="ml-auto">
                        <Button
                          type="submit"
                          variant={isInternalNote ? 'secondary' : 'primary'}
                          size="sm"
                          isLoading={commentSubmitting}
                          rightIcon={<Send className="w-3.5 h-3.5" />}
                        >
                          {isInternalNote ? 'Save Internal Note' : 'Post Reply'}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 rounded-lg bg-muted text-center text-xs text-muted-foreground">
                    This request has been resolved and closed. Further comments are locked.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Audit History / Timeline */}
            {activeTab === 'timeline' && (
              <div className="p-6">
                <TicketTimeline events={ticket.history || []} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Metadata Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
              Request Metadata
            </h3>

            <div className="space-y-4 text-xs">
              {/* Category */}
              <div>
                <span className="text-muted-foreground block mb-1">Category</span>
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {ticket.category_name}
                </span>
              </div>

              {/* Assigned Handler */}
              <div>
                <span className="text-muted-foreground block mb-1">Assigned Support Staff</span>
                {ticket.assigned_to_name ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center">
                      {ticket.assigned_to_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">
                        {ticket.assigned_to_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {ticket.assigned_to_dept || 'Support Officer'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Unassigned (In Triage Queue)
                  </span>
                )}
              </div>

              {/* SLA Target */}
              <div>
                <span className="text-muted-foreground block mb-1">SLA Target & Countdown</span>
                <SlaIndicator
                  status={ticket.slaStatus}
                  timeRemainingFormatted={ticket.slaRemainingFormatted}
                  percentRemaining={ticket.slaPercentRemaining}
                  isAtRisk={ticket.slaIsAtRisk}
                  showBar={true}
                />
              </div>

              {/* Ticket Age */}
              <div>
                <span className="text-muted-foreground block mb-1">Age</span>
                <span className="font-medium text-foreground">
                  {ticket.ageFormatted} (Bracket: {ticket.ageBracket})
                </span>
              </div>

              {/* Timestamps */}
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Created</span>
                  <span className="font-medium text-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Last Activity</span>
                  <span className="font-medium text-foreground">
                    {new Date(ticket.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {ticket.resolved_at && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Resolved</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {new Date(ticket.resolved_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Profile Card (visible to staff & manager) */}
          {!isStudent && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
                Requester Information
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Name</span>
                  <span className="font-semibold text-foreground text-sm">
                    {ticket.student_name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Email</span>
                  <span className="text-foreground">{ticket.student_email}</span>
                </div>
                {ticket.student_dept && (
                  <div>
                    <span className="text-muted-foreground block">Department / Program</span>
                    <span className="text-foreground">{ticket.student_dept}</span>
                  </div>
                )}
                {ticket.student_phone && (
                  <div>
                    <span className="text-muted-foreground block">Contact Phone</span>
                    <span className="text-foreground">{ticket.student_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Assign Staff (Manager) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Ticket to Support Staff"
        description="Select a support staff member. Current open ticket workload is shown."
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
                    name="assigned_staff"
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
              isLoading={actionLoading}
              onClick={handleAssign}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Change Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Ticket Status"
        description="Select next lifecycle status. Only permissible state transitions will be accepted."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              Next Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ASSIGNED">ASSIGNED (Awaiting initial review)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Currently being processed)</option>
              <option value="WAITING_FOR_STUDENT">WAITING_FOR_STUDENT (Information requested)</option>
              <option value="RESOLVED">RESOLVED (Resolution finalized)</option>
              <option value="CLOSED">CLOSED (Archived terminal state)</option>
              <option value="ESCALATED">ESCALATED (Elevated to management)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              onClick={handleStatusUpdate}
            >
              Save Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Change Priority */}
      <Modal
        isOpen={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        title="Adjust Ticket Priority"
        description="Modifying priority will automatically recompute the SLA countdown from original creation."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              New Priority
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="LOW">Low (72 Hours SLA)</option>
              <option value="MEDIUM">Medium (48 Hours SLA)</option>
              <option value="HIGH">High (24 Hours SLA)</option>
              <option value="URGENT">Urgent (8 Hours SLA)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setPriorityModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              onClick={handlePriorityUpdate}
            >
              Confirm Priority Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Resolve Ticket */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Ticket"
        description="Provide comprehensive resolution notes for the student."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              Resolution Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.target.value)}
              placeholder="Explain how the student request was fulfilled, dispatch details, reference numbers, or next steps..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              onClick={handleResolve}
            >
              Mark Resolved
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: Escalate Ticket */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title="Escalate Ticket"
        description="Escalate this request to senior administrative review and supervisor queues."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              Escalation Rationale (Recorded as Internal Staff Note)
            </label>
            <textarea
              rows={3}
              value={escalationReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="e.g., Unresolved SLA breach, upcoming statutory university deadline..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={actionLoading}
              onClick={handleEscalate}
            >
              Confirm Escalation
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: Reopen Ticket (Student) */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Reopen Request"
        description="If your inquiry was not fully resolved, state the reason below."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              Reopening Explanation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Describe what still needs attention or why the issue persists..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setReopenModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              onClick={handleReopen}
            >
              Reopen Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
