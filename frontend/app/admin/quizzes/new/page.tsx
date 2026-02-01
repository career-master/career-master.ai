'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import QuizSectionEditor from '@/components/QuizSectionEditor';
import QuestionTypeSelector from '@/components/QuestionTypeSelector';
import QuestionFormRouter from '@/components/question-forms/QuestionFormRouter';

interface QuizQuestionForm {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
  negativeMarks: number;
}

export default function AdminCreateQuizPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [enableAvailableFrom, setEnableAvailableFrom] = useState(false);
  const [enableAvailableTo, setEnableAvailableTo] = useState(false);
  const [availableToEveryone, setAvailableToEveryone] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(999);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('');

  // Link to Subject & Topic (optional: where this quiz appears for students)
  const [subjectId, setSubjectId] = useState('');
  const [selectedRootTopicId, setSelectedRootTopicId] = useState('');
  const [selectedSubTopicId, setSelectedSubTopicId] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [rootTopics, setRootTopics] = useState<any[]>([]);
  const [subTopics, setSubTopics] = useState<any[]>([]);
  const [existingQuizSetId, setExistingQuizSetId] = useState<string | null>(null);
  const [topicLinkLoading, setTopicLinkLoading] = useState(false);
  const [showAddSubTopicForm, setShowAddSubTopicForm] = useState(false);
  const [newSubTopicTitle, setNewSubTopicTitle] = useState('');
  const [addingSubTopic, setAddingSubTopic] = useState(false);
  const [useSections, setUseSections] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{ sectionIndex: number; questionIndex: number } | null>(null);

  const [questions, setQuestions] = useState<QuizQuestionForm[]>([
    {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      marks: 1,
      negativeMarks: 0,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [excelUploading, setExcelUploading] = useState(false);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [durationFilledByUser, setDurationFilledByUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload Excel: enable when user has filled title + duration. Marks come from Excel (optional default below).
  const hasTitle = String(title ?? '').trim().length > 0;
  const durationVal = Number(durationMinutes);
  const hasDuration = durationFilledByUser && Number.isFinite(durationVal) && durationVal >= 1;
  const canUploadExcel = hasTitle && hasDuration;

  // Show what's missing when Upload is disabled
  const uploadMissing: string[] = [];
  if (!hasTitle) uploadMissing.push('Quiz Title');
  if (!hasDuration) uploadMissing.push('Duration (minutes) ≥ 1');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }

    // Load batches and subjects (for Link to Subject & Topic dropdowns)
    loadBatches();
    loadSubjects();

    // Load quiz data if editing
    if (quizId) {
      loadQuiz(quizId);
    }
  }, [isAuthenticated, user, router, quizId]);

  const loadBatches = async () => {
    try {
      const res = await apiService.getBatches(1, 100);
      if (res.success && res.data) {
        const data: any = res.data;
        setBatches(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err: any) {
      console.error('Failed to load batches:', err);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await apiService.getSubjects({ page: 1, limit: 500, isActive: true });
      if (res.success && res.data) {
        const data: any = res.data;
        const list = Array.isArray(data) ? data : (data.items || []);
        setSubjects(list);
      }
    } catch (err: any) {
      console.error('Failed to load subjects:', err);
    }
  };

  const loadQuiz = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiService.getQuizById(id);
      if (res.success && res.data) {
        const quiz = res.data;
        setTitle(quiz.title || '');
        setDescription(quiz.description || '');
        setDurationMinutes(quiz.durationMinutes || 30);
        const hasAvailableFrom = quiz.availableFrom ? true : false;
        const hasAvailableTo = quiz.availableTo ? true : false;
        setEnableAvailableFrom(hasAvailableFrom);
        setEnableAvailableTo(hasAvailableTo);
        setAvailableFrom(hasAvailableFrom ? new Date(quiz.availableFrom).toISOString().split('T')[0] : '');
        setAvailableTo(hasAvailableTo ? new Date(quiz.availableTo).toISOString().split('T')[0] : '');
        setAvailableToEveryone(quiz.availableToEveryone || false);
        setMaxAttempts(quiz.maxAttempts || 999);
        setSelectedBatches(Array.isArray(quiz.batches) ? quiz.batches : []);
        setIsActive(quiz.isActive !== undefined ? quiz.isActive : true);
        setLevel(quiz.level === 'beginner' || quiz.level === 'intermediate' || quiz.level === 'advanced' ? quiz.level : '');
        
        // Load sections or questions based on quiz structure
        if (quiz.useSections && Array.isArray(quiz.sections) && quiz.sections.length > 0) {
          // Load sections
          setUseSections(true);
          const loadedSections = quiz.sections.map((section: any, idx: number) => ({
            sectionTitle: section.sectionTitle || `Section ${idx + 1}`,
            sectionDescription: section.sectionDescription || '',
            questionType: section.questionType || undefined,
            questions: (section.questions || []).map((q: any) => ({
              questionType: q.questionType || 'multiple_choice_single',
              questionText: q.questionText || '',
              options: q.options || [],
              correctOptionIndex: q.correctOptionIndex,
              correctOptionIndices: q.correctOptionIndices,
              correctAnswers: q.correctAnswers,
              matchPairs: q.matchPairs,
              correctOrder: q.correctOrder,
              imageUrl: q.imageUrl,
              passageText: q.passageText,
              hotspotRegions: q.hotspotRegions || [],
              marks: q.marks || 1,
              negativeMarks: q.negativeMarks || 0
            })),
            order: section.order !== undefined ? section.order : idx
          }));
          setSections(loadedSections);
        } else {
          // Load flat questions (legacy)
          setUseSections(false);
          if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
            const formattedQuestions = quiz.questions.map((q: any) => {
              const options = q.options || [];
              const correctIndex = q.correctOptionIndex || 0;
              const correctOptionMap: Record<number, 'A' | 'B' | 'C' | 'D'> = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };
              return {
                questionText: q.questionText || '',
                optionA: options[0] || '',
                optionB: options[1] || '',
                optionC: options[2] || '',
                optionD: options[3] || '',
                correctOption: correctOptionMap[correctIndex] || 'A',
                marks: q.marks || 1,
                negativeMarks: q.negativeMarks || 0,
              };
            });
            setQuestions(formattedQuestions);
          }
        }

        // Load QuizSets for this quiz to pre-fill Subject / Topic / Sub-topic
        try {
          setTopicLinkLoading(true);
          const qsRes = await apiService.getQuizSetsByQuiz(id);
          if (qsRes.success && Array.isArray(qsRes.data) && qsRes.data.length > 0) {
            const qs = qsRes.data[0] as any;
            const topic: any = qs.topicId;
            if (topic && (topic._id || topic.subjectId)) {
              setExistingQuizSetId(qs._id);
              const sid = (typeof topic.subjectId === 'string' ? topic.subjectId : topic.subjectId?.toString?.() || topic.subjectId?._id?.toString?.() || '') || '';
              const topicIdStr = (typeof topic._id === 'string' ? topic._id : topic._id?.toString?.()) || '';
              const parentId = topic.parentTopicId;
              const hasParent = parentId && (typeof parentId === 'string' ? parentId : (parentId?.toString?.() || parentId?._id));
              if (hasParent) {
                const pid = typeof parentId === 'string' ? parentId : (parentId?.toString?.() || parentId?._id?.toString?.() || '');
                setSubjectId(sid);
                setSelectedRootTopicId(pid);
                setSelectedSubTopicId(topicIdStr);
                const [rootRes, subRes] = await Promise.all([
                  apiService.getTopics(sid, true, 'roots'),
                  apiService.getTopics(sid, true, pid)
                ]);
                if (rootRes.success && Array.isArray(rootRes.data)) setRootTopics(rootRes.data);
                if (subRes.success && Array.isArray(subRes.data)) setSubTopics(subRes.data);
              } else {
                setSubjectId(sid);
                setSelectedRootTopicId(topicIdStr);
                setSelectedSubTopicId('');
                const [rootRes, subRes] = await Promise.all([
                  apiService.getTopics(sid, true, 'roots'),
                  apiService.getTopics(sid, true, topicIdStr)
                ]);
                if (rootRes.success && Array.isArray(rootRes.data)) setRootTopics(rootRes.data);
                if (subRes.success && Array.isArray(subRes.data) && subRes.data.length > 0) setSubTopics(subRes.data);
                else setSubTopics([]);
              }
            }
          } else {
            setExistingQuizSetId(null);
            setSubjectId('');
            setSelectedRootTopicId('');
            setSelectedSubTopicId('');
            setRootTopics([]);
            setSubTopics([]);
          }
        } catch (e) {
          console.error('Failed to load quiz-set link:', e);
          setExistingQuizSetId(null);
          setSubjectId('');
          setSelectedRootTopicId('');
          setSelectedSubTopicId('');
          setRootTopics([]);
          setSubTopics([]);
        } finally {
          setTopicLinkLoading(false);
        }
      } else {
        throw new Error('Failed to load quiz');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const toggleBatch = (code: string) => {
    setSelectedBatches((prev) =>
      prev.includes(code) ? prev.filter((b) => b !== code) : [...prev, code]
    );
  };

  const updateQuestion = (index: number, field: keyof QuizQuestionForm, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      (next[index] as any)[field] = value;
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        marks: 1,
        negativeMarks: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSubTopic = async () => {
    const title = newSubTopicTitle.trim();
    if (!title || !subjectId || !selectedRootTopicId) return;
    setAddingSubTopic(true);
    setError('');
    try {
      const res = await apiService.createTopic({
        subjectId,
        title,
        parentTopicId: selectedRootTopicId,
      });
      if (!res.success || !(res.data as any)?._id) {
        throw new Error((res as any).error?.message || 'Failed to create sub-topic');
      }
      const refetch = await apiService.getTopics(subjectId, true, selectedRootTopicId);
      if (refetch.success && Array.isArray(refetch.data)) {
        setSubTopics(refetch.data);
        setSelectedSubTopicId((res.data as any)._id);
      }
      setShowAddSubTopicForm(false);
      setNewSubTopicTitle('');
      setSuccess('Sub-topic added. It is now selected in the dropdown.');
    } catch (err: any) {
      setError(err?.message || 'Failed to add sub-topic');
    } finally {
      setAddingSubTopic(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload: any = {
        title,
        description: description || undefined,
        durationMinutes,
        availableToEveryone,
        maxAttempts: maxAttempts || 999,
        isActive,
      };
      // Always set level explicitly so it is never dropped (beginner/intermediate/advanced or null)
      payload.level = (level === 'beginner' || level === 'intermediate' || level === 'advanced') ? level : null;

      // Only include dates if checkboxes are enabled
      if (enableAvailableFrom && availableFrom) {
        payload.availableFrom = availableFrom;
      } else if (quizId && !enableAvailableFrom) {
        // If editing and checkbox is unchecked, send empty to clear the date
        payload.availableFrom = '';
      }
      if (enableAvailableTo && availableTo) {
        payload.availableTo = availableTo;
      } else if (quizId && !enableAvailableTo) {
        // If editing and checkbox is unchecked, send empty to clear the date
        payload.availableTo = '';
      }

      // If available to everyone, don't send batches
      if (!availableToEveryone) {
        payload.batches = selectedBatches;
      }

      // Handle sections or flat questions
      if (useSections && sections && sections.length > 0) {
        // Filter out sections with no valid questions
        const validSections = sections
          .map((section, idx) => ({
            sectionTitle: section.sectionTitle,
            sectionDescription: section.sectionDescription || '',
            questionType: section.questionType || undefined,
            questions: (section.questions || [])
              .filter((q: any) => {
                // Must have question text
                if (!q.questionText || q.questionText.trim().length === 0) return false;
                
                const questionType = q.questionType || 'multiple_choice_single';
                
                // For MCQ Multiple, must have at least one correct answer selected
                if (questionType === 'multiple_choice_multiple') {
                  // Check if correctOptionIndices exists, is an array, and has at least one valid index
                  if (!q.correctOptionIndices || !Array.isArray(q.correctOptionIndices) || q.correctOptionIndices.length === 0) {
                    console.warn('Filtering out MCQ Multiple question without correctOptionIndices:', q);
                    return false; // Filter out incomplete MCQ Multiple questions
                  }
                  // Also check that options exist
                  if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
                    console.warn('Filtering out MCQ Multiple question without enough options:', q);
                    return false;
                  }
                  // Validate that all indices are valid
                  const validIndices = q.correctOptionIndices.filter((idx: number) => 
                    typeof idx === 'number' && idx >= 0 && idx < q.options.length
                  );
                  if (validIndices.length === 0) {
                    console.warn('Filtering out MCQ Multiple question with invalid indices:', q);
                    return false;
                  }
                }
                
                // For MCQ Single/True-False, must have correctOptionIndex
                if (['multiple_choice_single', 'multiple_choice', 'true_false'].includes(questionType)) {
                  if (q.correctOptionIndex === undefined || q.correctOptionIndex === null) {
                    return false; // Filter out incomplete questions
                  }
                }
                
                // For Reorder questions, must have correctOrder
                if (questionType === 'reorder') {
                  if (!q.correctOrder || !Array.isArray(q.correctOrder) || q.correctOrder.length === 0) {
                    return false; // Filter out incomplete reorder questions
                  }
                  // Check that all items have text
                  const validItems = q.correctOrder.filter((item: string) => item && item.trim().length > 0);
                  if (validItems.length === 0) {
                    return false;
                  }
                }
                
                // For Match questions, must have matchPairs
                if (questionType === 'match') {
                  if (!q.matchPairs || !Array.isArray(q.matchPairs) || q.matchPairs.length === 0) {
                    console.warn('Filtering out Match question without matchPairs:', q);
                    return false; // Filter out incomplete match questions
                  }
                  // Check that all pairs have both left and right values
                  const validPairs = q.matchPairs.filter((pair: any) => 
                    pair && 
                    typeof pair === 'object' &&
                    pair.left && pair.left.trim().length > 0 &&
                    pair.right && pair.right.trim().length > 0
                  );
                  if (validPairs.length === 0) {
                    console.warn('Filtering out Match question without valid pairs:', q);
                    return false;
                  }
                }
                
                // For Hotspot questions, must have imageUrl and at least one hotspot region
                if (questionType === 'hotspot') {
                  if (!q.imageUrl || q.imageUrl.trim().length === 0) {
                    console.warn('Filtering out Hotspot question without imageUrl:', q);
                    return false;
                  }
                  if (!q.hotspotRegions || !Array.isArray(q.hotspotRegions) || q.hotspotRegions.length === 0) {
                    console.warn('Filtering out Hotspot question without hotspotRegions:', q);
                    return false;
                  }
                  // Validate that all regions have valid coordinates
                  const validRegions = q.hotspotRegions.filter((region: any) => 
                    region && 
                    typeof region === 'object' &&
                    typeof region.x === 'number' &&
                    typeof region.y === 'number' &&
                    typeof region.width === 'number' &&
                    typeof region.height === 'number' &&
                    region.width > 0 &&
                    region.height > 0
                  );
                  if (validRegions.length === 0) {
                    console.warn('Filtering out Hotspot question without valid regions:', q);
                    return false;
                  }
                }
                
                return true;
              })
              .map((q: any) => {
              // Ensure questionType is set - use the actual question type, don't default
              const questionType = q.questionType || 'multiple_choice_single';
              
              // Clean question data - only include fields relevant to this question type
              const questionData: any = {
                questionType: questionType,
                questionText: q.questionText?.trim() || '',
                marks: q.marks || 1,
                negativeMarks: q.negativeMarks || 0
              };
              
              // Explicitly exclude incorrect fields based on question type
              // This prevents leftover fields from type changes from causing validation errors

              // Add type-specific fields ONLY for the correct question type
              // MCQ types (single, multiple, true/false, dropdown)
              if (['multiple_choice_single', 'multiple_choice_multiple', 'dropdown', 'true_false'].includes(questionType)) {
                // For True/False, always set options to ['True', 'False']
                if (questionType === 'true_false') {
                  questionData.options = ['True', 'False'];
                } else if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                  questionData.options = q.options.filter((opt: string) => opt && opt.trim().length > 0);
                }
                if (questionType === 'multiple_choice_multiple') {
                  // For MCQ Multiple, ALWAYS include correctOptionIndices
                  // The frontend filter should have already ensured this exists and has valid values
                  if (q.correctOptionIndices && Array.isArray(q.correctOptionIndices) && q.correctOptionIndices.length > 0) {
                    // Validate and filter indices to ensure they're within bounds
                    const validIndices = q.correctOptionIndices.filter((idx: number) => 
                      typeof idx === 'number' && idx >= 0 && idx < (q.options?.length || 0)
                    );
                    // Always include it - if empty, backend validation will catch it
                    questionData.correctOptionIndices = validIndices.length > 0 ? validIndices : [];
                  } else {
                    // If somehow missing, include empty array - backend validation will catch it
                    // This shouldn't happen if filter worked correctly
                    console.warn('MCQ Multiple question missing or empty correctOptionIndices, including empty array:', q);
                    questionData.correctOptionIndices = [];
                  }
                } else {
                  // For single choice, only include correctOptionIndex
                  if (q.correctOptionIndex !== undefined && q.correctOptionIndex !== null) {
                    questionData.correctOptionIndex = q.correctOptionIndex;
                  }
                }
              }
              
              // Fill in blank
              if (questionType === 'fill_in_blank') {
                if (q.correctAnswers && Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0) {
                  questionData.correctAnswers = q.correctAnswers.filter((ans: string) => ans && ans.trim().length > 0);
                }
              }
              
              // Match
              if (questionType === 'match') {
                if (q.matchPairs && Array.isArray(q.matchPairs) && q.matchPairs.length > 0) {
                  // Filter out empty pairs and ensure both left and right have values
                  const validPairs = q.matchPairs
                    .filter((pair: any) => 
                      pair && 
                      typeof pair === 'object' &&
                      pair.left && pair.left.trim().length > 0 &&
                      pair.right && pair.right.trim().length > 0
                    )
                    .map((pair: any) => ({
                      left: pair.left.trim(),
                      right: pair.right.trim()
                    }));
                  if (validPairs.length > 0) {
                    questionData.matchPairs = validPairs;
                  }
                }
              }
              
              // Reorder
              if (questionType === 'reorder') {
                if (q.correctOrder && Array.isArray(q.correctOrder) && q.correctOrder.length > 0) {
                  questionData.correctOrder = q.correctOrder.filter((item: string) => item && item.trim().length > 0);
                }
              }
              
              // Image based
              if (['image_based', 'hotspot', 'labeling', 'draw'].includes(questionType)) {
                if (q.imageUrl && q.imageUrl.trim().length > 0) {
                  questionData.imageUrl = q.imageUrl.trim();
                }
                // Image based also has options
                if (questionType === 'image_based') {
                  if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                    questionData.options = q.options.filter((opt: string) => opt && opt.trim().length > 0);
                  }
                  if (q.correctOptionIndex !== undefined && q.correctOptionIndex !== null) {
                    questionData.correctOptionIndex = q.correctOptionIndex;
                  }
                }
                // Hotspot has hotspotRegions
                if (questionType === 'hotspot') {
                  if (q.hotspotRegions && Array.isArray(q.hotspotRegions) && q.hotspotRegions.length > 0) {
                    questionData.hotspotRegions = q.hotspotRegions.filter((region: any) => 
                      region && 
                      typeof region === 'object' &&
                      typeof region.x === 'number' &&
                      typeof region.y === 'number' &&
                      typeof region.width === 'number' &&
                      typeof region.height === 'number'
                    );
                  }
                }
              }
              
              // Passage
              if (questionType === 'passage') {
                if (q.passageText && q.passageText.trim().length > 0) {
                  questionData.passageText = q.passageText.trim();
                }
                if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                  questionData.options = q.options.filter((opt: string) => opt && opt.trim().length > 0);
                }
                if (q.correctOptionIndex !== undefined && q.correctOptionIndex !== null) {
                  questionData.correctOptionIndex = q.correctOptionIndex;
                }
              }
              
              // IMPORTANT: Explicitly remove fields that shouldn't be present for this question type
              // This prevents validation errors from leftover fields when question types are changed
              if (questionType !== 'multiple_choice_multiple') {
                delete questionData.correctOptionIndices; // Remove for all non-MCQ-Multiple questions
              }
              if (!['multiple_choice_single', 'multiple_choice_multiple', 'dropdown', 'true_false', 'passage', 'image_based'].includes(questionType)) {
                delete questionData.options; // Remove options for non-option-based questions
                delete questionData.correctOptionIndex; // Remove correctOptionIndex for non-option-based questions
              }
              if (questionType !== 'fill_in_blank') {
                delete questionData.correctAnswers; // Remove for non-fill-in-blank questions
              }
              if (questionType !== 'match') {
                delete questionData.matchPairs; // Remove for non-match questions
              }
              if (questionType !== 'reorder') {
                delete questionData.correctOrder; // Remove for non-reorder questions
              }
              if (!['image_based', 'hotspot', 'labeling', 'draw'].includes(questionType)) {
                delete questionData.imageUrl; // Remove for non-image questions
              }
              if (questionType !== 'hotspot') {
                delete questionData.hotspotRegions; // Remove for non-hotspot questions
              }
              if (questionType !== 'passage') {
                delete questionData.passageText; // Remove for non-passage questions
              }

              return questionData;
            }),
          order: idx
          }))
          .map(section => ({
            ...section,
            // Final validation pass: filter out any MCQ Multiple questions without valid correctOptionIndices
            questions: section.questions.filter((q: any) => {
              if (q.questionType === 'multiple_choice_multiple') {
                if (!q.correctOptionIndices || !Array.isArray(q.correctOptionIndices) || q.correctOptionIndices.length === 0) {
                  console.warn('Final filter: Removing MCQ Multiple question without valid correctOptionIndices:', q);
                  return false;
                }
              }
              return true;
            })
          }))
          .filter(section => section.questions.length > 0); // Only keep sections with questions

        if (validSections.length === 0) {
          setError('At least one complete question is required. Please ensure all questions have question text and correct answers selected. For MCQ (Multiple Correct) questions, at least one option must be marked as correct.');
          setSaving(false);
          return;
        }
        
        // Strict validation: do NOT allow saving if any questions were filtered out as incomplete.
        // This ensures admins must fully fill every question (text, options, correct answers, etc.)
        // instead of partially filled questions being silently dropped.
        const totalQuestionsBefore = sections.reduce((sum, s) => sum + (s.questions?.length || 0), 0);
        const totalQuestionsAfter = validSections.reduce((sum, s) => sum + s.questions.length, 0);
        if (totalQuestionsBefore > totalQuestionsAfter) {
          const removed = totalQuestionsBefore - totalQuestionsAfter;
          setError(
            `There are ${removed} incomplete question(s). Please complete every question (question text, options and correct answers — including MCQ Multiple, Match, Reorder, Hotspot, etc.) before saving the quiz.`
          );
          setSaving(false);
          return;
        }

        payload.useSections = true;
        payload.sections = validSections;
      } else {
        payload.useSections = false;
        payload.questions = questions.map((q) => {
          const options = [q.optionA, q.optionB, q.optionC, q.optionD].filter(
            (opt) => opt && opt.trim().length > 0
          );
          const correctIndexMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
          const correctIndex = correctIndexMap[q.correctOption] ?? 0;
          return {
            questionType: 'multiple_choice_single',
            questionText: q.questionText,
            options,
            correctOptionIndex: correctIndex,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
          };
        });
      }

      let res;
      if (quizId) {
        res = await apiService.updateQuiz(quizId, payload);
      } else {
        res = await apiService.createQuiz(payload);
      }

      if (!res.success) {
        throw new Error(res.error?.message || res.message || `Failed to ${quizId ? 'update' : 'create'} quiz`);
      }

      // QuizSet: link to Subject / Topic / Sub-topic (where this quiz appears for students)
      const resolvedTopicId = selectedSubTopicId || selectedRootTopicId || null;
      if (quizId) {
        if (existingQuizSetId) await apiService.deleteQuizSet(existingQuizSetId);
        if (resolvedTopicId) {
          const cr = await apiService.createQuizSet({ topicId: resolvedTopicId, quizId, setName: title || 'Quiz Set', order: 1 });
          if (cr.success && (cr as any).data?._id) setExistingQuizSetId((cr as any).data._id);
        } else setExistingQuizSetId(null);
      } else {
        const createdId = (res.data as any)?._id;
        if (resolvedTopicId && createdId) await apiService.createQuizSet({ topicId: resolvedTopicId, quizId: createdId, setName: title || 'Quiz Set', order: 1 });
      }

      setSuccess(`Quiz ${quizId ? 'updated' : 'created'} successfully`);
      
      if (!quizId) {
        // Reset form only for new quiz
        setTitle('');
        setDescription('');
        setDurationMinutes(30);
        setMarksPerQuestion(1);
        setDurationFilledByUser(false);
        setAvailableFrom('');
        setAvailableTo('');
        setSelectedBatches([]);
        setSubjectId('');
        setSelectedRootTopicId('');
        setSelectedSubTopicId('');
        setRootTopics([]);
        setSubTopics([]);
        setQuestions([
          {
            questionText: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: 'A',
            marks: 1,
            negativeMarks: 0,
          },
        ]);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${quizId ? 'update' : 'create'} quiz`);
    } finally {
      setSaving(false);
    }
  };

  const downloadQuizExcelTemplate = () => {
    const templateData = [
      { question: 'What is the capital of France?', optionA: 'London', optionB: 'Berlin', optionC: 'Paris', optionD: 'Madrid', correctOption: 'C', type: 'multiple_choice_single', marks: '1', negativeMarks: '0' },
      { question: 'Which are programming languages?', optionA: 'JavaScript', optionB: 'HTML', optionC: 'Python', optionD: 'CSS', correctOption: 'A,C', type: 'multiple_choice_multiple', marks: '2', negativeMarks: '0.5' },
      { question: 'Python is a compiled language.', optionA: 'True', optionB: 'False', correctOption: 'B', type: 'true_false', marks: '1', negativeMarks: '0' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    const instructions = [
      { Column: 'question', Description: 'Question text (required)' },
      { Column: 'optionA', Description: 'Option A (required)' },
      { Column: 'optionB', Description: 'Option B (required)' },
      { Column: 'optionC', Description: 'Option C (optional)' },
      { Column: 'optionD', Description: 'Option D (optional)' },
      { Column: 'correctOption', Description: 'Correct: A, B, C, D; or A,C for multiple' },
      { Column: 'type', Description: 'multiple_choice_single, multiple_choice_multiple, or true_false' },
      { Column: 'marks', Description: 'Marks per question (or use default above)' },
      { Column: 'negativeMarks', Description: 'Negative marks for wrong answer (default 0)' },
    ];
    const wsInst = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInst, 'Instructions');
    XLSX.writeFile(wb, 'Quiz_Questions_Template.xlsx');
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: Quiz name (title) and Duration required. Marks come from Excel (default used if not in sheet).
    if (!title || !title.trim()) {
      setError('Please enter a quiz name (title) before uploading the Excel file.');
      if (e.target) e.target.value = '';
      return;
    }

    if (!durationMinutes || durationMinutes < 1) {
      setError('Please enter a valid duration (minimum 1 minute) before uploading the Excel file.');
      if (e.target) e.target.value = '';
      return;
    }

    // Validate dates only if checkboxes are enabled
    if (enableAvailableFrom && (!availableFrom || !availableFrom.trim())) {
      setError('Please select an "Available From" date before uploading the Excel file.');
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    if (enableAvailableTo && (!availableTo || !availableTo.trim())) {
      setError('Please select an "Available To" date before uploading the Excel file.');
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    // Validate that "Available To" is after "Available From" if both are set
    if (enableAvailableFrom && enableAvailableTo && availableFrom && availableTo) {
      if (new Date(availableTo) <= new Date(availableFrom)) {
        setError('"Available To" date must be after "Available From" date.');
        if (e.target) {
          e.target.value = '';
        }
        return;
      }
    }

    setError('');
    setSuccess('');
    setExcelUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) formData.append('description', description);
      if (durationMinutes) formData.append('durationMinutes', String(durationMinutes));
      if (enableAvailableFrom && availableFrom) formData.append('availableFrom', availableFrom);
      if (enableAvailableTo && availableTo) formData.append('availableTo', availableTo);
      formData.append('availableToEveryone', String(availableToEveryone));
      formData.append('maxAttempts', String(maxAttempts || 999));
      formData.append('defaultMarks', String(marksPerQuestion || 1));
      if (level === 'beginner' || level === 'intermediate' || level === 'advanced') {
        formData.append('level', level);
      }
      if (!availableToEveryone && selectedBatches.length > 0) {
        formData.append('batches', selectedBatches.join(','));
      }

      const res = await apiService.uploadQuizExcel(formData);
      if (!res.success) {
        throw new Error(res.error?.message || res.message || 'Failed to upload quiz from Excel');
      }

      // Link to Subject/Topic if selected (optional)
      const resolvedTopicId = selectedSubTopicId || selectedRootTopicId || null;
      if (resolvedTopicId && (res.data as any)?._id) {
        try {
          await apiService.createQuizSet({
            topicId: resolvedTopicId,
            quizId: (res.data as any)._id,
            setName: title || 'Quiz Set',
            order: 1,
          });
        } catch (linkErr: any) {
          console.warn('Quiz created but linking to topic failed:', linkErr);
        }
      }

      setSuccess('Quiz uploaded successfully from Excel' + (resolvedTopicId ? ' and linked to the selected topic.' : '.'));
    } catch (err: any) {
      setError(err.message || 'Failed to upload quiz from Excel');
    } finally {
      setExcelUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">Loading quiz...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {quizId ? 'Edit Quiz' : 'Add New Quiz'}
            </h1>
            <p className="text-gray-600 text-sm">
              {quizId ? 'Update quiz information and questions' : 'Create a quiz manually or upload questions via Excel.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin/quizzes')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ← Back to Quiz List
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Success / Failed popup modal */}
          {(success || error) && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => { setSuccess(''); setError(''); }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div
                className={`relative rounded-xl shadow-xl max-w-md w-full p-6 ${
                  success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <h3
                    id="modal-title"
                    className={`text-lg font-bold mb-3 ${success ? 'text-green-800' : 'text-red-800'}`}
                  >
                    {success ? 'Success' : 'Failed'}
                  </h3>
                  <p className={`text-sm mb-5 ${success ? 'text-green-700' : 'text-red-700'}`}>
                    {success || error}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSuccess(''); setError(''); }}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white ${
                      success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    } transition-colors`}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. Algebra Basics Quiz"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                rows={2}
                placeholder="Short description of the quiz..."
              />
            </div>

            {/* Level (who can see this quiz) — right below description, radio buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Level (who can see this quiz)
              </label>
              <p className="text-xs text-gray-500 mb-2">Set whether this quiz is for Basic, Intermediate, or Advanced. Users filter by these on the Practice Quizzes page.</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="quiz-level"
                    checked={level === ''}
                    onChange={() => setLevel('')}
                    className="border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">All (show for all levels)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="quiz-level"
                    checked={level === 'beginner'}
                    onChange={() => setLevel('beginner')}
                    className="border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Basic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="quiz-level"
                    checked={level === 'intermediate'}
                    onChange={() => setLevel('intermediate')}
                    className="border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Intermediate</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="quiz-level"
                    checked={level === 'advanced'}
                    onChange={() => setLevel('advanced')}
                    className="border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Advanced</span>
                </label>
              </div>
            </div>

            {/* Link to Subject & Topic — optional, where this quiz appears for students */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Link to Subject & Topic</h3>
              <p className="text-xs text-slate-500 mb-3">Choose where this quiz appears for students. Optional.</p>
              {topicLinkLoading ? (
                <p className="text-sm text-slate-500">Loading link...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                    <select
                      value={subjectId}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSubjectId(v);
                        setSelectedRootTopicId('');
                        setSelectedSubTopicId('');
                        setRootTopics([]);
                        setSubTopics([]);
                        setShowAddSubTopicForm(false);
                        setNewSubTopicTitle('');
                        if (v) {
                          apiService.getTopics(v, true, 'roots').then((r) => {
                            if (r.success && Array.isArray(r.data)) setRootTopics(r.data);
                            else setRootTopics([]);
                          });
                        }
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">— Don&apos;t link to a topic —</option>
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Topic</label>
                    <select
                      value={selectedRootTopicId}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedRootTopicId(v);
                        setSelectedSubTopicId('');
                        setShowAddSubTopicForm(false);
                        setNewSubTopicTitle('');
                        if (v && subjectId) {
                          apiService.getTopics(subjectId, true, v).then((r) => {
                            if (r.success && Array.isArray(r.data)) setSubTopics(r.data);
                            else setSubTopics([]);
                          });
                        } else setSubTopics([]);
                      }}
                      disabled={!subjectId}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select topic</option>
                      {rootTopics.map((t) => (
                        <option key={t._id} value={t._id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sub-topic</label>
                    {showAddSubTopicForm ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newSubTopicTitle}
                          onChange={(e) => setNewSubTopicTitle(e.target.value)}
                          placeholder="Sub-topic name"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleAddSubTopic(); }
                            if (e.key === 'Escape') { setShowAddSubTopicForm(false); setNewSubTopicTitle(''); }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddSubTopic}
                            disabled={addingSubTopic || !newSubTopicTitle.trim()}
                            className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                          >
                            {addingSubTopic ? 'Adding…' : 'Add'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAddSubTopicForm(false); setNewSubTopicTitle(''); }}
                            disabled={addingSubTopic}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedSubTopicId}
                          onChange={(e) => setSelectedSubTopicId(e.target.value)}
                          disabled={!selectedRootTopicId || subTopics.length === 0}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="">— None (use topic) —</option>
                          {subTopics.map((t) => (
                            <option key={t._id} value={t._id}>{t.title}</option>
                          ))}
                        </select>
                        {selectedRootTopicId && (
                          <p className="mt-1.5">
                            <button
                              type="button"
                              onClick={() => { setShowAddSubTopicForm(true); setNewSubTopicTitle(''); }}
                              className="text-xs font-medium text-slate-600 hover:text-slate-800 underline"
                            >
                              {subTopics.length === 0 ? 'Add sub-topic' : '+ Add sub-topic'}
                            </button>
                          </p>
                        )}
                        {selectedRootTopicId && subTopics.length === 0 && !showAddSubTopicForm && (
                          <p className="text-xs text-slate-400 mt-0.5">No sub-topics yet</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => {
                    setDurationFilledByUser(true);
                    const v = e.target.value;
                    if (v === '') setDurationMinutes(30);
                    else setDurationMinutes(Math.max(1, Math.min(600, Number(v) || 1)));
                  }}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Max Attempts <span className="text-gray-400 text-xs">(999 = Unlimited)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                  placeholder="999"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set to 999 for unlimited attempts, or specify a number to limit attempts
                </p>
              </div>
            </div>

            {!quizId && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Create via Excel</h3>
              <p className="text-xs text-gray-600 mb-3">Download template → add questions &amp; options (marks can be in Excel). <strong>Upload is available after you fill Quiz Title and Duration below.</strong></p>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <button type="button" onClick={downloadQuizExcelTemplate} className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 transition-colors">Download template</button>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={excelUploading || !canUploadExcel}
                  className="rounded-lg border border-amber-400 bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={canUploadExcel ? 'Upload your Excel file' : uploadMissing.length ? `Fill: ${uploadMissing.join(', ')}` : 'Fill all required data first'}
                >
                  {excelUploading ? 'Uploading...' : canUploadExcel ? 'Upload Excel' : 'Fill all data to upload'}
                </button>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">Default marks (if not in Excel):</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={marksPerQuestion}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') setMarksPerQuestion(1);
                      else setMarksPerQuestion(Math.max(1, Math.min(100, Number(v) || 1)));
                    }}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <span className="text-gray-500">(optional)</span>
                </label>
              </div>
              {!canUploadExcel && uploadMissing.length > 0 && (
                <p className="text-xs text-amber-800 bg-amber-100/80 rounded-lg px-3 py-2 mb-2">
                  <strong>To enable Upload, fill:</strong> {uploadMissing.join(', ')}
                </p>
              )}
              <p className="text-xs text-gray-500">
                <strong>Required for upload:</strong> Quiz Title, Duration (minutes) ≥ 1. Marks come from your Excel file (or use the default above). If you use &quot;Set Available From&quot; or &quot;Set Available To&quot;, those dates must be set and &quot;Available To&quot; must be after &quot;Available From&quot;. Subject/Topic/Sub-topic are optional.
              </p>
            </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={enableAvailableFrom}
                    onChange={(e) => {
                      setEnableAvailableFrom(e.target.checked);
                      if (!e.target.checked) {
                        setAvailableFrom('');
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">Set Available From Date</label>
                </div>
                <input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  disabled={!enableAvailableFrom}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={enableAvailableTo}
                    onChange={(e) => {
                      setEnableAvailableTo(e.target.checked);
                      if (!e.target.checked) {
                        setAvailableTo('');
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">Set Available To Date</label>
                </div>
                <input
                  type="date"
                  value={availableTo}
                  onChange={(e) => setAvailableTo(e.target.value)}
                  disabled={!enableAvailableTo}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={availableToEveryone}
                  onChange={(e) => {
                    setAvailableToEveryone(e.target.checked);
                    if (e.target.checked) {
                      setSelectedBatches([]);
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-semibold text-gray-700">Available to Everyone</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                If checked, all users can attempt this quiz regardless of batch assignment.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign to Batches {availableToEveryone && <span className="text-gray-400 text-xs">(disabled when "Available to Everyone" is selected)</span>}
              </label>
              {batches.length === 0 ? (
                <p className="text-sm text-gray-500">No batches available. Create batches first.</p>
              ) : (
                <div className={`flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 ${
                  availableToEveryone ? 'bg-gray-50 opacity-60' : ''
                }`}>
                  {batches.map((batch) => (
                    <button
                      key={batch._id}
                      type="button"
                      onClick={() => toggleBatch(batch.code)}
                      disabled={availableToEveryone}
                      className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                        availableToEveryone
                          ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                          : selectedBatches.includes(batch.code)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {batch.name}
                    </button>
                  ))}
                </div>
              )}
              {selectedBatches.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {selectedBatches.length} batch(es)
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Questions</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useSections}
                    onChange={(e) => {
                      setUseSections(e.target.checked);
                      if (e.target.checked && sections.length === 0) {
                        setSections([{
                          sectionTitle: 'Section 1',
                          sectionDescription: '',
                          questions: [],
                          order: 0
                        }]);
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Use Sections</span>
                </label>
              </div>

              {useSections ? (
                <QuizSectionEditor sections={sections} onChange={setSections} />
              ) : (
                <>
                  <div className="flex items-center justify-end mb-2">
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      + Add Question
                    </button>
                  </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {questions.map((q, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase">
                        Question {index + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <textarea
                      value={q.questionText}
                      onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 mb-2 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                      rows={2}
                      placeholder="Enter question text..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                      {['A', 'B', 'C', 'D'].map((label) => (
                        <div key={label} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctOption === label}
                            onChange={() => updateQuestion(index, 'correctOption', label as any)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500"
                          />
                          <input
                            type="text"
                            value={(q as any)[`option${label}`]}
                            onChange={(e) =>
                              updateQuestion(index, `option${label}` as any, e.target.value)
                            }
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                            placeholder={`Option ${label}`}
                            required={label === 'A' || label === 'B'}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Marks
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={q.marks}
                          onChange={(e) =>
                            updateQuestion(index, 'marks', Number(e.target.value))
                          }
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Negative Marks
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={q.negativeMarks}
                          onChange={(e) =>
                            updateQuestion(index, 'negativeMarks', Number(e.target.value))
                          }
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving Quiz...' : quizId ? 'Update Quiz' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


