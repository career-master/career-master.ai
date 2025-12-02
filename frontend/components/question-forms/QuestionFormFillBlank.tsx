'use client';

interface QuestionFormFillBlankProps {
  question: {
    questionText: string;
    correctAnswers: string[];
    marks: number;
    negativeMarks: number;
  };
  onChange: (updates: any) => void;
}

export default function QuestionFormFillBlank({ question, onChange }: QuestionFormFillBlankProps) {
  const updateCorrectAnswer = (index: number, value: string) => {
    const newAnswers = [...(question.correctAnswers || [''])];
    newAnswers[index] = value;
    onChange({ correctAnswers: newAnswers });
  };

  const addCorrectAnswer = () => {
    const newAnswers = [...(question.correctAnswers || ['']), ''];
    onChange({ correctAnswers: newAnswers });
  };

  const removeCorrectAnswer = (index: number) => {
    if (question.correctAnswers && question.correctAnswers.length > 1) {
      const newAnswers = question.correctAnswers.filter((_, i) => i !== index);
      onChange({ correctAnswers: newAnswers });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-xs text-blue-800">
          <strong>Fill in the Blanks:</strong> Students type the answer. Use underscores (___, ____, or _____) to indicate blank spaces. Add all acceptable answer variations.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text * (Use underscores for blank)
        </label>
        <textarea
          value={question.questionText || ''}
          onChange={(e) => onChange({ questionText: e.target.value })}
          placeholder="Enter your question with ___ or ____ for the blank space..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-500 font-medium">Examples:</p>
          <p className="text-xs text-gray-500">• "The capital of France is ___"</p>
          <p className="text-xs text-gray-500">• "The capital of France is ____"</p>
          <p className="text-xs text-gray-500">• "The capital of France is _____"</p>
          <p className="text-xs text-gray-400 mt-1">💡 Tip: Use 3-5 underscores (___, ____, or _____) - any number works!</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answers * (Add all acceptable answers)
        </label>
        <div className="space-y-2">
          {(question.correctAnswers || ['']).map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => updateCorrectAnswer(index, e.target.value)}
                placeholder="Correct answer"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {(question.correctAnswers?.length || 1) > 1 && (
                <button
                  onClick={() => removeCorrectAnswer(index)}
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
        <button
          onClick={addCorrectAnswer}
          className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Alternative Answer
        </button>
        <p className="mt-2 text-xs text-gray-500">
          Add multiple answers if there are different acceptable variations
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

