const Subject = require('../subjects/subjects.model');
const Topic = require('../topics/topics.model');
const Quiz = require('../quiz/quiz.model');
const QuizSet = require('../quiz-sets/quiz-sets.model');
const Cheatsheet = require('../cheatsheets/cheatsheets.model');
const User = require('../user/users.model');
const { QUESTION_TYPES } = require('../quiz/question-types.config');
const { getQuestionsForTopic } = require('./question-bank');

/**
 * Sub-topics: when a topic is in this map, we create child topics (e.g. C - Intro, MONGODB - CRUD Operations)
 * each with their own quiz. Key = parent topic name, value = array of sub-topic names.
 * PROGRAMMING LANGAUGES: C, C++, JAVA, PYTHON.
 * DATABASES: MONGODB (and optionally MYSQL, etc.).
 */
const SUB_TOPICS_MAP = {
  // Programming Languages
  'C': ['Intro', 'Data Types', 'Operators', 'Control Flow', 'Functions', 'Pointers', 'Arrays & Strings'],
  'C++': ['Intro', 'OOP Basics', 'Inheritance', 'Templates', 'STL'],
  'JAVA': ['Intro', 'OOP', 'Collections', 'Exceptions', 'Multithreading'],
  'PYTHON': ['Intro', 'Data Types', 'Functions', 'OOP', 'Modules'],
  // Databases
  'MONGODB': ['Intro', 'CRUD Operations', 'Aggregation', 'Indexes', 'Data Modeling']
};

/**
 * Comprehensive Quizzes Seed
 * Creates subjects, topics, quizzes, and quiz sets based on the provided data structure
 * 
 * IMPORTANT: All quizzes created by this seed MUST be linked to topics via QuizSet.
 * Every quiz is automatically linked to its corresponding topic to ensure proper
 * topic-based organization and access control.
 */
class ComprehensiveQuizzesSeed {
  /**
   * Seed all quizzes based on the data structure
   * @returns {Promise<void>}
   */
  static async seedComprehensiveQuizzes() {
    try {
      // Find or get admin user for createdBy fields
      const adminUser = await User.findOne({ roles: { $in: ['super_admin'] } });
      if (!adminUser) {
        console.log('⚠️  No admin user found. Skipping comprehensive quizzes seed.');
        return;
      }

      const createdBy = adminUser._id;

      // Data structure based on your requirements
      const seedData = [
        // Technology - Programming Languages
        { domain: 'Technology', category: 'PROGRAMMING LANGAUGES', topics: ['C', 'C++', 'JAVA', 'PYTHON', 'PHP', 'C#', 'RUBY', 'GO', 'RUST'] },
        
        // Technology - Full Stack
        { domain: 'Technology', category: 'FULL STACK', topics: [
          'HTML', 'CSS', 'JAVASCRIPT', 'BOOTSTRAP', 'NODEJS', 'EXPRESSJS', 
          'REACTJS', 'NEXTJS', 'TAILWIND', 'TYPESCRIPT', 'DART', 'ANGULAR', 
          'VUEJS', 'SPRING BOOT', 'DJANGO', 'FLASK', 'ASP.NET', 'MATERIAL UI', 
          'CHAKRA UI', 'SASS'
        ]},
        
        // Technology - Databases
        { domain: 'Technology', category: 'DATABASES', topics: [
          'MONGODB', 'MYSQL', 'ORACLE', 'SQL SERVER', 'FIREBASE', 'POSTGRESQL', 
          'MARIADB', 'REDIS', 'CASSANDRA', 'ELASTICSEARCH'
        ]},
        
        // Technology - Mobile Development
        { domain: 'Technology', category: 'MOBILE DEVELOPMENT', topics: [
          'SWIFT', 'KOTLIN', 'FLUTTER', 'REACT NATIVE'
        ]},
        
        // Technology - AI
        { domain: 'Technology', category: 'AI', topics: ['R', 'PYTHON', 'JULIA', 'SCALA'] },
        
        // Technology - Testing
        { domain: 'Technology', category: 'TESTING', topics: ['JUNIT', 'JEST', 'PYTEST', 'SELENIUM', 'CYPRESS'] },
        
        // Technology - Cloud Computing
        { domain: 'Technology', category: 'CLOUD COMPUTING', topics: ['AWS', 'AZURE', 'GOOGLE CLOUD'] },
        
        // Maths
        { domain: 'MATHS', category: 'MATHS', topics: ['3 CLASS'] },
        
        // Science
        { domain: 'SCIENCE', category: 'SCIENCE', topics: ['3 CLASS'] },
        
        // Social
        { domain: 'SOCIAL', category: 'SOCIAL', topics: ['3 CLASS'] },
        
        // Olympiad Exams
        { domain: 'Olympiad Exams', category: 'Olympiad Exams', topics: [
          'NTSE', 'NLSTSE', 'INO', 'SOF', 'NBO', 'NIMO', 'IOEL', 'IOS', 'IOM', 
          'SILVERZONE', 'UIEO', 'UCO', 'ICSO', 'IGKO', 'IEO', 'NSO', 'IMO'
        ]},
        
        // National Level Government Exams
        { domain: 'National Level (All-India) Government Exams', category: 'National Level (All-India) Government Exams', topics: ['UPSC', 'SSC'] },
        
        // Public Sector Bank Exams
        { domain: 'Public Sector Bank (PSB) Exams', category: 'Public Sector Bank (PSB) Exams', topics: [
          'IBPS PO', 'IBPS SO', 'IBPS CLERK', 'SBI PO', 'SBI SO', 'SBI CLERK', 'SBI APPRENTICE'
        ]},
        
        // Public Sector Finance Exams
        { domain: 'Public Sector Finance Exams', category: 'Public Sector Finance Exams', topics: ['RBI', 'NABARD', 'LIC'] }
      ];

      let totalSubjects = 0;
      let totalTopics = 0;
      let totalQuizzes = 0;
      let totalQuizSets = 0;
      const processedSubjects = new Map();

      // Process each entry
      for (const entry of seedData) {
        const { domain, category, topics } = entry;
        const isTechnology = domain === 'Technology';

        // Technology: one subject per category (Programming Languages, Full Stack, etc.) with category="Technology"
        // Others: one subject per domain (MATHS, SCIENCE, Olympiad, etc.)
        const subjectKey = isTechnology ? `Technology::${category}` : domain;
        let subject = processedSubjects.get(subjectKey);

        if (!subject) {
          const subjectTitle = isTechnology ? category : domain;
          const subjectCategory = isTechnology ? 'Technology' : domain;
          subject = await Subject.findOne({
            title: subjectTitle,
            ...(isTechnology ? { category: 'Technology' } : {}),
            createdBy
          });

          if (!subject) {
            subject = new Subject({
              title: subjectTitle,
              description: `Comprehensive ${subjectTitle} learning resources with quizzes and practice tests`,
              category: subjectCategory,
              level: 'beginner',
              isActive: true,
              requiresApproval: false,
              createdBy: createdBy,
              order: totalSubjects + 1,
              courseCategories: []
            });
            subject = await subject.save();
            console.log(`✅ Created subject: ${subjectTitle}`);
            totalSubjects++;
          }
          processedSubjects.set(subjectKey, subject);
        }

        // Process each topic: Technology = tech name only (C, HTML); Others = "Category - Name"
        for (let i = 0; i < topics.length; i++) {
          const topicName = topics[i];
          const fullTopicName = isTechnology ? topicName : `${category} - ${topicName}`;

          let topic = await Topic.findOne({
            subjectId: subject._id,
            title: fullTopicName,
            createdBy: createdBy
          });

          if (!topic) {
            topic = new Topic({
              subjectId: subject._id,
              title: fullTopicName,
              description: `Learn and practice ${topicName} with comprehensive quizzes and theory content`,
              order: totalTopics + 1,
              requiredQuizzesToUnlock: 0,
              isActive: true,
              createdBy: createdBy
            });
            topic = await topic.save();
            console.log(`    ✅ Created topic: ${fullTopicName}`);
            totalTopics++;
          }

          // Create cheatsheet for this topic
          const cheatsheet = await Cheatsheet.findOne({
            topicId: topic._id
          });

          if (!cheatsheet) {
            const cheatsheetContent = this.generateCheatsheetContent(topicName, category, domain);
            const newCheatsheet = new Cheatsheet({
              topicId: topic._id,
              content: cheatsheetContent,
              isActive: true,
              createdBy: createdBy
            });
            await newCheatsheet.save();
            console.log(`      ✅ Created cheatsheet`);
          }

          // Create quiz for this topic
          // IMPORTANT: Every quiz MUST be linked to a topic via QuizSet
          const quizTitle = `${topicName} - Practice Quiz`;
          let quiz = await Quiz.findOne({
            title: quizTitle,
            createdBy: createdBy
          });

          // Generate new questions using the updated question bank
          const questions = this.generateQuizQuestions(topicName, category, domain, subject._id);
          
          // Generate course category ID for this specific topic
          const courseCategoryId = this.generateCourseCategoryId(domain, category, topicName);

          if (!quiz) {
            // Create new quiz
            quiz = new Quiz({
              title: quizTitle,
              description: `Test your knowledge of ${topicName} with this comprehensive practice quiz`,
              durationMinutes: 30,
              availableToEveryone: true,
              isActive: true,
              useSections: false,
              questions: questions,
              createdBy: createdBy,
              courseCategories: [courseCategoryId] // Link to course category
            });
            quiz = await quiz.save();
            console.log(`      ✅ Created quiz: ${quizTitle} (${questions.length} questions)`);
            totalQuizzes++;
          } else {
            // Update existing quiz with new questions (to get topic-specific questions)
            const oldQuestionCount = quiz.questions ? quiz.questions.length : 0;
            quiz.questions = questions;
            quiz.courseCategories = [courseCategoryId];
            quiz.description = `Test your knowledge of ${topicName} with this comprehensive practice quiz`;
            await quiz.save();
            console.log(`      🔄 Updated quiz: ${quizTitle} (${oldQuestionCount} → ${questions.length} questions)`);
            totalQuizzes++;
          }

          // CRITICAL: Create QuizSet to link quiz to topic
          // Every quiz MUST have at least one QuizSet linking it to a topic
          const quizSet = await QuizSet.findOne({
            topicId: topic._id,
            quizId: quiz._id
          });

          if (!quizSet) {
            const newQuizSet = new QuizSet({
              topicId: topic._id,
              quizId: quiz._id,
              setName: `${topicName} Practice Set`,
              order: 1,
              isActive: true,
              assignedBy: createdBy
            });
            await newQuizSet.save();
            console.log(`      ✅ Created quiz set (quiz linked to topic)`);
            totalQuizSets++;
          } else {
            console.log(`      ℹ️  Quiz set already exists (quiz already linked to topic)`);
          }
          
          // Verify the link was created
          if (!quizSet && !await QuizSet.findOne({ topicId: topic._id, quizId: quiz._id })) {
            throw new Error(`Failed to create QuizSet linking quiz "${quizTitle}" to topic "${fullTopicName}"`);
          }

          // Sub-topics: for PROGRAMMING LANGAUGES or DATABASES topics in SUB_TOPICS_MAP, create child topics + quizzes
          const subTopicNames = isTechnology && (category === 'PROGRAMMING LANGAUGES' || category === 'DATABASES') ? (SUB_TOPICS_MAP[topicName] || null) : null;
          if (subTopicNames && subTopicNames.length > 0) {
            for (let sIdx = 0; sIdx < subTopicNames.length; sIdx++) {
              const subName = subTopicNames[sIdx];
              const subTitle = `${topicName} - ${subName}`;

              let subTopic = await Topic.findOne({
                subjectId: subject._id,
                parentTopicId: topic._id,
                title: subTitle,
                createdBy: createdBy
              });

              if (!subTopic) {
                subTopic = new Topic({
                  subjectId: subject._id,
                  parentTopicId: topic._id,
                  title: subTitle,
                  description: `Learn and practice ${subName} in ${topicName}`,
                  order: totalTopics + 1,
                  requiredQuizzesToUnlock: 0,
                  isActive: true,
                  createdBy: createdBy
                });
                subTopic = await subTopic.save();
                console.log(`      ✅ Created sub-topic: ${subTitle}`);
                totalTopics++;
              }

              const subQuizTitle = `${topicName} - ${subName} - Practice Quiz`;
              let subQuiz = await Quiz.findOne({ title: subQuizTitle, createdBy: createdBy });

              const subQuestions = this.generateQuizQuestions(`${topicName} - ${subName}`, category, domain, subject._id);
              const subCourseCatId = this.generateCourseCategoryId(domain, category, `${topicName}_${subName}`);

              if (!subQuiz) {
                subQuiz = new Quiz({
                  title: subQuizTitle,
                  description: `Test your knowledge of ${subName} in ${topicName}`,
                  durationMinutes: 15,
                  availableToEveryone: true,
                  isActive: true,
                  useSections: false,
                  questions: subQuestions,
                  createdBy: createdBy,
                  courseCategories: [subCourseCatId]
                });
                subQuiz = await subQuiz.save();
                console.log(`        ✅ Created quiz: ${subQuizTitle} (${subQuestions.length} questions)`);
                totalQuizzes++;
              } else {
                subQuiz.questions = subQuestions;
                subQuiz.courseCategories = [subCourseCatId];
                subQuiz.description = `Test your knowledge of ${subName} in ${topicName}`;
                await subQuiz.save();
              }

              let subQuizSet = await QuizSet.findOne({ topicId: subTopic._id, quizId: subQuiz._id });
              if (!subQuizSet) {
                subQuizSet = new QuizSet({
                  topicId: subTopic._id,
                  quizId: subQuiz._id,
                  setName: `${subName} Practice Set`,
                  order: sIdx + 1,
                  isActive: true,
                  assignedBy: createdBy
                });
                await subQuizSet.save();
                console.log(`        ✅ Created quiz set for sub-topic`);
                totalQuizSets++;
              }
            }
          }
        }
      }

      console.log(`\n✅ Comprehensive Quizzes Seed Complete!`);
      console.log(`   - Subjects: ${totalSubjects}`);
      console.log(`   - Topics: ${totalTopics}`);
      console.log(`   - Quizzes: ${totalQuizzes}`);
      console.log(`   - Quiz Sets: ${totalQuizSets}`);
    } catch (error) {
      console.error('❌ Error seeding comprehensive quizzes:', error);
      throw error;
    }
  }

  /**
   * Generate course category ID based on domain, category, and topic
   * This matches the format used in the frontend profile page
   * Format: "Technology_Programming Languages_JavaScript" or "Technology_Programming Languages"
   */
  static generateCourseCategoryId(domain, category, topic = null) {
    // Normalize domain name to match frontend
    let normalizedDomain = domain;
    if (domain === 'Technology') {
      normalizedDomain = 'Technology';
    } else if (domain === 'MATHS') {
      normalizedDomain = 'Maths';
    } else if (domain === 'SCIENCE') {
      normalizedDomain = 'Physics'; // Or keep as Science based on frontend
    } else if (domain === 'SOCIAL') {
      normalizedDomain = 'Social';
    }
    
    // Normalize category name
    let normalizedCategory = category;
    if (category === 'PROGRAMMING LANGAUGES') {
      normalizedCategory = 'Programming Languages';
    } else if (category === 'FULL STACK') {
      normalizedCategory = 'Full Stack';
    } else if (category === 'DATABASES') {
      normalizedCategory = 'Databases';
    } else if (category === 'MOBILE DEVELOPMENT') {
      normalizedCategory = 'Mobile Development';
    } else if (category === 'AI') {
      normalizedCategory = 'AI';
    } else if (category === 'TESTING') {
      normalizedCategory = 'Testing';
    } else if (category === 'CLOUD COMPUTING') {
      normalizedCategory = 'Cloud Computing';
    }
    
    if (topic) {
      // For specific topics: "Technology_Programming Languages_JavaScript"
      return `${normalizedDomain}_${normalizedCategory}_${topic}`;
    } else {
      // For categories: "Technology_Programming Languages"
      return `${normalizedDomain}_${normalizedCategory}`;
    }
  }

  /**
   * Generate cheatsheet content for a topic
   */
  static generateCheatsheetContent(topicName, category, domain) {
    return `# ${topicName} - Study Guide

## Introduction

Welcome to the ${topicName} study guide. This comprehensive resource covers essential concepts, best practices, and key information you need to master ${topicName} in the ${category} category.

## Key Concepts

### Fundamentals
- Core concepts and principles of ${topicName}
- Basic syntax and structure
- Common patterns and practices
- Essential terminology

### Advanced Topics
- Advanced features and techniques
- Best practices and optimization
- Real-world applications
- Industry standards

### ${category} Specific
- How ${topicName} fits into ${category}
- Integration with other technologies
- Common use cases
- Performance considerations

## Practice Tips

1. **Regular Practice**: Consistent practice is key to mastering ${topicName}
2. **Understand Concepts**: Don't just memorize - understand the underlying concepts
3. **Build Projects**: Apply what you learn in real projects
4. **Review Regularly**: Regular review helps reinforce learning
5. **Take Quizzes**: Test your knowledge with practice quizzes

## Resources

- Official documentation
- Community forums and discussions
- Practice exercises and coding challenges
- Video tutorials and courses
- Books and reference materials

## Next Steps

After completing this guide, attempt the practice quiz to test your understanding of ${topicName}.

Good luck with your ${topicName} journey! 🚀
`;
  }

  /**
   * Generate quiz questions for a topic
   * Uses real-world questions from question bank when available
   */
  static generateQuizQuestions(topicName, category, domain, subjectId) {
    const numQuestions = 20; // 20 questions per quiz
    
    // Get real-world questions for this topic, considering category/domain context
    const questionData = getQuestionsForTopic(topicName, category, domain, numQuestions);
    
    // Convert to quiz question format
    const questions = questionData.map((q, index) => {
      // Distribute difficulty: 40% easy, 40% medium, 20% hard
      let difficulty = q.difficulty;
      if (!difficulty) {
        const ratio = index / numQuestions;
        if (ratio < 0.4) difficulty = 'easy';
        else if (ratio < 0.8) difficulty = 'medium';
        else difficulty = 'hard';
      }
      
      return {
        questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
        questionText: q.question,
        options: q.options,
        correctOptionIndex: q.correct,
        marks: difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1,
        negativeMarks: difficulty === 'hard' ? 0.5 : 0,
        difficulty: difficulty
      };
    });

    return questions;
  }
}

module.exports = ComprehensiveQuizzesSeed;

