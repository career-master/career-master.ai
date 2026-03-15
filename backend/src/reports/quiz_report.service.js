const QuizReportRepository = require('./quiz_report.repository');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const QuizAttempt = require('../quiz/quiz_attempts.model');
const { ErrorHandler } = require('../middleware/errorHandler');

class QuizReportService {
  /**
   * Get quiz attempt report
   * @param {string} attemptId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async getQuizAttemptReport(attemptId, userId) {
    try {
      const report = await QuizReportRepository.getQuizAttemptReport(attemptId, userId);
      return {
        success: true,
        data: report
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Get quiz attempt report for any user
   * @param {string} attemptId
   * @returns {Promise<Object>}
   */
  static async getQuizAttemptReportForAdmin(attemptId) {
    try {
      const report = await QuizReportRepository.getQuizAttemptReportForAdmin(attemptId);
      return {
        success: true,
        data: report,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate PDF report
   * @param {string} attemptId
   * @param {string} userId
   * @returns {Promise<Buffer>}
   */
  static async generatePDFReport(attemptId, userId) {
    try {
      console.log(`Generating PDF report for attemptId: ${attemptId}, userId: ${userId}`);
      const report = await QuizReportRepository.getQuizAttemptReport(attemptId, userId);
      
      if (!report) {
        throw new ErrorHandler(404, 'Quiz attempt report not found');
      }

      console.log('Report data retrieved, generating PDF...');
      
      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ margin: 50 });
          const chunks = [];

          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => {
            console.log('PDF generation completed');
            resolve(Buffer.concat(chunks));
          });
          doc.on('error', (error) => {
            console.error('PDF generation error:', error);
            reject(error);
          });

          // Header
          doc.fontSize(20).text('Quiz Report', { align: 'center' });
          doc.moveDown();

          // Quiz Info
          doc.fontSize(16).text(report.quizTitle, { align: 'center' });
          if (report.quizDescription) {
            doc.fontSize(10).text(report.quizDescription, { align: 'center', opacity: 0.7 });
          }
          doc.moveDown();

          // User Info
          doc.fontSize(12).text(`Student: ${report.user.name}`, { continued: true });
          doc.text(`Email: ${report.user.email}`, { align: 'right' });
          doc.text(`Submitted: ${new Date(report.attemptDetails.submittedAt).toLocaleString()}`);
          doc.moveDown();

          // Summary Box
          const summaryY = doc.y;
          doc.rect(50, summaryY, 500, 100).stroke();
          doc.fontSize(14).text('Summary', 60, summaryY + 10);
          doc.fontSize(10);
          let currentY = summaryY + 30;
          doc.text(`Marks Obtained: ${report.attemptDetails.marksObtained}/${report.attemptDetails.totalMarks}`, 60, currentY);
          currentY += 15;
          doc.text(`Percentage: ${report.attemptDetails.percentage.toFixed(2)}%`, 60, currentY);
          currentY += 15;
          doc.text(`Result: ${report.attemptDetails.result.toUpperCase()}`, 60, currentY);
          currentY += 15;
          doc.text(`Time Spent: ${report.attemptDetails.timeSpentFormatted}`, 60, currentY);
          
          // Right column
          currentY = summaryY + 30;
          doc.text(`Correct: ${report.summary.correct}`, 300, currentY);
          currentY += 15;
          doc.text(`Incorrect: ${report.summary.incorrect}`, 300, currentY);
          currentY += 15;
          doc.text(`Unattempted: ${report.summary.unattempted}`, 300, currentY);
          currentY += 15;
          doc.text(`Accuracy: ${report.summary.accuracy}%`, 300, currentY);
          
          doc.y = summaryY + 110;
          doc.moveDown(1);

          // Questions
          doc.fontSize(16).text('Question-wise Analysis', { underline: true });
          doc.moveDown();

          report.questions.forEach((q, index) => {
            // Question
            doc.fontSize(12).font('Helvetica-Bold')
              .text(`Q${q.questionNumber}: ${q.questionText}`, { continued: false });
            doc.moveDown(0.5);

            // Options
            doc.fontSize(10).font('Helvetica');
            q.options.forEach((option, optIndex) => {
              let prefix = '  ';
              if (optIndex === q.correctOptionIndex) {
                prefix = '✓ '; // Correct answer
              } else if (optIndex === q.userAnswerIndex) {
                prefix = '✗ '; // User's answer (if wrong)
              }
              doc.text(`${prefix}${String.fromCharCode(65 + optIndex)}. ${option}`, {
                indent: 20,
                continued: false
              });
            });
            doc.moveDown(0.5);

            // Result
            if (q.isCorrect) {
              doc.fontSize(10).fillColor('green')
                .text(`✓ Correct Answer | Marks: +${q.marksObtained}`, { indent: 20 });
            } else if (q.isAnswered) {
              doc.fontSize(10).fillColor('red')
                .text(`✗ Wrong Answer | Correct: ${q.correctAnswer} | Marks: ${q.marksObtained}`, { indent: 20 });
            } else {
              doc.fontSize(10).fillColor('gray')
                .text(`○ Not Attempted | Correct: ${q.correctAnswer} | Marks: 0`, { indent: 20 });
            }
            doc.fillColor('black');
            doc.moveDown(1);

            // Page break if needed
            if (doc.y > 700) {
              doc.addPage();
            }
          });

          doc.end();
        } catch (error) {
          console.error('Error in PDF generation promise:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error generating PDF report: ${error.message}`);
    }
  }

  /**
   * Admin: generate PDF report for any user's attempt
   * @param {string} attemptId
   * @returns {Promise<Buffer>}
   */
  static async generatePDFReportForAdmin(attemptId) {
    try {
      const attempt = await QuizAttempt.findById(attemptId).select('userId').lean();
      if (!attempt || !attempt.userId) {
        throw new ErrorHandler(404, 'Quiz attempt not found');
      }
      const ownerId = attempt.userId.toString();
      return this.generatePDFReport(attemptId, ownerId);
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error generating PDF report: ${error.message}`);
    }
  }

  /**
   * Generate Excel report
   * @param {string} attemptId
   * @param {string} userId
   * @returns {Promise<Buffer>}
   */
  static async generateExcelReport(attemptId, userId) {
    try {
      const report = await QuizReportRepository.getQuizAttemptReport(attemptId, userId);

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ['Quiz Report'],
        ['Quiz Title', report.quizTitle],
        ['Student Name', report.user.name],
        ['Student Email', report.user.email],
        ['Submitted At', new Date(report.attemptDetails.submittedAt).toLocaleString()],
        [''],
        ['Summary'],
        ['Total Marks', report.attemptDetails.totalMarks],
        ['Marks Obtained', report.attemptDetails.marksObtained],
        ['Percentage', `${report.attemptDetails.percentage.toFixed(2)}%`],
        ['Result', report.attemptDetails.result.toUpperCase()],
        ['Time Spent', report.attemptDetails.timeSpentFormatted],
        [''],
        ['Question Statistics'],
        ['Total Questions', report.summary.totalQuestions],
        ['Attempted', report.summary.attempted],
        ['Correct', report.summary.correct],
        ['Incorrect', report.summary.incorrect],
        ['Unattempted', report.summary.unattempted],
        ['Accuracy', `${report.summary.accuracy}%`]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Questions Sheet
      const questionsData = [
        ['Q#', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Option E', 'Option F', 
         'Correct Answer', 'Your Answer', 'Status', 'Marks Obtained', 'Marks']
      ];

      report.questions.forEach(q => {
        const row = [
          q.questionNumber,
          q.questionText,
          ...q.options,
          q.correctAnswer,
          q.userAnswer,
          q.isCorrect ? 'Correct' : q.isAnswered ? 'Wrong' : 'Not Attempted',
          q.marksObtained,
          q.marks
        ];
        questionsData.push(row);
      });

      const questionsSheet = XLSX.utils.aoa_to_sheet(questionsData);
      XLSX.utils.book_append_sheet(workbook, questionsSheet, 'Questions');

      // Generate buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return excelBuffer;
    } catch (error) {
      throw new ErrorHandler(500, `Error generating Excel report: ${error.message}`);
    }
  }

  /**
   * Admin: generate Excel report for any user's attempt
   * @param {string} attemptId
   * @returns {Promise<Buffer>}
   */
  static async generateExcelReportForAdmin(attemptId) {
    try {
      const attempt = await QuizAttempt.findById(attemptId).select('userId').lean();
      if (!attempt || !attempt.userId) {
        throw new ErrorHandler(404, 'Quiz attempt not found');
      }
      const ownerId = attempt.userId.toString();
      return this.generateExcelReport(attemptId, ownerId);
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(500, `Error generating Excel report: ${error.message}`);
    }
  }

  /**
   * Get user's quiz attempts list
   * @param {string} userId
   * @param {Object} filters - Filter object with quizId, subjectId, topicId, etc.
   * @returns {Promise<Object>}
   */
  static async getUserQuizAttempts(userId, filters = {}) {
    try {
      // Extract quizId from filters if it exists, otherwise use null
      const quizId = filters && typeof filters === 'object' && !Array.isArray(filters) 
        ? (filters.quizId || null)
        : (typeof filters === 'string' ? filters : null);
      
      const attempts = await QuizReportRepository.getUserQuizAttempts(userId, quizId, filters);
      return {
        success: true,
        data: attempts
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Get quiz attempts across users with filters + pagination
   * @param {Object} filters
   * @param {{ page: number, limit: number }} pagination
   * @returns {Promise<Object>}
   */
  static async getAdminUserQuizAttempts(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const { page = 1, limit = 20 } = pagination || {};
      const pageNum = Number.isNaN(Number(page)) ? 1 : Number(page);
      const limitNum = Number.isNaN(Number(limit)) ? 20 : Number(limit);

      const { data, total } = await QuizReportRepository.getAllQuizAttempts(filters, {
        page: pageNum,
        limit: limitNum,
      });

      return {
        success: true,
        data,
        total,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a single quiz attempt for a user
   * @param {string} userId
   * @param {string} attemptId
   */
  static async deleteUserQuizAttempt(userId, attemptId) {
    try {
      const attempt = await QuizAttempt.findById(attemptId).lean();
      if (!attempt) {
        throw new ErrorHandler(404, 'Quiz attempt not found');
      }

      if (attempt.userId.toString() !== userId.toString()) {
        throw new ErrorHandler(403, 'You are not allowed to delete this attempt');
      }

      await QuizAttempt.deleteOne({ _id: attemptId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Delete any quiz attempt (super_admin only)
   * @param {string} attemptId
   */
  static async deleteAdminQuizAttempt(attemptId) {
    try {
      const attempt = await QuizAttempt.findById(attemptId).lean();
      if (!attempt) {
        throw new ErrorHandler(404, 'Quiz attempt not found');
      }
      await QuizAttempt.deleteOne({ _id: attemptId });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = QuizReportService;

