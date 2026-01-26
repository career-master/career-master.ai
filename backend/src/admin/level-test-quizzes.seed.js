const Subject = require('../subjects/subjects.model');
const Topic = require('../topics/topics.model');
const Quiz = require('../quiz/quiz.model');
const QuizSet = require('../quiz-sets/quiz-sets.model');
const User = require('../user/users.model');
const { QUESTION_TYPES } = require('../quiz/question-types.config');

/**
 * Level Test Quizzes Seed
 * Creates Beginner, Intermediate, and Advanced quizzes for each subject
 * so the level filter (All / Beginner / Intermediate / Advanced) can be tested.
 * Each quiz has 5 simple placeholder questions.
 */
class LevelTestQuizzesSeed {
  static async seedLevelTestQuizzes() {
    try {
      const adminUser = await User.findOne({ roles: { $in: ['super_admin'] } });
      if (!adminUser) {
        console.log('⚠️  No admin user found. Skipping level-test quizzes seed.');
        return;
      }
      const createdBy = adminUser._id;

      const LEVELS = ['beginner', 'intermediate', 'advanced'];
      const subjects = await Subject.find({ isActive: true }).sort({ order: 1 });
      let created = 0;
      let linked = 0;
      let cleaned = 0;

      for (const subject of subjects) {
        // Use a dedicated "Level Practice" topic so level-test quizzes don't appear under
        // the first topic (e.g. MONGODB). They are subject-level, not topic-specific.
        let levelPracticeTopic = await Topic.findOne({
          subjectId: subject._id,
          title: 'Level Practice',
          createdBy,
        });
        if (!levelPracticeTopic) {
          const maxOrder = await Topic.findOne({ subjectId: subject._id }).sort({ order: -1 }).select('order').lean();
          levelPracticeTopic = new Topic({
            subjectId: subject._id,
            title: 'Level Practice',
            description: `${subject.title} level filter practice — Beginner, Intermediate, Advanced tests.`,
            order: (maxOrder?.order ?? 0) + 1,
            requiredQuizzesToUnlock: 0,
            isActive: true,
            createdBy,
          });
          await levelPracticeTopic.save();
          console.log(`      ✅ Created topic: Level Practice for ${subject.title}`);
        }

        for (const level of LEVELS) {
          const label = level.charAt(0).toUpperCase() + level.slice(1);
          const title = `${subject.title} - ${label} Level Test`;
          let quiz = await Quiz.findOne({ title, createdBy });

          const questions = this._dummyQuestions(5, subject.title, level);

          if (!quiz) {
            quiz = new Quiz({
              title,
              description: `${label} level practice quiz for ${subject.title} — use this to verify the level filter.`,
              durationMinutes: 10,
              availableToEveryone: true,
              isActive: true,
              useSections: false,
              questions,
              createdBy,
              courseCategories: [],
              level,
            });
            await quiz.save();
            created++;
            console.log(`      ✅ Created: ${title} [${level}]`);
          } else if (!quiz.level) {
            quiz.level = level;
            await quiz.save();
          }

          // Remove any QuizSets linking this quiz to other topics (e.g. first topic like MONGODB)
          // so it only appears under "Level Practice".
          const removed = await QuizSet.deleteMany({ quizId: quiz._id });
          if (removed?.deletedCount > 0) cleaned += removed.deletedCount;

          const existingSet = await QuizSet.findOne({ topicId: levelPracticeTopic._id, quizId: quiz._id });
          if (!existingSet) {
            await new QuizSet({
              topicId: levelPracticeTopic._id,
              quizId: quiz._id,
              setName: `${label} Level Test`,
              order: 100,
              isActive: true,
              assignedBy: createdBy,
            }).save();
            linked++;
          }
        }
      }

      console.log(`\n✅ Level-test quizzes: ${created} created, ${linked} quiz sets linked, ${cleaned} old links removed.`);
    } catch (e) {
      console.error('❌ level-test-quizzes seed error:', e);
      throw e;
    }
  }

  /** 5 simple MCQ questions for filter testing */
  static _dummyQuestions(n, subject, level) {
    const qs = [];
    for (let i = 1; i <= n; i++) {
      qs.push({
        questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
        questionText: `[${level}] ${subject} – Sample question ${i}: Pick the correct option.`,
        options: ['Option A', 'Option B (Correct)', 'Option C', 'Option D'],
        correctOptionIndex: 1,
        marks: 1,
        negativeMarks: 0,
        difficulty: 'easy',
      });
    }
    return qs;
  }
}

module.exports = LevelTestQuizzesSeed;
