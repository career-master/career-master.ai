const Quiz = require('../quiz/quiz.model');
const QuizSet = require('../quiz-sets/quiz-sets.model');
const Topic = require('../topics/topics.model');
const Subject = require('../subjects/subjects.model');

/**
 * Verification Script: Ensure all quizzes are linked to topics via QuizSet
 * This script checks for orphaned quizzes and reports them
 */
class QuizTopicLinkVerifier {
  /**
   * Verify all quizzes are linked to topics
   * @returns {Promise<Object>}
   */
  static async verifyAllQuizzesLinked() {
    try {
      console.log('🔍 Verifying quiz-topic links...\n');

      // Get all active quizzes
      const allQuizzes = await Quiz.find({ isActive: true }).lean();
      console.log(`📊 Total active quizzes: ${allQuizzes.length}`);

      // Get all quiz sets
      const allQuizSets = await QuizSet.find({ isActive: true }).lean();
      const quizIdsInQuizSets = new Set(
        allQuizSets.map(qs => qs.quizId.toString())
      );
      console.log(`📊 Total active quiz sets: ${allQuizSets.length}`);
      console.log(`📊 Unique quizzes in quiz sets: ${quizIdsInQuizSets.size}\n`);

      // Find orphaned quizzes (quizzes not in any quiz set)
      const orphanedQuizzes = allQuizzes.filter(
        quiz => !quizIdsInQuizSets.has(quiz._id.toString())
      );

      if (orphanedQuizzes.length === 0) {
        console.log('✅ All quizzes are properly linked to topics via QuizSet!\n');
        return {
          success: true,
          totalQuizzes: allQuizzes.length,
          linkedQuizzes: allQuizzes.length,
          orphanedQuizzes: 0,
          orphanedQuizList: []
        };
      }

      console.log(`⚠️  Found ${orphanedQuizzes.length} orphaned quiz(es) (not linked to any topic):\n`);
      orphanedQuizzes.forEach((quiz, index) => {
        console.log(`   ${index + 1}. "${quiz.title}" (ID: ${quiz._id})`);
      });

      // Get quiz set details for linked quizzes
      const quizSetDetails = await QuizSet.find({ isActive: true })
        .populate('topicId', 'title subjectId')
        .populate('quizId', 'title')
        .lean();

      console.log(`\n📋 Quiz-Topic Link Summary:`);
      const quizTopicMap = new Map();
      quizSetDetails.forEach(qs => {
        const quizId = qs.quizId?._id?.toString() || qs.quizId?.toString();
        const quizTitle = qs.quizId?.title || 'Unknown';
        const topicTitle = qs.topicId?.title || 'Unknown';
        
        if (!quizTopicMap.has(quizId)) {
          quizTopicMap.set(quizId, {
            quizTitle,
            topics: []
          });
        }
        quizTopicMap.get(quizId).topics.push(topicTitle);
      });

      console.log(`\n✅ Linked Quizzes (${quizTopicMap.size}):`);
      let count = 1;
      for (const [quizId, data] of quizTopicMap.entries()) {
        console.log(`   ${count}. "${data.quizTitle}"`);
        console.log(`      → Linked to ${data.topics.length} topic(s): ${data.topics.join(', ')}`);
        count++;
      }

      return {
        success: false,
        totalQuizzes: allQuizzes.length,
        linkedQuizzes: allQuizzes.length - orphanedQuizzes.length,
        orphanedQuizzes: orphanedQuizzes.length,
        orphanedQuizList: orphanedQuizzes.map(q => ({
          id: q._id.toString(),
          title: q.title
        }))
      };
    } catch (error) {
      console.error('❌ Error verifying quiz-topic links:', error);
      throw error;
    }
  }

  /**
   * Auto-link orphaned quizzes to a default topic (if needed)
   * This is a helper function - use with caution
   */
  static async autoLinkOrphanedQuizzes() {
    try {
      const result = await this.verifyAllQuizzesLinked();
      
      if (result.orphanedQuizzes === 0) {
        console.log('✅ No orphaned quizzes to link.');
        return result;
      }

      console.log(`\n⚠️  Found ${result.orphanedQuizzes} orphaned quiz(es).`);
      console.log('   Note: Auto-linking is not implemented. Please manually link quizzes to topics via QuizSet.');
      console.log('   Orphaned quizzes should be linked to appropriate topics based on their content.\n');

      return result;
    } catch (error) {
      console.error('❌ Error auto-linking quizzes:', error);
      throw error;
    }
  }
}

// If run directly, execute verification
if (require.main === module) {
  const database = require('../config/db');
  
  async function run() {
    try {
      await database.connect();
      const result = await QuizTopicLinkVerifier.verifyAllQuizzesLinked();
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error('Failed to verify quiz-topic links:', error);
      process.exit(1);
    }
  }
  
  run();
}

module.exports = QuizTopicLinkVerifier;

