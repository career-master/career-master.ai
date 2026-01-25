const QuizRepository = require('./quiz.repository');
const { ErrorHandler } = require('../middleware/errorHandler');
const CryptoUtil = require('../utils/crypto');
const xlsx = require('xlsx');

/**
 * Quiz Service
 * Business logic for quiz management
 */
class QuizService {
  /**
   * Create quiz with questions
   * @param {Object} payload
   * @param {string} userId
   */
  static async createQuiz(payload, userId) {
    try {
      const { 
        title, 
        description, 
        durationMinutes, 
        questions, 
        sections,
        useSections,
        availableFrom, 
        availableTo, 
        batches, 
        availableToEveryone,
        maxAttempts
      } = payload;

      const quizData = {
        title,
        description,
        durationMinutes,
        createdBy: userId,
        availableToEveryone: availableToEveryone || false,
        maxAttempts: maxAttempts || 999,
        isActive: payload.isActive !== undefined ? payload.isActive : true
      };

      // Handle sections or flat questions
      if (useSections && sections && Array.isArray(sections) && sections.length > 0) {
        // Filter out empty questions from sections and validate required fields
        const validSections = sections.map(section => ({
          ...section,
          questions: (section.questions || [])
            .filter(q => {
              // Must have question text
              if (!q.questionText || q.questionText.trim().length === 0) return false;
              
              // For MCQ Multiple, must have at least one correct answer selected
              if (q.questionType === 'multiple_choice_multiple') {
                if (!q.correctOptionIndices || !Array.isArray(q.correctOptionIndices) || q.correctOptionIndices.length === 0) {
                  return false;
                }
              }
              
              // For MCQ Single/True-False, must have correctOptionIndex
              if (['multiple_choice_single', 'multiple_choice', 'true_false'].includes(q.questionType)) {
                if (q.correctOptionIndex === undefined || q.correctOptionIndex === null) {
                  return false;
                }
              }
              
              return true;
            })
            .map(q => {
              // Clean up: Remove correctOptionIndices for non-MCQ-Multiple questions
              // This prevents Mongoose validation errors
              const cleanedQ = { ...q };
              if (cleanedQ.questionType !== 'multiple_choice_multiple') {
                delete cleanedQ.correctOptionIndices;
              }
              // Also remove other type-incompatible fields
              if (cleanedQ.questionType !== 'fill_in_blank') {
                delete cleanedQ.correctAnswers;
              }
              if (cleanedQ.questionType !== 'match') {
                delete cleanedQ.matchPairs;
              }
              if (!['reorder', 'drag_drop'].includes(cleanedQ.questionType)) {
                delete cleanedQ.correctOrder;
              }
              if (!['multiple_choice_single', 'multiple_choice_multiple', 'dropdown', 'true_false'].includes(cleanedQ.questionType)) {
                delete cleanedQ.options;
                delete cleanedQ.correctOptionIndex;
              }
              return cleanedQ;
            })
        })).filter(section => section.questions.length > 0);

      if (validSections.length === 0) {
        throw new ErrorHandler(400, 'At least one complete question is required in sections. Please ensure all questions have question text and correct answers selected.');
      }

      quizData.useSections = true;
      quizData.sections = validSections;
    } else {
      // Legacy flat questions
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new ErrorHandler(400, 'At least one question is required');
      }

      // Filter out empty questions
      const validQuestions = questions.filter(q => q.questionText && q.questionText.trim().length > 0);
      if (validQuestions.length === 0) {
        throw new ErrorHandler(400, 'At least one question is required');
      }

      quizData.useSections = false;
      quizData.questions = validQuestions;
    }

    // Only set dates if they are provided and not empty
    if (availableFrom && availableFrom.trim() !== '') {
      quizData.availableFrom = new Date(availableFrom);
    }
    if (availableTo && availableTo.trim() !== '') {
      quizData.availableTo = new Date(availableTo);
    }
    
    // If available to everyone, don't set batches
    if (availableToEveryone) {
      quizData.batches = [];
    } else if (Array.isArray(batches)) {
      quizData.batches = batches.map((b) => String(b).trim()).filter(Boolean);
    }

      const quiz = await QuizRepository.createQuiz(quizData);

      return quiz;
    } catch (error) {
      console.error('Error in QuizService.createQuiz:', error);
      console.error('Payload received:', JSON.stringify(payload, null, 2));
      throw error;
    }
  }

  /**
   * Update quiz
   */
  static async updateQuiz(quizId, updates) {
    // Handle date updates - convert to Date if provided, set to null to unset if empty
    if ('availableFrom' in updates) {
      if (updates.availableFrom && updates.availableFrom.trim() !== '') {
        updates.availableFrom = new Date(updates.availableFrom);
      } else {
        updates.availableFrom = null;
      }
    }
    if ('availableTo' in updates) {
      if (updates.availableTo && updates.availableTo.trim() !== '') {
        updates.availableTo = new Date(updates.availableTo);
      } else {
        updates.availableTo = null;
      }
    }
    
    // If available to everyone, clear batches
    if (updates.availableToEveryone) {
      updates.batches = [];
    }

    // Handle sections or questions updates
    if (updates.useSections && updates.sections) {
      // Filter out empty questions from sections
      updates.sections = updates.sections.map(section => ({
        ...section,
        questions: (section.questions || []).filter(q => q.questionText && q.questionText.trim().length > 0)
      })).filter(section => section.questions.length > 0);
    } else if (updates.questions) {
      // Filter out empty questions
      updates.questions = updates.questions.filter(q => q.questionText && q.questionText.trim().length > 0);
    }
    
    const quiz = await QuizRepository.updateQuiz(quizId, updates);
    if (!quiz) {
      throw new ErrorHandler(404, 'Quiz not found');
    }
    return quiz;
  }

  /**
   * Get all quizzes
   * Excludes quizzes that are part of quiz sets (those should only show in subject/topic pages)
   */
  static async getQuizzes({ page = 1, limit = 10, excludeQuizSets = true } = {}) {
    // Get all quiz IDs that are part of quiz sets
    let excludeQuizIds = [];
    if (excludeQuizSets) {
      const QuizSet = require('../quiz-sets/quiz-sets.model');
      const quizSets = await QuizSet.find({ isActive: true }).select('quizId').lean();
      excludeQuizIds = quizSets.map(qs => qs.quizId.toString());
    }

    return QuizRepository.getQuizzesPaginated({
      activeOnly: false,
      page,
      limit,
      excludeQuizIds
    });
  }

  /**
   * Get quiz by ID
   */
  static async getQuizById(quizId) {
    const quiz = await QuizRepository.getQuizById(quizId);
    if (!quiz) {
      throw new ErrorHandler(404, 'Quiz not found');
    }
    return quiz;
  }

  /**
   * Delete quiz
   */
  static async deleteQuiz(quizId) {
    await QuizRepository.deleteQuiz(quizId);
  }

  /**
   * Parse Excel file and create quiz with questions
   * Expected columns:
   * - title (quiz title) - only in first row or provided separately
   * - question
   * - optionA, optionB, optionC, optionD
   * - correctOption (A/B/C/D)
   * - marks
   * - negativeMarks
   */
  static async createQuizFromExcel(fileBuffer, metadata, userId) {
    if (!fileBuffer) {
      throw new ErrorHandler(400, 'Excel file is required');
    }

    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      throw new ErrorHandler(400, 'Excel file is empty');
    }

    const questions = [];

    for (const row of rows) {
      const questionText = row.question || row.Question || row.QUESTION;
      const optionA = row.optionA || row.OptionA || row.A || '';
      const optionB = row.optionB || row.OptionB || row.B || '';
      const optionC = row.optionC || row.OptionC || row.C || '';
      const optionD = row.optionD || row.OptionD || row.D || '';
      const correctOption = (row.correctOption || row.Correct || row.correct || '').toString().trim().toUpperCase();
      const questionType = (row.type || row.Type || row.TYPE || 'multiple_choice_single').toString().trim().toLowerCase();
      const rawMarks = row.marks ?? row.Marks;
      const marks = (rawMarks !== '' && rawMarks != null && !Number.isNaN(Number(rawMarks)))
        ? Number(rawMarks)
        : (metadata.defaultMarks ?? 1);
      const negativeMarks = Number(row.negativeMarks || row.NegativeMarks || 0);

      // Skip if no question text
      if (!questionText) {
        continue;
      }

      // Determine question type
      let finalQuestionType = 'multiple_choice_single';
      if (questionType.includes('multiple') || questionType.includes('multi')) {
        finalQuestionType = 'multiple_choice_multiple';
      } else if (questionType.includes('true') || questionType.includes('false') || questionType === 'tf') {
        finalQuestionType = 'true_false';
      } else if (questionType.includes('single') || questionType.includes('mcq')) {
        finalQuestionType = 'multiple_choice_single';
      }

      // Handle True/False
      if (finalQuestionType === 'true_false') {
        const options = ['True', 'False'];
        const correctIndex = correctOption.includes('TRUE') || correctOption.includes('T') ? 0 : 1;
        
        questions.push({
          questionType: 'true_false',
          questionText,
          options,
          correctOptionIndex: correctIndex,
          marks: Number.isNaN(marks) ? 1 : marks,
          negativeMarks: Number.isNaN(negativeMarks) ? 0 : negativeMarks
        });
        continue;
      }

      // Handle Multiple Choice (Single or Multiple)
      if (!optionA || !optionB) {
        continue; // Need at least 2 options
      }

      const options = [optionA, optionB];
      if (optionC) options.push(optionC);
      if (optionD) options.push(optionD);

      // Check if multiple correct answers (comma-separated like "A,C,D")
      const correctOptions = correctOption.split(',').map(opt => opt.trim()).filter(Boolean);
      
      if (finalQuestionType === 'multiple_choice_multiple' || correctOptions.length > 1) {
        // Multiple correct answers
        const correctIndexMap = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
        const correctIndices = correctOptions
          .map(opt => correctIndexMap[opt[0]])
          .filter(idx => idx !== undefined);

        if (correctIndices.length === 0) {
          continue; // Invalid correct answers
        }

        questions.push({
          questionType: 'multiple_choice_multiple',
          questionText,
          options,
          correctOptionIndices: correctIndices,
          marks: Number.isNaN(marks) ? 1 : marks,
          negativeMarks: Number.isNaN(negativeMarks) ? 0 : negativeMarks
        });
      } else {
        // Single correct answer
        const correctIndexMap = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
        const correctOptionIndex = correctIndexMap[correctOption[0]];

        if (correctOptionIndex === undefined) {
          continue; // Invalid correct option
        }

        questions.push({
          questionType: 'multiple_choice_single',
          questionText,
          options,
          correctOptionIndex,
          marks: Number.isNaN(marks) ? 1 : marks,
          negativeMarks: Number.isNaN(negativeMarks) ? 0 : negativeMarks
        });
      }
    }

    if (questions.length === 0) {
      throw new ErrorHandler(400, 'No valid questions found in Excel file');
    }

    const title = metadata.title || rows[0].title || rows[0].Title || 'Untitled Quiz';
    const description = metadata.description || '';
    const durationMinutes = Number(metadata.durationMinutes || 30);
    const availableFrom = metadata.availableFrom && metadata.availableFrom.trim() !== '' 
      ? new Date(metadata.availableFrom) 
      : undefined;
    const availableTo = metadata.availableTo && metadata.availableTo.trim() !== ''
      ? new Date(metadata.availableTo)
      : undefined;
    const availableToEveryone = metadata.availableToEveryone || false;
    const maxAttempts = Number(metadata.maxAttempts || 999);
    
    // If available to everyone, don't set batches
    const batches = availableToEveryone
      ? []
      : Array.isArray(metadata.batches)
        ? metadata.batches
        : typeof metadata.batches === 'string'
          ? metadata.batches.split(',').map((b) => b.trim()).filter(Boolean)
          : [];

    const quiz = await QuizRepository.createQuiz({
      title,
      description,
      durationMinutes,
      availableFrom,
      availableTo,
      batches,
      availableToEveryone,
      maxAttempts,
      questions,
      createdBy: userId
    });

    return quiz;
  }
}

module.exports = QuizService;


