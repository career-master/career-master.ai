'use client';

import { useState } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface QuestionFormImageBasedProps {
  question: {
    questionText: string;
    imageUrl: string;
    options?: string[];
    correctOptionIndex?: number;
    marks: number;
    negativeMarks: number;
  };
  onChange: (updates: any) => void;
}

export default function QuestionFormImageBased({ question, onChange }: QuestionFormImageBasedProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Uploading image...', { id: 'upload-image' });

      // Upload to Cloudinary
      const response = await apiService.uploadImage(file, 'career-master/quiz-images');
      
      if (response.success && response.data?.url) {
        onChange({ imageUrl: response.data.url });
        toast.success('Image uploaded successfully!', { id: 'upload-image' });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.', { id: 'upload-image' });
    } finally {
      setUploading(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onChange({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-xs text-blue-800">
          <strong>Image Based:</strong> Students analyze an image and select the correct answer. Upload an image and provide options describing patterns or concepts in the image.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={question.questionText || ''}
          onChange={(e) => onChange({ questionText: e.target.value })}
          placeholder="Enter your question about the image..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image *
        </label>
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Instructions:</strong> Upload an image that contains patterns, diagrams, or visual content. Students will analyze the image and select the correct answer from the options below.
          </p>
        </div>
        {question.imageUrl ? (
          <div className="relative inline-block">
            <img
              src={question.imageUrl}
              alt="Question image"
              className="max-w-full max-h-96 h-auto rounded-lg border-2 border-gray-300 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
            <button
              onClick={() => onChange({ imageUrl: '' })}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-lg"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploading}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-gray-600 font-medium">Uploading image...</span>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
                  <span className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP (Max 10MB)</span>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options * (What pattern/concept does the image represent?)
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
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Select the correct answer that describes the image pattern
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

