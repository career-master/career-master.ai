'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FALLBACK_DOMAINS } from '@/lib/constants';

export default function AddEditSubjectPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const isEdit = Boolean(subjectId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState<'basic' | 'hard'>('basic');
  const [isActive, setIsActive] = useState(true);

  const [topics, setTopics] = useState<any[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTopicTitle, setEditTopicTitle] = useState('');
  const [domainNames, setDomainNames] = useState<string[]>(FALLBACK_DOMAINS);
  const [categoriesFromApi, setCategoriesFromApi] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
    const domainParam = searchParams.get('domain');
    const categoryParam = searchParams.get('category');
    if (domainParam) setDomain(domainParam);
    if (categoryParam) setCategory(categoryParam);
    if (isEdit && subjectId) {
      loadSubject();
      loadTopics();
    }
    (async () => {
      const res = await apiService.getDomains();
      if (res.success && Array.isArray(res.data)) setDomainNames((res.data as { name: string }[]).map((d) => d.name));
      else setDomainNames(FALLBACK_DOMAINS);
    })();
  }, [isAuthenticated, user, router, isEdit, subjectId, searchParams]);

  useEffect(() => {
    if (!domain) {
      setCategoriesFromApi([]);
      return;
    }
    apiService.getCategories({ domain }).then((r) => {
      if (r.success && Array.isArray(r.data)) setCategoriesFromApi((r.data as { name: string }[]).map((c) => c.name));
      else setCategoriesFromApi([]);
    });
  }, [domain]);

  const loadSubject = async () => {
    if (!subjectId) return;
    try {
      setLoading(true);
      const res = await apiService.getSubjectById(subjectId);
      if (res.success && res.data) {
        const s = res.data as any;
        setTitle(s.title || '');
        setDescription(s.description || '');
        setDomain(s.domain || '');
        setCategory(s.category || '');
        setLevel(s.level === 'hard' ? 'hard' : 'basic');
        setIsActive(s.isActive !== false);
      }
    } catch (err) {
      toast.error('Failed to load subject');
      router.push('/admin/subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    if (!subjectId) return;
    try {
      setTopicsLoading(true);
      const res = await apiService.getTopics(subjectId);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setTopics(list.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
      }
    } catch (err) {
      toast.error('Failed to load topics');
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      setSaving(true);
      if (isEdit && subjectId) {
        const res = await apiService.updateSubject(subjectId, {
          title: title.trim(),
          description: description.trim() || undefined,
          domain: domain || undefined,
          category: category || undefined,
          level,
          isActive,
        });
        if (res.success) {
          toast.success('Subject updated');
        } else {
          toast.error((res as any).message || 'Update failed');
        }
      } else {
        const res = await apiService.createSubject({
          title: title.trim(),
          description: description.trim() || undefined,
          domain: domain || undefined,
          category: category || undefined,
          level,
          isActive,
        });
        if (res.success && res.data) {
          const created = (res.data as any)._id;
          toast.success('Subject created');
          router.replace(`/admin/subjects/new?subjectId=${created}`);
        } else {
          toast.error((res as any).message || 'Create failed');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTopic = async () => {
    if (!subjectId || !newTopicTitle.trim()) {
      toast.error('Enter topic title');
      return;
    }
    try {
      setAddingTopic(true);
      const res = await apiService.createTopic({
        subjectId,
        title: newTopicTitle.trim(),
        description: newTopicDesc.trim() || undefined,
        order: topics.length,
      });
      if (res.success) {
        toast.success('Topic added');
        setNewTopicTitle('');
        setNewTopicDesc('');
        setShowAddTopic(false);
        await loadTopics();
      } else {
        toast.error((res as any).message || 'Add topic failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Add topic failed');
    } finally {
      setAddingTopic(false);
    }
  };

  const handleUpdateTopic = async (topicId: string) => {
    if (!editTopicTitle.trim()) return;
    try {
      const res = await apiService.updateTopic(topicId, { title: editTopicTitle.trim() });
      if (res.success) {
        toast.success('Topic updated');
        setEditingTopicId(null);
        await loadTopics();
      } else {
        toast.error((res as any).message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Delete this topic?')) return;
    try {
      const res = await apiService.deleteTopic(topicId);
      if (res.success) {
        toast.success('Topic deleted');
        await loadTopics();
      } else {
        toast.error((res as any).message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  useEffect(() => {
    apiService.getSubjects({ limit: 500 }).then((res) => {
      if (res.success && (res.data as any)?.items) setAllSubjects((res.data as any).items);
    });
  }, []);

  // Preserve admin-defined category order (from API); append any from subjects not in API list
  const categoriesInDomain = useMemo(() => {
    if (!domain) return [];
    if (domain === 'Olympiad Exams') return [];
    const ordered = categoriesFromApi.filter((c): c is string => typeof c === 'string');
    const list = allSubjects.filter((s: any) => s.domain === domain || (domain === 'Technology' && s.category === 'Technology'));
    const fromSubjects = Array.from(new Set(list.map((s: any) => s.category).filter(Boolean))) as string[];
    fromSubjects.forEach((c) => { if (!ordered.includes(c)) ordered.push(c); });
    if (ordered.length > 0) return ordered;
    return ['ACADEMIC', 'PROGRAMMING LANGUAGES', 'FULL STACK', 'Technology'];
  }, [domain, allSubjects, categoriesFromApi]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/subjects" className="text-red-600 hover:underline font-medium text-sm">
            ← Back to Subjects & Topics
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {isEdit ? 'Edit Subject' : 'Add Subject'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {isEdit ? 'Update subject details and manage sub-topics below.' : 'Choose domain and category, then add title. After saving you can add sub-topics.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setCategory('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
            >
              <option value="">Select Domain</option>
              {domainNames.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {domain && domain !== 'Olympiad Exams' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
              >
                <option value="">Select Category</option>
                {categoriesInDomain.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JAVA, Physics-11"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
              placeholder="Optional description"
            />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as 'basic' | 'hard')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
              >
                <option value="basic">Basic</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Subject' : 'Add Subject'}
            </button>
            <Link
              href="/admin/subjects"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>

        {isEdit && subjectId && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sub-topics</h2>
            {topicsLoading ? (
              <p className="text-gray-500 text-sm">Loading topics...</p>
            ) : (
              <>
                <ul className="space-y-2 mb-4">
                  {topics.length === 0 ? (
                    <li className="text-gray-500 text-sm">No sub-topics yet. Add one below.</li>
                  ) : (
                    topics.map((t: any) => (
                      <li key={t._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        {editingTopicId === t._id ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editTopicTitle}
                              onChange={(e) => setEditTopicTitle(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                            />
                            <button type="button" onClick={() => handleUpdateTopic(t._id)} className="text-sm text-green-600 font-medium">Save</button>
                            <button type="button" onClick={() => setEditingTopicId(null)} className="text-sm text-gray-500">Cancel</button>
                          </div>
                        ) : (
                          <>
                            <span className="text-gray-900 font-medium">{t.title}</span>
                            <div className="flex gap-1">
                              <button type="button" onClick={() => { setEditingTopicId(t._id); setEditTopicTitle(t.title); }} className="text-blue-600 text-sm font-medium">Edit</button>
                              <button type="button" onClick={() => handleDeleteTopic(t._id)} className="text-red-600 text-sm font-medium">Delete</button>
                            </div>
                          </>
                        )}
                      </li>
                    ))
                  )}
                </ul>
                {!showAddTopic ? (
                  <button
                    type="button"
                    onClick={() => setShowAddTopic(true)}
                    className="text-sm text-red-600 font-medium hover:underline"
                  >
                    + Add sub-topic
                  </button>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <input
                      type="text"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Sub-topic title"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <textarea
                      value={newTopicDesc}
                      onChange={(e) => setNewTopicDesc(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={handleAddTopic} disabled={addingTopic || !newTopicTitle.trim()} className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50">
                        {addingTopic ? 'Adding...' : 'Add'}
                      </button>
                      <button type="button" onClick={() => { setShowAddTopic(false); setNewTopicTitle(''); setNewTopicDesc(''); }} className="px-3 py-1 border border-gray-300 rounded text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
