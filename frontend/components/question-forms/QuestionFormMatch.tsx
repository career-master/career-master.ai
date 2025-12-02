'use client';

interface QuestionFormMatchProps {
  question: {
    questionText: string;
    matchPairs: Array<{ left: string; right: string }>;
    marks: number;
    negativeMarks: number;
  };
  onChange: (updates: any) => void;
}

export default function QuestionFormMatch({ question, onChange }: QuestionFormMatchProps) {
  const updatePair = (index: number, side: 'left' | 'right', value: string) => {
    const newPairs = [...(question.matchPairs || [])];
    newPairs[index] = { ...newPairs[index], [side]: value };
    onChange({ matchPairs: newPairs });
  };

  const addPair = () => {
    const newPairs = [...(question.matchPairs || []), { left: '', right: '' }];
    onChange({ matchPairs: newPairs });
  };

  const removePair = (index: number) => {
    if (question.matchPairs && question.matchPairs.length > 1) {
      const newPairs = question.matchPairs.filter((_, i) => i !== index);
      onChange({ matchPairs: newPairs });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-xs text-blue-800">
          <strong>Match the Following:</strong> Students match items from the left column with items from the right column. Create matching pairs.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text / Instructions *
        </label>
        <textarea
          value={question.questionText || ''}
          onChange={(e) => onChange({ questionText: e.target.value })}
          placeholder="Enter instructions for matching..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Match Pairs * (Left column matches with Right column)
        </label>
        <div className="space-y-3">
          {(question.matchPairs || [{ left: '', right: '' }]).map((pair, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Left</label>
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => updatePair(index, 'left', e.target.value)}
                  placeholder="Left item"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="text-gray-400 mt-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Right</label>
                <input
                  type="text"
                  value={pair.right}
                  onChange={(e) => updatePair(index, 'right', e.target.value)}
                  placeholder="Right item"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {(question.matchPairs?.length || 1) > 1 && (
                <button
                  onClick={() => removePair(index)}
                  className="text-red-600 hover:text-red-700 mt-6"
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
          onClick={addPair}
          className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Match Pair
        </button>
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

