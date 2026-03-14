'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FALLBACK_DOMAINS } from '@/lib/constants';

type DomainRecord = { _id: string; name: string; order?: number; isActive?: boolean };

const subjectInDomain = (s: { domain?: string; category?: string }, domain: string) =>
  s.domain === domain || (domain === 'Technology' && s.category === 'Technology');

function SortableDomainRow({
  d,
  editingDomainId,
  editDomainName,
  setEditDomainName,
  setEditingDomainId,
  onUpdateDomain,
  onToggleActive,
  onDelete,
  deletingDomainId,
  disabled,
}: {
  d: DomainRecord;
  editingDomainId: string | null;
  editDomainName: string;
  setEditDomainName: (v: string) => void;
  setEditingDomainId: (v: string | null) => void;
  onUpdateDomain: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  deletingDomainId: string | null;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: d._id,
    disabled,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <tr ref={setNodeRef} style={style} className={`border-b border-gray-100 ${isDragging ? 'opacity-50 bg-gray-50' : ''}`}>
      <td className="py-2 pr-2 w-10">
        <span
          className="inline-flex cursor-grab active:cursor-grabbing touch-none p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
          </svg>
        </span>
      </td>
      <td className="py-2 pr-4">
        {editingDomainId === d._id ? (
          <span className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={editDomainName}
              onChange={(e) => setEditDomainName(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm w-48"
            />
            <button type="button" onClick={() => onUpdateDomain(d._id)} className="text-green-600 font-medium">Save</button>
            <button type="button" onClick={() => { setEditingDomainId(null); setEditDomainName(''); }} className="text-gray-600">Cancel</button>
          </span>
        ) : (
          <span className="font-medium text-gray-900">{d.name}</span>
        )}
      </td>
      <td className="py-2 pr-4">
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={d.isActive !== false}
            onChange={() => onToggleActive(d._id, !(d.isActive !== false))}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-gray-700">Yes</span>
        </label>
      </td>
      <td className="py-2">
        {editingDomainId !== d._id && (
          <>
            <button type="button" onClick={() => { setEditingDomainId(d._id); setEditDomainName(d.name); }} className="text-blue-600 hover:underline mr-2">Edit</button>
            <button
              type="button"
              onClick={() => window.confirm('Delete this domain?') && onDelete(d._id)}
              disabled={deletingDomainId === d._id}
              className="text-red-600 hover:underline disabled:opacity-50"
            >
              {deletingDomainId === d._id ? 'Deleting…' : 'Delete'}
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

type MappingRow = {
  sno: number;
  type: 'subject' | 'topic';
  id: string;
  subjectId: string;
  domain: string;
  category: string;
  subject: string;
  subTopic: string | null;
  level: string;
  createdBy: string;
  isActive: boolean;
};

const PAGE_SIZE = 25;

export default function SubjectsAndTopicsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Quiz-style cascading filters: Domain → Category → Subject
  const [filterDomain, setFilterDomain] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');

  const [domainsList, setDomainsList] = useState<DomainRecord[]>([]);
  const [domainNames, setDomainNames] = useState<string[]>(FALLBACK_DOMAINS);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [manageDomainsOpen, setManageDomainsOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null);
  const [editDomainName, setEditDomainName] = useState('');
  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null);

  // Manage Categories (per domain)
  type CategoryRecord = { _id: string; domain: string; name: string; order?: number; isActive?: boolean };
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [categoryDomain, setCategoryDomain] = useState('');
  const [categoriesList, setCategoriesList] = useState<CategoryRecord[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesForFilterDomain, setCategoriesForFilterDomain] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Quick add Subject
  const [quickAddSubjectOpen, setQuickAddSubjectOpen] = useState(false);
  const [qaSubjectDomain, setQaSubjectDomain] = useState('');
  const [qaSubjectCategory, setQaSubjectCategory] = useState('');
  const [qaSubjectTitle, setQaSubjectTitle] = useState('');
  const [qaSubjectDesc, setQaSubjectDesc] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [qaSubjectCategories, setQaSubjectCategories] = useState<string[]>([]);

  // Quick add Sub-topic
  const [quickAddTopicOpen, setQuickAddTopicOpen] = useState(false);
  const [qaTopicDomain, setQaTopicDomain] = useState('');
  const [qaTopicCategory, setQaTopicCategory] = useState('');
  const [qaTopicSubjectId, setQaTopicSubjectId] = useState('');
  const [qaTopicParentId, setQaTopicParentId] = useState('');
  const [qaTopicTitle, setQaTopicTitle] = useState('');
  const [qaSubjectsList, setQaSubjectsList] = useState<{ _id: string; title: string; domain?: string; category?: string }[]>([]);
  const [qaRootTopics, setQaRootTopics] = useState<{ _id: string; title: string }[]>([]);
  const [addingTopic, setAddingTopic] = useState(false);
  const [qaTopicCategories, setQaTopicCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMappingList();
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data as MappingRow[]);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subjects & topics');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDomains = async () => {
    try {
      setDomainsLoading(true);
      const res = await apiService.getDomains();
      if (res.success && Array.isArray(res.data)) {
        const list = res.data as DomainRecord[];
        setDomainsList(list);
        setDomainNames(list.map((d) => d.name));
      } else {
        setDomainNames(FALLBACK_DOMAINS);
      }
    } catch {
      setDomainNames(FALLBACK_DOMAINS);
    } finally {
      setDomainsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.roles?.includes('super_admin')) loadDomains();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!filterDomain) {
      setCategoriesForFilterDomain([]);
      return;
    }
    (async () => {
      const res = await apiService.getCategories({ domain: filterDomain });
      if (res.success && Array.isArray(res.data)) setCategoriesForFilterDomain((res.data as CategoryRecord[]).map((c) => c.name));
      else setCategoriesForFilterDomain([]);
    })();
  }, [filterDomain]);

  const loadCategoriesForDomain = async (domain: string) => {
    if (!domain) {
      setCategoriesList([]);
      return;
    }
    try {
      setCategoriesLoading(true);
      const res = await apiService.getCategories({ domain });
      if (res.success && Array.isArray(res.data)) setCategoriesList(res.data as CategoryRecord[]);
      else setCategoriesList([]);
    } catch {
      setCategoriesList([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (manageCategoriesOpen && categoryDomain) loadCategoriesForDomain(categoryDomain);
    else if (!manageCategoriesOpen) setCategoriesList([]);
  }, [manageCategoriesOpen, categoryDomain]);

  const handleAddDomain = async () => {
    const name = newDomainName.trim();
    if (!name) {
      toast.error('Enter a domain name');
      return;
    }
    setAddingDomain(true);
    try {
      const res = await apiService.createDomain({ name });
      if (res.success) {
        toast.success('Domain added');
        setNewDomainName('');
        await loadDomains();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to add domain');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add domain');
    } finally {
      setAddingDomain(false);
    }
  };

  const handleUpdateDomain = async (id: string) => {
    const name = editDomainName.trim();
    if (!name) return;
    try {
      const res = await apiService.updateDomain(id, { name });
      if (res.success) {
        toast.success('Domain updated');
        setEditingDomainId(null);
        setEditDomainName('');
        await loadDomains();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to update');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update');
    }
  };

  const handleDomainToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await apiService.updateDomain(id, { isActive });
      if (res.success) {
        toast.success(isActive ? 'Domain will show in user filters' : 'Domain hidden from user filters');
        await loadDomains();
      } else {
        toast.error((res as any).message || 'Failed to update');
      }
    } catch (err: any) {
      toast.error((err as any)?.message || 'Failed to update');
    }
  };

  const [savingDomainOrder, setSavingDomainOrder] = useState(false);
  const handleDomainsDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = domainsList.findIndex((d) => d._id === active.id);
      const newIndex = domainsList.findIndex((d) => d._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newList = arrayMove(domainsList, oldIndex, newIndex);
      setDomainsList(newList);
      setDomainNames(newList.map((d) => d.name));
      setSavingDomainOrder(true);
      try {
        await Promise.all(newList.map((d, i) => apiService.updateDomain(d._id, { order: i })));
        toast.success('Order saved');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save order');
        await loadDomains();
      } finally {
        setSavingDomainOrder(false);
      }
    },
    [domainsList]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDeleteDomain = async (id: string) => {
    setDeletingDomainId(id);
    try {
      const res = await apiService.deleteDomain(id);
      if (res.success) {
        toast.success('Domain deleted');
        await loadDomains();
        await loadData();
        if (filterDomain && domainsList.find((d) => d._id === id)?.name === filterDomain) {
          setFilterDomain('');
          setFilterCategory('');
          setFilterSubjectId('');
        }
      } else {
        toast.error((res as any).message || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setDeletingDomainId(null);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Enter a category name');
      return;
    }
    if (!categoryDomain) {
      toast.error('Select a domain first');
      return;
    }
    setAddingCategory(true);
    try {
      const res = await apiService.createCategory({ domain: categoryDomain, name });
      if (res.success) {
        toast.success('Category added');
        setNewCategoryName('');
        await loadCategoriesForDomain(categoryDomain);
        await loadData();
        if (filterDomain === categoryDomain) {
          const r = await apiService.getCategories({ domain: filterDomain });
          if (r.success && Array.isArray(r.data)) setCategoriesForFilterDomain((r.data as CategoryRecord[]).map((c) => c.name));
        }
      } else {
        toast.error((res as any).message || 'Failed to add category');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    const name = editCategoryName.trim();
    if (!name) return;
    try {
      const res = await apiService.updateCategory(id, { name });
      if (res.success) {
        toast.success('Category updated');
        setEditingCategoryId(null);
        setEditCategoryName('');
        await loadCategoriesForDomain(categoryDomain);
        await loadData();
        if (filterDomain === categoryDomain) {
          const r = await apiService.getCategories({ domain: filterDomain });
          if (r.success && Array.isArray(r.data)) setCategoriesForFilterDomain((r.data as CategoryRecord[]).map((c) => c.name));
        }
      } else {
        toast.error((res as any).message || 'Failed to update');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setDeletingCategoryId(id);
    try {
      const res = await apiService.deleteCategory(id);
      if (res.success) {
        toast.success('Category deleted');
        await loadCategoriesForDomain(categoryDomain);
        await loadData();
        if (filterDomain === categoryDomain) {
          const r = await apiService.getCategories({ domain: filterDomain });
          if (r.success && Array.isArray(r.data)) setCategoriesForFilterDomain((r.data as CategoryRecord[]).map((c) => c.name));
        }
      } else {
        toast.error((res as any).message || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleQuickAddSubject = async () => {
    const title = qaSubjectTitle.trim();
    if (!title) {
      toast.error('Enter subject title');
      return;
    }
    if (!user?.id) {
      toast.error('Not authenticated');
      return;
    }
    setAddingSubject(true);
    try {
      const res = await apiService.createSubject({
        title,
        description: qaSubjectDesc.trim() || undefined,
        domain: qaSubjectDomain || undefined,
        category: qaSubjectCategory || undefined,
      });
      if (res.success) {
        toast.success('Subject added');
        setQaSubjectTitle('');
        setQaSubjectDesc('');
        setQuickAddSubjectOpen(false);
        await loadData();
        if (filterDomain) {
          const r = await apiService.getCategories({ domain: filterDomain });
          if (r.success && Array.isArray(r.data)) setCategoriesForFilterDomain((r.data as CategoryRecord[]).map((c) => c.name));
        }
      } else {
        toast.error((res as any).message || 'Failed to add subject');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add subject');
    } finally {
      setAddingSubject(false);
    }
  };

  const handleQuickAddTopic = async () => {
    const title = qaTopicTitle.trim();
    if (!title) {
      toast.error('Enter sub-topic title');
      return;
    }
    if (!qaTopicSubjectId) {
      toast.error('Select a subject');
      return;
    }
    if (!user?.id) {
      toast.error('Not authenticated');
      return;
    }
    setAddingTopic(true);
    try {
      const res = await apiService.createTopic({
        subjectId: qaTopicSubjectId,
        title,
        parentTopicId: qaTopicParentId || null,
      });
      if (res.success) {
        toast.success('Sub-topic added');
        setQaTopicTitle('');
        setQuickAddTopicOpen(false);
        setQaTopicSubjectId('');
        setQaTopicParentId('');
        setQaRootTopics([]);
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to add sub-topic');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add sub-topic');
    } finally {
      setAddingTopic(false);
    }
  };

  // Load subjects for quick-add topic when domain/category change
  useEffect(() => {
    if (!quickAddTopicOpen || (!qaTopicDomain && !qaTopicCategory)) {
      setQaSubjectsList([]);
      setQaTopicSubjectId('');
      setQaTopicParentId('');
      setQaRootTopics([]);
      return;
    }
    (async () => {
      const res = await apiService.getSubjects({ limit: 500, domain: qaTopicDomain || undefined, category: qaTopicCategory || undefined });
      const data = (res as any)?.data;
      const items = Array.isArray(data) ? data : (data?.items || []);
      setQaSubjectsList(items);
      if (!items.some((s: any) => s._id === qaTopicSubjectId)) {
        setQaTopicSubjectId('');
        setQaTopicParentId('');
        setQaRootTopics([]);
      }
    })();
  }, [quickAddTopicOpen, qaTopicDomain, qaTopicCategory]);

  useEffect(() => {
    if (!quickAddTopicOpen || !qaTopicDomain) {
      setQaTopicCategories([]);
      return;
    }
    apiService.getCategories({ domain: qaTopicDomain }).then((r) => {
      if (r.success && Array.isArray(r.data)) setQaTopicCategories((r.data as CategoryRecord[]).map((c) => c.name));
      else setQaTopicCategories([]);
    });
  }, [quickAddTopicOpen, qaTopicDomain]);

  useEffect(() => {
    if (!qaTopicSubjectId) {
      setQaRootTopics([]);
      setQaTopicParentId('');
      return;
    }
    apiService.getTopics(qaTopicSubjectId, true, 'roots').then((r) => {
      if (r.success && Array.isArray(r.data)) setQaRootTopics(r.data as { _id: string; title: string }[]);
      else setQaRootTopics([]);
    });
  }, [qaTopicSubjectId]);

  useEffect(() => {
    if (!quickAddSubjectOpen || !qaSubjectDomain) {
      setQaSubjectCategories([]);
      return;
    }
    apiService.getCategories({ domain: qaSubjectDomain }).then((r) => {
      if (r.success && Array.isArray(r.data)) setQaSubjectCategories((r.data as CategoryRecord[]).map((c) => c.name));
      else setQaSubjectCategories([]);
    });
  }, [quickAddSubjectOpen, qaSubjectDomain]);

  // Categories in filter: API categories for this domain + distinct from rows (so new domains/categories appear in all filters)
  const categoriesInDomain = useMemo(() => {
    if (!filterDomain) return [];
    const list = rows.filter((r) => r.domain === filterDomain || (filterDomain === 'Technology' && r.category === 'Technology'));
    const fromRows = Array.from(new Set(list.map((r) => r.category).filter(Boolean)));
    const merged = new Set<string>([...categoriesForFilterDomain, ...fromRows]);
    return Array.from(merged).filter((c) => c !== 'Technology' && c !== 'Olympiad Exams').sort();
  }, [rows, filterDomain, categoriesForFilterDomain]);

  // Subjects in selected domain + category (quiz-style)
  const subjectsForFilter = useMemo(() => {
    let list = rows.filter((r) => r.type === 'subject');
    if (filterDomain) list = list.filter((r) => r.domain === filterDomain || (filterDomain === 'Technology' && r.category === 'Technology'));
    if (filterDomain && filterDomain !== 'Olympiad Exams' && filterCategory) list = list.filter((r) => r.category === filterCategory);
    return list;
  }, [rows, filterDomain, filterCategory]);

  // Apply cascading filters + search to get visible rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterDomain && r.domain !== filterDomain && !(filterDomain === 'Technology' && r.category === 'Technology')) return false;
      if (filterDomain && filterDomain !== 'Olympiad Exams' && filterCategory && r.category !== filterCategory) return false;
      if (filterSubjectId && r.subjectId !== filterSubjectId && r.id !== filterSubjectId) return false;
      const q = search.toLowerCase();
      if (q && !(r.domain || '').toLowerCase().includes(q) && !(r.category || '').toLowerCase().includes(q) && !(r.subject || '').toLowerCase().includes(q) && !(r.subTopic || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, filterDomain, filterCategory, filterSubjectId, search]);

  const totalRecords = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const toggleSelectAll = () => {
    if (selected.size === paginatedRows.length) setSelected(new Set());
    else setSelected(new Set(paginatedRows.map((r) => r.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleBulkDelete = async () => {
    const selectedList = Array.from(selected);
    if (selectedList.length === 0) {
      toast.error('Select at least one item');
      return;
    }
    const subjectIds: string[] = [];
    const topicIds: string[] = [];
    rows.forEach((r) => {
      if (selectedList.includes(r.id)) {
        if (r.type === 'subject') subjectIds.push(r.id);
        else topicIds.push(r.id);
      }
    });
    try {
      setBulkDeleting(true);
      const res = await apiService.bulkDeleteMapping({ subjectIds, topicIds });
      if (res.success) {
        toast.success(res.message || 'Deleted successfully');
        setSelected(new Set());
        await loadData();
      } else {
        toast.error(res.message || 'Bulk delete failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteOne = async (row: MappingRow) => {
    try {
      if (row.type === 'subject') {
        const res = await apiService.deleteSubject(row.id);
        if (res.success) {
          toast.success('Subject deleted');
          await loadData();
        } else toast.error((res as any).message || 'Delete failed');
      } else {
        const res = await apiService.deleteTopic(row.id);
        if (res.success) {
          toast.success('Topic deleted');
          await loadData();
        } else toast.error((res as any).message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    const allSelected = paginatedRows.length > 0 && selected.size === paginatedRows.length;
    const someSelected = selected.size > 0;
    el.checked = allSelected;
    el.indeterminate = someSelected && !allSelected;
  }, [selected.size, paginatedRows.length]);

  const exportCsv = () => {
    const headers = ['SNO', 'Domain', 'Category', 'Subject', 'Sub-Topic', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filteredRows.map((r) =>
        [r.sno, `"${(r.domain || '').replace(/"/g, '""')}"`, `"${(r.category || '').replace(/"/g, '""')}"`, `"${(r.subject || '').replace(/"/g, '""')}"`, `"${(r.subTopic || '').replace(/"/g, '""')}"`, r.isActive ? 'Active' : 'Inactive'].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subjects-topics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Export started');
  };

  const clearFilters = () => {
    setFilterDomain('');
    setFilterCategory('');
    setFilterSubjectId('');
    setSearch('');
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4" />
          <p className="text-gray-600">Loading subjects & topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subjects & Topics</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage domain, category, subject and sub-topic in one place. Use filters like Quiz page: Domain → Category → Subject.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setManageDomainsOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Domains
            </button>
            <button
              type="button"
              onClick={() => setManageCategoriesOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Categories
            </button>
            <button
              type="button"
              onClick={() => setQuickAddSubjectOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Quick add Subject
            </button>
            <button
              type="button"
              onClick={() => setQuickAddTopicOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Quick add Sub-topic
            </button>
            <Link
              href="/admin/subjects/requests"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Subject Requests
            </Link>
            <Link
              href="/admin/subjects/new"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm"
            >
              <span className="font-semibold">+ Add Subject</span>
            </Link>
          </div>
        </div>

        {manageDomainsOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Manage Domains</h2>
            <p className="text-xs text-gray-500 mb-3">Drag the handle to reorder (order is saved automatically). Toggle &quot;Show in user filters&quot; to show or hide in the user Subjects page dropdown.</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <input
                type="text"
                value={newDomainName}
                onChange={(e) => setNewDomainName(e.target.value)}
                placeholder="New domain name"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[200px]"
              />
              <button
                type="button"
                onClick={handleAddDomain}
                disabled={addingDomain || !newDomainName.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {addingDomain ? 'Adding…' : 'Add Domain'}
              </button>
            </div>
            {domainsLoading ? (
              <p className="text-sm text-gray-500">Loading domains…</p>
            ) : domainsList.length === 0 ? (
              <p className="text-sm text-gray-500">No domains from API. Add one above or run backend seed: node scripts/seed-domains.js</p>
            ) : (
              <div className="overflow-x-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDomainsDragEnd}>
                  <SortableContext items={domainsList.map((d) => d._id)} strategy={verticalListSortingStrategy}>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-600">
                          <th className="py-2 pr-2 w-10" aria-label="Drag" />
                          <th className="py-2 pr-4">Domain name</th>
                          <th className="py-2 pr-4">Show in user filters</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {domainsList.map((d) => (
                          <SortableDomainRow
                            key={d._id}
                            d={d}
                            editingDomainId={editingDomainId}
                            editDomainName={editDomainName}
                            setEditDomainName={setEditDomainName}
                            setEditingDomainId={setEditingDomainId}
                            onUpdateDomain={handleUpdateDomain}
                            onToggleActive={handleDomainToggleActive}
                            onDelete={handleDeleteDomain}
                            deletingDomainId={deletingDomainId}
                            disabled={savingDomainOrder}
                          />
                        ))}
                      </tbody>
                    </table>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        )}

        {manageCategoriesOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Manage Categories</h2>
            <p className="text-xs text-gray-500 mb-3">Select a domain, then add or edit categories. New categories appear in filters and when adding subjects.</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Domain:</span>
              <select
                value={categoryDomain}
                onChange={(e) => { setCategoryDomain(e.target.value); setEditingCategoryId(null); }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px]"
              >
                <option value="">Select domain</option>
                {domainNames.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {categoryDomain && (
                <>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={addingCategory || !newCategoryName.trim()}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {addingCategory ? 'Adding…' : 'Add Category'}
                  </button>
                </>
              )}
            </div>
            {categoryDomain && (
              categoriesLoading ? (
                <p className="text-sm text-gray-500">Loading categories…</p>
              ) : categoriesList.length === 0 ? (
                <p className="text-sm text-gray-500">No categories yet. Add one above.</p>
              ) : (
                <ul className="space-y-2">
                  {categoriesList.map((c) => (
                    <li key={c._id} className="flex items-center gap-2 flex-wrap">
                      {editingCategoryId === c._id ? (
                        <>
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="rounded border border-gray-300 px-2 py-1 text-sm w-48"
                          />
                          <button type="button" onClick={() => handleUpdateCategory(c._id)} className="text-sm text-green-600 font-medium">Save</button>
                          <button type="button" onClick={() => { setEditingCategoryId(null); setEditCategoryName(''); }} className="text-sm text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900">{c.name}</span>
                          <button type="button" onClick={() => { setEditingCategoryId(c._id); setEditCategoryName(c.name); }} className="text-sm text-blue-600 hover:underline">Edit</button>
                          <button
                            type="button"
                            onClick={() => window.confirm('Delete this category?') && handleDeleteCategory(c._id)}
                            disabled={deletingCategoryId === c._id}
                            className="text-sm text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingCategoryId === c._id ? 'Deleting…' : 'Delete'}
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}

        {quickAddSubjectOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick add Subject</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Domain</label>
                <select value={qaSubjectDomain} onChange={(e) => setQaSubjectDomain(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="">— Optional —</option>
                  {domainNames.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={qaSubjectCategory}
                  onChange={(e) => setQaSubjectCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  disabled={!qaSubjectDomain}
                >
                  <option value="">— Optional —</option>
                  {qaSubjectCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input type="text" value={qaSubjectTitle} onChange={(e) => setQaSubjectTitle(e.target.value)} placeholder="Subject title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={qaSubjectDesc} onChange={(e) => setQaSubjectDesc(e.target.value)} placeholder="Optional description" rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button type="button" onClick={handleQuickAddSubject} disabled={addingSubject || !qaSubjectTitle.trim()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {addingSubject ? 'Adding…' : 'Add Subject'}
                </button>
                <button type="button" onClick={() => setQuickAddSubjectOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {quickAddTopicOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick add Sub-topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Domain</label>
                <select value={qaTopicDomain} onChange={(e) => { setQaTopicDomain(e.target.value); setQaTopicCategory(''); setQaTopicSubjectId(''); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="">— Optional —</option>
                  {domainNames.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={qaTopicCategory} onChange={(e) => { setQaTopicCategory(e.target.value); setQaTopicSubjectId(''); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" disabled={!qaTopicDomain}>
                  <option value="">— Optional —</option>
                  {qaTopicCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                <select value={qaTopicSubjectId} onChange={(e) => setQaTopicSubjectId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Select subject</option>
                  {qaSubjectsList.map((s) => (
                    <option key={s._id} value={s._id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Parent topic (optional)</label>
                <select value={qaTopicParentId} onChange={(e) => setQaTopicParentId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" disabled={!qaTopicSubjectId}>
                  <option value="">— Root level —</option>
                  {qaRootTopics.map((t) => (
                    <option key={t._id} value={t._id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sub-topic title *</label>
                <input type="text" value={qaTopicTitle} onChange={(e) => setQaTopicTitle(e.target.value)} placeholder="Topic title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button type="button" onClick={handleQuickAddTopic} disabled={addingTopic || !qaTopicTitle.trim() || !qaTopicSubjectId} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {addingTopic ? 'Adding…' : 'Add Sub-topic'}
                </button>
                <button type="button" onClick={() => setQuickAddTopicOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz-style cascading filters: Domain → Category → Subject */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter (same flow as Quiz)</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Domain:</span>
              <select
                value={filterDomain}
                onChange={(e) => {
                  setFilterDomain(e.target.value);
                  setFilterCategory('');
                  setFilterSubjectId('');
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white min-w-[160px]"
              >
                <option value="">All</option>
                {domainNames.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {filterDomain && filterDomain !== 'Olympiad Exams' && categoriesInDomain.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Category:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setFilterSubjectId('');
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white min-w-[140px]"
                >
                  <option value="">All</option>
                  {categoriesInDomain.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Subject:</span>
              <select
                value={filterSubjectId}
                onChange={(e) => {
                  setFilterSubjectId(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white min-w-[160px]"
              >
                <option value="">All</option>
                {subjectsForFilter.map((s) => (
                  <option key={s.id} value={s.id}>{s.subject || s.id}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Search:</span>
              <input
                type="text"
                placeholder="Domain / Category / Subject / Topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-[200px]"
              />
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Table + Bulk actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-gray-700 font-medium">Total: {totalRecords} records</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600 text-sm font-medium"
              >
                Export
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting || selected.size === 0}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Bulk Delete
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input ref={selectAllRef} type="checkbox" onChange={toggleSelectAll} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SNO</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Domain</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sub-Topic</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No records. Adjust filters or{' '}
                      <Link href="/admin/subjects/new" className="text-red-600 font-medium hover:underline">
                        add a subject
                      </Link>.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr key={`${row.type}-${row.id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.sno}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">{row.domain || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">{row.category || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.subject || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.subTopic ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${row.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${row.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={row.type === 'subject' ? `/admin/subjects/new?subjectId=${row.id}` : `/admin/subjects/new?subjectId=${row.subjectId}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </Link>
                          <button type="button" onClick={() => handleDeleteOne(row)} className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalRecords > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, totalRecords)} of {totalRecords}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">
                    Prev
                  </button>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
