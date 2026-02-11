'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import * as XLSX from 'xlsx';

type Subject = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: 'basic' | 'hard';
  requiresApproval?: boolean;
  order?: number;
  thumbnail?: string;
  batches?: string[];
};


type Topic = {
  _id: string;
  subjectId: string;
  title: string;
  description?: string;
  order?: number;
  prerequisites?: string[];
  requiredQuizzesToUnlock?: number;
};

type CheatSheet = {
  _id?: string;
  topicId: string;
  content: string;
  contentType: 'html' | 'markdown' | 'text';
  estReadMinutes?: number;
};

type QuizSet = {
  _id: string;
  topicId: string;
  quizId: string | { _id: string; title: string };
  setName?: string;
  order?: number;
  isActive?: boolean;
};

type QuizLite = { _id: string; title: string };

type TopicWithData = Topic & {
  cheatsheet?: CheatSheet;
  quizSets: QuizSet[];
  expanded?: boolean;
};

export default function SubjectsBuilderPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicsWithData, setTopicsWithData] = useState<TopicWithData[]>([]);
  const [quizzes, setQuizzes] = useState<QuizLite[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [subjectForm, setSubjectForm] = useState({
    title: '',
    description: '',
    category: '',
    level: undefined as Subject['level'] | undefined,
    requiresApproval: true,
    order: 0,
    thumbnail: '',
    batches: [] as string[],
  });
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    order: 0,
    prerequisites: [] as string[],
    requiredQuizzesToUnlock: 1,
  });

  // Per-topic forms (stored by topicId)
  const [topicCheatForms, setTopicCheatForms] = useState<Record<string, {
    content: string;
    contentType: 'html' | 'markdown' | 'text';
    estReadMinutes: number;
  }>>({});

  const [topicQuizSetForms, setTopicQuizSetForms] = useState<Record<string, {
    quizId: string;
    setName: string;
    order: number;
    isActive: boolean;
  }>>({});

  // Excel upload form state (per topic)
  const [excelUploadForms, setExcelUploadForms] = useState<Record<string, {
    quizName: string;
    durationMinutes: number;
  }>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
    loadInitial();
  }, [isAuthenticated, user, router]);

  const loadInitial = async () => {
    try {
      setLoading(true);
      const preferredSubjectId = searchParams.get('subjectId');
      const [subjectsRes, quizzesRes, batchesRes] = await Promise.all([
        apiService.getSubjects({ page: 1, limit: 100 }),
        apiService.getQuizzes(1, 50),
        apiService.getBatches(1, 100),
      ]);
      if (batchesRes.success && batchesRes.data) {
        const data: any = batchesRes.data;
        setBatches(Array.isArray(data.items) ? data.items : []);
      }
      if (subjectsRes.success && subjectsRes.data?.items) {
        setSubjects(subjectsRes.data.items);
        const initialSubject =
          (preferredSubjectId && subjectsRes.data.items.find((s: Subject) => s._id === preferredSubjectId)) ||
          subjectsRes.data.items[0];
        if (initialSubject) {
          setSelectedSubjectId(initialSubject._id);
          await loadTopicsWithData(initialSubject._id);
        }
      }
      if (quizzesRes.success && quizzesRes.data?.items) {
        setQuizzes(
          quizzesRes.data.items.map((q: any) => ({ _id: q._id, title: q.title }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopicsWithData = async (subjectId: string) => {
    try {
      const res = await apiService.getTopics(subjectId, true);
      if (res.success && Array.isArray(res.data)) {
        const topics = res.data;
        setTopicForm((prev) => ({ ...prev, order: topics.length || 0 }));

        // Load cheatsheet and quiz sets for each topic
        const topicsWithDataPromises = topics.map(async (topic: Topic) => {
          const [cheatRes, quizSetRes] = await Promise.all([
            apiService.getCheatSheetByTopic(topic._id),
            apiService.getQuizSetsByTopic(topic._id, true),
          ]);

          // Cheatsheet is optional - backend returns success: false if not found
          const cheatsheet = cheatRes.success && cheatRes.data ? cheatRes.data : undefined;
          const quizSets = quizSetRes.success && Array.isArray(quizSetRes.data) ? quizSetRes.data : [];

          // Initialize form state for this topic
          if (cheatsheet) {
            setTopicCheatForms((prev) => ({
              ...prev,
              [topic._id]: {
                content: cheatsheet.content || '',
                contentType: cheatsheet.contentType || 'html',
                estReadMinutes: cheatsheet.estReadMinutes || 5,
              },
            }));
          } else {
            setTopicCheatForms((prev) => ({
              ...prev,
              [topic._id]: { content: '', contentType: 'html', estReadMinutes: 5 },
            }));
          }

          setTopicQuizSetForms((prev) => ({
            ...prev,
            [topic._id]: { quizId: '', setName: '', order: 0, isActive: true },
          }));

          // Initialize Excel upload form
          setExcelUploadForms((prev) => ({
            ...prev,
            [topic._id]: { quizName: '', durationMinutes: 30 },
          }));

          return {
            ...topic,
            cheatsheet,
            quizSets,
            expanded: false,
          } as TopicWithData;
        });

        const topicsWithData = await Promise.all(topicsWithDataPromises);
        setTopicsWithData(topicsWithData);
      } else {
        setTopicForm((prev) => ({ ...prev, order: 0 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubject = async () => {
    try {
      setSaving(true);
      // Filter out empty strings and undefined values
      const payload: any = {
        title: subjectForm.title.trim(),
        requiresApproval: subjectForm.requiresApproval,
        order: subjectForm.order,
      };
      if (subjectForm.description?.trim()) {
        payload.description = subjectForm.description.trim();
      }
      if (subjectForm.category?.trim()) {
        payload.category = subjectForm.category.trim();
      }
      if (subjectForm.level) {
        payload.level = subjectForm.level;
      }
    if (subjectForm.thumbnail?.trim()) {
      payload.thumbnail = subjectForm.thumbnail.trim();
    }
    if (subjectForm.thumbnail?.trim()) {
      payload.thumbnail = subjectForm.thumbnail.trim();
    }
    if (subjectForm.batches && subjectForm.batches.length > 0) {
      payload.batches = subjectForm.batches;
    }
      const res = await apiService.createSubject(payload);
      if (res.success) {
        const created =
          (res as any)?.data ||
          (res as any)?.subject ||
          (res as any)?.item ||
          (res as any);
        if (created?._id) {
          setSubjects((prev) => [created, ...prev]);
          setSelectedSubjectId(created._id);
          await loadTopicsWithData(created._id);
        } else {
          await loadInitial();
        }
        setSubjectForm({
          title: '',
          description: '',
          category: '',
          level: undefined,
          requiresApproval: true,
          order: 0,
          thumbnail: '',
          batches: [],
        });
      } else {
        alert(res.message || 'Failed to create subject');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create subject');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject._id);
    setSubjectForm({
      title: subject.title,
      description: subject.description || '',
      category: subject.category || '',
      level: subject.level,
      requiresApproval: subject.requiresApproval ?? true,
      order: subject.order ?? 0,
      thumbnail: subject.thumbnail || '',
      batches: subject.batches || [],
    });
  };

  const handleUpdateSubject = async () => {
    if (!editingSubjectId) return;
    try {
      setSaving(true);
      const payload: any = {
        title: subjectForm.title.trim(),
        requiresApproval: subjectForm.requiresApproval,
        order: subjectForm.order,
      };
      if (subjectForm.description?.trim()) {
        payload.description = subjectForm.description.trim();
      }
      if (subjectForm.category?.trim()) {
        payload.category = subjectForm.category.trim();
      }
      if (subjectForm.level) {
        payload.level = subjectForm.level;
      }
      if (subjectForm.thumbnail?.trim()) {
        payload.thumbnail = subjectForm.thumbnail.trim();
      }
      if (subjectForm.batches && Array.isArray(subjectForm.batches)) {
        payload.batches = subjectForm.batches;
      }
      const res = await apiService.updateSubject(editingSubjectId, payload);
      if (res.success) {
        await loadInitial();
        setEditingSubjectId(null);
        setSubjectForm({
          title: '',
          description: '',
          category: '',
          level: undefined,
          requiresApproval: true,
          order: 0,
          thumbnail: '',
          batches: [],
        });
      } else {
        alert(res.message || 'Failed to update subject');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all associated topics, cheatsheets, and quiz sets.')) {
      return;
    }
    try {
      setSaving(true);
      const res = await apiService.deleteSubject(subjectId);
      if (res.success) {
        await loadInitial();
        if (selectedSubjectId === subjectId) {
          setSelectedSubjectId(null);
        }
      } else {
        alert(res.message || 'Failed to delete subject');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!selectedSubjectId) return;
    try {
      setSaving(true);
      const res = await apiService.createTopic({
        subjectId: selectedSubjectId,
        ...topicForm,
      });
      if (res.success) {
        const createdTopic = (res as any)?.data || (res as any)?.topic || (res as any)?.item;
        await loadTopicsWithData(selectedSubjectId);
        
        // Auto-expand the newly created topic
        if (createdTopic?._id) {
          setTimeout(() => {
            setTopicsWithData((prev) =>
              prev.map((t) => (t._id === createdTopic._id ? { ...t, expanded: true } : t))
            );
          }, 100);
        }
        
        setTopicForm({
          title: '',
          description: '',
          order: topicsWithData.length + 1,
          prerequisites: [],
          requiredQuizzesToUnlock: 1,
        });
        setEditingTopicId(null);
      } else {
        alert(res.message || 'Failed to create topic');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create topic');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopicId(topic._id);
    setTopicForm({
      title: topic.title,
      description: topic.description || '',
      order: topic.order ?? 0,
      prerequisites: topic.prerequisites || [],
      requiredQuizzesToUnlock: topic.requiredQuizzesToUnlock ?? 1,
    });
  };

  const handleUpdateTopic = async () => {
    if (!editingTopicId || !selectedSubjectId) return;
    try {
      setSaving(true);
      const res = await apiService.updateTopic(editingTopicId, {
        subjectId: selectedSubjectId,
        ...topicForm,
      });
      if (res.success) {
        await loadTopicsWithData(selectedSubjectId);
        setEditingTopicId(null);
        setTopicForm({
          title: '',
          description: '',
          order: topicsWithData.length,
          prerequisites: [],
          requiredQuizzesToUnlock: 1,
        });
      } else {
        alert(res.message || 'Failed to update topic');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update topic');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete associated cheatsheets and quiz sets.')) {
      return;
    }
    if (!selectedSubjectId) return;
    try {
      setSaving(true);
      const res = await apiService.deleteTopic(topicId);
      if (res.success) {
        await loadTopicsWithData(selectedSubjectId);
      } else {
        alert(res.message || 'Failed to delete topic');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete topic');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCheatsheet = async (topicId: string) => {
    const cheatForm = topicCheatForms[topicId];
    if (!cheatForm) return;

    try {
      setSaving(true);
      const topic = topicsWithData.find((t) => t._id === topicId);
      const existingCheat = topic?.cheatsheet;

      if (existingCheat?._id) {
        const res = await apiService.updateCheatSheet(existingCheat._id, {
          ...cheatForm,
          topicId,
        });
        if (!res.success) {
          alert(res.message || 'Failed to update cheatsheet');
          return;
        }
      } else {
        const res = await apiService.createCheatSheet({
          ...cheatForm,
          topicId,
        });
        if (!res.success) {
          alert(res.message || 'Failed to create cheatsheet');
          return;
        }
      }
      await loadTopicsWithData(selectedSubjectId!);
    } catch (err: any) {
      alert(err.message || 'Failed to save cheatsheet');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuizSet = async (topicId: string) => {
    const quizSetForm = topicQuizSetForms[topicId];
    if (!quizSetForm || !quizSetForm.quizId) return;

    try {
      setSaving(true);
      const res = await apiService.createQuizSet({
        topicId,
        quizId: quizSetForm.quizId,
        setName: quizSetForm.setName || undefined,
        order: quizSetForm.order,
        isActive: quizSetForm.isActive,
      });
      if (res.success) {
        await loadTopicsWithData(selectedSubjectId!);
        setTopicQuizSetForms((prev) => ({
          ...prev,
          [topicId]: { quizId: '', setName: '', order: 0, isActive: true },
        }));
      } else {
        alert(res.message || 'Failed to add quiz set');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add quiz set');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadMarkdown = (file: File, topicId: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result?.toString() || '';
      setTopicCheatForms((prev) => ({
        ...prev,
        [topicId]: {
          ...(prev[topicId] || { contentType: 'html', estReadMinutes: 5 }),
          content: text,
          contentType: 'markdown',
        },
      }));
    };
    reader.readAsText(file);
  };

  // Enhanced function to detect and format code snippets
  const detectAndFormatCode = (text: string): string => {
    const lines = text.split('\n');
    const formatted: string[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let detectedLanguage = '';

    // Common code patterns
    const codePatterns = {
      javascript: /(function|const|let|var|=>|import|export|console\.|\.js)/i,
      python: /(def |import |from |print\(|\.py|if __name__)/i,
      java: /(public |private |class |import java|System\.out)/i,
      cpp: /(#include|using namespace|std::|int main|\.cpp)/i,
      c: /(#include|int main|printf|scanf|\.c)/i,
      html: /(<html|<div|<body|<head|<!DOCTYPE)/i,
      css: /(@media|@keyframes|\.|#|:hover|:focus)/i,
      sql: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|CREATE TABLE)/i,
    };

    const detectLanguage = (line: string): string => {
      for (const [lang, pattern] of Object.entries(codePatterns)) {
        if (pattern.test(line)) {
          return lang;
        }
      }
      return '';
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if line looks like code (contains common code indicators)
      const looksLikeCode =
        trimmed.includes('{') ||
        trimmed.includes('}') ||
        trimmed.includes('(') && trimmed.includes(')') ||
        trimmed.includes(';') ||
        trimmed.includes('=') && trimmed.includes('(') ||
        trimmed.includes('->') ||
        trimmed.includes('::') ||
        trimmed.match(/^\s*(function|def|class|import|const|let|var)\s/) ||
        trimmed.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/) ||
        trimmed.match(/^\s*\/\//) ||
        trimmed.match(/^\s*\/\*/);

      if (looksLikeCode && !inCodeBlock) {
        // Start code block
        inCodeBlock = true;
        codeBuffer = [line];
        detectedLanguage = detectLanguage(line) || 'javascript';
      } else if (inCodeBlock) {
        // Check if we should end the code block
        const isEmpty = trimmed === '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        const nextIsCode = nextLine.trim() && (
          nextLine.trim().includes('{') ||
          nextLine.trim().includes('}') ||
          nextLine.trim().includes('(') && nextLine.trim().includes(')') ||
          nextLine.trim().includes(';') ||
          nextLine.trim().match(/^\s*(function|def|class|import|const|let|var)\s/)
        );

        if (isEmpty && !nextIsCode && codeBuffer.length > 0) {
          // End code block
          formatted.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
          codeBuffer = [];
          inCodeBlock = false;
          detectedLanguage = '';
        } else if (looksLikeCode || isEmpty) {
          codeBuffer.push(line);
        } else {
          // End code block and add current line as text
          if (codeBuffer.length > 0) {
            formatted.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
            codeBuffer = [];
          }
          inCodeBlock = false;
          formatted.push(line);
        }
      } else {
        formatted.push(line);
      }
    }

    // Close any open code block
    if (inCodeBlock && codeBuffer.length > 0) {
      formatted.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
    }

    return formatted.join('\n');
  };

  // Enhanced function to detect and format headings
  const detectAndFormatHeadings = (text: string): string => {
    const lines = text.split('\n');
    const formatted: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip if already a markdown heading
      if (trimmed.match(/^#{1,6}\s/)) {
        formatted.push(line);
        continue;
      }

      // Detect bold text that might be a heading (common from GPT)
      if (trimmed.match(/^\*\*[^*]+\*\*$/) || trimmed.match(/^__[^_]+__$/)) {
        const headingText = trimmed.replace(/\*\*/g, '').replace(/__/g, '').trim();
        // Convert to H2 if it's a short line (likely heading)
        if (headingText.length < 100 && !headingText.includes('.')) {
          formatted.push(`## ${headingText}`);
          continue;
        }
      }

      // Detect lines that look like headings (short, no punctuation at end, capitalized)
      if (
        trimmed.length > 0 &&
        trimmed.length < 80 &&
        !trimmed.endsWith('.') &&
        !trimmed.endsWith(',') &&
        !trimmed.endsWith(';') &&
        !trimmed.includes('```') &&
        trimmed[0] === trimmed[0].toUpperCase() &&
        !trimmed.includes('{') &&
        !trimmed.includes('}') &&
        !trimmed.includes('(') &&
        !trimmed.includes(')') &&
        !trimmed.match(/^\d+\./) // Not a numbered list
      ) {
        // Check if previous line was empty (common heading pattern)
        const prevLine = formatted[formatted.length - 1] || '';
        if (prevLine.trim() === '' || formatted.length === 0) {
          formatted.push(`## ${trimmed}`);
          continue;
        }
      }

      formatted.push(line);
    }

    return formatted.join('\n');
  };

  const handlePasteFromSource = async (topicId: string) => {
    try {
      // Get clipboard content
      let clipboardText = await navigator.clipboard.readText();
      
      // Check if it's HTML (common from GPT or web sources)
      const isHTML = clipboardText.trim().startsWith('<') || clipboardText.includes('<html') || clipboardText.includes('<div');
      
      if (isHTML) {
        // Convert HTML to Markdown using turndown
        const TurndownService = (await import('turndown')).default;
        const turndownService = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
          bulletListMarker: '-',
        });
        
        // Enhanced code block support
        turndownService.addRule('codeBlocks', {
          filter: ['pre'],
          replacement: (content: string, node: any) => {
            const codeElement = node.querySelector('code');
            const language = codeElement?.className?.replace('language-', '').replace('hljs', '').trim() || '';
            const code = codeElement?.textContent || content;
            return `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
          },
        });

        // Better heading detection
        turndownService.addRule('headings', {
          filter: (node: any) => {
            return node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' || 
                   node.tagName === 'H4' || node.tagName === 'H5' || node.tagName === 'H6' ||
                   (node.tagName === 'P' && node.querySelector('strong') && node.textContent.length < 100);
          },
          replacement: (content: string, node: any) => {
            if (node.tagName.startsWith('H')) {
              const level = parseInt(node.tagName.charAt(1));
              return `\n${'#'.repeat(level)} ${content}\n`;
            }
            // Strong text in short paragraphs might be headings
            const strong = node.querySelector('strong');
            if (strong && node.textContent.length < 100) {
              return `\n## ${strong.textContent}\n`;
            }
            return content;
          },
        });
        
        let markdown = turndownService.turndown(clipboardText);
        
        // Post-process: detect and format any remaining code snippets
        markdown = detectAndFormatCode(markdown);
        // Format headings
        markdown = detectAndFormatHeadings(markdown);
        
        setTopicCheatForms((prev) => ({
          ...prev,
          [topicId]: {
            ...(prev[topicId] || { contentType: 'html', estReadMinutes: 5 }),
            content: markdown,
            contentType: 'markdown',
          },
        }));
        alert('Content pasted and converted! Headings and code snippets have been automatically formatted.');
      } else {
        // Plain text or markdown - detect and format code snippets and headings
        let formattedText = clipboardText;
        
        // First format headings
        formattedText = detectAndFormatHeadings(formattedText);
        // Then format code snippets
        formattedText = detectAndFormatCode(formattedText);
        
        setTopicCheatForms((prev) => ({
          ...prev,
          [topicId]: {
            ...(prev[topicId] || { contentType: 'html', estReadMinutes: 5 }),
            content: formattedText,
            contentType: 'markdown',
          },
        }));
        alert('Content pasted and auto-formatted! Headings and code snippets have been detected and formatted.');
      }
    } catch (error: any) {
      console.error('Paste error:', error);
      // Fallback: prompt user to paste manually
      const userInput = prompt('Please paste your content here (supports HTML, Markdown, or plain text):');
      if (userInput) {
        const isHTML = userInput.trim().startsWith('<') || userInput.includes('<html') || userInput.includes('<div');
        let processedContent = userInput;
        
        if (isHTML) {
          try {
            const TurndownService = (await import('turndown')).default;
            const turndownService = new TurndownService({
              headingStyle: 'atx',
              codeBlockStyle: 'fenced',
            });
            processedContent = turndownService.turndown(userInput);
          } catch (e) {
            // Keep original if conversion fails
          }
        }
        
        // Auto-format headings and code
        processedContent = detectAndFormatHeadings(processedContent);
        processedContent = detectAndFormatCode(processedContent);
        
        setTopicCheatForms((prev) => ({
          ...prev,
          [topicId]: {
            ...(prev[topicId] || { contentType: 'html', estReadMinutes: 5 }),
            content: processedContent,
            contentType: 'markdown',
          },
        }));
        alert('Content pasted and auto-formatted!');
      }
    }
  };

  const handleUploadHTML = async (file: File, topicId: string) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const htmlContent = e.target?.result?.toString() || '';
        
        // Convert HTML to Markdown
        const TurndownService = (await import('turndown')).default;
        const turndownService = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
          bulletListMarker: '-',
        });
        
        // Add code block support
        turndownService.addRule('codeBlocks', {
          filter: ['pre'],
          replacement: (content: string, node: any) => {
            const codeElement = node.querySelector('code');
            const language = codeElement?.className?.replace('language-', '') || '';
            const code = codeElement?.textContent || content;
            return `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
          },
        });
        
        const markdown = turndownService.turndown(htmlContent);
        
        setTopicCheatForms((prev) => ({
          ...prev,
          [topicId]: {
            ...(prev[topicId] || { contentType: 'html', estReadMinutes: 5 }),
            content: markdown,
            contentType: 'markdown',
          },
        }));
        
        alert('HTML file converted to Markdown successfully!');
      };
      reader.readAsText(file);
    } catch (error: any) {
      console.error('HTML conversion error:', error);
      alert(`Failed to convert HTML: ${error.message || 'Unknown error'}`);
    }
  };

  const downloadExcelTemplate = () => {
    // Create template data
    const templateData = [
      {
        question: 'What is the capital of France?',
        optionA: 'London',
        optionB: 'Berlin',
        optionC: 'Paris',
        optionD: 'Madrid',
        correctOption: 'C',
        type: 'multiple_choice_single',
        marks: '1',
        negativeMarks: '0',
      },
      {
        question: 'Which of the following are programming languages?',
        optionA: 'JavaScript',
        optionB: 'HTML',
        optionC: 'Python',
        optionD: 'CSS',
        correctOption: 'A,C',
        type: 'multiple_choice_multiple',
        marks: '2',
        negativeMarks: '0.5',
      },
      {
        question: 'Python is a compiled language.',
        optionA: 'True',
        optionB: 'False',
        correctOption: 'B',
        type: 'true_false',
        marks: '1',
        negativeMarks: '0',
      },
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');

    // Add instructions sheet
    const instructions = [
      { Column: 'question', Description: 'The question text (required)' },
      { Column: 'optionA', Description: 'First option (required)' },
      { Column: 'optionB', Description: 'Second option (required)' },
      { Column: 'optionC', Description: 'Third option (optional)' },
      { Column: 'optionD', Description: 'Fourth option (optional)' },
      { Column: 'correctOption', Description: 'Correct answer: A, B, C, D (or comma-separated for multiple: A,C,D)' },
      { Column: 'type', Description: 'Question type: multiple_choice_single, multiple_choice_multiple, or true_false' },
      { Column: 'marks', Description: 'Marks for correct answer (default: 1)' },
      { Column: 'negativeMarks', Description: 'Negative marks for wrong answer (default: 0)' },
    ];
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Download file
    XLSX.writeFile(wb, 'Quiz_Template.xlsx');
  };

  const handleUploadExcel = async (file: File, topicId: string) => {
    try {
      const excelForm = excelUploadForms[topicId];
      if (!excelForm?.quizName?.trim()) {
        alert('Please enter quiz name first');
        return;
      }
      if (!excelForm.durationMinutes || excelForm.durationMinutes <= 0) {
        alert('Please enter valid duration (in minutes)');
        return;
      }

      setSaving(true);

      // Read Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rows || rows.length === 0) {
        alert('Excel file is empty');
        setSaving(false);
        return;
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', excelForm.quizName.trim());
      formData.append('description', `Quiz for topic: ${topicsWithData.find(t => t._id === topicId)?.title || 'Unknown'}`);
      formData.append('durationMinutes', excelForm.durationMinutes.toString());
      formData.append('availableToEveryone', 'false');
      formData.append('maxAttempts', '999');

      // Upload to backend
      const res = await apiService.uploadQuizExcel(formData);
      
      if (res.success && res.data?._id) {
        const createdQuizId = res.data._id;
        
        // Automatically create quiz set with the uploaded quiz
        const quizSetForm = topicQuizSetForms[topicId] || { quizId: '', setName: '', order: 0, isActive: true };
        const quizSetPayload: any = {
          topicId,
          quizId: createdQuizId,
          setName: excelForm.quizName.trim(),
          order: 0,
          isActive: true,
        };

        const quizSetRes = await apiService.createQuizSet(quizSetPayload);
        
        if (quizSetRes.success) {
          // Reload topics to show new quiz set
          await loadTopicsWithData(selectedSubjectId!);
          
          // Reset forms
          setExcelUploadForms((prev) => ({
            ...prev,
            [topicId]: { quizName: '', durationMinutes: 30 },
          }));
          setTopicQuizSetForms((prev) => ({
            ...prev,
            [topicId]: { quizId: '', setName: '', order: 0, isActive: true },
          }));
          
          // Refresh quizzes list
          const quizzesRes = await apiService.getQuizzes(1, 50);
          if (quizzesRes.success && quizzesRes.data?.items) {
            setQuizzes(
              quizzesRes.data.items.map((q: any) => ({ _id: q._id, title: q.title }))
            );
          }
          
          alert(`Quiz "${excelForm.quizName}" created and added to quiz sets successfully!`);
        } else {
          alert(`Quiz created but failed to add to quiz sets: ${quizSetRes.message || 'Unknown error'}`);
        }
      } else {
        alert(`Failed to create quiz: ${res.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Excel upload error:', error);
      alert(`Failed to upload Excel: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPDF = async (file: File, topicId: string) => {
    try {
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source - try local first, then CDN (works in both dev and production)
      if (typeof window !== 'undefined') {
        const version = pdfjsLib.version || '5.4.449';
        const localWorkerPath = '/pdfjs/pdf.worker.min.mjs';
        
        // Try local worker first (available after build)
        // Fallback to CDN if local file doesn't exist (works in all environments)
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          // Use CDN as primary source for production reliability
          // Local file will be used if available, but CDN ensures it always works
          `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
        
        // Optional: Try to use local file if available (faster, but CDN is reliable fallback)
        // The CDN will work in all environments (dev, production, Vercel, Render, etc.)
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0 // Reduce console noise
      }).promise;
      
      let markdownContent = '';
      const numPages = pdf.numPages;

      // Extract text from each page with better formatting
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Group text items by line based on y-position
        const lines: { [key: number]: string[] } = {};
        textContent.items.forEach((item: any) => {
          if ('str' in item && item.str.trim()) {
            const y = Math.round(item.transform[5] || 0);
            if (!lines[y]) lines[y] = [];
            lines[y].push(item.str);
          }
        });

        // Convert lines to text, preserving structure
        const pageLines = Object.keys(lines)
          .sort((a, b) => Number(b) - Number(a)) // Sort by y-position (top to bottom)
          .map((y) => lines[Number(y)].join(' ').trim())
          .filter((line) => line.length > 0);

        if (pageLines.length > 0) {
          // Process lines to detect code blocks, headings, and format properly
          const processedLines: string[] = [];
          let inCodeBlock = false;
          let codeBuffer: string[] = [];
          let detectedLanguage = '';

          for (let i = 0; i < pageLines.length; i++) {
            const line = pageLines[i];
            const trimmed = line.trim();

            // Detect code patterns (common in programming cheatsheets)
            const looksLikeCode =
              trimmed.includes('#include') ||
              trimmed.includes('int main') ||
              trimmed.includes('printf') ||
              trimmed.includes('scanf') ||
              trimmed.includes('{') ||
              trimmed.includes('}') ||
              trimmed.includes(';') ||
              trimmed.match(/^\s*(function|def|class|import|const|let|var|#include|int|char|float|void)\s/) ||
              trimmed.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[=<>!]+\s*/) ||
              trimmed.match(/^\s*\/\//) ||
              (trimmed.includes('(') && trimmed.includes(')') && trimmed.length < 100);

            if (looksLikeCode && !inCodeBlock) {
              // Start code block
              inCodeBlock = true;
              codeBuffer = [line];
              
              // Detect language
              if (trimmed.includes('#include') || trimmed.includes('printf') || trimmed.includes('scanf')) {
                detectedLanguage = 'c';
              } else if (trimmed.includes('def ') || trimmed.includes('import ') || trimmed.includes('print(')) {
                detectedLanguage = 'python';
              } else if (trimmed.includes('function') || trimmed.includes('const ') || trimmed.includes('let ')) {
                detectedLanguage = 'javascript';
              } else {
                detectedLanguage = 'cpp';
              }
            } else if (inCodeBlock) {
              // Check if we should end the code block
              const isEmpty = trimmed === '';
              const nextLine = i < pageLines.length - 1 ? pageLines[i + 1] : '';
              const nextIsCode = nextLine.trim() && (
                nextLine.trim().includes('{') ||
                nextLine.trim().includes('}') ||
                nextLine.trim().includes(';') ||
                nextLine.trim().match(/^\s*(function|def|class|import|const|let|var|#include|int|char|float|void)\s/)
              );

              if (isEmpty && !nextIsCode && codeBuffer.length > 0) {
                // End code block
                processedLines.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
                codeBuffer = [];
                inCodeBlock = false;
                detectedLanguage = '';
              } else if (looksLikeCode || isEmpty || trimmed.match(/^\s+/)) {
                // Continue code block (includes indented lines)
                codeBuffer.push(line);
              } else {
                // End code block and add current line as text
                if (codeBuffer.length > 0) {
                  processedLines.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
                  codeBuffer = [];
                }
                inCodeBlock = false;
                
                // Process as regular text
                if (trimmed.length < 80 && (trimmed === trimmed.toUpperCase() || trimmed.endsWith(':'))) {
                  processedLines.push(`## ${trimmed.replace(':', '')}`);
                } else if (/^\d+[\.\)]\s/.test(trimmed)) {
                  processedLines.push(line);
                } else if (/^[•\-\*]\s/.test(trimmed)) {
                  processedLines.push(`- ${trimmed.replace(/^[•\-\*]\s/, '')}`);
                } else {
                  processedLines.push(line);
                }
              }
            } else {
              // Regular text processing
              // Detect potential headings (short lines, all caps, or lines ending with colon)
              if (trimmed.length > 0 && trimmed.length < 80 && (trimmed === trimmed.toUpperCase() || trimmed.endsWith(':'))) {
                processedLines.push(`## ${trimmed.replace(':', '')}`);
              } else if (/^\d+[\.\)]\s/.test(trimmed)) {
                // Numbered lists
                processedLines.push(line);
              } else if (/^[•\-\*]\s/.test(trimmed)) {
                // Bullet points
                processedLines.push(`- ${trimmed.replace(/^[•\-\*]\s/, '')}`);
              } else {
                processedLines.push(line);
              }
            }
          }

          // Close any open code block
          if (inCodeBlock && codeBuffer.length > 0) {
            processedLines.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
          }

          markdownContent += processedLines.join('\n\n');
          if (pageNum < numPages) {
            markdownContent += '\n\n---\n\n'; // Page separator
          }
        }
      }

      // Clean up extra whitespace
      const cleanedMarkdown = markdownContent
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
        .trim();

      setTopicCheatForms((prev) => ({
        ...prev,
        [topicId]: {
          ...(prev[topicId] || { contentType: 'html', estReadMinutes: 5 }),
          content: cleanedMarkdown || 'No text extracted from PDF.',
          contentType: 'markdown',
        },
      }));

      alert(`PDF converted successfully! Extracted ${numPages} page(s) and converted to markdown.`);
    } catch (error: any) {
      console.error('PDF conversion error:', error);
      
      // Provide more helpful error messages and retry without worker
      let errorMessage = 'Failed to convert PDF. ';
      
      if (error.message?.includes('worker') || error.message?.includes('Failed to fetch') || error.message?.includes('dynamically imported')) {
        errorMessage += 'Worker file could not be loaded. Trying alternative method...';
        
        // Retry without worker (slower but should work)
        try {
          const pdfjsLib = await import('pdfjs-dist');
          const arrayBuffer = await file.arrayBuffer();
          
          // Disable worker completely
          pdfjsLib.GlobalWorkerOptions.workerSrc = '';
          
          const pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            useWorkerFetch: false,
            isEvalSupported: false,
            verbosity: 0
          }).promise;
          
          let markdownContent = '';
          const numPages = pdf.numPages;

          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            const lines: { [key: number]: string[] } = {};
            textContent.items.forEach((item: any) => {
              if ('str' in item && item.str.trim()) {
                const y = Math.round(item.transform[5] || 0);
                if (!lines[y]) lines[y] = [];
                lines[y].push(item.str);
              }
            });

            const pageLines = Object.keys(lines)
              .sort((a, b) => Number(b) - Number(a))
              .map((y) => lines[Number(y)].join(' ').trim())
              .filter((line) => line.length > 0);

            if (pageLines.length > 0) {
              // Use the same improved formatting logic
              const processedLines: string[] = [];
              let inCodeBlock = false;
              let codeBuffer: string[] = [];
              let detectedLanguage = '';

              for (let i = 0; i < pageLines.length; i++) {
                const line = pageLines[i];
                const trimmed = line.trim();

                const looksLikeCode =
                  trimmed.includes('#include') ||
                  trimmed.includes('int main') ||
                  trimmed.includes('printf') ||
                  trimmed.includes('scanf') ||
                  trimmed.includes('{') ||
                  trimmed.includes('}') ||
                  trimmed.includes(';') ||
                  trimmed.match(/^\s*(function|def|class|import|const|let|var|#include|int|char|float|void)\s/) ||
                  trimmed.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[=<>!]+\s*/) ||
                  trimmed.match(/^\s*\/\//) ||
                  (trimmed.includes('(') && trimmed.includes(')') && trimmed.length < 100);

                if (looksLikeCode && !inCodeBlock) {
                  inCodeBlock = true;
                  codeBuffer = [line];
                  
                  if (trimmed.includes('#include') || trimmed.includes('printf') || trimmed.includes('scanf')) {
                    detectedLanguage = 'c';
                  } else if (trimmed.includes('def ') || trimmed.includes('import ') || trimmed.includes('print(')) {
                    detectedLanguage = 'python';
                  } else if (trimmed.includes('function') || trimmed.includes('const ') || trimmed.includes('let ')) {
                    detectedLanguage = 'javascript';
                  } else {
                    detectedLanguage = 'cpp';
                  }
                } else if (inCodeBlock) {
                  const isEmpty = trimmed === '';
                  const nextLine = i < pageLines.length - 1 ? pageLines[i + 1] : '';
                  const nextIsCode = nextLine.trim() && (
                    nextLine.trim().includes('{') ||
                    nextLine.trim().includes('}') ||
                    nextLine.trim().includes(';') ||
                    nextLine.trim().match(/^\s*(function|def|class|import|const|let|var|#include|int|char|float|void)\s/)
                  );

                  if (isEmpty && !nextIsCode && codeBuffer.length > 0) {
                    processedLines.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
                    codeBuffer = [];
                    inCodeBlock = false;
                    detectedLanguage = '';
                  } else if (looksLikeCode || isEmpty || trimmed.match(/^\s+/)) {
                    codeBuffer.push(line);
                  } else {
                    if (codeBuffer.length > 0) {
                      processedLines.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
                      codeBuffer = [];
                    }
                    inCodeBlock = false;
                    
                    if (trimmed.length < 80 && (trimmed === trimmed.toUpperCase() || trimmed.endsWith(':'))) {
                      processedLines.push(`## ${trimmed.replace(':', '')}`);
                    } else if (/^\d+[\.\)]\s/.test(trimmed)) {
                      processedLines.push(line);
                    } else if (/^[•\-\*]\s/.test(trimmed)) {
                      processedLines.push(`- ${trimmed.replace(/^[•\-\*]\s/, '')}`);
                    } else {
                      processedLines.push(line);
                    }
                  }
                } else {
                  if (trimmed.length > 0 && trimmed.length < 80 && (trimmed === trimmed.toUpperCase() || trimmed.endsWith(':'))) {
                    processedLines.push(`## ${trimmed.replace(':', '')}`);
                  } else if (/^\d+[\.\)]\s/.test(trimmed)) {
                    processedLines.push(line);
                  } else if (/^[•\-\*]\s/.test(trimmed)) {
                    processedLines.push(`- ${trimmed.replace(/^[•\-\*]\s/, '')}`);
                  } else {
                    processedLines.push(line);
                  }
                }
              }

              if (inCodeBlock && codeBuffer.length > 0) {
                processedLines.push(`\`\`\`${detectedLanguage}\n${codeBuffer.join('\n')}\n\`\`\``);
              }

              markdownContent += processedLines.join('\n\n');
              if (pageNum < numPages) {
                markdownContent += '\n\n---\n\n';
              }
            }
          }

          const cleanedMarkdown = markdownContent
            .replace(/\n{3,}/g, '\n\n')
            .trim();

          setTopicCheatForms((prev) => ({
            ...prev,
            [topicId]: {
              ...(prev[topicId] || { contentType: 'html', estReadMinutes: 5 }),
              content: cleanedMarkdown || 'No text extracted from PDF.',
              contentType: 'markdown',
            },
          }));

          alert(`PDF converted successfully! Extracted ${numPages} page(s) and converted to markdown.`);
          return; // Success, exit early
        } catch (retryError: any) {
          errorMessage = `Failed to convert PDF: ${retryError.message || 'Unknown error'}. Please try a different PDF or convert manually.`;
        }
      } else {
        errorMessage += error.message || 'Unknown error. Please try a different PDF or convert manually.';
      }
      
      alert(errorMessage);
      // Reset content on error
      setTopicCheatForms((prev) => ({
        ...prev,
        [topicId]: {
          ...(prev[topicId] || { contentType: 'html', estReadMinutes: 5 }),
          content: '',
        },
      }));
    }
  };

  const toggleTopicExpanded = (topicId: string) => {
    setTopicsWithData((prev) =>
      prev.map((t) => (t._id === topicId ? { ...t, expanded: !t.expanded } : t))
    );
  };

  const prerequisiteOptions = useMemo(
    () => topicsWithData.map((t) => ({ value: t._id, label: t.title })),
    [topicsWithData]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add / Manage Subject</h1>
            <p className="text-sm text-gray-600">
              Create a subject, then add topics. Each topic can have cheatsheets and quiz sets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/subjects/requests')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              View Subject Requests
            </button>
            <button
              onClick={() => router.push('/admin/subjects')}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Subject List
            </button>
          </div>
        </div>

        {/* Subjects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Subjects</h2>
              {!editingSubjectId && (
                <button
                  onClick={handleCreateSubject}
                  disabled={saving}
                  className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  + Add
                </button>
              )}
            </div>
            {editingSubjectId && (
              <div className="text-xs text-blue-600 font-medium">
                Editing subject...
              </div>
            )}
            <div className="space-y-2">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                placeholder="Title"
                value={subjectForm.title}
                onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
              />
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                rows={2}
                placeholder="Description"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
              />
              
              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Subject Image (Thumbnail)</label>
                {subjectForm.thumbnail ? (
                  <div className="relative">
                    <img
                      src={subjectForm.thumbnail}
                      alt="Subject thumbnail"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setSubjectForm({ ...subjectForm, thumbnail: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mb-2 text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 10 * 1024 * 1024) {
                          alert('Image size must be less than 10MB');
                          return;
                        }

                        try {
                          setUploadingThumbnail(true);
                          const res = await apiService.uploadImage(file, 'career-master/subject-thumbnails');
                          if (res.success && res.data?.url) {
                            setSubjectForm({ ...subjectForm, thumbnail: res.data.url });
                            // Show success message
                            if (typeof window !== 'undefined' && (window as any).toast) {
                              (window as any).toast.success('Image uploaded successfully!');
                            }
                          } else {
                            alert('Failed to upload image');
                          }
                        } catch (err: any) {
                          alert(err.message || 'Failed to upload image');
                        } finally {
                          setUploadingThumbnail(false);
                        }
                      }}
                      disabled={uploadingThumbnail}
                    />
                  </label>
                )}
                {uploadingThumbnail && (
                  <p className="text-xs text-blue-600">Uploading image...</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <input
                  className="border rounded-lg px-3 py-2 text-gray-900"
                  placeholder="Category (e.g. Programming, Math)"
                  value={subjectForm.category}
                  onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value })}
                />
                <select
                  className="border rounded-lg px-3 py-2 text-gray-900 bg-white"
                  value={subjectForm.level ?? ''}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      level: (e.target.value || undefined) as Subject['level'] | undefined,
                    })
                  }
                >
                  <option value="">Level (optional)</option>
                  <option value="basic">Basic</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subjectForm.requiresApproval}
                    onChange={(e) => setSubjectForm({ ...subjectForm, requiresApproval: e.target.checked })}
                  />
                  Requires approval
                </label>
                <input
                  type="number"
                  className="w-20 border rounded-lg px-2 py-1 text-gray-900"
                  value={subjectForm.order}
                  onChange={(e) => setSubjectForm({ ...subjectForm, order: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2 text-sm">
                <label className="text-xs font-medium text-gray-700 block">
                  Assign to Batches
                </label>
                {batches.length === 0 ? (
                  <p className="text-sm text-gray-500">No batches available. Create batches first.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {batches.map((batch) => (
                      <button
                        key={batch._id}
                        type="button"
                        onClick={() => {
                          const isSelected = subjectForm.batches.includes(batch.code);
                          if (isSelected) {
                            setSubjectForm({
                              ...subjectForm,
                              batches: subjectForm.batches.filter((b) => b !== batch.code),
                            });
                          } else {
                            setSubjectForm({
                              ...subjectForm,
                              batches: [...subjectForm.batches, batch.code],
                            });
                          }
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                          subjectForm.batches.includes(batch.code)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {batch.name}
                      </button>
                    ))}
                  </div>
                )}
                {subjectForm.batches.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Selected: {subjectForm.batches.length} batch(es)
                  </p>
                )}
                <p className="text-[11px] text-gray-500">
                  Leave empty to make the subject visible to all students. If you select batches, only students in those batches will see the subject and its topics/quizzes.
                </p>
              </div>
              <div className="flex gap-2">
                {editingSubjectId ? (
                  <>
                    <button
                      onClick={handleUpdateSubject}
                      disabled={saving || !subjectForm.title.trim()}
                      className="flex-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubjectId(null);
                        setSubjectForm({
                          title: '',
                          description: '',
                          category: '',
                          level: undefined,
                          requiresApproval: true,
                          order: 0,
                          thumbnail: '',
          batches: [],
                        });
                      }}
                      disabled={saving}
                      className="text-sm bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreateSubject}
                    disabled={saving || !subjectForm.title.trim()}
                    className="w-full text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    + Add Subject
                  </button>
                )}
              </div>
            </div>

            <div className="border-t pt-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Subject List</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {subjects.map((s) => (
                  <div
                    key={s._id}
                    className={`border rounded-lg px-3 py-2 text-sm ${
                      selectedSubjectId === s._id ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSubjectId(s._id);
                        loadTopicsWithData(s._id);
                      }}
                      className="w-full text-left"
                    >
                      <div className="font-semibold text-gray-900">{s.title}</div>
                      <div className="text-xs text-gray-500">Level: {s.level || 'Not set'}</div>
                    </button>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubject(s);
                        }}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(s._id);
                        }}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {subjects.length === 0 && <p className="text-xs text-gray-500">No subjects yet.</p>}
              </div>
            </div>
          </div>

          {/* Topics Section */}
          <div className="bg-white rounded-xl shadow p-4 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
            </div>

            {/* Add/Edit Topic Form (like "Add Section" in quiz) */}
            {selectedSubjectId && (
              <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-800">
                  {editingTopicId ? 'Edit Topic' : 'Add Topic'}
                </h3>
                {editingTopicId && (
                  <div className="text-xs text-blue-600 font-medium">
                    Editing topic...
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    placeholder="Topic title"
                    value={topicForm.title}
                    onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  />
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                    placeholder="Description (optional)"
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  />
                </div>
                {prerequisiteOptions.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-800">Prerequisites</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                      {prerequisiteOptions.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={topicForm.prerequisites.includes(opt.value)}
                            onChange={() => {
                              const exists = topicForm.prerequisites.includes(opt.value);
                              const updated = exists
                                ? topicForm.prerequisites.filter((id) => id !== opt.value)
                                : [...topicForm.prerequisites, opt.value];
                              setTopicForm({ ...topicForm, prerequisites: updated });
                            }}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  {editingTopicId ? (
                    <>
                      <button
                        onClick={handleUpdateTopic}
                        disabled={!selectedSubjectId || saving || !topicForm.title.trim()}
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Update Topic
                      </button>
                      <button
                        onClick={() => {
                          setEditingTopicId(null);
                          setTopicForm({
                            title: '',
                            description: '',
                            order: topicsWithData.length,
                            prerequisites: [],
                            requiredQuizzesToUnlock: 1,
                          });
                        }}
                        disabled={saving}
                        className="text-sm bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCreateTopic}
                      disabled={!selectedSubjectId || saving || !topicForm.title.trim()}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      + Add Topic
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Topics List as Expandable Cards */}
            <div className="space-y-3">
              {topicsWithData.length === 0 && selectedSubjectId && (
                <p className="text-xs text-gray-500 text-center py-4">No topics yet. Add one above.</p>
              )}
              {topicsWithData.map((topic) => {
                const cheatForm = topicCheatForms[topic._id] || { content: '', contentType: 'html' as const, estReadMinutes: 5 };
                const quizSetForm = topicQuizSetForms[topic._id] || { quizId: '', setName: '', order: 0, isActive: true };
                const isExpanded = topic.expanded;

                return (
                  <div key={topic._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Topic Header (Collapsed View) */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => toggleTopicExpanded(topic._id)}
                          className="flex-1 text-left"
                        >
                          <div className="font-semibold text-gray-900">{topic.title}</div>
                          {topic.description && (
                            <div className="text-xs text-gray-600 mt-1">{topic.description}</div>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {topic.cheatsheet && <span>• Cheatsheet: ✓</span>}
                            {topic.quizSets.length > 0 && <span>• Quiz Sets: {topic.quizSets.length}</span>}
                            {!topic.cheatsheet && topic.quizSets.length === 0 && (
                              <span className="text-gray-400">Click to add cheatsheet & quiz sets</span>
                            )}
                          </div>
                        </button>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTopic(topic);
                            }}
                            className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 font-medium"
                            title="Edit topic"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTopic(topic._id);
                            }}
                            disabled={saving}
                            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 font-medium disabled:opacity-50"
                            title="Delete topic"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => toggleTopicExpanded(topic._id)}
                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            <svg
                              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Cheatsheet Section */}
                          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">Cheatsheet / README.md</h4>
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handlePasteFromSource(topic._id)}
                                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                                title="Paste content from GPT, web, or any source. Auto-detects and formats headings and code snippets!"
                              >
                                📋 Paste & Auto-Format
                              </button>
                              <label className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                                📄 Upload .md
                                <input
                                  type="file"
                                  accept=".md,text/markdown"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadMarkdown(file, topic._id);
                                  }}
                                />
                              </label>
                              <label className="text-sm bg-orange-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-orange-700 transition-colors">
                                🌐 Upload HTML
                                <input
                                  type="file"
                                  accept=".html,.htm,text/html"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setTopicCheatForms((prev) => ({
                                        ...prev,
                                        [topic._id]: {
                                          ...cheatForm,
                                          content: 'Converting HTML to Markdown... Please wait.',
                                        },
                                      }));
                                      await handleUploadHTML(file, topic._id);
                                    }
                                  }}
                                />
                              </label>
                              <label className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                                📑 Upload PDF
                                <input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Show loading state
                                      const originalContent = cheatForm.content;
                                      setTopicCheatForms((prev) => ({
                                        ...prev,
                                        [topic._id]: {
                                          ...cheatForm,
                                          content: 'Converting PDF... Please wait.',
                                        },
                                      }));
                                      await handleUploadPDF(file, topic._id);
                                    }
                                  }}
                                />
                              </label>
                              <select
                                className="text-xs border rounded-lg px-2 py-1 text-gray-900 bg-white"
                                value={cheatForm.contentType}
                                onChange={(e) =>
                                  setTopicCheatForms((prev) => ({
                                    ...prev,
                                    [topic._id]: { ...cheatForm, contentType: e.target.value as any },
                                  }))
                                }
                              >
                                <option value="html">HTML</option>
                                <option value="markdown">Markdown</option>
                                <option value="text">Plain Text</option>
                              </select>
                            </div>
                          </div>
                          <textarea
                            className="w-full border rounded-lg px-3 py-2 text-sm min-h-[180px] text-gray-900 font-mono text-xs"
                            placeholder="Paste content here (Markdown, HTML, or plain text). Use buttons above to upload files or paste from GPT/any source. Supports code blocks, images, and links. Headings and code snippets will be auto-detected and formatted when you paste."
                            value={cheatForm.content}
                            onChange={(e) =>
                              setTopicCheatForms((prev) => ({
                                ...prev,
                                [topic._id]: { ...cheatForm, content: e.target.value },
                              }))
                            }
                            onPaste={async (e) => {
                              const pastedText = e.clipboardData.getData('text');
                              e.preventDefault();
                              
                              const isHTML = pastedText.trim().startsWith('<') || pastedText.includes('<html') || pastedText.includes('<div');
                              let processedContent = pastedText;
                              
                              if (isHTML) {
                                try {
                                  const TurndownService = (await import('turndown')).default;
                                  const turndownService = new TurndownService({
                                    headingStyle: 'atx',
                                    codeBlockStyle: 'fenced',
                                    bulletListMarker: '-',
                                  });
                                  
                                  turndownService.addRule('codeBlocks', {
                                    filter: ['pre'],
                                    replacement: (content: string, node: any) => {
                                      const codeElement = node.querySelector('code');
                                      const language = codeElement?.className?.replace('language-', '').replace('hljs', '').trim() || '';
                                      const code = codeElement?.textContent || content;
                                      return `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
                                    },
                                  });
                                  
                                  processedContent = turndownService.turndown(pastedText);
                                } catch (err) {
                                  console.error('HTML conversion error:', err);
                                }
                              }
                              
                              // Use the helper functions defined above
                              processedContent = detectAndFormatHeadings(processedContent);
                              processedContent = detectAndFormatCode(processedContent);
                              
                              const textarea = e.currentTarget;
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const currentContent = cheatForm.content;
                              const newContent = currentContent.substring(0, start) + processedContent + currentContent.substring(end);
                              
                              setTopicCheatForms((prev) => ({
                                ...prev,
                                [topic._id]: { ...cheatForm, content: newContent },
                              }));
                              
                              setTimeout(() => {
                                textarea.focus();
                                textarea.setSelectionRange(start + processedContent.length, start + processedContent.length);
                              }, 0);
                            }}
                          />
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <label className="text-gray-700">Est. read (mins)</label>
                              <input
                                type="number"
                                className="w-20 border rounded-lg px-2 py-1 text-gray-900"
                                value={cheatForm.estReadMinutes}
                                onChange={(e) =>
                                  setTopicCheatForms((prev) => ({
                                    ...prev,
                                    [topic._id]: { ...cheatForm, estReadMinutes: Number(e.target.value) },
                                  }))
                                }
                              />
                            </div>
                            <button
                              onClick={() => handleSaveCheatsheet(topic._id)}
                              disabled={saving}
                              className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              Save Cheatsheet
                            </button>
                          </div>
                        </div>

                        {/* Quiz Sets Section */}
                        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">Quiz Sets</h4>
                            <button
                              onClick={() => handleAddQuizSet(topic._id)}
                              disabled={saving || !quizSetForm.quizId}
                              className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                              + Add Quiz Set
                            </button>
                          </div>
                          <div className="space-y-2">
                            <select
                              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
                              value={quizSetForm.quizId}
                              onChange={(e) =>
                                setTopicQuizSetForms((prev) => ({
                                  ...prev,
                                  [topic._id]: { ...quizSetForm, quizId: e.target.value },
                                }))
                              }
                            >
                              <option value="">Select quiz</option>
                              {quizzes.map((q) => (
                                <option key={q._id} value={q._id}>
                                  {q.title}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-3">
                              <input
                                className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-900"
                                placeholder="Set name (optional)"
                                value={quizSetForm.setName}
                                onChange={(e) =>
                                  setTopicQuizSetForms((prev) => ({
                                    ...prev,
                                    [topic._id]: { ...quizSetForm, setName: e.target.value },
                                  }))
                                }
                              />
                              <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={quizSetForm.isActive}
                                  onChange={(e) =>
                                    setTopicQuizSetForms((prev) => ({
                                      ...prev,
                                      [topic._id]: { ...quizSetForm, isActive: e.target.checked },
                                    }))
                                  }
                                />
                                Active
                              </label>
                            </div>
                          </div>

                          {/* Excel Upload Section */}
                          <div className="border-t pt-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-semibold text-gray-700">Or Upload from Excel</h5>
                              <button
                                onClick={downloadExcelTemplate}
                                className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                                title="Download Excel template with example questions"
                              >
                                📥 Download Template
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                                placeholder="Quiz Name (required)"
                                value={excelUploadForms[topic._id]?.quizName || ''}
                                onChange={(e) =>
                                  setExcelUploadForms((prev) => ({
                                    ...prev,
                                    [topic._id]: {
                                      ...(prev[topic._id] || { quizName: '', durationMinutes: 30 }),
                                      quizName: e.target.value,
                                    },
                                  }))
                                }
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  className="w-32 border rounded-lg px-3 py-2 text-sm text-gray-900"
                                  placeholder="Duration (minutes)"
                                  min="1"
                                  value={excelUploadForms[topic._id]?.durationMinutes || 30}
                                  onChange={(e) =>
                                    setExcelUploadForms((prev) => ({
                                      ...prev,
                                      [topic._id]: {
                                        ...(prev[topic._id] || { quizName: '', durationMinutes: 30 }),
                                        durationMinutes: Number(e.target.value) || 30,
                                      },
                                    }))
                                  }
                                />
                                <label className="text-xs text-gray-600 flex-1">
                                  Set quiz name and time here (not in Excel)
                                </label>
                              </div>
                              <label className="block text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors text-center">
                                📊 Upload Excel File
                                <input
                                  type="file"
                                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      await handleUploadExcel(file, topic._id);
                                    }
                                  }}
                                  disabled={saving}
                                />
                              </label>
                              <p className="text-[10px] text-gray-500">
                                Download template → Fill questions → Set name & time above → Upload Excel
                              </p>
                            </div>
                          </div>

                          {/* Existing Quiz Sets List */}
                          {topic.quizSets.length > 0 && (
                            <div className="border-t pt-3 space-y-2 max-h-48 overflow-y-auto">
                              {topic.quizSets.map((qs) => (
                                <div
                                  key={qs._id}
                                  className="border rounded-lg px-3 py-2 text-sm flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-semibold text-gray-900">{qs.setName || 'Quiz Set'}</div>
                                    <div className="text-xs text-gray-600">
                                      Quiz: {typeof qs.quizId === 'string' ? qs.quizId : qs.quizId?.title}
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                                      qs.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {qs.isActive ? 'ACTIVE' : 'INACTIVE'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {topic.quizSets.length === 0 && (
                            <p className="text-xs text-gray-500 text-center py-2">No quiz sets yet.</p>
                          )}
                        </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
