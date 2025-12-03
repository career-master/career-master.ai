'use client';

import { useState } from 'react';

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE_SINGLE: 'multiple_choice_single',
  MULTIPLE_CHOICE_MULTIPLE: 'multiple_choice_multiple',
  TRUE_FALSE: 'true_false',
  FILL_IN_BLANK: 'fill_in_blank',
  MATCH: 'match',
  REORDER: 'reorder',
  IMAGE_BASED: 'image_based',
  HOTSPOT: 'hotspot',
  PASSAGE: 'passage',
  OPEN_ENDED: 'open_ended'
};

const QUESTION_TYPE_CONFIG = {
  [QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE]: {
    name: 'MCQ (Single Correct)',
    icon: 'radio',
    category: 'basic',
    description: 'One exact correct answer',
    canImportFromExcel: true
  },
  [QUESTION_TYPES.MULTIPLE_CHOICE_MULTIPLE]: {
    name: 'MCQ (Multiple Correct)',
    icon: 'checkbox',
    category: 'basic',
    description: 'More than one valid choice',
    canImportFromExcel: true
  },
  [QUESTION_TYPES.TRUE_FALSE]: {
    name: 'True / False',
    icon: 'true-false',
    category: 'basic',
    description: 'Fact-based correctness',
    canImportFromExcel: true
  },
  [QUESTION_TYPES.FILL_IN_BLANK]: {
    name: 'Fill in the Blanks',
    icon: 'blank',
    category: 'basic',
    description: 'Missing word/value based',
    canImportFromExcel: false
  },
  [QUESTION_TYPES.MATCH]: {
    name: 'Match the Following',
    icon: 'match',
    category: 'interactive',
    description: 'Pair related concepts',
    canImportFromExcel: false
  },
  [QUESTION_TYPES.REORDER]: {
    name: 'Arrange / Reorder',
    icon: 'reorder',
    category: 'interactive',
    description: 'Sequence, steps, timeline',
    canImportFromExcel: false
  },
  [QUESTION_TYPES.IMAGE_BASED]: {
    name: 'Image Based',
    icon: 'image',
    category: 'interactive',
    description: 'Patterns',
    canImportFromExcel: false
  },
  [QUESTION_TYPES.HOTSPOT]: {
    name: 'Hotspot',
    icon: 'hotspot',
    category: 'interactive',
    description: 'Clickable regions on image',
    canImportFromExcel: false
  },
  [QUESTION_TYPES.PASSAGE]: {
    name: 'Passage',
    icon: 'passage',
    category: 'basic',
    description: 'Reading comprehension',
    canImportFromExcel: false
  },
  [QUESTION_TYPES.OPEN_ENDED]: {
    name: 'Open Ended',
    icon: 'open-ended',
    category: 'open-ended',
    description: 'Free text response',
    canImportFromExcel: false
  }
};

const CATEGORIES = {
  basic: 'Basic Question Types',
  interactive: 'Interactive/Higher-order thinking',
  'open-ended': 'Open ended responses'
};

interface QuestionTypeSelectorProps {
  selectedType?: string;
  onSelect: (type: string) => void;
  onClose: () => void;
  showExcelImportable?: boolean;
}

export default function QuestionTypeSelector({
  selectedType,
  onSelect,
  onClose,
  showExcelImportable = false
}: QuestionTypeSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'excel'>('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'radio':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'checkbox':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'true-false':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'blank':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'match':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'reorder':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'hotspot':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        );
      case 'passage':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'open-ended':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const filteredTypes = Object.entries(QUESTION_TYPE_CONFIG).filter(([type, config]) => {
    if (showExcelImportable && filter === 'excel') {
      return config.canImportFromExcel;
    }
    return true;
  });

  const groupedTypes = filteredTypes.reduce((acc, [type, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ type, ...config });
    return acc;
  }, {} as Record<string, Array<{ type: string; name: string; description: string; icon: string; canImportFromExcel: boolean }>>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Select Question Type</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter */}
        {showExcelImportable && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilter('excel')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'excel'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Excel Importable
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(groupedTypes).map(([category, types]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {CATEGORIES[category as keyof typeof CATEGORIES] || category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.map(({ type, name, description, icon, canImportFromExcel }) => (
                  <button
                    key={type}
                    onClick={() => onSelect(type)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedType === type
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${
                        selectedType === type ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        {getIcon(icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{name}</h4>
                          {canImportFromExcel && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              ⚡ Excel
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      {selectedType === type && (
                        <div className="flex-shrink-0 text-purple-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {selectedType && (
            <button
              onClick={() => {
                onSelect(selectedType);
                onClose();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

