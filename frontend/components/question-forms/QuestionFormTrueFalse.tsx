'use client';

interface QuestionFormTrueFalseProps {
  question: {
    questionText: string;
    correctOptionIndex: number;
    marks: number;
    negativeMarks: number;
  };
  onChange: (updates: any) => void;
}

export default function QuestionFormTrueFalse({ question, onChange }: QuestionFormTrueFalseProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-xs text-blue-800">
          <strong>True/False:</strong> Students select either True or False. Choose the correct answer.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={question.questionText || ''}
          onChange={(e) => onChange({ questionText: e.target.value })}
          placeholder="Enter your True/False question..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answer *
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="correctAnswer"
              checked={question.correctOptionIndex === 0}
              onChange={() => onChange({ correctOptionIndex: 0 })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="font-medium text-gray-900">True</span>
          </label>
          <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="correctAnswer"
              checked={question.correctOptionIndex === 1}
              onChange={() => onChange({ correctOptionIndex: 1 })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="font-medium text-gray-900">False</span>
          </label>
        </div>
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

