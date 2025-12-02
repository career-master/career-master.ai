'use client';

interface QuestionFormMCQSingleProps {
  question: {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    marks: number;
    negativeMarks: number;
  };
  onChange: (updates: any) => void;
}

export default function QuestionFormMCQSingle({ question, onChange }: QuestionFormMCQSingleProps) {
  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onChange({ options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    onChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    if (question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== index);
      onChange({
        options: newOptions,
        correctOptionIndex: question.correctOptionIndex >= newOptions.length
          ? newOptions.length - 1
          : question.correctOptionIndex
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-xs text-blue-800">
          <strong>MCQ (Single Correct):</strong> Students select one correct answer from multiple options. Only one option can be marked as correct.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={question.questionText || ''}
          onChange={(e) => onChange({ questionText: e.target.value })}
          placeholder="Enter your question..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options *
        </label>
        <div className="space-y-2">
          {(question.options || ['', '', '', '']).map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                checked={question.correctOptionIndex === index}
                onChange={() => onChange({ correctOptionIndex: index })}
                className="w-4 h-4 text-purple-600"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {(question.options?.length || 4) > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {(question.options?.length || 4) < 6 && (
          <button
            onClick={addOption}
            className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Option
          </button>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Select the radio button next to the correct answer
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marks *
          </label>
          <input
            type="number"
            value={question.marks || 1}
            onChange={(e) => onChange({ marks: parseInt(e.target.value) || 1 })}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Negative Marks
          </label>
          <input
            type="number"
            value={question.negativeMarks || 0}
            onChange={(e) => onChange({ negativeMarks: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.25"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

