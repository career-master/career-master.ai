const Subject = require('../subjects/subjects.model');
const Topic = require('../topics/topics.model');
const Quiz = require('../quiz/quiz.model');
const QuizSet = require('../quiz-sets/quiz-sets.model');
const Cheatsheet = require('../cheatsheets/cheatsheets.model');
const User = require('../user/users.model');
const { QUESTION_TYPES } = require('../quiz/question-types.config');

/**
 * Technology Quizzes Seed
 * Creates subjects, topics, quizzes, and quiz sets for all technology categories
 */
class TechnologyQuizzesSeed {
  /**
   * Seed all technology quizzes
   * @returns {Promise<void>}
   */
  static async seedTechnologyQuizzes() {
    try {
      // Find or get admin user for createdBy fields
      const adminUser = await User.findOne({ roles: { $in: ['super_admin'] } });
      if (!adminUser) {
        console.log('⚠️  No admin user found. Skipping technology quizzes seed.');
        return;
      }

      const createdBy = adminUser._id;

      // Technologies: each category = one subject, each tech = one topic (matches Programing Languages | C, Full Stack | HTML, etc.)
      const technologiesData = {
        'Programming Languages': ['C', 'C++', 'JAVA', 'PYTHON', 'PHP', 'C#', 'RUBY', 'GO', 'RUST'],
        'Full Stack': [
          'HTML', 'CSS', 'JAVASCRIPT', 'BOOTSTRAP', 'NODEJS', 'EXPRESSJS', 'REACTJS', 'NEXTJS', 'TAILWIND',
          'TYPESCRIPT', 'DART', 'ANGULAR', 'VUEJS', 'SPRING BOOT', 'DJANGO', 'FLASK', 'ASP.NET',
          'MATERIAL UI', 'CHAKRA UI', 'SASS'
        ],
        'Databases': ['MONGODB', 'MYSQL', 'ORACLE', 'SQL SERVER', 'FIREBASE', 'POSTGRESQL', 'MARIADB', 'REDIS', 'CASSANDRA', 'ELASTICSEARCH'],
        'Mobile Development': ['SWIFT', 'KOTLIN', 'FLUTTER', 'REACT NATIVE'],
        'AI': ['R', 'PYTHON', 'JULIA', 'SCALA'],
        'Testing': ['JUNIT', 'JEST', 'PYTEST', 'SELENIUM', 'CYPRESS'],
        'Cloud Computing': ['AWS', 'AZURE', 'GOOGLE CLOUD']
      };

      // Seed technologies: one subject per category, topics = tech names
      for (const [categoryName, techList] of Object.entries(technologiesData)) {
        console.log(`\n📚 Technology: ${categoryName}`);
        let subject = await Subject.findOne({ title: categoryName, category: 'Technology', createdBy: createdBy });
        if (!subject) {
          subject = new Subject({
            title: categoryName,
            description: `Learn and practice ${categoryName.toLowerCase()} with quizzes and study material`,
            category: 'Technology',
            level: 'basic',
            isActive: true,
            requiresApproval: false,
            createdBy: createdBy,
            order: totalSubjects + 1,
            courseCategories: []
          });
          subject = await subject.save();
          console.log(`  ✅ Subject: ${categoryName}`);
          totalSubjects++;
        }
        for (let i = 0; i < techList.length; i++) {
          const techName = techList[i];
          let topic = await Topic.findOne({ subjectId: subject._id, title: techName, createdBy: createdBy });
          if (!topic) {
            topic = new Topic({
              subjectId: subject._id,
              title: techName,
              description: `Practice ${techName} with quizzes and theory`,
              order: i + 1,
              requiredQuizzesToUnlock: 0,
              isActive: true,
              createdBy: createdBy
            });
            topic = await topic.save();
            totalTopics++;
            console.log(`    ✅ Topic: ${techName}`);
          }
          let cheatsheet = await Cheatsheet.findOne({ topicId: topic._id });
          if (!cheatsheet) {
            cheatsheet = new Cheatsheet({
              topicId: topic._id,
              content: this.generateCheatsheetContent(techName, categoryName),
              contentType: 'markdown',
              createdBy: createdBy
            });
            await cheatsheet.save();
          }
          const quizTitle = `${techName} - Practice Quiz`;
          let quiz = await Quiz.findOne({ title: quizTitle, createdBy: createdBy });
          if (!quiz) {
            quiz = new Quiz({
              title: quizTitle,
              description: `Test your knowledge of ${techName}`,
              durationMinutes: 30,
              availableToEveryone: true,
              isActive: true,
              useSections: false,
              questions: this.generateQuizQuestions(techName, categoryName),
              createdBy: createdBy,
              courseCategories: []
            });
            quiz = await quiz.save();
            totalQuizzes++;
            console.log(`    ✅ Quiz: ${quizTitle}`);
          }
          let quizSet = await QuizSet.findOne({ topicId: topic._id, quizId: quiz._id });
          if (!quizSet) {
            quizSet = new QuizSet({
              topicId: topic._id,
              quizId: quiz._id,
              setName: `${techName} Practice`,
              order: 1,
              isActive: true,
              assignedBy: createdBy
            });
            await quizSet.save();
            totalQuizSets++;
          }
        }
      }

      // Other domains (MATHS, SCIENCE, Olympiads, etc.): one subject per domain, topic = "Category - Name"
      const technologyData = {
        'MATHS': {
          'MATHS': ['3 CLASS']
        },
        'SCIENCE': {
          'SCIENCE': ['3 CLASS']
        },
        'SOCIAL': {
          'SOCIAL': ['3 CLASS']
        },
        'Olympiad Exams': {
          'Olympiad Exams': [
            'NTSE', 'NLSTSE', 'INO', 'SOF', 'NBO', 'NIMO', 'IOEL', 'IOS', 'IOM', 
            'SILVERZONE', 'UIEO', 'UCO', 'ICSO', 'IGKO', 'IEO', 'NSO', 'IMO'
          ]
        },
        'National Level (All-India) Government Exams': {
          'National Level (All-India) Government Exams': ['UPSC', 'SSC']
        },
        'Public Sector Bank (PSB) Exams': {
          'Public Sector Bank (PSB) Exams': [
            'IBPS PO', 'IBPS SO', 'IBPS CLERK', 'SBI PO', 'SBI SO', 'SBI CLERK', 'SBI APPRENTICE'
          ]
        },
        'Public Sector Finance Exams': {
          'Public Sector Finance Exams': ['RBI', 'NABARD', 'LIC']
        }
      };

      let totalSubjects = 0;
      let totalTopics = 0;
      let totalQuizzes = 0;
      let totalQuizSets = 0;

      // Iterate through each domain
      for (const [domain, categories] of Object.entries(technologyData)) {
        console.log(`\n📚 Processing domain: ${domain}`);

        // Find or create subject for this domain
        let subject = await Subject.findOne({ 
          title: domain,
          createdBy: createdBy
        });

        if (!subject) {
          subject = new Subject({
            title: domain,
            description: `Comprehensive ${domain} learning resources with quizzes and practice tests`,
            category: domain,
            level: 'basic',
            isActive: true,
            requiresApproval: false,
            createdBy: createdBy,
            order: totalSubjects + 1,
            courseCategories: [] // Available to all users
          });
          subject = await subject.save();
          console.log(`✅ Created subject: ${domain}`);
          totalSubjects++;
        } else {
          console.log(`ℹ️  Subject already exists: ${domain}`);
        }

        // Iterate through categories in this domain
        for (const [category, topics] of Object.entries(categories)) {
          console.log(`  📁 Processing category: ${category}`);

          // Iterate through topics in this category
          for (const topicName of topics) {
            const fullTopicName = `${category} - ${topicName}`;
            
            // Find or create topic
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
                requiredQuizzesToUnlock: 0, // Immediately accessible
                isActive: true,
                createdBy: createdBy
              });
              topic = await topic.save();
              console.log(`    ✅ Created topic: ${fullTopicName}`);
              totalTopics++;
            } else {
              console.log(`    ℹ️  Topic already exists: ${fullTopicName}`);
            }

            // Create cheatsheet for this topic
            const cheatsheet = await Cheatsheet.findOne({
              topicId: topic._id
            });

            if (!cheatsheet) {
              const cheatsheetContent = this.generateCheatsheetContent(topicName, category);
              const newCheatsheet = new Cheatsheet({
                topicId: topic._id,
                content: cheatsheetContent,
                isActive: true,
                createdBy: createdBy
              });
              await newCheatsheet.save();
              console.log(`    ✅ Created cheatsheet for: ${fullTopicName}`);
            }

            // Create quiz for this topic
            const quizTitle = `${topicName} - Practice Quiz`;
            let quiz = await Quiz.findOne({
              title: quizTitle,
              createdBy: createdBy
            });

            if (!quiz) {
              const questions = this.generateQuizQuestions(topicName, category);
              
              quiz = new Quiz({
                title: quizTitle,
                description: `Test your knowledge of ${topicName} with this comprehensive practice quiz`,
                durationMinutes: 30,
                availableToEveryone: true,
                isActive: true,
                useSections: false,
                questions: questions,
                createdBy: createdBy,
                courseCategories: [`Technology_${category}_${topicName}`.toUpperCase().replace(/\s+/g, '_')]
              });
              quiz = await quiz.save();
              console.log(`    ✅ Created quiz: ${quizTitle} (${questions.length} questions)`);
              totalQuizzes++;
            } else {
              console.log(`    ℹ️  Quiz already exists: ${quizTitle}`);
            }

            // Create QuizSet to link quiz to topic
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
              console.log(`    ✅ Created quiz set linking quiz to topic`);
              totalQuizSets++;
            }
          }
        }
      }

      console.log(`\n✅ Technology Quizzes Seed Complete!`);
      console.log(`   - Subjects: ${totalSubjects}`);
      console.log(`   - Topics: ${totalTopics}`);
      console.log(`   - Quizzes: ${totalQuizzes}`);
      console.log(`   - Quiz Sets: ${totalQuizSets}`);
    } catch (error) {
      console.error('❌ Error seeding technology quizzes:', error);
      throw error;
    }
  }

  /**
   * Generate cheatsheet content for a topic
   * @param {string} topicName - Name of the topic
   * @param {string} category - Category of the topic
   * @returns {string} - Markdown content
   */
  static generateCheatsheetContent(topicName, category) {
    return `# ${topicName} - Study Guide

## Introduction

Welcome to the ${topicName} study guide. This comprehensive resource covers essential concepts, best practices, and key information you need to master ${topicName}.

## Key Concepts

### Fundamentals
- Core concepts and principles
- Basic syntax and structure
- Common patterns and practices

### Advanced Topics
- Advanced features and techniques
- Best practices and optimization
- Real-world applications

## Practice Tips

1. **Regular Practice**: Consistent practice is key to mastering ${topicName}
2. **Understand Concepts**: Don't just memorize - understand the underlying concepts
3. **Build Projects**: Apply what you learn in real projects
4. **Review Regularly**: Regular review helps reinforce learning

## Resources

- Official documentation
- Community forums
- Practice exercises
- Video tutorials

## Next Steps

After completing this guide, attempt the practice quiz to test your understanding.

Good luck with your ${topicName} journey! 🚀
`;
  }

  /**
   * Generate quiz questions for a topic
   * @param {string} topicName - Name of the topic
   * @param {string} category - Category of the topic
   * @returns {Array} - Array of question objects
   */
  static generateQuizQuestions(topicName, category) {
    const questions = [];
    const numQuestions = 20; // Default 20 questions per quiz

    // Generate questions based on topic
    for (let i = 1; i <= numQuestions; i++) {
      questions.push({
        questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
        questionText: `Question ${i}: What is a key concept related to ${topicName}?`,
        options: [
          `Option A for ${topicName}`,
          `Option B for ${topicName}`,
          `Option C for ${topicName} (Correct)`,
          `Option D for ${topicName}`
        ],
        correctOptionIndex: 2,
        marks: 1,
        negativeMarks: 0
      });
    }

    return questions;
  }
}

module.exports = TechnologyQuizzesSeed;

