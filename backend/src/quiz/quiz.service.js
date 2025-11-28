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
    const { title, description, durationMinutes, questions, availableFrom, availableTo, batches } = payload;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new ErrorHandler(400, 'At least one question is required');
    }

    const quizData = {
      title,
      description,
      durationMinutes,
      questions,
      createdBy: userId
    };

    if (availableFrom) {
      quizData.availableFrom = new Date(availableFrom);
    }
    if (availableTo) {
      quizData.availableTo = new Date(availableTo);
    }
    if (Array.isArray(batches)) {
      quizData.batches = batches.map((b) => String(b).trim()).filter(Boolean);
    }

    const quiz = await QuizRepository.createQuiz(quizData);

    return quiz;
  }

  /**
   * Update quiz
   */
  static async updateQuiz(quizId, updates) {
    const quiz = await QuizRepository.updateQuiz(quizId, updates);
    if (!quiz) {
      throw new ErrorHandler(404, 'Quiz not found');
    }
    return quiz;
  }

  /**
   * Get all quizzes
   */
  static async getQuizzes({ page = 1, limit = 10 } = {}) {
    return QuizRepository.getQuizzesPaginated({
      activeOnly: false,
      page,
      limit
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
      const optionA = row.optionA || row.OptionA || row.A;
      const optionB = row.optionB || row.OptionB || row.B;
      const optionC = row.optionC || row.OptionC || row.C;
      const optionD = row.optionD || row.OptionD || row.D;
      const correctOption = (row.correctOption || row.Correct || '').toString().trim().toUpperCase();
      const marks = Number(row.marks || 1);
      const negativeMarks = Number(row.negativeMarks || 0);

      if (!questionText || !optionA || !optionB || !['A', 'B'].includes(correctOption[0] || '')) {
        // Skip invalid rows but continue processing others
        // At minimum, need question, two options, and a valid correct option
        continue;
      }

      const options = [optionA, optionB];
      if (optionC) options.push(optionC);
      if (optionD) options.push(optionD);

      const correctIndexMap = { A: 0, B: 1, C: 2, D: 3 };
      const correctOptionIndex = correctIndexMap[correctOption[0]];

      questions.push({
        questionText,
        options,
        correctOptionIndex,
        marks: Number.isNaN(marks) ? 1 : marks,
        negativeMarks: Number.isNaN(negativeMarks) ? 0 : negativeMarks
      });
    }

    if (questions.length === 0) {
      throw new ErrorHandler(400, 'No valid questions found in Excel file');
    }

    const title = metadata.title || rows[0].title || rows[0].Title || 'Untitled Quiz';
    const description = metadata.description || '';
    const durationMinutes = Number(metadata.durationMinutes || 30);
    const availableFrom = metadata.availableFrom ? new Date(metadata.availableFrom) : undefined;
    const availableTo = metadata.availableTo ? new Date(metadata.availableTo) : undefined;
    const batches = Array.isArray(metadata.batches)
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
      questions,
      createdBy: userId
    });

    return quiz;
  }
}

module.exports = QuizService;


