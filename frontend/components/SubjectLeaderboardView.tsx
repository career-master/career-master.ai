'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ProfileAvatar3D from '@/components/ProfileAvatar3D';
import AdminExportButtons from '@/components/AdminExportButtons';
import { exportRowsToDoc, exportRowsToPdf } from '@/lib/adminExport';

type Performer = {
  userId: string;
  name: string;
  email?: string;
  rank: number;
  averageScore: number;
  totalAttempts: number;
  bestScore: number;
  passRate: number;
  profilePicture?: string;
};

type SubjectRow = { _id: string; title: string; domain?: string; category?: string };

const PAGE_SIZE = 10;

/** Same control styling as admin reports (light scheme, solid text). */
const filterSelectClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 [color-scheme:light] focus:border-purple-500 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500';

export default function SubjectLeaderboardView({
  title = 'Leaderboard by subject',
  subtitle = 'Filter by domain, category, subject, and optional topic — same flow as Admin → Reports. Rankings use quiz attempts linked through topic / quiz set.',
  enableDocumentExport = false,
}: {
  title?: string;
  subtitle?: string;
  /** When true (e.g. Admin → Leaderboard), show PDF/DOC export for the full ranked list. */
  enableDocumentExport?: boolean;
}) {
  const [filters, setFilters] = useState<{
    domain?: string;
    category?: string;
    subjectId?: string;
    topicId?: string;
  }>({});

  const [domains, setDomains] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [topics, setTopics] = useState<{ _id: string; title: string }[]>([]);

  const [loadingFilterData, setLoadingFilterData] = useState(true);
  const [rows, setRows] = useState<Performer[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingFilterData(true);
        const [domainsRes, subjectsRes] = await Promise.all([
          apiService.getDomains({ active: true }),
          apiService.getSubjects({ page: 1, limit: 300, isActive: true }),
        ]);
        if (cancelled) return;
        if (domainsRes.success && Array.isArray(domainsRes.data)) {
          setDomains((domainsRes.data as { name: string }[]).map((d) => d.name));
        }
        const items = (subjectsRes.data?.items || subjectsRes.data || []) as SubjectRow[];
        setSubjects(Array.isArray(items) ? items : []);
      } catch (e: any) {
        if (!cancelled) toast.error(e.message || 'Failed to load filter options');
      } finally {
        if (!cancelled) setLoadingFilterData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      if (!filters.domain) {
        setCategories([]);
        return;
      }
      try {
        const res = await apiService.getCategories({ domain: filters.domain, active: true });
        if (res.success && Array.isArray(res.data)) {
          setCategories((res.data as { name: string }[]).map((c) => c.name));
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, [filters.domain]);

  useEffect(() => {
    const loadTopics = async () => {
      if (!filters.subjectId) {
        setTopics([]);
        return;
      }
      try {
        const res = await apiService.getTopics(filters.subjectId, true, 'roots');
        if (res.success && Array.isArray(res.data)) {
          setTopics(res.data as { _id: string; title: string }[]);
        } else {
          setTopics([]);
        }
      } catch {
        setTopics([]);
      }
    };
    loadTopics();
  }, [filters.subjectId]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (filters.domain && s.domain !== filters.domain) return false;
      if (filters.category && s.category !== filters.category) return false;
      return true;
    });
  }, [subjects, filters.domain, filters.category]);

  const loadBoard = useCallback(async (subjectId: string, topicId: string | undefined, pageNum: number) => {
    if (!subjectId) {
      setRows([]);
      setMeta(null);
      return;
    }
    try {
      setLoadingBoard(true);
      const res = await apiService.getTopPerformers({
        limit: PAGE_SIZE,
        page: pageNum,
        subjectId,
        ...(topicId ? { topicId } : {}),
        sortBy: 'averageScore',
      });
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data as Performer[]);
        setMeta(res.meta ?? null);
      } else {
        setRows([]);
        setMeta(null);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load leaderboard');
      setRows([]);
      setMeta(null);
    } finally {
      setLoadingBoard(false);
    }
  }, []);

  useEffect(() => {
    if (filters.subjectId) {
      loadBoard(filters.subjectId, filters.topicId, page);
    } else {
      setRows([]);
      setMeta(null);
    }
  }, [filters.subjectId, filters.topicId, page, loadBoard]);

  useEffect(() => {
    if (!meta?.totalPages) return;
    if (page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta, page]);

  const scopeHint = useMemo(() => {
    if (!filters.subjectId) return '';
    const sub = subjects.find((s) => String(s._id) === filters.subjectId);
    const top = topics.find((t) => String(t._id) === filters.topicId);
    if (top) {
      return `Topic: ${top.title} · Subject: ${sub?.title ?? '—'}`;
    }
    return `Subject: ${sub?.title ?? '—'} (all topics)`;
  }, [filters.subjectId, filters.topicId, subjects, topics]);

  const exportLeaderboardDocuments = useCallback(
    async (format: 'pdf' | 'doc') => {
      if (!filters.subjectId) {
        throw new Error('Select a subject before exporting');
      }
      const all: Performer[] = [];
      let p = 1;
      let totalPages = 1;
      do {
        const res = await apiService.getTopPerformers({
          limit: PAGE_SIZE,
          page: p,
          subjectId: filters.subjectId,
          ...(filters.topicId ? { topicId: filters.topicId } : {}),
          sortBy: 'averageScore',
        });
        if (!res.success || !Array.isArray(res.data)) break;
        all.push(...(res.data as Performer[]));
        totalPages = res.meta?.totalPages ?? 1;
        p += 1;
      } while (p <= totalPages && p < 500);

      if (all.length === 0) {
        throw new Error('No leaderboard rows to export for this scope');
      }

      const headers = ['Rank', 'Student', 'Email', 'Avg score %', 'Best %', 'Attempts', 'Pass rate %'];
      const rows = all.map((r) => [
        String(r.rank),
        r.name,
        r.email || '',
        String(r.averageScore != null ? Number(r.averageScore).toFixed(1) : ''),
        String(r.bestScore != null ? Number(r.bestScore).toFixed(1) : ''),
        String(r.totalAttempts ?? ''),
        String(r.passRate != null ? Number(r.passRate).toFixed(0) : ''),
      ]);
      const sub = scopeHint ? `${scopeHint} · ${all.length} students` : `${all.length} students`;
      if (format === 'pdf') {
        exportRowsToPdf(title, sub, headers, rows, 'admin-leaderboard');
      } else {
        exportRowsToDoc(title, sub, headers, rows, 'admin-leaderboard');
      }
    },
    [filters.subjectId, filters.topicId, scopeHint, title]
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Domain</label>
            <select
              className={filterSelectClass}
              value={filters.domain || ''}
              disabled={loadingFilterData}
              onChange={(e) => {
                const v = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  domain: v || undefined,
                  category: undefined,
                  subjectId: undefined,
                  topicId: undefined,
                }));
                setPage(1);
              }}
            >
              <option value="">All domains</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Category</label>
            <select
              className={filterSelectClass}
              value={filters.category || ''}
              disabled={!filters.domain}
              onChange={(e) => {
                const v = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  category: v || undefined,
                  subjectId: undefined,
                  topicId: undefined,
                }));
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Subject</label>
            <select
              className={filterSelectClass}
              value={filters.subjectId || ''}
              disabled={!filters.category}
              onChange={(e) => {
                const v = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  subjectId: v || undefined,
                  topicId: undefined,
                }));
                setPage(1);
              }}
            >
              <option value="">Select subject</option>
              {filteredSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Topic</label>
            <select
              className={filterSelectClass}
              value={filters.topicId || ''}
              disabled={!filters.subjectId}
              onChange={(e) => {
                const v = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  topicId: v || undefined,
                }));
                setPage(1);
              }}
            >
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
              onClick={() => {
                setFilters({});
                setPage(1);
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
        {scopeHint ? (
          <p className="mt-3 text-xs text-gray-600">
            <span className="font-medium text-gray-800">Scope:</span> {scopeHint}
          </p>
        ) : (
          <p className="mt-3 text-xs text-gray-500">
            Choose domain, category, and subject to load rankings. Topic is optional (narrow to one root topic).
          </p>
        )}
        {enableDocumentExport && filters.subjectId ? (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <span className="text-xs text-gray-500">Export full list:</span>
            <AdminExportButtons
              disabled={loadingBoard}
              onPdf={() => exportLeaderboardDocuments('pdf')}
              onDoc={() => exportLeaderboardDocuments('doc')}
            />
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {loadingBoard ? (
          <div className="p-10 text-center text-gray-500">Loading rankings…</div>
        ) : !filters.subjectId ? (
          <div className="p-10 text-center text-gray-600">
            <p className="font-medium text-gray-800">Select filters to view the leaderboard</p>
            <p className="mt-2 text-sm text-gray-500">
              Pick a domain, category, and subject — same order as Admin → Reports. Optionally choose a topic to limit
              to that unit.
            </p>
          </div>
        ) : !loadingBoard && rows.length === 0 && (!meta || meta.total === 0) ? (
          <div className="p-10 text-center text-gray-600">
            <p className="mb-2 font-medium">No quiz activity for this scope yet.</p>
            <p className="text-sm text-gray-500">
              Students need completed attempts for quizzes linked to this subject (and topic, if selected) via topic /
              quiz set.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Avg score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Best</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Attempts</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Pass rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r.userId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                            r.rank === 1
                              ? 'bg-amber-500'
                              : r.rank === 2
                                ? 'bg-slate-400'
                                : r.rank === 3
                                  ? 'bg-orange-500'
                                  : 'bg-purple-500'
                          }`}
                        >
                          {r.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProfileAvatar3D src={r.profilePicture} name={r.name} size="sm" />
                          <div>
                            <div className="font-medium text-gray-900">{r.name}</div>
                            {r.email ? <div className="text-xs text-gray-500">{r.email}</div> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{r.averageScore?.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-gray-700">{r.bestScore?.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-gray-700">{r.totalAttempts}</td>
                      <td className="px-4 py-3 text-gray-700">{r.passRate?.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta && meta.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{meta.total}</span> student
                  {meta.total !== 1 ? 's' : ''} ranked
                  {meta.totalPages > 1 ? (
                    <>
                      {' '}
                      · Page <span className="font-medium text-gray-800">{meta.page}</span> of{' '}
                      <span className="font-medium text-gray-800">{meta.totalPages}</span> ({PAGE_SIZE} per page)
                    </>
                  ) : null}
                </p>
                {meta.totalPages > 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || loadingBoard}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= meta.totalPages || loadingBoard}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
