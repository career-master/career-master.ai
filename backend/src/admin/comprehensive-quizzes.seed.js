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
 * Covers Technology domain: categories (subjects) → topics → sub-topics.
 */
const SUB_TOPICS_MAP = {
  // Programming Languages
  'C': ['Intro', 'Data Types', 'Operators', 'Control Flow', 'Functions', 'Pointers', 'Arrays & Strings'],
  'C++': ['Intro', 'OOP Basics', 'Inheritance', 'Templates', 'STL'],
  'JAVA': ['Intro', 'OOP', 'Collections', 'Exceptions', 'Multithreading'],
  'PYTHON': ['Intro', 'Data Types', 'Functions', 'OOP', 'Modules'],
  'PHP': ['Intro', 'Syntax', 'Functions', 'OOP', 'Database with MySQL'],
  'C#': ['Intro', 'OOP', 'LINQ', 'ASP.NET Basics', 'Collections'],
  'RUBY': ['Intro', 'Syntax', 'Blocks & Iterators', 'OOP', 'Rails Basics'],
  'GO': ['Intro', 'Types', 'Concurrency', 'Packages', 'Interfaces'],
  'RUST': ['Intro', 'Ownership', 'Structs & Enums', 'Error Handling', 'Concurrency'],

  // Full Stack
  'HTML': ['Structure', 'Forms', 'Semantic HTML', 'Accessibility', 'Media'],
  'CSS': ['Selectors', 'Layout Flex Grid', 'Responsive', 'Animations', 'Preprocessors'],
  'JAVASCRIPT': ['Basics', 'DOM', 'Async', 'ES6+', 'Modules'],
  'BOOTSTRAP': ['Grid', 'Components', 'Utilities', 'Customization', 'Responsive'],
  'NODEJS': ['Basics', 'Express', 'NPM', 'File System', 'Async'],
  'EXPRESSJS': ['Routing', 'Middleware', 'REST API', 'Error Handling', 'Security'],
  'REACTJS': ['Components', 'Hooks', 'State', 'Routing', 'Context'],
  'NEXTJS': ['Pages', 'API Routes', 'SSR', 'Routing', 'Deployment'],
  'TAILWIND': ['Utility-First', 'Layout', 'Responsive', 'Components', 'Customization'],
  'TYPESCRIPT': ['Types', 'Interfaces', 'Generics', 'Config', 'with React'],
  'DART': ['Basics', 'OOP', 'Async', 'Flutter Basics', 'Null Safety'],
  'ANGULAR': ['Components', 'Services', 'Routing', 'Forms', 'RxJS'],
  'VUEJS': ['Components', 'Composition API', 'Routing', 'State', 'Vuex Pinia'],
  'SPRING BOOT': ['Basics', 'REST', 'Data JPA', 'Security', 'Testing'],
  'DJANGO': ['Models', 'Views', 'Templates', 'REST', 'Admin'],
  'FLASK': ['Routing', 'Templates', 'Forms', 'Database', 'REST'],
  'ASP.NET': ['MVC', 'API', 'Entity Framework', 'Identity', 'Deployment'],
  'MATERIAL UI': ['Components', 'Theming', 'Layout', 'Data Display', 'Responsive'],
  'CHAKRA UI': ['Components', 'Theming', 'Layout', 'Forms', 'Responsive'],
  'SASS': ['Variables', 'Nesting', 'Mixins', 'Partials', 'Functions'],

  // Databases
  'MONGODB': ['Intro', 'CRUD Operations', 'Aggregation', 'Indexes', 'Data Modeling'],
  'MYSQL': ['Intro', 'Queries', 'Joins', 'Indexes', 'Transactions'],
  'ORACLE': ['Intro', 'PL/SQL', 'Administration', 'Performance', 'Security'],
  'SQL SERVER': ['Intro', 'T-SQL', 'Administration', 'SSIS', 'Security'],
  'FIREBASE': ['Auth', 'Firestore', 'Realtime DB', 'Storage', 'Hosting'],
  'POSTGRESQL': ['Intro', 'Advanced Queries', 'Indexes', 'JSON', 'Extensions'],
  'MARIADB': ['Intro', 'Compatibility', 'Replication', 'Storage Engines', 'Security'],
  'REDIS': ['Data Types', 'Caching', 'Pub/Sub', 'Persistence', 'Cluster'],
  'CASSANDRA': ['Data Model', 'CQL', 'Architecture', 'Tuning', 'Consistency'],
  'ELASTICSEARCH': ['Indexing', 'Search', 'Aggregations', 'Mapping', 'Performance'],

  // Mobile Development
  'SWIFT': ['Basics', 'OOP', 'UIKit', 'SwiftUI', 'Concurrency'],
  'KOTLIN': ['Basics', 'OOP', 'Android', 'Coroutines', 'Null Safety'],
  'FLUTTER': ['Widgets', 'State', 'Navigation', 'APIs', 'Testing'],
  'REACT NATIVE': ['Components', 'Navigation', 'State', 'Native Modules', 'Performance'],

  // AI
  'R': ['Basics', 'Data Frames', 'Visualization', 'Statistics', 'Modeling'],
  'JULIA': ['Basics', 'Data Science', 'Plotting', 'Parallelism', 'Packages'],
  'SCALA': ['Basics', 'OOP', 'Functional', 'Collections', 'Concurrency'],

  // Testing
  'JUNIT': ['Basics', 'Assertions', 'Annotations', 'Parameterized', 'Mocking'],
  'JEST': ['Setup', 'Matchers', 'Mocking', 'Async', 'Snapshots'],
  'PYTEST': ['Fixtures', 'Assertions', 'Parametrize', 'Plugins', 'Coverage'],
  'SELENIUM': ['Locators', 'Actions', 'Waits', 'Page Object', 'Cross-Browser'],
  'CYPRESS': ['Selectors', 'Commands', 'Fixtures', 'API Testing', 'Best Practices'],

  // Cloud Computing
  'AWS': ['EC2', 'S3', 'Lambda', 'IAM', 'RDS'],
  'AZURE': ['VMs', 'Storage', 'Functions', 'AD', 'Cosmos DB'],
  'GOOGLE CLOUD': ['Compute Engine', 'Cloud Storage', 'Functions', 'IAM', 'BigQuery']
};

/** Technology: one subject per tech (C, C++, HTML). Category = PROGRAMMING LANGAUGES, FULL STACK, etc. Topics = from SUB_TOPICS_MAP. */
const TECHNOLOGY_CATEGORIES = [
  { category: 'PROGRAMMING LANGAUGES', techNames: ['C', 'C++', 'JAVA', 'PYTHON', 'PHP', 'C#', 'RUBY', 'GO', 'RUST'] },
  { category: 'FULL STACK', techNames: ['HTML', 'CSS', 'JAVASCRIPT', 'BOOTSTRAP', 'NODEJS', 'EXPRESSJS', 'REACTJS', 'NEXTJS', 'TAILWIND', 'TYPESCRIPT', 'DART', 'ANGULAR', 'VUEJS', 'SPRING BOOT', 'DJANGO', 'FLASK', 'ASP.NET', 'MATERIAL UI', 'CHAKRA UI', 'SASS'] },
  { category: 'DATABASES', techNames: ['MONGODB', 'MYSQL', 'ORACLE', 'SQL SERVER', 'FIREBASE', 'POSTGRESQL', 'MARIADB', 'REDIS', 'CASSANDRA', 'ELASTICSEARCH'] },
  { category: 'MOBILE DEVELOPMENT', techNames: ['SWIFT', 'KOTLIN', 'FLUTTER', 'REACT NATIVE'] },
  { category: 'AI', techNames: ['R', 'PYTHON', 'JULIA', 'SCALA'] },
  { category: 'TESTING', techNames: ['JUNIT', 'JEST', 'PYTEST', 'SELENIUM', 'CYPRESS'] },
  { category: 'CLOUD COMPUTING', techNames: ['AWS', 'AZURE', 'GOOGLE CLOUD'] }
];

/** Olympiad Exams: one subject per exam (NLSTSE, INO, SOF, etc.). Domain & Category = Olympiad Exams. */
const OLYMPIAD_EXAM_NAMES = [
  'NTSE', 'NLSTSE', 'INO', 'SOF', 'NBO', 'NIMO', 'IOEL', 'IOS', 'IOM',
  'SILVERZONE', 'UIEO', 'UCO', 'ICSO', 'IGKO', 'IEO', 'NSO', 'IMO', 'NCERT', 'ISTSE'
];
const OLYMPIAD_TOPICS = ['Syllabus & Pattern', 'Practice Tests', 'Previous Papers'];

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

      // Data structure: Domain → Category → Subject (title) / Topics (list)
      // Technology: one Subject per tech (C, C++, HTML) so Subject dropdown shows C, C++; Category = PROGRAMMING LANGAUGES etc.; Topics = Intro, Data Types (from SUB_TOPICS_MAP)
      const technologyEntries = TECHNOLOGY_CATEGORIES.flatMap(({ category, techNames }) =>
        techNames.map((tech) => ({
          domain: 'Technology',
          category,
          subjectTitle: tech,
          subjectCategory: category,
          topics: SUB_TOPICS_MAP[tech] || [tech]
        }))
      );
      const seedData = [
        ...technologyEntries,

        // Academic classes 3–10 (Domain = class, Category = ACADEMIC)
        // Class 3
        { domain: '3 CLASS', category: 'ACADEMIC', subjectTitle: 'MATHS-3', subjectCategory: 'ACADEMIC', topics: ['Numbers and Operations', 'Geometry and Measurement', 'Data Handling and Patterns'] },
        { domain: '3 CLASS', category: 'ACADEMIC', subjectTitle: 'SCIENCE-3', subjectCategory: 'ACADEMIC', topics: ['Living Things and Habitat', 'Matter and Materials', 'Environment and Weather'] },
        { domain: '3 CLASS', category: 'ACADEMIC', subjectTitle: 'SOCIAL-3', subjectCategory: 'ACADEMIC', topics: ['Family and Community', 'Our Country and States', 'History and Culture'] },
        { domain: '3 CLASS', category: 'ACADEMIC', subjectTitle: 'ENGLISH-3', subjectCategory: 'ACADEMIC', topics: ['Grammar and Sentences', 'Reading Comprehension', 'Writing Skills'] },
        { domain: '3 CLASS', category: 'ACADEMIC', subjectTitle: 'TELUGU-3', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },
        { domain: '3 CLASS', category: 'ACADEMIC', subjectTitle: 'HINDI-3', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },

        // Class 4
        { domain: '4 CLASS', category: 'ACADEMIC', subjectTitle: 'MATHS-4', subjectCategory: 'ACADEMIC', topics: ['Numbers and Operations', 'Geometry and Measurement', 'Data Handling and Patterns'] },
        { domain: '4 CLASS', category: 'ACADEMIC', subjectTitle: 'SCIENCE-4', subjectCategory: 'ACADEMIC', topics: ['Living Things and Habitat', 'Matter and Materials', 'Environment and Weather'] },
        { domain: '4 CLASS', category: 'ACADEMIC', subjectTitle: 'SOCIAL-4', subjectCategory: 'ACADEMIC', topics: ['Family and Community', 'Our Country and States', 'History and Culture'] },
        { domain: '4 CLASS', category: 'ACADEMIC', subjectTitle: 'ENGLISH-4', subjectCategory: 'ACADEMIC', topics: ['Grammar and Sentences', 'Reading Comprehension', 'Writing Skills'] },
        { domain: '4 CLASS', category: 'ACADEMIC', subjectTitle: 'TELUGU-4', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },
        { domain: '4 CLASS', category: 'ACADEMIC', subjectTitle: 'HINDI-4', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },

        // Class 5
        { domain: '5 CLASS', category: 'ACADEMIC', subjectTitle: 'MATHS-5', subjectCategory: 'ACADEMIC', topics: ['Numbers and Operations', 'Geometry and Measurement', 'Data Handling and Patterns'] },
        { domain: '5 CLASS', category: 'ACADEMIC', subjectTitle: 'SCIENCE-5', subjectCategory: 'ACADEMIC', topics: ['Living Things and Habitat', 'Matter and Materials', 'Environment and Weather'] },
        { domain: '5 CLASS', category: 'ACADEMIC', subjectTitle: 'SOCIAL-5', subjectCategory: 'ACADEMIC', topics: ['Family and Community', 'Our Country and States', 'History and Culture'] },
        { domain: '5 CLASS', category: 'ACADEMIC', subjectTitle: 'ENGLISH-5', subjectCategory: 'ACADEMIC', topics: ['Grammar and Sentences', 'Reading Comprehension', 'Writing Skills'] },
        { domain: '5 CLASS', category: 'ACADEMIC', subjectTitle: 'TELUGU-5', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },
        { domain: '5 CLASS', category: 'ACADEMIC', subjectTitle: 'HINDI-5', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },

        // Class 6
        { domain: '6 CLASS', category: 'ACADEMIC', subjectTitle: 'MATHS-6', subjectCategory: 'ACADEMIC', topics: ['Numbers and Operations', 'Geometry and Measurement', 'Data Handling and Patterns'] },
        { domain: '6 CLASS', category: 'ACADEMIC', subjectTitle: 'SCIENCE-6', subjectCategory: 'ACADEMIC', topics: ['Living Things and Habitat', 'Matter and Materials', 'Environment and Weather'] },
        { domain: '6 CLASS', category: 'ACADEMIC', subjectTitle: 'SOCIAL-6', subjectCategory: 'ACADEMIC', topics: ['Family and Community', 'Our Country and States', 'History and Culture'] },
        { domain: '6 CLASS', category: 'ACADEMIC', subjectTitle: 'ENGLISH-6', subjectCategory: 'ACADEMIC', topics: ['Grammar and Sentences', 'Reading Comprehension', 'Writing Skills'] },
        { domain: '6 CLASS', category: 'ACADEMIC', subjectTitle: 'TELUGU-6', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },
        { domain: '6 CLASS', category: 'ACADEMIC', subjectTitle: 'HINDI-6', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },

        // Class 7
        { domain: '7 CLASS', category: 'ACADEMIC', subjectTitle: 'MATHS-7', subjectCategory: 'ACADEMIC', topics: ['Numbers and Operations', 'Geometry and Measurement', 'Data Handling and Patterns'] },
        { domain: '7 CLASS', category: 'ACADEMIC', subjectTitle: 'SCIENCE-7', subjectCategory: 'ACADEMIC', topics: ['Living Things and Habitat', 'Matter and Materials', 'Environment and Weather'] },
        { domain: '7 CLASS', category: 'ACADEMIC', subjectTitle: 'SOCIAL-7', subjectCategory: 'ACADEMIC', topics: ['Family and Community', 'Our Country and States', 'History and Culture'] },
        { domain: '7 CLASS', category: 'ACADEMIC', subjectTitle: 'ENGLISH-7', subjectCategory: 'ACADEMIC', topics: ['Grammar and Sentences', 'Reading Comprehension', 'Writing Skills'] },
        { domain: '7 CLASS', category: 'ACADEMIC', subjectTitle: 'TELUGU-7', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },
        { domain: '7 CLASS', category: 'ACADEMIC', subjectTitle: 'HINDI-7', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },

        // Class 8
        { domain: '8 CLASS', category: 'ACADEMIC', subjectTitle: 'MATHS-8', subjectCategory: 'ACADEMIC', topics: ['Numbers and Operations', 'Geometry and Measurement', 'Data Handling and Patterns'] },
        { domain: '8 CLASS', category: 'ACADEMIC', subjectTitle: 'SCIENCE-8', subjectCategory: 'ACADEMIC', topics: ['Living Things and Habitat', 'Matter and Materials', 'Environment and Weather'] },
        { domain: '8 CLASS', category: 'ACADEMIC', subjectTitle: 'SOCIAL-8', subjectCategory: 'ACADEMIC', topics: ['Family and Community', 'Our Country and States', 'History and Culture'] },
        { domain: '8 CLASS', category: 'ACADEMIC', subjectTitle: 'ENGLISH-8', subjectCategory: 'ACADEMIC', topics: ['Grammar and Sentences', 'Reading Comprehension', 'Writing Skills'] },
        { domain: '8 CLASS', category: 'ACADEMIC', subjectTitle: 'TELUGU-8', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },
        { domain: '8 CLASS', category: 'ACADEMIC', subjectTitle: 'HINDI-8', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },

        // Class 9
        { domain: '9 CLASS', category: 'ACADEMIC', subjectTitle: 'MATHS-9', subjectCategory: 'ACADEMIC', topics: ['Numbers and Operations', 'Geometry and Measurement', 'Data Handling and Patterns'] },
        { domain: '9 CLASS', category: 'ACADEMIC', subjectTitle: 'SCIENCE-9', subjectCategory: 'ACADEMIC', topics: ['Living Things and Habitat', 'Matter and Materials', 'Environment and Weather'] },
        { domain: '9 CLASS', category: 'ACADEMIC', subjectTitle: 'SOCIAL-9', subjectCategory: 'ACADEMIC', topics: ['Family and Community', 'Our Country and States', 'History and Culture'] },
        { domain: '9 CLASS', category: 'ACADEMIC', subjectTitle: 'ENGLISH-9', subjectCategory: 'ACADEMIC', topics: ['Grammar and Sentences', 'Reading Comprehension', 'Writing Skills'] },
        { domain: '9 CLASS', category: 'ACADEMIC', subjectTitle: 'TELUGU-9', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },
        { domain: '9 CLASS', category: 'ACADEMIC', subjectTitle: 'HINDI-9', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },

        // Class 10
        { domain: '10 CLASS', category: 'ACADEMIC', subjectTitle: 'MATHS-10', subjectCategory: 'ACADEMIC', topics: ['Numbers and Operations', 'Geometry and Measurement', 'Data Handling and Patterns'] },
        { domain: '10 CLASS', category: 'ACADEMIC', subjectTitle: 'SCIENCE-10', subjectCategory: 'ACADEMIC', topics: ['Living Things and Habitat', 'Matter and Materials', 'Environment and Weather'] },
        { domain: '10 CLASS', category: 'ACADEMIC', subjectTitle: 'SOCIAL-10', subjectCategory: 'ACADEMIC', topics: ['Family and Community', 'Our Country and States', 'History and Culture'] },
        { domain: '10 CLASS', category: 'ACADEMIC', subjectTitle: 'ENGLISH-10', subjectCategory: 'ACADEMIC', topics: ['Grammar and Sentences', 'Reading Comprehension', 'Writing Skills'] },
        { domain: '10 CLASS', category: 'ACADEMIC', subjectTitle: 'TELUGU-10', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },
        { domain: '10 CLASS', category: 'ACADEMIC', subjectTitle: 'HINDI-10', subjectCategory: 'ACADEMIC', topics: ['Grammar and Vocabulary', 'Reading Comprehension', 'Writing Practice'] },

        // INTER (10+2) - Grade 11 & 12
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'MATHS-11', subjectCategory: 'ACADEMIC', topics: ['Sets and Functions', 'Algebra', 'Coordinate Geometry', 'Calculus Basics', 'Trigonometry'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'PHYSICS-11', subjectCategory: 'ACADEMIC', topics: ['Units and Measurement', 'Kinematics', 'Laws of Motion', 'Work Energy and Power', 'System of Particles'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'CHEMISTRY-11', subjectCategory: 'ACADEMIC', topics: ['Basic Concepts', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding', 'States of Matter'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'BOTANY-11', subjectCategory: 'ACADEMIC', topics: ['Cell Biology', 'Plant Kingdom', 'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Cell Division'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'ZOOLOZY-11', subjectCategory: 'ACADEMIC', topics: ['Animal Kingdom', 'Structural Organisation', 'Cell and Cell Cycle', 'Digestion and Absorption', 'Breathing and Exchange of Gases'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'MATHS-12', subjectCategory: 'ACADEMIC', topics: ['Relations and Functions', 'Algebra', 'Calculus', 'Vectors and 3D Geometry', 'Linear Programming'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'PHYSICS-12', subjectCategory: 'ACADEMIC', topics: ['Electrostatics', 'Current Electricity', 'Magnetic Effects', 'Electromagnetic Induction', 'Optics and Waves'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'CHEMISTRY-12', subjectCategory: 'ACADEMIC', topics: ['Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Organic Chemistry'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'BOTANY-12', subjectCategory: 'ACADEMIC', topics: ['Reproduction in Plants', 'Genetics and Evolution', 'Biology in Human Welfare', 'Ecosystem', 'Biodiversity'] },
        { domain: 'INTER (10+2)', category: 'ACADEMIC', subjectTitle: 'ZOOLOZY-12', subjectCategory: 'ACADEMIC', topics: ['Reproduction', 'Genetics and Evolution', 'Biology and Human Welfare', 'Biotechnology', 'Ecology'] },

        // Olympiad Exams: Domain = Olympiad Exams, Category = Olympiad Exams, Subject = NTSE, NLSTSE, INO, etc. (one per exam)
        ...OLYMPIAD_EXAM_NAMES.map((examName) => ({
          domain: 'Olympiad Exams',
          category: 'Olympiad Exams',
          subjectTitle: examName,
          subjectCategory: 'Olympiad Exams',
          topics: OLYMPIAD_TOPICS
        })),

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
      let levelCounter = 0;
      const LEVELS = ['basic', 'hard'];
      const processedSubjects = new Map();

      // Process each entry
      for (const entry of seedData) {
        const { domain, category, topics } = entry;
        const isTechnology = domain === 'Technology';
        const explicitSubjectTitle = entry.subjectTitle;
        const explicitSubjectCategory = entry.subjectCategory;

        const subjectDomain = domain;
        const subjectTitle = explicitSubjectTitle || (isTechnology ? category : domain);
        const subjectCategory = explicitSubjectCategory || (isTechnology ? 'Technology' : domain);

        // Technology: one subject per tech (C, C++, HTML) so Subject dropdown shows tech names; key = Technology::SubjectTitle
        // Others: one subject per domain, or per (domain + subjectTitle) when provided (class-wise academics)
        const subjectKey = explicitSubjectTitle
          ? `${subjectDomain}::${subjectTitle}`
          : isTechnology
            ? `Technology::${category}`
            : subjectTitle;

        let subject = processedSubjects.get(subjectKey);

        if (!subject) {
          const findQuery = {
            title: subjectTitle,
            category: subjectCategory,
            createdBy
          };

          subject = await Subject.findOne(findQuery);

          if (!subject) {
            subject = new Subject({
              title: subjectTitle,
              description: `Comprehensive ${subjectTitle} learning resources with quizzes and practice tests`,
              domain: subjectDomain,
              category: subjectCategory,
              level: 'basic',
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

          const mainLevel = LEVELS[levelCounter++ % 2];
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
              courseCategories: [courseCategoryId], // Link to course category
              level: mainLevel
            });
            quiz = await quiz.save();
            console.log(`      ✅ Created quiz: ${quizTitle} (${questions.length} questions) [${mainLevel}]`);
            totalQuizzes++;
          } else {
            // Update existing quiz with new questions (to get topic-specific questions)
            const oldQuestionCount = quiz.questions ? quiz.questions.length : 0;
            quiz.questions = questions;
            quiz.courseCategories = [courseCategoryId];
            quiz.description = `Test your knowledge of ${topicName} with this comprehensive practice quiz`;
            quiz.level = mainLevel;
            await quiz.save();
            console.log(`      🔄 Updated quiz: ${quizTitle} (${oldQuestionCount} → ${questions.length} questions) [${mainLevel}]`);
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
              quizNumber: i + 1,
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

          // Sub-topics: for any Technology topic in SUB_TOPICS_MAP, create child topics + quizzes (categories → subjects → topics → sub-topics)
          const subTopicNames = isTechnology ? (SUB_TOPICS_MAP[topicName] || null) : null;
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
              const subLevel = LEVELS[levelCounter++ % 2];

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
                  courseCategories: [subCourseCatId],
                  level: subLevel
                });
                subQuiz = await subQuiz.save();
                console.log(`        ✅ Created quiz: ${subQuizTitle} (${subQuestions.length} questions) [${subLevel}]`);
                totalQuizzes++;
              } else {
                subQuiz.questions = subQuestions;
                subQuiz.courseCategories = [subCourseCatId];
                subQuiz.description = `Test your knowledge of ${subName} in ${topicName}`;
                subQuiz.level = subLevel;
                await subQuiz.save();
              }

              let subQuizSet = await QuizSet.findOne({ topicId: subTopic._id, quizId: subQuiz._id });
              if (!subQuizSet) {
                subQuizSet = new QuizSet({
                  topicId: subTopic._id,
                  quizId: subQuiz._id,
                  setName: `${subName} Practice Set`,
                  order: sIdx + 1,
                  quizNumber: sIdx + 1,
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

