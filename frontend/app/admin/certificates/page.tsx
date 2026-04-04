'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

type ProgressQuiz = {
  quizId: string;
  quizTitle: string;
  bestPct: number | null;
  passed: boolean;
  attempted: boolean;
};

type ProgressStudent = {
  userId: string;
  name?: string;
  email?: string;
  assignedQuizCount: number;
  attemptedQuizCount: number;
  passedQuizCount: number;
  allQuizzesAttempted: boolean;
  allQuizzesPassed: boolean;
  overallAverage: number | null;
  averageOnAttempted: number;
  canIssueCertificate: boolean;
  status: 'eligible' | 'below_avg' | 'not_all_passed' | 'in_progress';
  perQuiz: ProgressQuiz[];
};

type CertRow = {
  _id: string;
  recipientName: string;
  userEmail: string;
  subjectTitle: string;
  averagePercentage: number;
  assignedQuizCount: number;
  minAverageRequired?: number;
  pdfUrl: string;
  issuedOnText?: string;
  emailSentAt?: string;
  emailError?: string;
  createdAt?: string;
  userId?: { _id?: string; name?: string; email?: string };
  certificateScope?: 'subject' | 'topics';
  scopeDescription?: string;
};

type TopicRow = { _id: string; title: string; parentTopicId?: string | null; order?: number };

function sortTopicsForCertificatePicker(topics: TopicRow[]): { topic: TopicRow; depth: number }[] {
  const byId = new Map(topics.map((t) => [t._id, t]));
  const depthMemo = new Map<string, number>();
  function depthOf(id: string): number {
    if (depthMemo.has(id)) return depthMemo.get(id)!;
    const t = byId.get(id);
    if (!t || !t.parentTopicId) {
      depthMemo.set(id, 0);
      return 0;
    }
    const pid = String(t.parentTopicId);
    if (!byId.has(pid)) {
      depthMemo.set(id, 0);
      return 0;
    }
    const d = 1 + depthOf(pid);
    depthMemo.set(id, d);
    return d;
  }
  return [...topics]
    .map((topic) => ({ topic, depth: depthOf(topic._id) }))
    .sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return (a.topic.order ?? 0) - (b.topic.order ?? 0);
    });
}

function barColorClass(pct: number, threshold: number): string {
  if (pct >= threshold) return 'bg-emerald-500';
  if (pct >= threshold - 15) return 'bg-amber-500';
  return 'bg-red-400';
}

function PercentBar({
  value,
  threshold,
  slim,
}: {
  value: number;
  threshold: number;
  slim?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const h = slim ? 'h-1.5' : 'h-2.5';
  return (
    <div className="flex min-w-[100px] max-w-[220px] items-center gap-2">
      <div className={`min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 ${h}`}>
        <div
          className={`${h} rounded-full transition-[width] ${barColorClass(pct, threshold)}`}
          style={{ width: `${pct}%` }}
          title={`${pct.toFixed(1)}% (threshold ${threshold}%)`}
        />
      </div>
      <span className="w-11 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-800">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

function QuizAttemptBar({ q, threshold }: { q: ProgressQuiz; threshold: number }) {
  if (!q.attempted) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="max-w-[130px] truncate text-gray-500" title={q.quizTitle}>
          {q.quizTitle}
        </span>
        <span className="text-gray-400">—</span>
      </div>
    );
  }
  const pct = Math.min(100, Math.max(0, q.bestPct ?? 0));
  const h = 'h-1.5';
  const fill = q.passed ? 'bg-emerald-500' : 'bg-red-400';
  return (
    <div className="flex min-w-[100px] max-w-[200px] flex-wrap items-center gap-2 text-xs sm:flex-nowrap">
      <span className="max-w-[130px] truncate text-gray-600" title={q.quizTitle}>
        {q.quizTitle}
        {q.passed ? (
          <span className="ml-1 text-emerald-600" title="Passed">
            ✓
          </span>
        ) : (
          <span className="ml-1 text-red-500" title="Not passed">
            ✗
          </span>
        )}
      </span>
      <div className={`min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 ${h}`}>
        <div className={`${h} rounded-full ${fill}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-semibold tabular-nums text-gray-800">{pct.toFixed(0)}%</span>
    </div>
  );
}

function statusBadge(status: ProgressStudent['status']) {
  const styles: Record<ProgressStudent['status'], string> = {
    eligible: 'bg-emerald-100 text-emerald-900',
    below_avg: 'bg-amber-100 text-amber-900',
    not_all_passed: 'bg-red-100 text-red-800',
    in_progress: 'bg-gray-100 text-gray-700',
  };
  const labels: Record<ProgressStudent['status'], string> = {
    eligible: 'Ready to issue',
    below_avg: 'All passed · avg low',
    not_all_passed: 'Not all passed',
    in_progress: 'In progress',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

const filterSelectClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 [color-scheme:light] focus:border-red-500 focus:ring-1 focus:ring-red-500';

export default function AdminCertificatesPage() {
  const [tab, setTab] = useState<'generate' | 'manage'>('generate');

  const [subjects, setSubjects] = useState<{ _id: string; title: string }[]>([]);
  const [batches, setBatches] = useState<{ code: string; name: string }[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [minAverage, setMinAverage] = useState(70);
  const [batchScope, setBatchScope] = useState<'all' | 'batch_only'>('all');
  const [batchCode, setBatchCode] = useState('');
  /** Entire subject vs only quizzes under selected topics (each includes its subtopics). */
  const [certScopeMode, setCertScopeMode] = useState<'subject' | 'topics'>('subject');
  const [topicsForSubject, setTopicsForSubject] = useState<TopicRow[]>([]);
  const [selectedScopeTopicIds, setSelectedScopeTopicIds] = useState<Set<string>>(new Set());

  const [progressLoading, setProgressLoading] = useState(false);
  const [progressData, setProgressData] = useState<{
    subjectTitle?: string;
    assignedQuizCount?: number;
    minAverage?: number;
    certificateScope?: 'subject' | 'topics';
    scopeTopicIds?: string[];
    students: ProgressStudent[];
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'eligible' | 'in_progress' | 'not_all_passed' | 'below_avg'
  >('all');
  const [minPctFilter, setMinPctFilter] = useState(0);
  const [studentSearch, setStudentSearch] = useState('');
  const [manageSearch, setManageSearch] = useState('');
  const [manageSearchApplied, setManageSearchApplied] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendEmail, setSendEmail] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [listItems, setListItems] = useState<CertRow[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listTotalPages, setListTotalPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [filterListSubject, setFilterListSubject] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getSubjects({ page: 1, limit: 400, isActive: true });
        const items = (res.data as any)?.items || [];
        setSubjects(Array.isArray(items) ? items : []);
      } catch {
        setSubjects([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getBatches(1, 500);
        const items = (res.data as any)?.items || [];
        if (res.success && Array.isArray(items)) {
          setBatches(
            items.map((b: { code?: string; name?: string }) => ({
              code: String(b.code ?? ''),
              name: String(b.name ?? b.code ?? ''),
            }))
          );
        }
      } catch {
        setBatches([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setTopicsForSubject([]);
      return;
    }
    (async () => {
      try {
        const res = await apiService.getTopics(subjectId, true);
        const raw = Array.isArray(res.data) ? (res.data as TopicRow[]) : [];
        setTopicsForSubject(raw);
      } catch {
        setTopicsForSubject([]);
      }
    })();
  }, [subjectId]);

  const topicIdsQueryParam =
    certScopeMode === 'topics' && selectedScopeTopicIds.size > 0
      ? Array.from(selectedScopeTopicIds).join(',')
      : undefined;

  const topicsPickerRows = useMemo(() => sortTopicsForCertificatePicker(topicsForSubject), [topicsForSubject]);

  const loadSubjectProgress = async () => {
    if (!subjectId) {
      toast.error('Select a subject');
      return;
    }
    if (certScopeMode === 'topics' && selectedScopeTopicIds.size === 0) {
      toast.error('Select at least one topic, or switch to “Entire subject”.');
      return;
    }
    setProgressLoading(true);
    setProgressData(null);
    setStudentSearch('');
    setSelected(new Set());
    try {
      const res = await apiService.getCertificateSubjectProgress({
        subjectId,
        minAverage,
        batchScope: batchScope === 'batch_only' ? 'batch_only' : 'all',
        ...(batchScope === 'batch_only' ? { batchCode: batchCode.trim() || undefined } : {}),
        ...(topicIdsQueryParam ? { topicIds: topicIdsQueryParam } : {}),
      });
      if (!res.success || !res.data) {
        throw new Error((res as any).error?.message || 'Failed to load students');
      }
      const d = res.data as {
        subjectTitle?: string;
        assignedQuizCount?: number;
        minAverage?: number;
        certificateScope?: 'subject' | 'topics';
        scopeTopicIds?: string[];
        students?: ProgressStudent[];
      };
      const students = Array.isArray(d.students) ? d.students : [];
      setProgressData({
        subjectTitle: d.subjectTitle,
        assignedQuizCount: d.assignedQuizCount,
        minAverage: typeof d.minAverage === 'number' ? d.minAverage : minAverage,
        certificateScope: d.certificateScope,
        scopeTopicIds: Array.isArray(d.scopeTopicIds) ? d.scopeTopicIds : undefined,
        students,
      });
      if ((d.assignedQuizCount || 0) === 0) {
        toast.error('No quizzes are assigned to this subject via topics (quiz sets).');
      } else if (students.length === 0) {
        toast('No students have attempts on these quizzes yet.', { icon: 'ℹ️' });
      } else {
        const ready = students.filter((s) => s.canIssueCertificate).length;
        toast.success(`Loaded ${students.length} student(s) · ${ready} ready to issue`);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setProgressLoading(false);
    }
  };

  const thresholdUsed = progressData?.minAverage ?? minAverage;

  const filteredStudents = useMemo(() => {
    const list = progressData?.students ?? [];
    const q = studentSearch.trim().toLowerCase();
    return list.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      const compare = s.overallAverage ?? s.averageOnAttempted;
      if (minPctFilter > 0 && compare < minPctFilter) return false;
      if (q) {
        const name = (s.name || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [progressData, statusFilter, minPctFilter, studentSearch]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllIssuable = () => {
    const issuable = filteredStudents.filter((s) => s.canIssueCertificate);
    if (issuable.length === 0) return;
    const allSelected = issuable.every((s) => selected.has(s.userId));
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(issuable.map((s) => s.userId)));
    }
  };

  const handleGenerate = async () => {
    if (!subjectId || selected.size === 0) {
      toast.error('Select students to issue certificates');
      return;
    }
    const all = progressData?.students ?? [];
    for (const id of selected) {
      const s = all.find((x) => x.userId === id);
      if (!s?.canIssueCertificate) {
        toast.error('Only students marked “Ready to issue” can receive a certificate.');
        return;
      }
    }
    if (certScopeMode === 'topics' && selectedScopeTopicIds.size === 0) {
      toast.error('Select topics for this certificate, or switch to “Entire subject”.');
      return;
    }
    setGenerating(true);
    try {
      const res = await apiService.generateSubjectCertificates({
        subjectId,
        userIds: Array.from(selected),
        minAverage,
        batchScope: batchScope === 'batch_only' ? 'batch_only' : 'all',
        ...(batchScope === 'batch_only' ? { batchCode: batchCode.trim() || undefined } : {}),
        sendEmail,
        ...(topicIdsQueryParam
          ? { topicScopeIds: Array.from(selectedScopeTopicIds) }
          : {}),
      });
      if (!res.success) {
        throw new Error((res as any).error?.message || (res as any).message || 'Generate failed');
      }
      toast.success((res as any).message || 'Certificates issued');
      setSelected(new Set());
      setTab('manage');
      await loadList(1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Generate failed');
    } finally {
      setGenerating(false);
    }
  };

  const loadList = useCallback(
    async (page: number) => {
      setListLoading(true);
      try {
        const res = await apiService.listSubjectCertificates(
          page,
          15,
          filterListSubject || undefined,
          manageSearchApplied || undefined
        );
        if (res.success && res.data) {
          const d: any = res.data;
          setListItems(Array.isArray(d.items) ? d.items : []);
          setListPage(d.page || page);
          setListTotalPages(d.totalPages || 1);
        }
      } catch {
        toast.error('Failed to load certificates');
      } finally {
        setListLoading(false);
      }
    },
    [filterListSubject, manageSearchApplied]
  );

  useEffect(() => {
    const id = setTimeout(() => setManageSearchApplied(manageSearch.trim()), 350);
    return () => clearTimeout(id);
  }, [manageSearch]);

  useEffect(() => {
    if (tab !== 'manage') return;
    setListPage(1);
    void loadList(1);
  }, [tab, manageSearchApplied, filterListSubject, loadList]);

  const openEdit = (row: CertRow) => {
    setEditId(row._id);
    setEditName(row.recipientName || '');
    setEditDate(row.issuedOnText || '');
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSavingEdit(true);
    try {
      const res = await apiService.updateCertificate(editId, {
        recipientName: editName.trim(),
        issuedOnText: editDate.trim(),
      });
      if (!res.success) {
        throw new Error((res as any).error?.message || 'Update failed');
      }
      toast.success('Certificate updated (PDF regenerated)');
      setEditId(null);
      await loadList(listPage);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this certificate record and file?')) return;
    try {
      const res = await apiService.deleteCertificate(id);
      if (!res.success) throw new Error('Delete failed');
      toast.success('Deleted');
      await loadList(listPage);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="mt-1 text-sm text-gray-600">
            Students earn a certificate only when they <strong>pass every assigned quiz</strong> (at least one passing
            attempt each) <strong>and</strong> their <strong>average of best scores</strong> is ≥ your minimum %. Load
            students to see everyone with any progress, filter by status or min %, then issue only for “Ready to issue”.
            Optional PDF background:{' '}
            <code className="rounded bg-gray-100 px-1 text-xs">CERTIFICATE_BACKGROUND_URL</code>.
          </p>
        </div>
        <Link
          href="/admin/reports"
          className="text-sm font-medium text-red-600 hover:text-red-800"
        >
          ← Reports
        </Link>
      </div>

      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab('generate')}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            tab === 'generate' ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Generate
        </button>
        <button
          type="button"
          onClick={() => setTab('manage')}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            tab === 'manage' ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          View / edit / delete
        </button>
      </div>

      {tab === 'generate' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-700">Subject</label>
              <select
                className={filterSelectClass}
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setSelectedScopeTopicIds(new Set());
                  setCertScopeMode('subject');
                  setProgressData(null);
                }}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Min. average %</label>
              <input
                type="number"
                min={0}
                max={100}
                className={filterSelectClass}
                value={minAverage}
                onChange={(e) => setMinAverage(Number(e.target.value) || 70)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Batch scope</label>
              <select
                className={filterSelectClass}
                value={batchScope}
                onChange={(e) => setBatchScope(e.target.value as 'all' | 'batch_only')}
              >
                <option value="all">All students</option>
                <option value="batch_only">Filter by batch code</option>
              </select>
            </div>
          </div>

          {batchScope === 'batch_only' ? (
            <div className="max-w-md">
              <label className="mb-1 block text-xs font-semibold text-gray-700">Batch code</label>
              <select
                className={filterSelectClass}
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
              >
                <option value="">Select batch</option>
                {batches.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {subjectId ? (
            <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/80 p-4">
              <div className="text-xs font-semibold text-gray-700">Certificate coverage</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCertScopeMode('subject');
                    setSelectedScopeTopicIds(new Set());
                    setProgressData(null);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    certScopeMode === 'subject'
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Entire subject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCertScopeMode('topics');
                    setProgressData(null);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    certScopeMode === 'topics'
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Selected topics &amp; subtopics
                </button>
              </div>
              {certScopeMode === 'topics' ? (
                <div>
                  <p className="mb-2 text-xs text-gray-600">
                    Select one or more topics. Quizzes in those topics and in nested subtopics count. Students must pass
                    every quiz in this scope and meet the minimum average.
                  </p>
                  <div className="max-h-48 overflow-y-auto rounded border border-gray-200 bg-white p-2 text-sm">
                    {topicsPickerRows.length === 0 ? (
                      <p className="text-gray-500">No topics found for this subject.</p>
                    ) : (
                      topicsPickerRows.map(({ topic, depth }) => (
                        <label
                          key={topic._id}
                          className="flex cursor-pointer items-center gap-2 py-1 hover:bg-gray-50"
                          style={{ paddingLeft: `${8 + depth * 14}px` }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedScopeTopicIds.has(topic._id)}
                            onChange={() => {
                              setSelectedScopeTopicIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(topic._id)) next.delete(topic._id);
                                else next.add(topic._id);
                                return next;
                              });
                              setProgressData(null);
                            }}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-gray-800">{topic.title || 'Untitled'}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedScopeTopicIds.size} root topic(s) selected — click “Load…” again after changing selection.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadSubjectProgress()}
              disabled={progressLoading}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {progressLoading ? 'Loading…' : 'Load all students (subject progress)'}
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Email PDF to each student
            </label>
          </div>

          {progressData ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{progressData.subjectTitle}</span> —{' '}
                <span className="font-medium">{progressData.assignedQuizCount}</span> assigned quiz(zes) in this scope.
                Min. average: <strong>{thresholdUsed}%</strong>. Showing <strong>{filteredStudents.length}</strong> of{' '}
                {progressData.students.length} (after filters).
                {progressData.certificateScope === 'topics' ? (
                  <span className="ml-1 block text-xs text-amber-800">
                    Topic-scoped certificate (includes subtopics under selected roots).
                  </span>
                ) : null}
              </p>

              <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-4">
                <div className="min-w-[200px] flex-1 basis-[220px]">
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Search student</label>
                  <input
                    type="search"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Name or email…"
                    className={filterSelectClass}
                    autoComplete="off"
                  />
                </div>
                <div className="min-w-[160px]">
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Status</label>
                  <select
                    className={filterSelectClass}
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as 'all' | 'eligible' | 'in_progress' | 'not_all_passed' | 'below_avg'
                      )
                    }
                  >
                    <option value="all">All</option>
                    <option value="eligible">Ready to issue</option>
                    <option value="in_progress">In progress</option>
                    <option value="not_all_passed">Not all passed</option>
                    <option value="below_avg">All passed · avg below min</option>
                  </select>
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Min avg % (filter)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={filterSelectClass}
                    value={minPctFilter}
                    onChange={(e) => setMinPctFilter(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  />
                </div>
              </div>

              {filteredStudents.length > 0 ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={selectAllIssuable}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      {filteredStudents.filter((s) => s.canIssueCertificate).every((s) => selected.has(s.userId)) &&
                      filteredStudents.some((s) => s.canIssueCertificate)
                        ? 'Deselect issuable'
                        : 'Select all ready to issue'}
                    </button>
                    <button
                      type="button"
                      disabled={generating || selected.size === 0}
                      onClick={() => void handleGenerate()}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {generating ? 'Issuing…' : `Issue certificates (${selected.size})`}
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="w-10 px-3 py-2"></th>
                          <th className="px-3 py-2 font-semibold text-gray-800">Student</th>
                          <th className="px-3 py-2 font-semibold text-gray-800">Email</th>
                          <th className="px-3 py-2 font-semibold text-gray-800">Progress</th>
                          <th className="px-3 py-2 font-semibold text-gray-800">Status</th>
                          <th className="px-3 py-2 font-semibold text-gray-800">Average</th>
                          <th className="min-w-[220px] px-3 py-2 font-semibold text-gray-800">Per quiz</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((r) => (
                          <tr key={r.userId} className="hover:bg-gray-50">
                            <td className="px-3 py-2 align-top">
                              <input
                                type="checkbox"
                                disabled={!r.canIssueCertificate}
                                title={r.canIssueCertificate ? 'Select to issue' : 'Must pass all quizzes and meet avg'}
                                checked={selected.has(r.userId)}
                                onChange={() => toggleSelect(r.userId)}
                                className="mt-1 rounded border-gray-300 text-red-600 disabled:opacity-40"
                              />
                            </td>
                            <td className="px-3 py-2 align-top font-medium text-gray-900">{r.name || '—'}</td>
                            <td className="px-3 py-2 align-top text-gray-600">{r.email || '—'}</td>
                            <td className="px-3 py-2 align-top text-xs text-gray-700">
                              <div className="font-medium tabular-nums">
                                {r.attemptedQuizCount}/{r.assignedQuizCount} attempted
                              </div>
                              <div className="tabular-nums text-gray-600">
                                {r.passedQuizCount}/{r.assignedQuizCount} passed
                              </div>
                            </td>
                            <td className="px-3 py-2 align-top">{statusBadge(r.status)}</td>
                            <td className="px-3 py-2 align-top">
                              {r.overallAverage != null ? (
                                <PercentBar value={r.overallAverage} threshold={thresholdUsed} />
                              ) : (
                                <div className="text-xs text-gray-500">
                                  <span className="block">— (incomplete)</span>
                                  <span className="text-gray-400">Avg on tries: {r.averageOnAttempted}%</span>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                                {r.perQuiz.map((q) => (
                                  <QuizAttemptBar key={q.quizId} q={q} threshold={thresholdUsed} />
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">No rows match the current filters.</p>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1 basis-[240px]">
              <label className="mb-1 block text-xs font-semibold text-gray-700">Search recipient</label>
              <input
                type="search"
                value={manageSearch}
                onChange={(e) => setManageSearch(e.target.value)}
                placeholder="Name or email…"
                className={filterSelectClass}
                autoComplete="off"
              />
            </div>
            <div className="min-w-[200px]">
              <label className="mb-1 block text-xs font-semibold text-gray-700">Filter by subject</label>
              <select
                className={filterSelectClass}
                value={filterListSubject}
                onChange={(e) => {
                  setFilterListSubject(e.target.value);
                  setListPage(1);
                }}
              >
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {listLoading ? (
            <p className="text-gray-500">Loading…</p>
          ) : listItems.length === 0 ? (
            <p className="text-gray-600">No certificates issued yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-gray-800">Recipient</th>
                      <th className="px-3 py-2 font-semibold text-gray-800">Email</th>
                      <th className="px-3 py-2 font-semibold text-gray-800">Subject / scope</th>
                      <th className="min-w-[140px] px-3 py-2 font-semibold text-gray-800">Avg %</th>
                      <th className="px-3 py-2 font-semibold text-gray-800">Email sent</th>
                      <th className="px-3 py-2 font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listItems.map((row) => (
                      <tr key={row._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{row.recipientName}</td>
                        <td className="px-3 py-2 text-gray-600">{row.userEmail}</td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-900">{row.subjectTitle}</div>
                          {row.certificateScope === 'topics' && row.scopeDescription ? (
                            <div className="mt-0.5 text-xs text-gray-600">Scope: {row.scopeDescription}</div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2">
                          <PercentBar
                            value={row.averagePercentage}
                            threshold={row.minAverageRequired ?? 70}
                          />
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {row.emailSentAt
                            ? new Date(row.emailSentAt).toLocaleString()
                            : row.emailError
                              ? `Error: ${row.emailError}`
                              : '—'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={row.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              PDF
                            </a>
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="text-amber-700 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(row._id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>
                  Page {listPage} / {listTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={listPage <= 1}
                    onClick={() => {
                      const p = listPage - 1;
                      setListPage(p);
                      void loadList(p);
                    }}
                    className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={listPage >= listTotalPages}
                    onClick={() => {
                      const p = listPage + 1;
                      setListPage(p);
                      void loadList(p);
                    }}
                    className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {editId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !savingEdit && setEditId(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900">Edit certificate</h3>
            <p className="mt-1 text-xs text-gray-500">Updates display name / date and regenerates the PDF.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Recipient name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Issued on (text)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => setEditId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => void saveEdit()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
