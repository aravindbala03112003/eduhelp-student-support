import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { getCategories, createTicket } from '../services/api.js';
import { Category, TicketPriority } from '../types/index.js';
import { Button } from '../components/common/Button.js';
import { Modal } from '../components/common/Modal.js';

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Success Confirmation Modal
  const [createdTicket, setCreatedTicket] = useState<{ id: string; ticket_number: string } | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!categoryId) {
      errs.category = 'Please select a request category.';
    }

    if (!subject.trim()) {
      errs.subject = 'Subject is required.';
    } else if (subject.trim().length < 5) {
      errs.subject = 'Subject must be at least 5 characters.';
    } else if (subject.trim().length > 200) {
      errs.subject = 'Subject cannot exceed 200 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Description is required.';
    } else if (description.trim().length < 10) {
      errs.description = 'Please provide at least 10 characters describing the issue.';
    } else if (description.trim().length > 3000) {
      errs.description = 'Description cannot exceed 3000 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate size (max 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: 'File size exceeds maximum limit of 5MB.' }));
      return;
    }

    // Validate type (images, pdfs, docs)
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(selected.type)) {
      setErrors((prev) => ({ ...prev, file: 'Invalid format. Allowed formats: PDF, PNG, JPG, WEBP.' }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.file;
      return next;
    });
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await createTicket({
        category_id: categoryId as number,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });

      setCreatedTicket({
        id: res.id,
        ticket_number: res.ticket_number,
      });
    } catch (err: any) {
      setServerError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSlaHours = (p: TicketPriority) => {
    switch (p) {
      case 'URGENT':
        return 8;
      case 'HIGH':
        return 24;
      case 'MEDIUM':
        return 48;
      case 'LOW':
        return 72;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create Support Request
          </h1>
          <p className="text-xs text-muted-foreground">
            Submit your inquiry or issue directly to institutional support officers.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-card p-6 sm:p-8 space-y-6">
        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={loadingCats}
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.category ? 'border-rose-500' : 'border-border'
              }`}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
            {selectedCategory?.description && (
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                {selectedCategory.description}
              </p>
            )}
          </div>

          {/* Priority Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="LOW">Low (Standard Non-Urgent)</option>
              <option value="MEDIUM">Medium (Normal Course Business)</option>
              <option value="HIGH">High (Time Sensitive)</option>
              <option value="URGENT">Urgent (Critical Exam/Safety Blocker)</option>
            </select>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>
                Standard SLA Resolution Target: <strong>{getSlaHours(priority)} hours</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
            Subject / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Bonafide Certificate request for Passport appointment"
            maxLength={200}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.subject ? 'border-rose-500' : 'border-border'
            }`}
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
            {errors.subject ? (
              <span className="text-rose-500">{errors.subject}</span>
            ) : (
              <span>Clear summary of your request</span>
            )}
            <span>{subject.length}/200</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide all relevant details such as reference transaction IDs, room numbers, course codes, or deadlines..."
            maxLength={3000}
            className={`w-full px-3.5 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed ${
              errors.description ? 'border-rose-500' : 'border-border'
            }`}
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
            {errors.description ? (
              <span className="text-rose-500">{errors.description}</span>
            ) : (
              <span>Include full context to prevent delayed information requests</span>
            )}
            <span>{description.length}/3000</span>
          </div>
        </div>

        {/* File Attachment Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
            Supporting Document or Proof (Optional)
          </label>
          {file ? (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Remove attached file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
              <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-xs font-medium text-foreground">
                Click to attach document or drag and drop
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PDF, PNG, JPG, or WEBP (max 5MB)
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />
            </label>
          )}
          {errors.file && <p className="text-xs text-rose-500 mt-1">{errors.file}</p>}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/student/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
          >
            Submit Request
          </Button>
        </div>
      </form>

      {/* Success Confirmation Modal */}
      {createdTicket && (
        <Modal
          isOpen={true}
          onClose={() => navigate(`/tickets/${createdTicket.id}`)}
          title="Your Request Has Been Submitted"
          maxWidth="md"
        >
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Your request has been registered in the institutional queue.
              </p>
              <div className="mt-3 p-3 bg-muted/60 rounded-lg inline-block border border-border">
                <span className="text-xs text-muted-foreground block">Assigned Ticket Reference</span>
                <span className="font-mono text-base font-bold text-primary tracking-wide">
                  {createdTicket.ticket_number}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Our support team will review your inquiry within the designated SLA window. You will receive notifications as progress updates occur.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/tickets/${createdTicket.id}`)}
              >
                View Ticket Details
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
