'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [batchesText, setBatchesText] = useState('');

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
  }, [isAuthenticated, user, router]);

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
      const batches =
        batchesText
          .split(',')
          .map((b) => b.trim())
          .filter((b) => b.length > 0) || [];

      const payload: any = {
        title,
        description,
        durationMinutes,
        availableFrom: availableFrom || undefined,
        availableTo: availableTo || undefined,
        batches,
        questions: questions.map((q) => {
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
        }),
      };

      const res = await apiService.createQuiz(payload);
      if (!res.success) {
        throw new Error(res.error?.message || res.message || 'Failed to create quiz');
      }

      setSuccess('Quiz created successfully');
      setTitle('');
      setDescription('');
      setDurationMinutes(30);
      setAvailableFrom('');
      setAvailableTo('');
      setBatchesText('');
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
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Require at least a title so the Excel quiz has proper metadata
    if (!title) {
      setError('Please enter a quiz title before uploading the Excel file.');
      if (e.target) {
        e.target.value = '';
      }
      return;
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
      if (availableFrom) formData.append('availableFrom', availableFrom);
      if (availableTo) formData.append('availableTo', availableTo);
      if (batchesText) formData.append('batches', batchesText);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Quiz</h1>
            <p className="text-gray-600 text-sm">
              Create a quiz manually or upload questions via Excel.
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

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Create Quiz</h2>
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
                disabled={excelUploading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {excelUploading ? 'Uploading Excel...' : 'Upload Excel'}
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                rows={2}
                placeholder="Short description of the quiz..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Available From
                </label>
                <input
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Available To
                </label>
                <input
                  type="datetime-local"
                  value={availableTo}
                  onChange={(e) => setAvailableTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Batches (comma separated) – e.g. Batch A, Batch B
              </label>
              <input
                type="text"
                value={batchesText}
                onChange={(e) => setBatchesText(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
                placeholder="Enter batch names separated by commas"
              />
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2 focus:border-red-500 focus:ring-2 focus:ring-red-500"
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
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
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
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
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
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500"
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
                {saving ? 'Saving Quiz...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


