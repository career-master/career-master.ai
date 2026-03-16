'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
type CategoryRecord = { _id: string; domain: string; name: string; order?: number; isActive?: boolean };

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
              className="rounded border border-gray-300 px-2 py-1 text-sm w-48 text-gray-900 bg-white"
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

const DRAG_HANDLE = (
                  <span
    className="inline-flex cursor-grab active:cursor-grabbing touch-none p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
    title="Drag to reorder"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
    </svg>
                  </span>
);

function SortableLi({
  id,
  children,
  disabled,
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li ref={setNodeRef} style={style} className={`flex items-center gap-2 flex-wrap border-b border-gray-100 py-1 ${isDragging ? 'opacity-50 bg-gray-50' : ''}`}>
      <span className="flex-shrink-0" {...attributes} {...listeners}>
        {DRAG_HANDLE}
      </span>
      {children}
    </li>
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
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Quiz-style cascading filters: Domain → Category → Subject → Topic
  const [filterDomain, setFilterDomain] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterTopicId, setFilterTopicId] = useState('');
  const [topicsForFilter, setTopicsForFilter] = useState<{ _id: string; title: string }[]>([]);

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
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  // Manage Subjects (same style as Categories)
  const [manageSubjectsOpen, setManageSubjectsOpen] = useState(false);
  const [msDomain, setMsDomain] = useState('');
  const [msCategory, setMsCategory] = useState('');
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [subjectsListLoading, setSubjectsListLoading] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectTitle, setEditSubjectTitle] = useState('');
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  // Manage Topics (root topics per subject)
  const [manageTopicsOpen, setManageTopicsOpen] = useState(false);
  const [mtDomain, setMtDomain] = useState('');
  const [mtCategory, setMtCategory] = useState('');
  const [mtSubjectId, setMtSubjectId] = useState('');
  const [topicsList, setTopicsList] = useState<any[]>([]);
  const [topicsListLoading, setTopicsListLoading] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTopicTitle, setEditTopicTitle] = useState('');
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  // Manage Sub-topics (child topics)
  const [manageSubTopicsOpen, setManageSubTopicsOpen] = useState(false);
  const [mstDomain, setMstDomain] = useState('');
  const [mstCategory, setMstCategory] = useState('');
  const [mstSubjectId, setMstSubjectId] = useState('');
  const [mstParentId, setMstParentId] = useState('');
  const [subTopicsList, setSubTopicsList] = useState<any[]>([]);
  const [subTopicsListLoading, setSubTopicsListLoading] = useState(false);
  const [newSubTopicTitle, setNewSubTopicTitle] = useState('');
  const [editingSubTopicId, setEditingSubTopicId] = useState<string | null>(null);
  const [editSubTopicTitle, setEditSubTopicTitle] = useState('');
  const [deletingSubTopicId, setDeletingSubTopicId] = useState<string | null>(null);
  const [mstRootTopics, setMstRootTopics] = useState<any[]>([]);
  const [managePanelSubjectsList, setManagePanelSubjectsList] = useState<any[]>([]);
  const [msCategoriesList, setMsCategoriesList] = useState<string[]>([]);
  const [categoryDomain, setCategoryDomain] = useState('');
  const [categoriesList, setCategoriesList] = useState<CategoryRecord[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesForFilterDomain, setCategoriesForFilterDomain] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Derived lists for Manage Topics/Sub-topics filters
  const mtCategoriesList = useMemo(() => {
    if (!mtDomain) return [];
    const list = managePanelSubjectsList.filter((s: any) => subjectInDomain(s, mtDomain));
    return Array.from(new Set(list.map((s: any) => s.category).filter(Boolean))) as string[];
  }, [mtDomain, managePanelSubjectsList]);

  const mtSubjectsForSelect = useMemo(() => {
    return managePanelSubjectsList.filter((s: any) => {
      if (mtDomain && !subjectInDomain(s, mtDomain)) return false;
      if (mtDomain && mtDomain !== 'Olympiad Exams' && mtCategory && s.category !== mtCategory) return false;
      return true;
    });
  }, [managePanelSubjectsList, mtDomain, mtCategory]);

  const mstCategoriesList = useMemo(() => {
    if (!mstDomain) return [];
    const list = managePanelSubjectsList.filter((s: any) => subjectInDomain(s, mstDomain));
    return Array.from(new Set(list.map((s: any) => s.category).filter(Boolean))) as string[];
  }, [mstDomain, managePanelSubjectsList]);

  const mstSubjectsForSelect = useMemo(() => {
    return managePanelSubjectsList.filter((s: any) => {
      if (mstDomain && !subjectInDomain(s, mstDomain)) return false;
      if (mstDomain && mstDomain !== 'Olympiad Exams' && mstCategory && s.category !== mstCategory) return false;
      return true;
    });
  }, [managePanelSubjectsList, mstDomain, mstCategory]);

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

  useEffect(() => {
    if (!filterSubjectId) {
      setTopicsForFilter([]);
      setFilterTopicId('');
      return;
    }
    (async () => {
      const res = await apiService.getTopics(filterSubjectId);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? [];
        setTopicsForFilter(list);
      } else setTopicsForFilter([]);
    })();
  }, [filterSubjectId]);

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

  const loadSubjectsList = useCallback(async () => {
    setSubjectsListLoading(true);
    try {
      const res = await apiService.getSubjects({
        limit: 500,
        domain: msDomain || undefined,
        category: msCategory || undefined,
      });
      const data = res?.data as any;
      const items = data?.items ?? (Array.isArray(data) ? data : []);
      setSubjectsList(Array.isArray(items) ? items : []);
    } catch {
      setSubjectsList([]);
    } finally {
      setSubjectsListLoading(false);
    }
  }, [msDomain, msCategory]);

  useEffect(() => {
    if (manageSubjectsOpen) loadSubjectsList();
    else setSubjectsList([]);
  }, [manageSubjectsOpen, loadSubjectsList]);

  useEffect(() => {
    if (manageSubjectsOpen && msDomain) {
      apiService.getCategories({ domain: msDomain }).then((r) => {
        if (r.success && Array.isArray(r.data)) setMsCategoriesList((r.data as CategoryRecord[]).map((c) => c.name));
        else setMsCategoriesList([]);
      }).catch(() => setMsCategoriesList([]));
    } else {
      setMsCategoriesList([]);
    }
  }, [manageSubjectsOpen, msDomain]);

  const loadTopicsList = useCallback(async () => {
    if (!mtSubjectId) {
      setTopicsList([]);
      return;
    }
    setTopicsListLoading(true);
    try {
      const res = await apiService.getTopics(mtSubjectId, undefined, 'roots');
      const data = res?.data;
      const list = Array.isArray(data) ? data : (data as any)?.items ?? [];
      setTopicsList(list);
    } catch {
      setTopicsList([]);
    } finally {
      setTopicsListLoading(false);
    }
  }, [mtSubjectId]);

  useEffect(() => {
    if (manageTopicsOpen && mtSubjectId) loadTopicsList();
    else if (!manageTopicsOpen) setTopicsList([]);
  }, [manageTopicsOpen, loadTopicsList]);

  useEffect(() => {
    if (manageTopicsOpen || manageSubTopicsOpen) {
      apiService.getSubjects({ limit: 500 }).then((res) => {
        const data = res?.data as any;
        const items = data?.items ?? (Array.isArray(data) ? data : []);
        setManagePanelSubjectsList(Array.isArray(items) ? items : []);
      }).catch(() => setManagePanelSubjectsList([]));
    } else {
      setManagePanelSubjectsList([]);
    }
  }, [manageTopicsOpen, manageSubTopicsOpen]);

  const loadSubTopicsList = useCallback(async () => {
    if (!mstSubjectId) {
      setSubTopicsList([]);
      setMstRootTopics([]);
      return;
    }
    setSubTopicsListLoading(true);
    try {
      const [allRes, rootsRes] = await Promise.all([
        apiService.getTopics(mstSubjectId),
        apiService.getTopics(mstSubjectId, undefined, 'roots'),
      ]);
      const allData = allRes?.data;
      const allList = Array.isArray(allData) ? allData : (allData as any)?.items ?? [];
      const rootsData = rootsRes?.data;
      const roots = Array.isArray(rootsData) ? rootsData : (rootsData as any)?.items ?? [];
      setMstRootTopics(roots);
      const parentId = mstParentId || null;
      const filtered = parentId
        ? allList.filter((t: any) => String(t.parentTopicId || t.parentTopic) === String(parentId))
        : allList.filter((t: any) => t.parentTopicId || t.parentTopic);
      setSubTopicsList(filtered);
    } catch {
      setSubTopicsList([]);
      setMstRootTopics([]);
    } finally {
      setSubTopicsListLoading(false);
    }
  }, [mstSubjectId, mstParentId, mtSubjectId]);

  useEffect(() => {
    if (manageSubTopicsOpen && mstSubjectId) loadSubTopicsList();
    else if (!manageSubTopicsOpen) {
      setSubTopicsList([]);
      setMstRootTopics([]);
    }
  }, [manageSubTopicsOpen, loadSubTopicsList]);

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

  const [savingCategoryOrder, setSavingCategoryOrder] = useState(false);
  const handleCategoriesDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = categoriesList.findIndex((c) => c._id === active.id);
      const newIndex = categoriesList.findIndex((c) => c._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newList = arrayMove(categoriesList, oldIndex, newIndex);
      setCategoriesList(newList);
      setSavingCategoryOrder(true);
      try {
        await Promise.all(newList.map((c, i) => apiService.updateCategory(c._id, { order: i })));
        toast.success('Order saved');
        await loadCategoriesForDomain(categoryDomain);
        if (filterDomain === categoryDomain) {
          const r = await apiService.getCategories({ domain: filterDomain });
          if (r.success && Array.isArray(r.data)) setCategoriesForFilterDomain((r.data as CategoryRecord[]).map((c) => c.name));
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save order');
        await loadCategoriesForDomain(categoryDomain);
      } finally {
        setSavingCategoryOrder(false);
      }
    },
    [categoriesList, categoryDomain, filterDomain]
  );

  const [savingSubjectOrder, setSavingSubjectOrder] = useState(false);
  const handleSubjectsDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = subjectsList.findIndex((s) => s._id === active.id);
      const newIndex = subjectsList.findIndex((s) => s._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newList = arrayMove(subjectsList, oldIndex, newIndex);
      setSubjectsList(newList);
      setSavingSubjectOrder(true);
      try {
        await apiService.bulkUpdateSubjectOrders(newList.map((s, i) => ({ id: s._id, order: i })));
        toast.success('Order saved');
        await loadSubjectsList();
        await loadData();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save order');
        await loadSubjectsList();
      } finally {
        setSavingSubjectOrder(false);
      }
    },
    [subjectsList, loadData]
  );

  const [savingTopicOrder, setSavingTopicOrder] = useState(false);
  const handleTopicsDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = topicsList.findIndex((t) => t._id === active.id);
      const newIndex = topicsList.findIndex((t) => t._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newList = arrayMove(topicsList, oldIndex, newIndex);
      setTopicsList(newList);
      setSavingTopicOrder(true);
      try {
        await apiService.bulkUpdateTopicOrders(newList.map((t, i) => ({ id: t._id, order: i })));
        toast.success('Order saved');
        await loadTopicsList();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save order');
        await loadTopicsList();
      } finally {
        setSavingTopicOrder(false);
      }
    },
    [topicsList]
  );

  const [savingSubTopicOrder, setSavingSubTopicOrder] = useState(false);
  const handleSubTopicsDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = subTopicsList.findIndex((t) => t._id === active.id);
      const newIndex = subTopicsList.findIndex((t) => t._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newList = arrayMove(subTopicsList, oldIndex, newIndex);
      setSubTopicsList(newList);
      setSavingSubTopicOrder(true);
      try {
        await apiService.bulkUpdateTopicOrders(newList.map((t, i) => ({ id: t._id, order: i })));
        toast.success('Order saved');
        await loadSubTopicsList();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save order');
        await loadSubTopicsList();
      } finally {
        setSavingSubTopicOrder(false);
      }
    },
    [subTopicsList, loadSubTopicsList]
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

  const handleManageAddSubject = async () => {
    const title = newSubjectTitle.trim();
    if (!title) {
      toast.error('Enter subject title');
      return;
    }
    try {
      const res = await apiService.createSubject({
        title,
        domain: msDomain || undefined,
        category: msCategory || undefined,
      });
      if (res.success) {
        toast.success('Subject added');
        setNewSubjectTitle('');
        await loadSubjectsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to add subject');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add subject');
    }
  };

  const handleManageUpdateSubject = async (id: string) => {
    const title = editSubjectTitle.trim();
    if (!title) return;
    try {
      const res = await apiService.updateSubject(id, { title });
      if (res.success) {
        toast.success('Subject updated');
        setEditingSubjectId(null);
        setEditSubjectTitle('');
        await loadSubjectsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to update');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update');
    }
  };

  const handleManageDeleteSubject = async (id: string) => {
    setDeletingSubjectId(id);
    try {
      const res = await apiService.deleteSubject(id);
      if (res.success) {
        toast.success('Subject deleted');
        await loadSubjectsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setDeletingSubjectId(null);
    }
  };

  const handleManageAddTopic = async () => {
    const title = newTopicTitle.trim();
    if (!title || !mtSubjectId) {
      toast.error('Select a subject and enter topic title');
      return;
    }
    try {
      const res = await apiService.createTopic({ subjectId: mtSubjectId, title, parentTopicId: null });
      if (res.success) {
        toast.success('Topic added');
        setNewTopicTitle('');
        await loadTopicsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to add topic');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add topic');
    }
  };

  const handleManageUpdateTopic = async (id: string) => {
    const title = editTopicTitle.trim();
    if (!title) return;
    try {
      const res = await apiService.updateTopic(id, { title });
      if (res.success) {
        toast.success('Topic updated');
        setEditingTopicId(null);
        setEditTopicTitle('');
        await loadTopicsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to update');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update');
    }
  };

  const handleManageDeleteTopic = async (id: string) => {
    setDeletingTopicId(id);
    try {
      const res = await apiService.deleteTopic(id);
      if (res.success) {
        toast.success('Topic deleted');
        await loadTopicsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setDeletingTopicId(null);
    }
  };

  const handleManageAddSubTopic = async () => {
    const title = newSubTopicTitle.trim();
    if (!title || !mstSubjectId) {
      toast.error('Select a subject and enter sub-topic title');
      return;
    }
    try {
      const res = await apiService.createTopic({
        subjectId: mstSubjectId,
        title,
        parentTopicId: mstParentId || null,
      });
      if (res.success) {
        toast.success('Sub-topic added');
        setNewSubTopicTitle('');
        await loadSubTopicsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to add sub-topic');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add sub-topic');
    }
  };

  const handleManageUpdateSubTopic = async (id: string) => {
    const title = editSubTopicTitle.trim();
    if (!title) return;
    try {
      const res = await apiService.updateTopic(id, { title });
      if (res.success) {
        toast.success('Sub-topic updated');
        setEditingSubTopicId(null);
        setEditSubTopicTitle('');
        await loadSubTopicsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to update');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update');
    }
  };

  const handleManageDeleteSubTopic = async (id: string) => {
    setDeletingSubTopicId(id);
    try {
      const res = await apiService.deleteTopic(id);
      if (res.success) {
        toast.success('Sub-topic deleted');
        await loadSubTopicsList();
        await loadData();
      } else {
        toast.error((res as any).message || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setDeletingSubTopicId(null);
    }
  };

  // Categories in filter: preserve admin-defined order (from API); append any from rows not in API list
  const categoriesInDomain = useMemo(() => {
    if (!filterDomain) return [];
    const ordered = categoriesForFilterDomain.filter((c) => c !== 'Technology' && c !== 'Olympiad Exams');
    const list = rows.filter((r) => r.domain === filterDomain || (filterDomain === 'Technology' && r.category === 'Technology'));
    const fromRows = Array.from(new Set(list.map((r) => r.category).filter(Boolean)));
    fromRows.forEach((c) => {
      if (c !== 'Technology' && c !== 'Olympiad Exams' && !ordered.includes(c)) ordered.push(c);
    });
    return ordered;
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
      if (filterTopicId && r.id !== filterTopicId && !(r.type === 'subject' && r.id === filterSubjectId)) return false;
      const q = search.toLowerCase();
      if (q && !(r.domain || '').toLowerCase().includes(q) && !(r.category || '').toLowerCase().includes(q) && !(r.subject || '').toLowerCase().includes(q) && !(r.subTopic || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, filterDomain, filterCategory, filterSubjectId, filterTopicId, search]);

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

  const closeAllPanels = () => {
    setManageDomainsOpen(false);
    setManageCategoriesOpen(false);
    setManageSubjectsOpen(false);
    setManageTopicsOpen(false);
    setManageSubTopicsOpen(false);
  };

  // Open section from URL (e.g. from main sidebar links) - must be before any early return to keep hook order
  useEffect(() => {
    const section = searchParams?.get('section');
    if (!section) return;
    closeAllPanels();
    if (section === 'domains') setManageDomainsOpen(true);
    else if (section === 'categories') setManageCategoriesOpen(true);
    else if (section === 'subjects') setManageSubjectsOpen(true);
    else if (section === 'topics') setManageTopicsOpen(true);
    else if (section === 'subtopics') setManageSubTopicsOpen(true);
  }, [searchParams]);

  const toggleSection = (section: 'domains' | 'categories' | 'subjects' | 'topics' | 'subtopics') => {
    closeAllPanels();
    if (section === 'domains') setManageDomainsOpen(true);
    else if (section === 'categories') setManageCategoriesOpen(true);
    else if (section === 'subjects') setManageSubjectsOpen(true);
    else if (section === 'topics') setManageTopicsOpen(true);
    else if (section === 'subtopics') setManageSubTopicsOpen(true);
  };

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Subjects & Topics</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage domain, category, subject and sub-topic in one place. Use filters like Quiz page: Domain → Category → Subject.
              </p>
            </div>

        {/* Toggle row: same as main sidebar sub-items, no second sidebar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => toggleSection('domains')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${manageDomainsOpen ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Manage Domains
          </button>
          <button
            type="button"
            onClick={() => toggleSection('categories')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${manageCategoriesOpen ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Manage Categories
          </button>
          <button
            type="button"
            onClick={() => toggleSection('subjects')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${manageSubjectsOpen ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Manage Subjects
          </button>
          <button
            type="button"
            onClick={() => toggleSection('topics')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${manageTopicsOpen ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Manage Topics
          </button>
          <button
            type="button"
            onClick={() => toggleSection('subtopics')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${manageSubTopicsOpen ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Manage Sub-topics
          </button>
              <Link
                href="/admin/subjects/requests"
            className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-blue-600 hover:bg-blue-50"
              >
                Subject Requests
              </Link>
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
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[200px] text-gray-900 placeholder:text-gray-500 bg-white"
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
            <p className="text-xs text-gray-500 mb-3">Select a domain, then add or edit categories. Drag the handle to reorder. New categories appear in filters and when adding subjects.</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Domain:</span>
              <select
                value={categoryDomain}
                onChange={(e) => { setCategoryDomain(e.target.value); setEditingCategoryId(null); }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px] text-gray-900 bg-white"
              >
                <option value="">All (select domain to list)</option>
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
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px] text-gray-900 placeholder:text-gray-500 bg-white"
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoriesDragEnd}>
                  <SortableContext items={categoriesList.map((c) => c._id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-0">
                      {categoriesList.map((c) => (
                        <SortableLi key={c._id} id={c._id} disabled={savingCategoryOrder}>
                          {editingCategoryId === c._id ? (
                            <>
                              <input
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                className="rounded border border-gray-300 px-2 py-1 text-sm w-48 text-gray-900 bg-white"
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
                        </SortableLi>
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )
            )}
          </div>
        )}

        {manageSubjectsOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Manage Subjects</h2>
            <p className="text-xs text-gray-500 mb-3">Filter by domain/category (use &quot;All&quot; to see everything), then add or edit subjects. Drag the handle to reorder.</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Domain:</span>
              <select
                value={msDomain}
                onChange={(e) => { setMsDomain(e.target.value); setMsCategory(''); }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px] text-gray-900 bg-white"
              >
                <option value="">All</option>
                {domainNames.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {msDomain && msDomain !== 'Olympiad Exams' && (
                <>
                  <span className="text-sm text-gray-600">Category:</span>
                  <select
                    value={msCategory}
                    onChange={(e) => setMsCategory(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[160px] text-gray-900 bg-white"
                  >
                    <option value="">All</option>
                    {msCategoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </>
              )}
              <input
                type="text"
                value={newSubjectTitle}
                onChange={(e) => setNewSubjectTitle(e.target.value)}
                placeholder="New subject title"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px] text-gray-900 placeholder:text-gray-500 bg-white"
              />
              <button
                type="button"
                onClick={handleManageAddSubject}
                disabled={!newSubjectTitle.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Add Subject
              </button>
            </div>
            {subjectsListLoading ? (
              <p className="text-sm text-gray-500">Loading subjects…</p>
            ) : subjectsList.length === 0 ? (
              <p className="text-sm text-gray-500">No subjects match the filter. Use &quot;All&quot; or add one above.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubjectsDragEnd}>
                <SortableContext items={subjectsList.map((s) => s._id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-0 max-h-64 overflow-y-auto">
                    {subjectsList.map((s) => (
                      <SortableLi key={s._id} id={s._id} disabled={savingSubjectOrder}>
                        {editingSubjectId === s._id ? (
                          <>
                            <input
                              type="text"
                              value={editSubjectTitle}
                              onChange={(e) => setEditSubjectTitle(e.target.value)}
                              className="rounded border border-gray-300 px-2 py-1 text-sm w-48 text-gray-900 bg-white"
                            />
                            <button type="button" onClick={() => handleManageUpdateSubject(s._id)} className="text-sm text-green-600 font-medium">Save</button>
                            <button type="button" onClick={() => { setEditingSubjectId(null); setEditSubjectTitle(''); }} className="text-sm text-gray-600">Cancel</button>
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-gray-900">{s.title}</span>
                            <span className="text-xs text-gray-500">({s.domain || '—'})</span>
                            <button type="button" onClick={() => { setEditingSubjectId(s._id); setEditSubjectTitle(s.title); }} className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button
                              type="button"
                              onClick={() => window.confirm('Delete this subject?') && handleManageDeleteSubject(s._id)}
                              disabled={deletingSubjectId === s._id}
                              className="text-sm text-red-600 hover:underline disabled:opacity-50"
                            >
                              {deletingSubjectId === s._id ? 'Deleting…' : 'Delete'}
                            </button>
                          </>
                        )}
                      </SortableLi>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {manageTopicsOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Manage Topics</h2>
            <p className="text-xs text-gray-500 mb-3">Filter by domain/category (use &quot;All&quot; to see everything), then select subject. Root-level topics only. Drag the handle to reorder.</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Domain:</span>
              <select
                value={mtDomain}
                onChange={(e) => { setMtDomain(e.target.value); setMtCategory(''); setMtSubjectId(''); }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px] text-gray-900 bg-white"
              >
                <option value="">All</option>
                {domainNames.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {mtDomain && mtDomain !== 'Olympiad Exams' && (
                <>
                  <span className="text-sm text-gray-600">Category:</span>
                  <select
                    value={mtCategory}
                    onChange={(e) => { setMtCategory(e.target.value); setMtSubjectId(''); }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[160px] text-gray-900 bg-white"
                  >
                    <option value="">All</option>
                    {mtCategoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </>
              )}
              <span className="text-sm text-gray-600">Subject:</span>
              <select
                value={mtSubjectId}
                onChange={(e) => setMtSubjectId(e.target.value)}
                disabled={!mtDomain || (mtDomain !== 'Olympiad Exams' && !mtCategory)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[200px] text-gray-900 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!mtDomain ? 'Select domain first' : mtDomain !== 'Olympiad Exams' && !mtCategory ? 'Select category first' : 'All (select a subject)'}
                  </option>
                {mtSubjectsForSelect.map((s) => (
                  <option key={s._id} value={s._id}>{s.title} {s.domain ? `(${s.domain})` : ''}</option>
                ))}
              </select>
              {mtSubjectId && (
                <>
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="New topic title"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px] text-gray-900 placeholder:text-gray-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleManageAddTopic}
                    disabled={!newTopicTitle.trim()}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Add Topic
                  </button>
                </>
              )}
            </div>
            {!mtSubjectId ? (
              <p className="text-sm text-gray-500">Select domain/category and a subject above to list and manage topics.</p>
            ) : topicsListLoading ? (
              <p className="text-sm text-gray-500">Loading topics…</p>
            ) : topicsList.length === 0 ? (
              <p className="text-sm text-gray-500">No root topics yet. Add one above.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTopicsDragEnd}>
                <SortableContext items={topicsList.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-0 max-h-64 overflow-y-auto">
                    {topicsList.map((t) => (
                      <SortableLi key={t._id} id={t._id} disabled={savingTopicOrder}>
                        {editingTopicId === t._id ? (
                          <>
                            <input
                              type="text"
                              value={editTopicTitle}
                              onChange={(e) => setEditTopicTitle(e.target.value)}
                              className="rounded border border-gray-300 px-2 py-1 text-sm w-48 text-gray-900 bg-white"
                            />
                            <button type="button" onClick={() => handleManageUpdateTopic(t._id)} className="text-sm text-green-600 font-medium">Save</button>
                            <button type="button" onClick={() => { setEditingTopicId(null); setEditTopicTitle(''); }} className="text-sm text-gray-600">Cancel</button>
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-gray-900">{t.title}</span>
                            <button type="button" onClick={() => { setEditingTopicId(t._id); setEditTopicTitle(t.title); }} className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button
                              type="button"
                              onClick={() => window.confirm('Delete this topic?') && handleManageDeleteTopic(t._id)}
                              disabled={deletingTopicId === t._id}
                              className="text-sm text-red-600 hover:underline disabled:opacity-50"
                            >
                              {deletingTopicId === t._id ? 'Deleting…' : 'Delete'}
                            </button>
                          </>
                        )}
                      </SortableLi>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {manageSubTopicsOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Manage Sub-topics</h2>
            <p className="text-xs text-gray-500 mb-3">Filter by domain/category (use &quot;All&quot; to see everything), then select subject and optional parent topic. Drag the handle to reorder.</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Domain:</span>
              <select
                value={mstDomain}
                onChange={(e) => { setMstDomain(e.target.value); setMstCategory(''); setMstSubjectId(''); setMstParentId(''); }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px] text-gray-900 bg-white"
              >
                <option value="">All</option>
                {domainNames.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {mstDomain && mstDomain !== 'Olympiad Exams' && (
                <>
                  <span className="text-sm text-gray-600">Category:</span>
                  <select
                    value={mstCategory}
                    onChange={(e) => { setMstCategory(e.target.value); setMstSubjectId(''); setMstParentId(''); }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[160px] text-gray-900 bg-white"
                  >
                    <option value="">All</option>
                    {mstCategoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </>
              )}
              <span className="text-sm text-gray-600">Subject:</span>
              <select
                value={mstSubjectId}
                onChange={(e) => { setMstSubjectId(e.target.value); setMstParentId(''); }}
                disabled={!mstDomain || (mstDomain !== 'Olympiad Exams' && !mstCategory)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[200px] text-gray-900 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!mstDomain ? 'Select domain first' : mstDomain !== 'Olympiad Exams' && !mstCategory ? 'Select category first' : 'All (select a subject)'}
                  </option>
                {mstSubjectsForSelect.map((s) => (
                  <option key={s._id} value={s._id}>{s.title} {s.domain ? `(${s.domain})` : ''}</option>
                ))}
              </select>
              {mstSubjectId && (
                <>
                  <span className="text-sm text-gray-600">Parent topic:</span>
                  <select
                    value={mstParentId}
                    onChange={(e) => setMstParentId(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[180px] text-gray-900 bg-white"
                  >
                    <option value="">All sub-topics</option>
                    {mstRootTopics.map((r) => (
                      <option key={r._id} value={r._id}>{r.title}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newSubTopicTitle}
                    onChange={(e) => setNewSubTopicTitle(e.target.value)}
                    placeholder="New sub-topic title"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[160px] text-gray-900 placeholder:text-gray-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleManageAddSubTopic}
                    disabled={!newSubTopicTitle.trim()}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Add Sub-topic
                  </button>
                </>
              )}
            </div>
            {!mstSubjectId ? (
              <p className="text-sm text-gray-500">Select domain/category and a subject above to list and manage sub-topics.</p>
            ) : subTopicsListLoading ? (
              <p className="text-sm text-gray-500">Loading sub-topics…</p>
            ) : subTopicsList.length === 0 ? (
              <p className="text-sm text-gray-500">No sub-topics for this filter. Add one above.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubTopicsDragEnd}>
                <SortableContext items={subTopicsList.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-0 max-h-64 overflow-y-auto">
                    {subTopicsList.map((t) => (
                      <SortableLi key={t._id} id={t._id} disabled={savingSubTopicOrder}>
                        {editingSubTopicId === t._id ? (
                          <>
                            <input
                              type="text"
                              value={editSubTopicTitle}
                              onChange={(e) => setEditSubTopicTitle(e.target.value)}
                              className="rounded border border-gray-300 px-2 py-1 text-sm w-48 text-gray-900 bg-white"
                            />
                            <button type="button" onClick={() => handleManageUpdateSubTopic(t._id)} className="text-sm text-green-600 font-medium">Save</button>
                            <button type="button" onClick={() => { setEditingSubTopicId(null); setEditSubTopicTitle(''); }} className="text-sm text-gray-600">Cancel</button>
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-gray-900">{t.title}</span>
                            <span className="text-xs text-gray-500">(under {mstRootTopics.find((r) => r._id === t.parentTopicId || r._id === (t as any).parentTopic)?.title || 'root'})</span>
                            <button type="button" onClick={() => { setEditingSubTopicId(t._id); setEditSubTopicTitle(t.title); }} className="text-sm text-blue-600 hover:underline">Edit</button>
                            <button
                              type="button"
                              onClick={() => window.confirm('Delete this sub-topic?') && handleManageDeleteSubTopic(t._id)}
                              disabled={deletingSubTopicId === t._id}
                              className="text-sm text-red-600 hover:underline disabled:opacity-50"
                            >
                              {deletingSubTopicId === t._id ? 'Deleting…' : 'Delete'}
                            </button>
                          </>
                        )}
                      </SortableLi>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {/* Cascading filters: Domain → Category → Subject */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Domain:</span>
              <select
                value={filterDomain}
                onChange={(e) => {
                  setFilterDomain(e.target.value);
                  setFilterCategory('');
                  setFilterSubjectId('');
                  setFilterTopicId('');
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
            {filterDomain && filterDomain !== 'Olympiad Exams' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Category:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setFilterSubjectId('');
                    setFilterTopicId('');
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white min-w-[140px]"
                >
                  <option value="">All</option>
                  {categoriesInDomain.length > 0 ? (
                    categoriesInDomain.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  ) : (
                    <option value="" disabled>No categories yet</option>
                  )}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Subject:</span>
              <select
                value={filterSubjectId}
                onChange={(e) => {
                  setFilterSubjectId(e.target.value);
                  setFilterTopicId('');
                  setPage(1);
                }}
                disabled={!filterDomain || (filterDomain !== 'Olympiad Exams' && !filterCategory)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white min-w-[160px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!filterDomain ? 'Select domain first' : filterDomain !== 'Olympiad Exams' && !filterCategory ? 'Select category first' : 'All'}
                </option>
                {subjectsForFilter.map((s) => (
                  <option key={s.id} value={s.id}>{s.subject || s.id}</option>
                ))}
              </select>
            </div>
            {filterSubjectId && filterDomain && (filterDomain === 'Olympiad Exams' || filterCategory) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 whitespace-nowrap">Topic:</span>
                <select
                  value={filterTopicId}
                  onChange={(e) => { setFilterTopicId(e.target.value); setPage(1); }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white min-w-[160px]"
                >
                  <option value="">All</option>
                  {topicsForFilter.length > 0 ? (
                    topicsForFilter.map((t) => (
                      <option key={t._id} value={t._id}>{t.title}</option>
                    ))
                  ) : (
                    <option value="" disabled>No topics yet</option>
                  )}
                </select>
                {topicsForFilter.length === 0 && (
                  <Link
                    href={`/admin/subjects/new?subjectId=${filterSubjectId}`}
                    className="text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                  >
                    + Add topic
                  </Link>
                )}
              </div>
            )}
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
              <span className="text-sm text-gray-900">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, totalRecords)} of {totalRecords}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-500">
                    Prev
                  </button>
                  <span className="px-2 text-sm text-gray-900">{currentPage}</span>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-500">
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
