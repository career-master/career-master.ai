'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }

    // Load batches
    loadBatches();

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
        
        // Load questions
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

      payload.questions = questions.map((q) => {
        const options = [q.optionA, q.optionB, q.optionC, q.optionD].filter(
          (opt) => opt && opt.trim().length > 0
        );
        const correctIndexMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
        const correctIndex = correctIndexMap[q.correctOption] ?? 0;
        return {
          questionText: q.questionText,
          options,
          correctOptionIndex: correctIndex,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
        };
      });

      let res;
      if (quizId) {
        res = await apiService.updateQuiz(quizId, payload);
      } else {
        res = await apiService.createQuiz(payload);
      }

      if (!res.success) {
        throw new Error(res.error?.message || res.message || `Failed to ${quizId ? 'update' : 'create'} quiz`);
      }

      setSuccess(`Quiz ${quizId ? 'updated' : 'created'} successfully`);
      
      if (!quizId) {
        // Reset form only for new quiz
        setTitle('');
        setDescription('');
        setDurationMinutes(30);
        setAvailableFrom('');
        setAvailableTo('');
        setSelectedBatches([]);
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

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate all required fields before uploading
    if (!title || !title.trim()) {
      setError('Please enter a quiz title before uploading the Excel file.');
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    if (!durationMinutes || durationMinutes < 1) {
      setError('Please enter a valid duration (minimum 1 minute) before uploading the Excel file.');
      if (e.target) {
        e.target.value = '';
      }
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
      if (!availableToEveryone && selectedBatches.length > 0) {
        formData.append('batches', selectedBatches.join(','));
      }

      const res = await apiService.uploadQuizExcel(formData);
      if (!res.success) {
        throw new Error(res.error?.message || res.message || 'Failed to upload quiz from Excel');
      }
      setSuccess('Quiz uploaded successfully from Excel');
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
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">
                {quizId ? 'Edit Quiz' : 'Create Quiz'}
              </h2>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleUploadExcel}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={Boolean(
                    excelUploading ||
                    !title?.trim() ||
                    !durationMinutes ||
                    durationMinutes < 1 ||
                    (enableAvailableFrom && !availableFrom) ||
                    (enableAvailableTo && !availableTo) ||
                    (enableAvailableFrom && enableAvailableTo && availableFrom && availableTo && new Date(availableTo) <= new Date(availableFrom))
                  )}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    !title?.trim() || !durationMinutes
                      ? 'Please fill all required fields (Title, Duration) before uploading Excel'
                      : (enableAvailableFrom && !availableFrom) || (enableAvailableTo && !availableTo)
                      ? 'Please fill in the enabled date fields before uploading Excel'
                      : ''
                  }
                >
                  {excelUploading ? 'Uploading Excel...' : 'Upload Excel'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              Note: Please fill in Quiz Title and Duration before uploading Excel file. Dates are optional.
            </p>
          </div>

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
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">Questions</h3>
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


