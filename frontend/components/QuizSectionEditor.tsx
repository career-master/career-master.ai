'use client';

import { useState } from 'react';
import QuestionTypeSelector, { QUESTION_TYPES } from './QuestionTypeSelector';
import QuestionFormRouter from './question-forms/QuestionFormRouter';

interface Question {
  questionText: string;
  questionType: string;
  options?: string[];
  correctOptionIndex?: number;
  correctOptionIndices?: number[];
  correctAnswers?: string[];
  matchPairs?: Array<{ left: string; right: string }>;
  correctOrder?: string[];
  imageUrl?: string;
  marks: number;
  negativeMarks: number;
  [key: string]: any;
}

interface Section {
  sectionTitle: string;
  sectionDescription?: string;
  questionType?: string;
  questions: Question[];
  order: number;
}

interface QuizSectionEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
}

export default function QuizSectionEditor({ sections, onChange }: QuizSectionEditorProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [typeSelectorMode, setTypeSelectorMode] = useState<'addQuestion' | 'setRestriction'>('addQuestion');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{ sectionIndex: number; questionIndex: number } | null>(null);

  const addSection = () => {
    const newSection: Section = {
      sectionTitle: `Section ${sections.length + 1}`,
      sectionDescription: '',
      questions: [],
      order: sections.length
    };
    onChange([...sections, newSection]);
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const deleteSection = (index: number) => {
    if (confirm('Are you sure you want to delete this section? All questions in it will be removed.')) {
      const updated = sections.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const addQuestion = (sectionIndex: number, questionType: string) => {
    const newQuestion: Question = {
      questionText: '',
      questionType,
      marks: 1,
      negativeMarks: 0
    };

    // Initialize type-specific fields
    if (['multiple_choice_single', 'multiple_choice_multiple', 'dropdown', 'true_false'].includes(questionType)) {
      if (questionType === 'true_false') {
        newQuestion.options = ['True', 'False'];
        newQuestion.correctOptionIndex = 0;
      } else {
        newQuestion.options = ['', '', '', ''];
        newQuestion.correctOptionIndex = 0;
        if (questionType === 'multiple_choice_multiple') {
          newQuestion.correctOptionIndices = [];
        }
      }
    } else if (questionType === 'fill_in_blank') {
      newQuestion.correctAnswers = [''];
    } else if (questionType === 'match') {
      newQuestion.matchPairs = [{ left: '', right: '' }];
    } else if (questionType === 'reorder') {
      newQuestion.correctOrder = [''];
    } else if (['image_based', 'hotspot', 'labeling', 'draw'].includes(questionType)) {
      newQuestion.imageUrl = '';
      // For image_based, also add options
      if (questionType === 'image_based') {
        newQuestion.options = ['', '', '', ''];
        newQuestion.correctOptionIndex = 0;
      }
      // For hotspot, initialize empty hotspotRegions array
      if (questionType === 'hotspot') {
        newQuestion.hotspotRegions = [];
      }
    } else if (questionType === 'passage') {
      newQuestion.passageText = '';
      newQuestion.options = ['', '', '', ''];
      newQuestion.correctOptionIndex = 0;
    }

    const updated = [...sections];
    updated[sectionIndex].questions.push(newQuestion);
    onChange(updated);
    setEditingQuestion({ sectionIndex, questionIndex: updated[sectionIndex].questions.length - 1 });
    setShowQuestionForm(true);
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => {
    const updated = [...sections];
    updated[sectionIndex].questions[questionIndex] = {
      ...updated[sectionIndex].questions[questionIndex],
      ...updates
    };
    onChange(updated);
  };

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].questions.splice(questionIndex, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Add Section Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Quiz Sections</h3>
        <button
          onClick={addSection}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Section
        </button>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No sections yet. Create your first section to get started.</p>
          <button
            onClick={addSection}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create First Section
          </button>
        </div>
      ) : (
        sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Section Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={section.sectionTitle}
                  onChange={(e) => updateSection(sectionIndex, { sectionTitle: e.target.value })}
                  placeholder="Section Title"
                  className="text-lg font-semibold text-gray-900 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                />
                <button
                  onClick={() => deleteSection(sectionIndex)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <textarea
                value={section.sectionDescription || ''}
                onChange={(e) => updateSection(sectionIndex, { sectionDescription: e.target.value })}
                placeholder="Section Description (optional)"
                className="w-full text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
              />
              
              {/* Section Question Type Restriction */}
              <div className="mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!section.questionType}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSectionIndex(sectionIndex);
                        setTypeSelectorMode('setRestriction');
                        setShowTypeSelector(true);
                      } else {
                        updateSection(sectionIndex, { questionType: undefined });
                      }
                    }}
                    className="rounded"
                  />
                  <span>Restrict this section to a specific question type</span>
                </label>
                {section.questionType && (
                  <div className="mt-2 px-3 py-2 bg-purple-50 rounded-lg text-sm">
                    Type: <span className="font-semibold">{section.questionType}</span>
                    <button
                      onClick={() => {
                        setSelectedSectionIndex(sectionIndex);
                        setTypeSelectorMode('setRestriction');
                        setShowTypeSelector(true);
                      }}
                      className="ml-2 text-purple-600 hover:text-purple-700"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">
                  Questions ({section.questions.length})
                </h4>
                <button
                  onClick={() => {
                    // If section has a restricted question type, use it directly
                    if (section.questionType) {
                      addQuestion(sectionIndex, section.questionType);
                    } else {
                      // Otherwise, show type selector
                      setSelectedSectionIndex(sectionIndex);
                      setTypeSelectorMode('addQuestion');
                      setShowTypeSelector(true);
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Question
                </button>
              </div>

              {section.questions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 text-sm mb-2">No questions in this section</p>
                  <button
                    onClick={() => {
                      // If section has a restricted question type, use it directly
                      if (section.questionType) {
                        addQuestion(sectionIndex, section.questionType);
                      } else {
                        // Otherwise, show type selector
                        setSelectedSectionIndex(sectionIndex);
                        setTypeSelectorMode('addQuestion');
                        setShowTypeSelector(true);
                      }
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Add Question
                  </button>
                </div>
              ) : (
                section.questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500">
                          Q{questionIndex + 1}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {question.questionType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {question.questionText || 'Untitled Question'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingQuestion({ sectionIndex, questionIndex });
                          setShowQuestionForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))
      )}

      {/* Question Type Selector Modal */}
      {showTypeSelector && selectedSectionIndex !== null && (
        <QuestionTypeSelector
          onSelect={(type) => {
            if (selectedSectionIndex !== null) {
              if (typeSelectorMode === 'setRestriction') {
                // Setting section restriction
                updateSection(selectedSectionIndex, { questionType: type });
              } else {
                // Adding a new question
                addQuestion(selectedSectionIndex, type);
              }
              setShowTypeSelector(false);
              setSelectedSectionIndex(null);
              setTypeSelectorMode('addQuestion');
            }
          }}
          onClose={() => {
            setShowTypeSelector(false);
            setSelectedSectionIndex(null);
            setTypeSelectorMode('addQuestion');
          }}
        />
      )}

      {/* Question Form Modal */}
      {showQuestionForm && editingQuestion !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuestion.questionIndex >= 0 && sections[editingQuestion.sectionIndex]?.questions[editingQuestion.questionIndex]
                  ? `Edit Question ${editingQuestion.questionIndex + 1}`
                  : 'Add Question'}
              </h2>
              <button
                onClick={() => {
                  setShowQuestionForm(false);
                  setEditingQuestion(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {editingQuestion !== null && sections[editingQuestion.sectionIndex]?.questions[editingQuestion.questionIndex] && (
                <QuestionFormRouter
                  questionType={sections[editingQuestion.sectionIndex].questions[editingQuestion.questionIndex].questionType}
                  question={sections[editingQuestion.sectionIndex].questions[editingQuestion.questionIndex]}
                  onChange={(updates) => {
                    updateQuestion(editingQuestion.sectionIndex, editingQuestion.questionIndex, updates);
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowQuestionForm(false);
                  setEditingQuestion(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Validate question before saving
                  if (editingQuestion !== null) {
                    const question = sections[editingQuestion.sectionIndex]?.questions[editingQuestion.questionIndex];
                    if (!question?.questionText?.trim()) {
                      alert('Please enter a question text');
                      return;
                    }
                    // Additional validation based on question type
                    if (question.questionType === 'multiple_choice_single' || question.questionType === 'multiple_choice_multiple') {
                      if (!question.options || question.options.filter((opt: string) => opt.trim()).length < 2) {
                        alert('Please provide at least 2 options');
                        return;
                      }
                      if (question.questionType === 'multiple_choice_single' && question.correctOptionIndex === undefined) {
                        alert('Please select a correct answer');
                        return;
                      }
                      if (question.questionType === 'multiple_choice_multiple' && (!question.correctOptionIndices || question.correctOptionIndices.length === 0)) {
                        alert('Please select at least one correct answer');
                        return;
                      }
                    }
                  }
                  setShowQuestionForm(false);
                  setEditingQuestion(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

