/**
 * Question Bank
 * Real-world questions and answers for various topics
 * Each topic has a set of realistic questions with correct answers
 */

const QUESTION_BANK = {
  // Programming Languages
  'C': [
    {
      question: 'What is the correct way to declare a pointer variable in C?',
      options: ['int *ptr;', 'int ptr*;', 'pointer int ptr;', 'int &ptr;'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What does the malloc() function return if memory allocation fails?',
      options: ['0', 'NULL', '-1', 'An error code'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'Which operator is used to access the value at the address stored in a pointer?',
      options: ['&', '*', '->', '.'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the size of an int data type in C on a 32-bit system?',
      options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on compiler'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of the free() function in C?',
      options: ['Allocate memory', 'Deallocate memory', 'Initialize memory', 'Copy memory'],
      correct: 1,
      difficulty: 'easy'
    }
  ],
  
  'JAVA': [
    {
      question: 'Which keyword is used to inherit a class in Java?',
      options: ['extends', 'implements', 'inherits', 'super'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What is the default value of a boolean variable in Java?',
      options: ['true', 'false', '0', 'null'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'Which method is called when an object is created in Java?',
      options: ['main()', 'constructor', 'init()', 'create()'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the difference between == and .equals() in Java?',
      options: ['== compares references, .equals() compares values', '== compares values, .equals() compares references', 'Both are same', 'None of the above'],
      correct: 0,
      difficulty: 'hard'
    },
    {
      question: 'Which collection class is synchronized in Java?',
      options: ['ArrayList', 'HashMap', 'Vector', 'HashSet'],
      correct: 2,
      difficulty: 'medium'
    }
  ],
  
  'PYTHON': [
    {
      question: 'What is the correct way to create a list in Python?',
      options: ['list = []', 'list = list()', 'list = [] or list()', 'All of the above'],
      correct: 3,
      difficulty: 'easy'
    },
    {
      question: 'What does the len() function return for an empty list?',
      options: ['0', '1', 'None', 'Error'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What is a lambda function in Python?',
      options: ['A named function', 'An anonymous function', 'A built-in function', 'A class method'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the output of: print(2 ** 3)',
      options: ['6', '8', '9', 'Error'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'Which method is used to add an element to the end of a list?',
      options: ['append()', 'insert()', 'add()', 'push()'],
      correct: 0,
      difficulty: 'easy'
    }
  ],
  
  'JAVASCRIPT': [
    {
      question: 'What is the correct way to declare a variable in JavaScript ES6?',
      options: ['var', 'let', 'const', 'All of the above'],
      correct: 3,
      difficulty: 'easy'
    },
    {
      question: 'What does JSON.stringify() do?',
      options: ['Parse JSON string', 'Convert object to JSON string', 'Validate JSON', 'None of the above'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the result of: typeof null',
      options: ['null', 'object', 'undefined', 'boolean'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is a closure in JavaScript?',
      options: ['A function inside another function', 'A function that has access to outer scope variables', 'A built-in method', 'A data type'],
      correct: 1,
      difficulty: 'hard'
    },
    {
      question: 'What does the === operator do?',
      options: ['Compares values only', 'Compares values and types', 'Assigns value', 'None of the above'],
      correct: 1,
      difficulty: 'easy'
    }
  ],
  
  'REACTJS': [
    {
      question: 'What is JSX in React?',
      options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A CSS framework', 'A database'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the correct way to update state in React?',
      options: ['this.state.value = newValue', 'this.setState({value: newValue})', 'state.value = newValue', 'All of the above'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is a React Hook?',
      options: ['A function that lets you use state in functional components', 'A class method', 'A lifecycle method', 'A prop'],
      correct: 0,
      difficulty: 'medium'
    },
    {
      question: 'What does useEffect hook do?',
      options: ['Manages state', 'Handles side effects', 'Renders components', 'Handles events'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of keys in React lists?',
      options: ['Styling', 'Performance optimization and element identification', 'Event handling', 'State management'],
      correct: 1,
      difficulty: 'hard'
    }
  ],
  
  'NODEJS': [
    {
      question: 'What is Node.js?',
      options: ['A JavaScript framework', 'A JavaScript runtime built on Chrome\'s V8 engine', 'A database', 'A CSS library'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the purpose of package.json in Node.js?',
      options: ['To store project dependencies', 'To configure the project', 'To define scripts', 'All of the above'],
      correct: 3,
      difficulty: 'easy'
    },
    {
      question: 'What is the default port for Express.js server?',
      options: ['3000', '8080', '5000', 'No default port'],
      correct: 3,
      difficulty: 'medium'
    },
    {
      question: 'What is middleware in Express.js?',
      options: ['A database', 'Functions that execute during request-response cycle', 'A template engine', 'A routing system'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What does require() do in Node.js?',
      options: ['Exports a module', 'Imports a module', 'Creates a module', 'Deletes a module'],
      correct: 1,
      difficulty: 'easy'
    }
  ],
  
  'MONGODB': [
    {
      question: 'What type of database is MongoDB?',
      options: ['Relational', 'NoSQL', 'Graph', 'Key-Value'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is a collection in MongoDB?',
      options: ['A table', 'A group of documents', 'A database', 'A field'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the primary key in MongoDB called?',
      options: ['_id', 'id', 'key', 'primary'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'Which operator is used to update documents in MongoDB?',
      options: ['$set', '$update', '$change', '$modify'],
      correct: 0,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of indexes in MongoDB?',
      options: ['To store data', 'To improve query performance', 'To delete data', 'To create collections'],
      correct: 1,
      difficulty: 'medium'
    }
  ],

  // MongoDB sub-topics (for "MONGODB - Intro", "MONGODB - CRUD Operations", etc.)
  'MONGODB_INTRO': [
    { question: 'What is a document in MongoDB?', options: ['A row', 'A BSON (JSON-like) record in a collection', 'A table', 'A database'], correct: 1, difficulty: 'easy' },
    { question: 'What is the default _id type in MongoDB?', options: ['Integer', 'ObjectId', 'String', 'UUID'], correct: 1, difficulty: 'easy' },
    { question: 'What does BSON stand for?', options: ['Binary SQL', 'Binary JSON', 'Basic Object Notation', 'Big String Object Notation'], correct: 1, difficulty: 'medium' },
    { question: 'Which shell is used to interact with MongoDB?', options: ['mongo', 'mongosh or mongo', 'mongocli', 'mdb'], correct: 1, difficulty: 'easy' },
    { question: 'What is a database in MongoDB?', options: ['A single table', 'A container for collections', 'A single document', 'A schema'], correct: 1, difficulty: 'easy' }
  ],
  'MONGODB_CRUD_OPERATIONS': [
    { question: 'Which method inserts a single document?', options: ['insert()', 'insertOne()', 'addOne()', 'create()'], correct: 1, difficulty: 'easy' },
    { question: 'What does find() with empty filter return?', options: ['Nothing', 'All documents in the collection', 'First document only', 'Error'], correct: 1, difficulty: 'easy' },
    { question: 'Which operator is used to set a field value in update?', options: ['$set', '$put', '$update', '$value'], correct: 0, difficulty: 'easy' },
    { question: 'What does deleteMany({}) do?', options: ['Deletes one document', 'Deletes all documents in the collection', 'Deletes the collection', 'Throws error'], correct: 1, difficulty: 'medium' },
    { question: 'Which method is used to replace a document?', options: ['replaceOne()', 'updateOne() with $set', 'replace()', 'Both replaceOne() and updateOne() with replacement doc'], correct: 3, difficulty: 'medium' }
  ],
  'MONGODB_AGGREGATION': [
    { question: 'What is an aggregation pipeline?', options: ['A single operation', 'A sequence of stages that process documents', 'A type of index', 'A replication config'], correct: 1, difficulty: 'medium' },
    { question: 'What does the $match stage do?', options: ['Joins collections', 'Filters documents', 'Groups documents', 'Sorts documents'], correct: 1, difficulty: 'easy' },
    { question: 'What does $group do?', options: ['Filters', 'Groups documents by an expression and computes aggregates', 'Sorts', 'Limits'], correct: 1, difficulty: 'medium' },
    { question: 'Which stage projects or reshapes fields?', options: ['$match', '$project', '$select', '$fields'], correct: 1, difficulty: 'easy' },
    { question: 'What does $lookup do?', options: ['Filters', 'Performs a left outer join to another collection', 'Sorts', 'Groups'], correct: 1, difficulty: 'medium' }
  ],
  'MONGODB_INDEXES': [
    { question: 'What is the main purpose of an index in MongoDB?', options: ['To store more data', 'To speed up queries', 'To replace collections', 'To encrypt data'], correct: 1, difficulty: 'easy' },
    { question: 'Which method creates an index?', options: ['createIndex()', 'addIndex()', 'makeIndex()', 'index()'], correct: 0, difficulty: 'easy' },
    { question: 'What is a compound index?', options: ['An index on one field', 'An index on multiple fields', 'A hashed index', 'A text index'], correct: 1, difficulty: 'medium' },
    { question: 'What does a unique index enforce?', options: ['Speed', 'No duplicate values for the indexed key(s)', 'Encryption', 'Sharding'], correct: 1, difficulty: 'easy' },
    { question: 'Which index type supports text search?', options: ['single', 'text', 'string', 'search'], correct: 1, difficulty: 'easy' }
  ],
  'MONGODB_DATA_MODELING': [
    { question: 'What is embedded document design?', options: ['Storing related data in separate collections', 'Storing related data inside a single document', 'Using only _id', 'Normalized tables'], correct: 1, difficulty: 'medium' },
    { question: 'When is a reference (manual or DBRef) preferred?', options: ['For one-to-one only', 'When sub-documents are large or shared across many docs', 'Never in MongoDB', 'For embedded only'], correct: 1, difficulty: 'medium' },
    { question: 'What is a common one-to-many pattern in MongoDB?', options: ['Multiple collections only', 'Array of sub-documents or array of ObjectIds', 'Single flat document', 'No pattern'], correct: 1, difficulty: 'medium' },
    { question: 'What does schema flexibility in MongoDB allow?', options: ['No flexibility', 'Documents in a collection to have different fields', 'Only one schema per DB', 'Strict SQL-like schema'], correct: 1, difficulty: 'easy' },
    { question: 'What is denormalization in MongoDB modeling?', options: ['Splitting into more collections', 'Duplicating data across documents to reduce lookups', 'Using only _id', 'Avoiding indexes'], correct: 1, difficulty: 'medium' }
  ],
  
  'MYSQL': [
    {
      question: 'What is MySQL?',
      options: ['A NoSQL database', 'A relational database management system', 'A programming language', 'A web framework'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the correct SQL syntax to select all columns from a table?',
      options: ['SELECT * FROM table', 'SELECT ALL FROM table', 'SELECT table.*', 'GET * FROM table'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What is a primary key?',
      options: ['A foreign key', 'A unique identifier for each row', 'A column name', 'A table name'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What does JOIN do in SQL?',
      options: ['Combines rows from two or more tables', 'Creates a new table', 'Deletes data', 'Updates data'],
      correct: 0,
      difficulty: 'medium'
    },
    {
      question: 'What is the difference between WHERE and HAVING?',
      options: ['WHERE filters rows, HAVING filters groups', 'No difference', 'WHERE is for SELECT, HAVING is for UPDATE', 'WHERE is for groups, HAVING is for rows'],
      correct: 0,
      difficulty: 'hard'
    }
  ],
  
  // Add more topics as needed - this is a sample structure
  'HTML': [
    {
      question: 'What does HTML stand for?',
      options: ['HyperText Markup Language', 'High-level Text Markup Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'Which tag is used to create a hyperlink?',
      options: ['<link>', '<a>', '<href>', '<url>'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the correct HTML5 semantic element for navigation?',
      options: ['<nav>', '<navigation>', '<menu>', '<link>'],
      correct: 0,
      difficulty: 'medium'
    },
    {
      question: 'Which attribute is used to make an input field required?',
      options: ['mandatory', 'required', 'must', 'necessary'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the purpose of the <meta> tag?',
      options: ['To create metadata about the HTML document', 'To create a table', 'To create a form', 'To create a list'],
      correct: 0,
      difficulty: 'medium'
    }
  ],
  
  'CSS': [
    {
      question: 'What does CSS stand for?',
      options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'Which property is used to change the text color?',
      options: ['font-color', 'text-color', 'color', 'text-style'],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: 'What is the correct way to apply a class selector in CSS?',
      options: ['.classname', '#classname', 'classname', '*classname'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What is flexbox used for?',
      options: ['Database queries', 'Layout and alignment of elements', 'Image processing', 'Text formatting'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What does the z-index property control?',
      options: ['Horizontal position', 'Vertical position', 'Stacking order', 'Size'],
      correct: 2,
      difficulty: 'medium'
    }
  ],
  
  // Additional Programming Languages
  'C++': [
    {
      question: 'What is the main difference between C and C++?',
      options: ['C++ is object-oriented', 'C is faster', 'C++ has no pointers', 'C has classes'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What is a class in C++?',
      options: ['A function', 'A blueprint for creating objects', 'A variable', 'A loop'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the purpose of the new operator in C++?',
      options: ['Delete memory', 'Allocate memory dynamically', 'Create a variable', 'Initialize an array'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is inheritance in C++?',
      options: ['Copying code', 'Deriving a class from another class', 'Creating objects', 'Deleting classes'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is polymorphism in C++?',
      options: ['Multiple forms of a function', 'Single function', 'Variable types', 'Memory management'],
      correct: 0,
      difficulty: 'hard'
    }
  ],
  
  'PHP': [
    {
      question: 'What does PHP stand for?',
      options: ['Personal Home Page', 'PHP: Hypertext Preprocessor', 'Programmed HTML Pages', 'Private Hosting Protocol'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'Which symbol is used to start a PHP variable?',
      options: ['@', '$', '#', '%'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the correct way to include a file in PHP?',
      options: ['include "file.php";', 'require "file.php";', 'Both include and require', 'import file.php'],
      correct: 2,
      difficulty: 'medium'
    },
    {
      question: 'What is the difference between == and === in PHP?',
      options: ['== compares values, === compares values and types', 'No difference', '=== is for arrays only', '== is deprecated'],
      correct: 0,
      difficulty: 'medium'
    },
    {
      question: 'What is a session in PHP?',
      options: ['A database connection', 'A way to store user data across pages', 'A file', 'A variable'],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  // Full Stack Technologies
  'EXPRESSJS': [
    {
      question: 'What is Express.js?',
      options: ['A database', 'A web application framework for Node.js', 'A frontend library', 'A CSS framework'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the correct way to create an Express app?',
      options: ['const app = express()', 'const app = new Express()', 'const app = Express.create()', 'const app = require("express")()'],
      correct: 3,
      difficulty: 'easy'
    },
    {
      question: 'What does app.get() do in Express?',
      options: ['Gets data from database', 'Handles GET requests', 'Gets environment variables', 'Gets user input'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is middleware in Express?',
      options: ['A database', 'Functions that execute during request-response cycle', 'A template engine', 'A routing system'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of body-parser middleware?',
      options: ['Parse HTML', 'Parse request body', 'Parse JSON only', 'Parse cookies'],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  'NEXTJS': [
    {
      question: 'What is Next.js built on?',
      options: ['Angular', 'React', 'Vue', 'Svelte'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is Server-Side Rendering (SSR) in Next.js?',
      options: ['Rendering on client', 'Rendering on server before sending to client', 'No rendering', 'Rendering in database'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of getServerSideProps in Next.js?',
      options: ['Client-side data fetching', 'Server-side data fetching', 'Styling', 'Routing'],
      correct: 1,
      difficulty: 'hard'
    },
    {
      question: 'What file-based routing system does Next.js use?',
      options: ['pages directory', 'routes directory', 'components directory', 'config directory'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What is the purpose of next/image component?',
      options: ['Display text', 'Optimize and lazy-load images', 'Create forms', 'Handle routing'],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  // Databases
  'POSTGRESQL': [
    {
      question: 'What type of database is PostgreSQL?',
      options: ['NoSQL', 'Relational (SQL)', 'Graph', 'Document'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is ACID in PostgreSQL?',
      options: ['A query language', 'Properties that guarantee reliable transactions', 'A data type', 'A function'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is a foreign key in PostgreSQL?',
      options: ['Primary key', 'A key that references another table', 'A unique constraint', 'An index'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of indexes in PostgreSQL?',
      options: ['Store data', 'Improve query performance', 'Delete data', 'Create tables'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is a transaction in PostgreSQL?',
      options: ['A single query', 'A sequence of operations that are atomic', 'A table', 'A database'],
      correct: 1,
      difficulty: 'hard'
    }
  ],
  
  // Mobile Development
  'FLUTTER': [
    {
      question: 'What programming language does Flutter use?',
      options: ['Java', 'Dart', 'Swift', 'Kotlin'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is a widget in Flutter?',
      options: ['A database', 'A building block of UI', 'A function', 'A variable'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is hot reload in Flutter?',
      options: ['Restarting the app', 'Updating UI without losing state', 'Deleting code', 'Compiling'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of setState() in Flutter?',
      options: ['Create state', 'Update state and trigger rebuild', 'Delete state', 'Read state'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the main advantage of Flutter?',
      options: ['Single codebase for multiple platforms', 'Only for Android', 'Only for iOS', 'No advantages'],
      correct: 0,
      difficulty: 'easy'
    }
  ],
  
  // Cloud Computing
  'AWS': [
    {
      question: 'What does AWS stand for?',
      options: ['Amazon Web Services', 'Advanced Web System', 'Application Web Server', 'Automated Web Service'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What is EC2 in AWS?',
      options: ['Email service', 'Elastic Compute Cloud - virtual servers', 'Database service', 'Storage service'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is S3 in AWS?',
      options: ['Simple Storage Service - object storage', 'Server Service', 'System Service', 'Security Service'],
      correct: 0,
      difficulty: 'easy'
    },
    {
      question: 'What is the purpose of IAM in AWS?',
      options: ['Image management', 'Identity and Access Management', 'Internet management', 'Integration management'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is auto-scaling in AWS?',
      options: ['Manual scaling', 'Automatic adjustment of resources based on demand', 'Fixed resources', 'No scaling'],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  // Testing
  'JEST': [
    {
      question: 'What is Jest primarily used for?',
      options: ['Database testing', 'JavaScript testing framework', 'CSS testing', 'HTML testing'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is a test case in Jest?',
      options: ['A function', 'A test() or it() function that tests a specific behavior', 'A variable', 'A class'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is mocking in Jest?',
      options: ['Creating real objects', 'Creating fake implementations for testing', 'Deleting tests', 'Running tests'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What does expect() do in Jest?',
      options: ['Imports modules', 'Makes assertions about values', 'Exports functions', 'Creates variables'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is code coverage in Jest?',
      options: ['Number of tests', 'Percentage of code executed by tests', 'Test speed', 'Test size'],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  // AI/Data Science
  'R': [
    {
      question: 'What is R primarily used for?',
      options: ['Web development', 'Statistical computing and data analysis', 'Mobile apps', 'Game development'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is a vector in R?',
      options: ['A matrix', 'A one-dimensional array of elements', 'A function', 'A package'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the purpose of data frames in R?',
      options: ['Store single values', 'Store tabular data with rows and columns', 'Store functions', 'Store packages'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the %>% operator in R (from dplyr)?',
      options: ['Pipe operator for chaining operations', 'Assignment operator', 'Comparison operator', 'Logical operator'],
      correct: 0,
      difficulty: 'medium'
    },
    {
      question: 'What is ggplot2 in R?',
      options: ['A database', 'A data visualization package', 'A statistical test', 'A data type'],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  // Additional topics - Programming Languages
  'RUBY': [
    {
      question: 'What is Ruby primarily known for?',
      options: ['Speed', 'Developer-friendly syntax and productivity', 'Memory efficiency', 'Type safety'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is Ruby on Rails?',
      options: ['A gem', 'A web application framework written in Ruby', 'A database', 'A CSS framework'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is a gem in Ruby?',
      options: ['A package or library', 'A variable', 'A function', 'A class'],
      correct: 0,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of yield in Ruby?',
      options: ['Return a value', 'Call a block', 'Create a variable', 'Import a module'],
      correct: 1,
      difficulty: 'hard'
    },
    {
      question: 'What is the difference between symbols and strings in Ruby?',
      options: ['No difference', 'Symbols are immutable and more memory efficient', 'Strings are faster', 'Symbols are mutable'],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  // Testing
  'PYTEST': [
    {
      question: 'What is pytest?',
      options: ['A Python database', 'A testing framework for Python', 'A web framework', 'A CSS library'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is a fixture in pytest?',
      options: ['A test function', 'A reusable setup/teardown mechanism', 'A variable', 'A class'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of assert statements in pytest?',
      options: ['Import modules', 'Make test assertions', 'Create functions', 'Handle errors'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is parametrize in pytest?',
      options: ['A function', 'A decorator to run a test with multiple inputs', 'A variable', 'A class'],
      correct: 1,
      difficulty: 'hard'
    },
    {
      question: 'What is the correct way to run pytest?',
      options: ['python test.py', 'pytest', 'python -m pytest', 'Both pytest and python -m pytest'],
      correct: 3,
      difficulty: 'easy'
    }
  ],
  
  'SELENIUM': [
    {
      question: 'What is Selenium used for?',
      options: ['Database testing', 'Web browser automation and testing', 'API testing', 'Unit testing'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is a WebDriver in Selenium?',
      options: ['A browser', 'An interface to control browsers', 'A test', 'A function'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of implicit wait in Selenium?',
      options: ['Wait for a specific element', 'Wait for a fixed time', 'Wait for page load', 'Wait for a condition'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is XPath used for in Selenium?',
      options: ['Styling', 'Locating elements in XML/HTML documents', 'Database queries', 'File handling'],
      correct: 1,
      difficulty: 'hard'
    },
    {
      question: 'What is the difference between findElement and findElements in Selenium?',
      options: ['No difference', 'findElement returns one element, findElements returns a list', 'findElements returns one, findElement returns list', 'Both return lists'],
      correct: 1,
      difficulty: 'medium'
    }
  ],
  
  // Cloud Computing
  'AZURE': [
    {
      question: 'What is Microsoft Azure?',
      options: ['A database', 'A cloud computing platform', 'A programming language', 'A web framework'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is Azure App Service?',
      options: ['A database service', 'A platform for hosting web applications', 'A storage service', 'A networking service'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is Azure Blob Storage used for?',
      options: ['Storing structured data', 'Storing unstructured data like files and media', 'Storing code', 'Storing configurations'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is Azure Functions?',
      options: ['A database', 'Serverless compute service', 'A web framework', 'A storage service'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of Azure Resource Manager?',
      options: ['Manage resources', 'Deploy and manage Azure resources', 'Delete resources', 'Create resources only'],
      correct: 1,
      difficulty: 'hard'
    }
  ],
  
  'GOOGLE CLOUD': [
    {
      question: 'What is Google Cloud Platform (GCP)?',
      options: ['A database', 'A suite of cloud computing services', 'A programming language', 'A web framework'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is Compute Engine in GCP?',
      options: ['A database', 'Virtual machines in the cloud', 'A storage service', 'A networking service'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is Cloud Storage in GCP?',
      options: ['A database', 'Object storage service', 'A compute service', 'A networking service'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is App Engine in GCP?',
      options: ['A database', 'Platform for building scalable web applications', 'A storage service', 'A compute service'],
      correct: 1,
      difficulty: 'medium'
    },
    {
      question: 'What is the purpose of Cloud Functions in GCP?',
      options: ['Database queries', 'Serverless functions that run in response to events', 'File storage', 'Networking'],
      correct: 1,
      difficulty: 'medium'
    }
  ],

  // Programming Languages - C#, GO, RUST
  'C#': [
    { question: 'What is C# primarily used for?', options: ['Web only', 'Microsoft ecosystem: desktop, web, and mobile apps', 'Database only', 'Games only'], correct: 1, difficulty: 'easy' },
    { question: 'What is the correct extension for a C# file?', options: ['.cs', '.csharp', '.c#', '.csp'], correct: 0, difficulty: 'easy' },
    { question: 'What is LINQ in C#?', options: ['A database', 'Language Integrated Query for querying collections', 'A GUI framework', 'A testing tool'], correct: 1, difficulty: 'medium' },
    { question: 'What is the base class of all types in C#?', options: ['Object', 'Base', 'Type', 'Root'], correct: 0, difficulty: 'medium' },
    { question: 'What does the async/await keywords do in C#?', options: ['Synchronous execution', 'Asynchronous, non-blocking operations', 'Thread creation', 'Process spawning'], correct: 1, difficulty: 'hard' }
  ],
  'GO': [
    { question: 'Who created the Go programming language?', options: ['Microsoft', 'Google', 'Apple', 'Facebook'], correct: 1, difficulty: 'easy' },
    { question: 'What is a goroutine in Go?', options: ['A class', 'A lightweight thread for concurrency', 'A variable type', 'A package'], correct: 1, difficulty: 'easy' },
    { question: 'What is the purpose of the go keyword?', options: ['Define a function', 'Start a new goroutine', 'Import a package', 'Return a value'], correct: 1, difficulty: 'medium' },
    { question: 'What does defer do in Go?', options: ['Import', 'Delay execution until the surrounding function returns', 'Delete', 'Define'], correct: 1, difficulty: 'medium' },
    { question: 'What is the correct way to declare a variable in Go?', options: ['var x int = 5', 'x := 5', 'Both var x int = 5 and x := 5', 'int x = 5'], correct: 2, difficulty: 'easy' }
  ],
  'RUST': [
    { question: 'What is Rust best known for?', options: ['Ease of use', 'Memory safety without garbage collection', 'Slow speed', 'Dynamic typing'], correct: 1, difficulty: 'easy' },
    { question: 'What is ownership in Rust?', options: ['A library', 'A rule that each value has a single owner', 'A type', 'A function'], correct: 1, difficulty: 'medium' },
    { question: 'What does the borrow checker do in Rust?', options: ['Checks syntax', 'Ensures references follow borrowing rules at compile time', 'Runs tests', 'Manages memory at runtime'], correct: 1, difficulty: 'hard' },
    { question: 'What is Cargo in Rust?', options: ['A language', 'Package manager and build system', 'A database', 'A framework'], correct: 1, difficulty: 'easy' },
    { question: 'What keyword is used to make a variable mutable in Rust?', options: ['var', 'mut', 'mutable', 'change'], correct: 1, difficulty: 'easy' }
  ],

  // C sub-topics (for "C - Intro", "C - Data Types", etc. - keys: C_INTRO, C_DATA_TYPES, ...)
  'C_INTRO': [
    { question: 'What is the entry point of a C program?', options: ['start()', 'main()', 'begin()', 'run()'], correct: 1, difficulty: 'easy' },
    { question: 'Which header is needed for printf in C?', options: ['<iostream>', '<stdio.h>', '<console.h>', '<print.h>'], correct: 1, difficulty: 'easy' },
    { question: 'What does \\n represent in C?', options: ['New variable', 'Newline character', 'Number', 'Nothing'], correct: 1, difficulty: 'easy' },
    { question: 'What is the smallest unit of execution in C?', options: ['Block', 'Statement', 'Expression', 'All of these'], correct: 1, difficulty: 'medium' },
    { question: 'How do you add a single-line comment in C?', options: ['//', '/* */', '--', 'Both // and /* */ in C99'], correct: 3, difficulty: 'easy' }
  ],
  'C_DATA_TYPES': [
    { question: 'Which is a valid basic data type in C?', options: ['int', 'string', 'bool', 'float and int'], correct: 3, difficulty: 'easy' },
    { question: 'What is the size of char in C?', options: ['1 byte', '2 bytes', '4 bytes', 'Depends on system'], correct: 0, difficulty: 'easy' },
    { question: 'What does "unsigned" mean for an integer?', options: ['No sign', 'Only positive or zero', 'No negative numbers', 'Both B and C'], correct: 3, difficulty: 'medium' },
    { question: 'Which is used to store decimal numbers in C?', options: ['int', 'float or double', 'decimal', 'number'], correct: 1, difficulty: 'easy' },
    { question: 'What is the range of values for a signed int?', options: ['0 to 65535', 'About -2.1e9 to 2.1e9 on 32-bit', '0 to 4.2e9', 'Unlimited'], correct: 1, difficulty: 'medium' }
  ],
  'C_OPERATORS': [
    { question: 'What does the % operator do in C?', options: ['Percentage', 'Modulus (remainder)', 'Multiply', 'Divide'], correct: 1, difficulty: 'easy' },
    { question: 'What is i++?', options: ['Add 2', 'Increment i by 1', 'Square i', 'Double i'], correct: 1, difficulty: 'easy' },
    { question: 'What does == compare?', options: ['Assignment', 'Equality', 'Approximation', 'Range'], correct: 1, difficulty: 'easy' },
    { question: 'What is the result of 5 / 2 in C when both are int?', options: ['2.5', '2', '3', '2.0'], correct: 1, difficulty: 'medium' },
    { question: 'What does the && operator do?', options: ['Bitwise AND', 'Logical AND', 'Address of', 'Both A and B'], correct: 1, difficulty: 'easy' }
  ],
  'C_CONTROL_FLOW': [
    { question: 'Which keyword starts an if statement?', options: ['when', 'if', 'check', 'test'], correct: 1, difficulty: 'easy' },
    { question: 'What does a for loop need?', options: ['Only condition', 'Init, condition, and update', 'Only init', 'Only update'], correct: 1, difficulty: 'easy' },
    { question: 'What does break do in a loop?', options: ['Pause', 'Exit the loop immediately', 'Skip one iteration', 'Reset'], correct: 1, difficulty: 'easy' },
    { question: 'What does continue do in a loop?', options: ['Exit the loop', 'Skip to the next iteration', 'Stop the program', 'Restart the loop'], correct: 1, difficulty: 'medium' },
    { question: 'Which is the conditional (ternary) operator?', options: ['? :', 'if-else', '&&', '||'], correct: 0, difficulty: 'medium' }
  ],
  'C_FUNCTIONS': [
    { question: 'What does a function return type of "void" mean?', options: ['Returns 0', 'Returns nothing', 'Returns null', 'Returns void'], correct: 1, difficulty: 'easy' },
    { question: 'How are arguments passed to functions in C by default?', options: ['By reference', 'By value', 'By pointer', 'By name'], correct: 1, difficulty: 'medium' },
    { question: 'What is a function prototype?', options: ['The function body', 'A declaration of the function before its definition', 'A pointer', 'A macro'], correct: 1, difficulty: 'medium' },
    { question: 'Can a C function return more than one value directly?', options: ['Yes, always', 'No, use pointers or structs for multiple', 'Yes, with arrays only', 'Only in C99'], correct: 1, difficulty: 'hard' },
    { question: 'What is recursion?', options: ['A loop', 'A function calling itself', 'A variable', 'A type'], correct: 1, difficulty: 'easy' }
  ],
  'C_POINTERS': [
    { question: 'What does &variable give you?', options: ['Value', 'Address of variable', 'Copy', 'Reference'], correct: 1, difficulty: 'easy' },
    { question: 'What does *ptr do when used as an expression?', options: ['Multiply', 'Dereference - get value at address', 'Define', 'Pointer type'], correct: 1, difficulty: 'easy' },
    { question: 'What is a null pointer?', options: ['Pointer to 0', 'Pointer that does not point to valid memory', 'Uninitialized', 'Void pointer'], correct: 1, difficulty: 'medium' },
    { question: 'What is the purpose of free()?', options: ['Allocate', 'Deallocate memory from malloc', 'Clear variable', 'Reset pointer'], correct: 1, difficulty: 'easy' },
    { question: 'What is a void pointer (void *)?', options: ['Invalid', 'A generic pointer that can point to any type', 'Empty', 'Null'], correct: 1, difficulty: 'medium' }
  ],
  'C_ARRAYS_STRINGS': [
    { question: 'How do you declare an array of 10 integers in C?', options: ['int array[10];', 'array int[10];', 'int[10] array;', 'integer array(10);'], correct: 0, difficulty: 'easy' },
    { question: 'What is the index of the first element in a C array?', options: ['1', '0', '-1', 'depends'], correct: 1, difficulty: 'easy' },
    { question: 'How is a string stored in C?', options: ['String type', 'Array of char ending with \\0', 'Object', 'List'], correct: 1, difficulty: 'easy' },
    { question: 'Which function copies a string in C?', options: ['strcopy', 'strcpy', 'copy', 'string_copy'], correct: 1, difficulty: 'medium' },
    { question: 'What does strlen return?', options: ['Size in bytes', 'Length of string excluding \\0', 'Capacity', 'Index'], correct: 1, difficulty: 'easy' }
  ],

  // Full Stack - BOOTSTRAP, TAILWIND, TYPESCRIPT, DART, ANGULAR, VUEJS, SPRING BOOT, DJANGO, FLASK, ASP.NET, MATERIAL UI, CHAKRA UI, SASS
  'BOOTSTRAP': [
    { question: 'What is Bootstrap?', options: ['A programming language', 'A CSS framework for responsive web design', 'A database', 'A server'], correct: 1, difficulty: 'easy' },
    { question: 'What is the Bootstrap grid system based on?', options: ['Tables', '12 columns', 'Fixed width', 'No grid'], correct: 1, difficulty: 'easy' },
    { question: 'Which class makes a Bootstrap button blue?', options: ['btn-blue', 'btn-primary', 'btn-info', 'Both btn-primary and btn-info'], correct: 3, difficulty: 'easy' },
    { question: 'What does the Bootstrap class "container-fluid" do?', options: ['Fixed width', 'Full-width container', 'Hides content', 'Adds padding only'], correct: 1, difficulty: 'medium' },
    { question: 'What is the purpose of data-bs-toggle in Bootstrap 5?', options: ['Styling', 'Enabling JavaScript components like modals and dropdowns', 'Database', 'Routing'], correct: 1, difficulty: 'medium' }
  ],
  'TAILWIND': [
    { question: 'What is Tailwind CSS?', options: ['A JS framework', 'A utility-first CSS framework', 'A database', 'A backend tool'], correct: 1, difficulty: 'easy' },
    { question: 'How does Tailwind primarily style elements?', options: ['External CSS files', 'Utility classes in HTML', 'Inline styles only', 'Sass files'], correct: 1, difficulty: 'easy' },
    { question: 'What does the class "flex" do in Tailwind?', options: ['Hide element', 'Display flex', 'Fixed position', 'Float'], correct: 1, difficulty: 'easy' },
    { question: 'What is the purpose of @apply in Tailwind?', options: ['Import', 'Apply utility classes inside CSS', 'Extend', 'Override'], correct: 1, difficulty: 'medium' },
    { question: 'Which Tailwind class adds padding on all sides?', options: ['p-4', 'pad-4', 'padding-4', 'space-4'], correct: 0, difficulty: 'easy' }
  ],
  'TYPESCRIPT': [
    { question: 'What is TypeScript?', options: ['A database', 'JavaScript with static types', 'A CSS framework', 'A server'], correct: 1, difficulty: 'easy' },
    { question: 'What does the : string syntax indicate in TypeScript?', options: ['A label', 'A type annotation', 'A comment', 'A function'], correct: 1, difficulty: 'easy' },
    { question: 'What is an interface in TypeScript?', options: ['A class', 'A way to define the shape of an object', 'A variable', 'A loop'], correct: 1, difficulty: 'medium' },
    { question: 'What does the "as" keyword do in TypeScript?', options: ['Import', 'Type assertion', 'Assign', 'Compare'], correct: 1, difficulty: 'medium' },
    { question: 'What is the file extension for TypeScript?', options: ['.js', '.ts', '.typescript', '.tsc'], correct: 1, difficulty: 'easy' }
  ],
  'DART': [
    { question: 'What is Dart primarily used for?', options: ['Backend only', 'Flutter app development and web', 'Databases', 'DevOps'], correct: 1, difficulty: 'easy' },
    { question: 'What is the Dart null safety feature?', options: ['Prevents null errors at compile time', 'Allows only null', 'Removes null', 'Converts null'], correct: 0, difficulty: 'medium' },
    { question: 'What is a Stream in Dart?', options: ['A file', 'An asynchronous sequence of data events', 'A string', 'A loop'], correct: 1, difficulty: 'medium' },
    { question: 'What does the "?" operator do for null in Dart?', options: ['Throws', 'Null-aware access', 'Assigns', 'Deletes'], correct: 1, difficulty: 'easy' },
    { question: 'Which framework uses Dart?', options: ['React', 'Angular', 'Flutter', 'Vue'], correct: 2, difficulty: 'easy' }
  ],
  'ANGULAR': [
    { question: 'What is Angular?', options: ['A CSS framework', 'A TypeScript-based web framework by Google', 'A database', 'A server'], correct: 1, difficulty: 'easy' },
    { question: 'What is a component in Angular?', options: ['A service', 'A class with template and logic for a part of UI', 'A module', 'A pipe'], correct: 1, difficulty: 'easy' },
    { question: 'What is dependency injection in Angular?', options: ['A bug', 'A way to provide dependencies to classes', 'A directive', 'A route'], correct: 1, difficulty: 'medium' },
    { question: 'What does ngModel do?', options: ['Styling', 'Two-way data binding', 'Routing', 'HTTP'], correct: 1, difficulty: 'medium' },
    { question: 'What is the Angular CLI command to generate a component?', options: ['ng add', 'ng generate component', 'ng new component', 'ng create'], correct: 1, difficulty: 'easy' }
  ],
  'VUEJS': [
    { question: 'What is Vue.js?', options: ['A database', 'A progressive JavaScript framework for building UIs', 'A CSS tool', 'A backend'], correct: 1, difficulty: 'easy' },
    { question: 'What is the Vue 3 Composition API?', options: ['A database', 'An alternative to Options API using setup() and composables', 'A router', 'A store'], correct: 1, difficulty: 'medium' },
    { question: 'What is v-model in Vue?', options: ['A style', 'Two-way binding for form inputs', 'A method', 'A prop'], correct: 1, difficulty: 'easy' },
    { question: 'What is a Vue directive?', options: ['A component', 'Special tokens like v-if, v-for that add behavior', 'A service', 'A hook'], correct: 1, difficulty: 'medium' },
    { question: 'What does Vuex or Pinia provide in Vue?', options: ['Routing', 'State management', 'HTTP only', 'Styling'], correct: 1, difficulty: 'medium' }
  ],
  'SPRING BOOT': [
    { question: 'What is Spring Boot?', options: ['A database', 'A Java framework for building standalone applications', 'A frontend lib', 'A CMS'], correct: 1, difficulty: 'easy' },
    { question: 'What does @RestController do in Spring Boot?', options: ['Renders HTML', 'Marks a class as REST API controller', 'Configures DB', 'Schedules jobs'], correct: 1, difficulty: 'easy' },
    { question: 'What is the default embedded server in Spring Boot?', options: ['Apache', 'Tomcat', 'Jetty', 'Both Tomcat and Jetty'], correct: 3, difficulty: 'medium' },
    { question: 'What does @Autowired do?', options: ['Creates bean', 'Injects dependency', 'Exports', 'Maps'], correct: 1, difficulty: 'medium' },
    { question: 'What file holds main Spring Boot configuration?', options: ['config.xml', 'application.properties or application.yml', 'pom.xml only', 'build.gradle only'], correct: 1, difficulty: 'easy' }
  ],
  'DJANGO': [
    { question: 'What is Django?', options: ['A frontend framework', 'A Python web framework', 'A database', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What is the Django ORM?', options: ['A template engine', 'Object-Relational Mapping for database operations', 'A router', 'A form'], correct: 1, difficulty: 'medium' },
    { question: 'What does "migrate" do in Django?', options: ['Move files', 'Apply database migrations', 'Deploy', 'Import'], correct: 1, difficulty: 'easy' },
    { question: 'What is a Django view?', options: ['A template', 'A function or class that handles a request and returns a response', 'A model', 'A URL'], correct: 1, difficulty: 'medium' },
    { question: 'What is the Django admin?', options: ['A hosting service', 'Auto-generated admin interface for models', 'A CSS framework', 'A test runner'], correct: 1, difficulty: 'easy' }
  ],
  'FLASK': [
    { question: 'What is Flask?', options: ['A database', 'A lightweight Python web framework', 'A frontend framework', 'A CMS'], correct: 1, difficulty: 'easy' },
    { question: 'What does @app.route() do in Flask?', options: ['Defines a URL route and view', 'Configures DB', 'Runs server', 'Imports'], correct: 0, difficulty: 'easy' },
    { question: 'What is a Flask blueprint?', options: ['A color', 'A way to organize a Flask app into modules', 'A database', 'A template'], correct: 1, difficulty: 'medium' },
    { question: 'What is Jinja2 in Flask?', options: ['A database', 'A template engine', 'A router', 'A ORM'], correct: 1, difficulty: 'easy' },
    { question: 'How do you run a Flask app in development?', options: ['flask run', 'python app.py', 'Both flask run and python app.py', 'npm start'], correct: 2, difficulty: 'easy' }
  ],
  'ASP.NET': [
    { question: 'What is ASP.NET Core?', options: ['A database', 'A cross-platform web framework by Microsoft', 'A CSS framework', 'A JS library'], correct: 1, difficulty: 'easy' },
    { question: 'What is MVC in ASP.NET?', options: ['Model-View-Controller pattern', 'A database', 'A language', 'A server'], correct: 0, difficulty: 'easy' },
    { question: 'What does Entity Framework do in ASP.NET?', options: ['Frontend', 'ORM for database access', 'Caching', 'Logging'], correct: 1, difficulty: 'medium' },
    { question: 'What is middleware in ASP.NET Core?', options: ['A view', 'Components in the request pipeline', 'A model', 'A config file'], correct: 1, difficulty: 'medium' },
    { question: 'What is Blazor in ASP.NET?', options: ['A database', 'A framework for building interactive UIs with C# and WebAssembly', 'A CSS tool', 'A server'], correct: 1, difficulty: 'medium' }
  ],
  'MATERIAL UI': [
    { question: 'What is Material UI (MUI)?', options: ['A database', 'A React component library implementing Material Design', 'A backend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What design system does Material UI follow?', options: ['Bootstrap', 'Material Design by Google', 'Tailwind', 'Custom'], correct: 1, difficulty: 'easy' },
    { question: 'What is the purpose of the ThemeProvider in MUI?', options: ['Routing', 'Applying theme (colors, typography) to the app', 'State', 'HTTP'], correct: 1, difficulty: 'medium' },
    { question: 'What does the Button component in MUI support?', options: ['Only one variant', 'Variants like contained, outlined, text', 'No styling', 'Only icons'], correct: 1, difficulty: 'easy' },
    { question: 'What is MUI Base?', options: ['A database', 'Unstyled, accessible components from MUI', 'A server', 'A build tool'], correct: 1, difficulty: 'medium' }
  ],
  'CHAKRA UI': [
    { question: 'What is Chakra UI?', options: ['A database', 'A React component library that is modular and accessible', 'A backend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What makes Chakra UI accessible?', options: ['It is not', 'Built-in focus management, ARIA, keyboard support', 'Only color', 'Only size'], correct: 1, difficulty: 'medium' },
    { question: 'What is the Chakra provider used for?', options: ['Routing', 'Providing theme and default props to the app', 'State', 'HTTP'], correct: 1, difficulty: 'easy' },
    { question: 'How does Chakra handle theming?', options: ['No theming', 'Theme object with colors, fonts, components', 'CSS only', 'Inline only'], correct: 1, difficulty: 'medium' },
    { question: 'What type of components does Chakra offer?', options: ['Only buttons', 'Layout, forms, data display, feedback, and more', 'Only layout', 'Only forms'], correct: 1, difficulty: 'easy' }
  ],
  'SASS': [
    { question: 'What is SASS?', options: ['A database', 'A CSS preprocessor with variables, nesting, mixins', 'A JS framework', 'A server'], correct: 1, difficulty: 'easy' },
    { question: 'What is a SASS variable?', options: ['$name: value', '@name: value', '#name: value', 'var(name)'], correct: 0, difficulty: 'easy' },
    { question: 'What is a mixin in SASS?', options: ['A variable', 'Reusable block of styles', 'A function', 'A loop'], correct: 1, difficulty: 'medium' },
    { question: 'What does @include do in SASS?', options: ['Import', 'Include a mixin', 'Extend', 'Condition'], correct: 1, difficulty: 'easy' },
    { question: 'What is the file extension for SASS?', options: ['.css', '.scss or .sass', '.sass only', '.styl'], correct: 1, difficulty: 'easy' }
  ],

  // Databases - ORACLE, SQL SERVER, FIREBASE, MARIADB, REDIS, CASSANDRA, ELASTICSEARCH
  'ORACLE': [
    { question: 'What is Oracle Database?', options: ['A NoSQL DB', 'A relational database management system', 'A frontend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What is PL/SQL?', options: ['A NoSQL language', 'Oracle\'s procedural extension to SQL', 'A GUI tool', 'A type'], correct: 1, difficulty: 'medium' },
    { question: 'What is an Oracle schema?', options: ['A table', 'A collection of database objects owned by a user', 'A view', 'An index'], correct: 1, difficulty: 'medium' },
    { question: 'What is RAC in Oracle?', options: ['A query', 'Real Application Clusters for high availability', 'A type', 'A key'], correct: 1, difficulty: 'hard' },
    { question: 'What does Oracle DataGuard provide?', options: ['Frontend', 'Disaster recovery and data protection', 'Caching', 'Monitoring only'], correct: 1, difficulty: 'medium' }
  ],
  'SQL SERVER': [
    { question: 'What is Microsoft SQL Server?', options: ['NoSQL', 'A relational database system by Microsoft', 'A frontend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What is T-SQL?', options: ['A NoSQL variant', 'Microsoft\'s extension to SQL', 'A GUI', 'A type'], correct: 1, difficulty: 'easy' },
    { question: 'What is the purpose of SQL Server Agent?', options: ['Run queries', 'Schedule jobs, alerts, and automate tasks', 'Backup only', 'Monitor only'], correct: 1, difficulty: 'medium' },
    { question: 'What is an SQL Server index?', options: ['A table', 'A structure to speed up queries', 'A view', 'A key only'], correct: 1, difficulty: 'medium' },
    { question: 'What does SSIS stand for?', options: ['SQL Server Interface', 'SQL Server Integration Services', 'SQL Server Index', 'SQL Server Instance'], correct: 1, difficulty: 'hard' }
  ],
  'FIREBASE': [
    { question: 'What is Firebase?', options: ['A relational DB', 'Google\'s platform for app development (auth, DB, hosting)', 'A CSS framework', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What is Firestore?', options: ['A SQL DB', 'NoSQL document database in Firebase', 'A CMS', 'A server'], correct: 1, difficulty: 'easy' },
    { question: 'What does Firebase Authentication provide?', options: ['Database', 'User sign-in (email, Google, etc.)', 'Hosting only', 'Storage only'], correct: 1, difficulty: 'easy' },
    { question: 'What is Firebase Realtime Database?', options: ['A table DB', 'JSON-based, real-time syncing NoSQL DB', 'A cache', 'A queue'], correct: 1, difficulty: 'medium' },
    { question: 'What is the purpose of Firebase Hosting?', options: ['Run backend', 'Host static and dynamic web apps', 'Store files only', 'Send email'], correct: 1, difficulty: 'medium' }
  ],
  'MARIADB': [
    { question: 'What is MariaDB?', options: ['A NoSQL DB', 'A MySQL-compatible relational database', 'A frontend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'How is MariaDB related to MySQL?', options: ['Unrelated', 'Fork of MySQL, community-developed', 'A wrapper', 'A copy'], correct: 1, difficulty: 'medium' },
    { question: 'What is the default storage engine in MariaDB?', options: ['MyISAM', 'InnoDB', 'Memory', 'CSV'], correct: 1, difficulty: 'medium' },
    { question: 'What does Galera Cluster do for MariaDB?', options: ['Query', 'Synchronous multi-master replication', 'Backup', 'Monitor'], correct: 1, difficulty: 'hard' },
    { question: 'Is MariaDB open source?', options: ['No', 'Yes', 'Partially', 'Enterprise only'], correct: 1, difficulty: 'easy' }
  ],
  'REDIS': [
    { question: 'What is Redis?', options: ['A relational DB', 'An in-memory data store used as cache, DB, and message broker', 'A frontend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What does Redis primarily store?', options: ['Only strings', 'Strings, hashes, lists, sets, sorted sets', 'Only numbers', 'Only JSON'], correct: 1, difficulty: 'medium' },
    { question: 'What is Redis often used for?', options: ['Primary DB only', 'Caching and session storage', 'File storage', 'Email'], correct: 1, difficulty: 'easy' },
    { question: 'What does the Redis command SET do?', options: ['Create table', 'Set a key to a value', 'Delete', 'Query'], correct: 1, difficulty: 'easy' },
    { question: 'What is Redis persistence?', options: ['Not supported', 'RDB snapshots and AOF for durability', 'Only memory', 'Only backup'], correct: 1, difficulty: 'medium' }
  ],
  'CASSANDRA': [
    { question: 'What is Apache Cassandra?', options: ['A relational DB', 'A distributed NoSQL wide-column store', 'A frontend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What is Cassandra designed for?', options: ['Single node', 'High availability and linear scalability across nodes', 'Small data', 'OLTP only'], correct: 1, difficulty: 'medium' },
    { question: 'What is a Cassandra keyspace?', options: ['A table', 'A namespace for tables (like a schema)', 'A key', 'A node'], correct: 1, difficulty: 'medium' },
    { question: 'What is CQL?', options: ['A NoSQL API', 'Cassandra Query Language', 'A type', 'A tool'], correct: 1, difficulty: 'easy' },
    { question: 'What is the Cassandra data model?', options: ['Relational', 'Wide-column / column-family', 'Document', 'Graph'], correct: 1, difficulty: 'hard' }
  ],
  'ELASTICSEARCH': [
    { question: 'What is Elasticsearch?', options: ['A relational DB', 'A search and analytics engine based on Apache Lucene', 'A frontend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What is Elasticsearch best suited for?', options: ['ACID transactions', 'Full-text search, log analytics, and real-time analytics', 'Graph queries', 'Simple CRUD only'], correct: 1, difficulty: 'medium' },
    { question: 'What is an index in Elasticsearch?', options: ['A DB table', 'A collection of documents', 'A key', 'A node'], correct: 1, difficulty: 'easy' },
    { question: 'What is the Query DSL in Elasticsearch?', options: ['A language', 'JSON-based language for queries', 'A type', 'A GUI'], correct: 1, difficulty: 'medium' },
    { question: 'What is the ELK Stack?', options: ['A DB', 'Elasticsearch, Logstash, Kibana', 'A framework', 'A server'], correct: 1, difficulty: 'medium' }
  ],

  // Mobile - SWIFT, KOTLIN, REACT NATIVE
  'SWIFT': [
    { question: 'What is Swift?', options: ['A database', 'Apple\'s programming language for iOS, macOS, etc.', 'A framework', 'A server'], correct: 1, difficulty: 'easy' },
    { question: 'What is an optional in Swift?', options: ['Required', 'A type that can hold a value or nil', 'A loop', 'A function'], correct: 1, difficulty: 'easy' },
    { question: 'What is the "?" after a type in Swift?', options: ['Syntax error', 'Makes it an optional', 'Multiplies', 'Comment'], correct: 1, difficulty: 'medium' },
    { question: 'What is SwiftUI?', options: ['A database', 'A declarative UI framework by Apple', 'A server', 'A language'], correct: 1, difficulty: 'medium' },
    { question: 'What does guard do in Swift?', options: ['Loop', 'Early exit if condition fails', 'Import', 'Class'], correct: 1, difficulty: 'medium' }
  ],
  'KOTLIN': [
    { question: 'What is Kotlin?', options: ['A database', 'A JVM language; official for Android', 'A frontend only', 'A server only'], correct: 1, difficulty: 'easy' },
    { question: 'What is a null safety feature in Kotlin?', options: ['No null', 'Nullable types with ? and safe calls', 'Only !!', 'Ignore null'], correct: 1, difficulty: 'medium' },
    { question: 'What is a Kotlin data class?', options: ['A DB table', 'A class that automatically generates equals, hashCode, toString', 'A function', 'A type'], correct: 1, difficulty: 'medium' },
    { question: 'What does the "?" safe call operator do in Kotlin?', options: ['Throw', 'Return null if receiver is null', 'Assign', 'Compare'], correct: 1, difficulty: 'easy' },
    { question: 'What is Kotlin used for on Android?', options: ['Optional', 'Official language; can replace Java', 'Not supported', 'Only tests'], correct: 1, difficulty: 'easy' }
  ],
  'REACT NATIVE': [
    { question: 'What is React Native?', options: ['A database', 'A framework to build mobile apps with React', 'A backend', 'A language'], correct: 1, difficulty: 'easy' },
    { question: 'What does React Native use to render UI?', options: ['WebView only', 'Native components (not HTML divs)', 'HTML only', 'Java only'], correct: 1, difficulty: 'medium' },
    { question: 'What is the bridge in React Native?', options: ['A component', 'Communication layer between JS and native code', 'A router', 'A store'], correct: 1, difficulty: 'hard' },
    { question: 'What is Expo in React Native?', options: ['A database', 'A set of tools and services for React Native development', 'A UI lib', 'A server'], correct: 1, difficulty: 'medium' },
    { question: 'Can you use the same React Native code for iOS and Android?', options: ['No', 'Yes, with platform-specific code when needed', 'Only iOS', 'Only Android'], correct: 1, difficulty: 'easy' }
  ],

  // AI - JULIA, SCALA
  'JULIA': [
    { question: 'What is Julia primarily used for?', options: ['Web development', 'Scientific computing and numerical analysis', 'Mobile apps', 'Games'], correct: 1, difficulty: 'easy' },
    { question: 'What is a key feature of Julia?', options: ['Only slow', 'High-level syntax with performance close to C', 'No types', 'No libraries'], correct: 1, difficulty: 'medium' },
    { question: 'What does the Julia package manager do?', options: ['Run code', 'Add and manage packages (e.g. Pkg)', 'Deploy', 'Test only'], correct: 1, difficulty: 'easy' },
    { question: 'What is multiple dispatch in Julia?', options: ['A bug', 'Selecting a function based on all argument types', 'A type', 'A loop'], correct: 1, difficulty: 'hard' },
    { question: 'What is the JIT in Julia?', options: ['A package', 'Just-in-time compilation for speed', 'A type', 'A function'], correct: 1, difficulty: 'medium' }
  ],
  'SCALA': [
    { question: 'What is Scala?', options: ['A database', 'A JVM language blending OOP and functional programming', 'A frontend', 'A server'], correct: 1, difficulty: 'easy' },
    { question: 'What does "val" mean in Scala?', options: ['Variable', 'Immutable value', 'Function', 'Class'], correct: 1, difficulty: 'easy' },
    { question: 'What is the relationship between Scala and Apache Spark?', options: ['Unrelated', 'Spark is written in Scala; Scala is a primary API', 'Spark uses Scala only for tests', 'Spark replaced Scala'], correct: 1, difficulty: 'medium' },
    { question: 'What is a case class in Scala?', options: ['A DB table', 'A class with built-in equals, hash, pattern matching', 'A function', 'A type'], correct: 1, difficulty: 'medium' },
    { question: 'What is the "Option" type in Scala?', options: ['Required', 'Represents optional value (Some or None)', 'A loop', 'A string'], correct: 1, difficulty: 'medium' }
  ],

  // Testing - JUNIT, CYPRESS
  'JUNIT': [
    { question: 'What is JUnit?', options: ['A database', 'A unit testing framework for Java', 'A frontend', 'A server'], correct: 1, difficulty: 'easy' },
    { question: 'What does @Test denote in JUnit?', options: ['A class', 'A method as a test', 'A variable', 'Import'], correct: 1, difficulty: 'easy' },
    { question: 'What is @BeforeEach in JUnit 5?', options: ['After test', 'Runs before each test', 'Once only', 'A test'], correct: 1, difficulty: 'medium' },
    { question: 'What does Assertions.assertEquals do?', options: ['Run', 'Check that expected equals actual', 'Throw', 'Ignore'], correct: 1, difficulty: 'easy' },
    { question: 'What is JUnit 5 also known as?', options: ['JUnit 4', 'Jupiter', 'JUnit 3', 'JUnit 6'], correct: 1, difficulty: 'medium' }
  ],
  'CYPRESS': [
    { question: 'What is Cypress used for?', options: ['Unit tests only', 'End-to-end and component testing for web apps', 'Database testing', 'API only'], correct: 1, difficulty: 'easy' },
    { question: 'What makes Cypress different from Selenium?', options: ['Nothing', 'Runs in the browser; fast, real-time reload; built-in wait', 'Only for mobile', 'No DOM'], correct: 1, difficulty: 'medium' },
    { question: 'What is the typical Cypress command for visiting a URL?', options: ['cy.open()', 'cy.visit()', 'cy.go()', 'cy.nav()'], correct: 1, difficulty: 'easy' },
    { question: 'What does cy.get() do in Cypress?', options: ['HTTP get', 'Select DOM element(s)', 'Import', 'Assert'], correct: 1, difficulty: 'easy' },
    { question: 'Can Cypress test APIs?', options: ['No', 'Yes, via cy.request()', 'Only mock', 'Only UI'], correct: 1, difficulty: 'medium' }
  ],
  
  // Academic Subjects - These will be overridden by category-specific questions in generateGenericQuestions
  // But kept here as fallback
  '3 CLASS': [
    {
      question: 'What is 2 + 3?',
      options: ['4', '5', '6', '7'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'How many days are in a week?',
      options: ['5', '6', '7', '8'],
      correct: 2,
      difficulty: 'easy'
    },
    {
      question: 'What is the largest number among 5, 8, 3, and 9?',
      options: ['5', '8', '3', '9'],
      correct: 3,
      difficulty: 'easy'
    },
    {
      question: 'What do plants need to grow?',
      options: ['Only water', 'Water, sunlight, and soil', 'Only sunlight', 'Only soil'],
      correct: 1,
      difficulty: 'easy'
    },
    {
      question: 'What is the capital of India?',
      options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
      correct: 1,
      difficulty: 'easy'
    }
  ]
};

/**
 * Get questions for a specific topic
 * Considers category and domain for better topic-specific questions
 * Falls back to category-specific questions if topic not found
 */
function getQuestionsForTopic(topicName, category = '', domain = '', numQuestions = 20) {
  // Normalize topic name - handle formats like "PROGRAMMING LANGAUGES - C" or just "C"
  let normalizedTopic = topicName.toUpperCase().trim();
  const normalizedCategory = (category || '').toUpperCase().trim();
  const normalizedDomain = (domain || '').toUpperCase().trim();
  
  // Sub-topic format "C - Intro" -> "C_INTRO"; "C - Arrays & Strings" -> "C_ARRAYS_STRINGS"
  // Must try this FIRST, before we strip to last part (which would turn "C - Intro" into "INTRO" and break the lookup)
  let topicQuestions = [];
  if (normalizedTopic.includes(' - ')) {
    const subKey = normalizedTopic.replace(/\s*-\s*/g, '_').replace(/\s+&\s+/g, '_').replace(/\s+/g, '_');
    topicQuestions = QUESTION_BANK[subKey] || [];
  }
  
  // If sub-topic key not found, extract "CATEGORY - TOPIC" -> take last part (e.g. "PROGRAMMING LANGAUGES - C" -> "C")
  if (topicQuestions.length === 0 && normalizedTopic.includes(' - ')) {
    const parts = normalizedTopic.split(' - ');
    if (parts.length > 1) {
      normalizedTopic = parts[parts.length - 1].trim();
    }
  }
  
  if (topicQuestions.length === 0) {
    topicQuestions = QUESTION_BANK[normalizedTopic] || [];
  }
  
  // If not found, try to find a partial match (e.g., "JAVASCRIPT" matches "JAVASCRIPT" in bank)
  if (topicQuestions.length === 0) {
    // Try matching by removing spaces and special characters
    const cleanTopic = normalizedTopic.replace(/[^A-Z0-9]/g, '');
    for (const [key, questions] of Object.entries(QUESTION_BANK)) {
      const cleanKey = key.replace(/[^A-Z0-9]/g, '');
      if (cleanKey === cleanTopic || cleanTopic.includes(cleanKey) || cleanKey.includes(cleanTopic)) {
        topicQuestions = questions;
        break;
      }
    }
  }
  
  // If we have questions for this topic, use them
  if (topicQuestions.length > 0) {
    // Repeat questions if needed to reach numQuestions, but shuffle the order
    const questions = [];
    for (let i = 0; i < numQuestions; i++) {
      const questionIndex = i % topicQuestions.length;
      questions.push(topicQuestions[questionIndex]);
    }
    // Shuffle questions to avoid predictable patterns
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
  }
  
  // Fallback: Generate category/domain-specific realistic questions
  return generateGenericQuestions(topicName, category, domain, numQuestions);
}

/**
 * Generate category/domain-specific realistic questions when topic-specific questions aren't available
 */
function generateGenericQuestions(topicName, category = '', domain = '', numQuestions = 20) {
  const questions = [];
  const normalizedCategory = (category || '').toUpperCase().trim();
  const normalizedDomain = (domain || '').toUpperCase().trim();
  const normalizedTopic = topicName.toUpperCase().trim();
  
  // Category/Domain-specific question templates
  let questionTemplates = [];
  
  // Academic Subjects (MATHS, SCIENCE, SOCIAL)
  if (normalizedDomain === 'MATHS' || normalizedCategory === 'MATHS') {
    questionTemplates = [
      {
        question: 'What is 5 + 7?',
        options: ['11', '12', '13', '14'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'How many sides does a triangle have?',
        options: ['2', '3', '4', '5'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'What is 10 - 4?',
        options: ['5', '6', '7', '8'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'What is 3 × 4?',
        options: ['10', '11', '12', '13'],
        correct: 2,
        difficulty: 'easy'
      },
      {
        question: 'What is 20 ÷ 4?',
        options: ['4', '5', '6', '7'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'Which shape has 4 equal sides?',
        options: ['Triangle', 'Circle', 'Square', 'Rectangle'],
        correct: 2,
        difficulty: 'medium'
      },
      {
        question: 'What is the largest number: 15, 8, 22, or 19?',
        options: ['15', '8', '22', '19'],
        correct: 2,
        difficulty: 'easy'
      },
      {
        question: 'How many tens are in the number 50?',
        options: ['4', '5', '6', '7'],
        correct: 1,
        difficulty: 'medium'
      },
      {
        question: 'What comes after 99?',
        options: ['98', '100', '101', '102'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'What is half of 20?',
        options: ['8', '9', '10', '11'],
        correct: 2,
        difficulty: 'easy'
      }
    ];
  } else if (normalizedDomain === 'SCIENCE' || normalizedCategory === 'SCIENCE') {
    questionTemplates = [
      {
        question: 'What do plants need to make their food?',
        options: ['Water only', 'Sunlight, water, and air', 'Soil only', 'Fertilizer only'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'Which part of the plant makes food?',
        options: ['Roots', 'Leaves', 'Stem', 'Flowers'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'What is the largest planet in our solar system?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correct: 2,
        difficulty: 'medium'
      },
      {
        question: 'How many legs does a spider have?',
        options: ['4', '6', '8', '10'],
        correct: 2,
        difficulty: 'easy'
      },
      {
        question: 'What do we breathe in?',
        options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'What is the main source of light on Earth?',
        options: ['Moon', 'Stars', 'Sun', 'Lamp'],
        correct: 2,
        difficulty: 'easy'
      },
      {
        question: 'Which animal is known as the king of the jungle?',
        options: ['Tiger', 'Lion', 'Elephant', 'Bear'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'What happens to water when it freezes?',
        options: ['It becomes a gas', 'It becomes ice (solid)', 'It disappears', 'It becomes hot'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'How many bones does an adult human have?',
        options: ['156', '206', '256', '306'],
        correct: 1,
        difficulty: 'hard'
      },
      {
        question: 'What is the process by which plants make food called?',
        options: ['Respiration', 'Photosynthesis', 'Digestion', 'Circulation'],
        correct: 1,
        difficulty: 'medium'
      }
    ];
  } else if (normalizedDomain === 'SOCIAL' || normalizedCategory === 'SOCIAL') {
    questionTemplates = [
      {
        question: 'What is the capital city of India?',
        options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'How many states are there in India?',
        options: ['26', '28', '29', '30'],
        correct: 1,
        difficulty: 'medium'
      },
      {
        question: 'Which is the largest ocean in the world?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'],
        correct: 2,
        difficulty: 'easy'
      },
      {
        question: 'What is the longest river in India?',
        options: ['Yamuna', 'Ganga', 'Godavari', 'Krishna'],
        correct: 1,
        difficulty: 'medium'
      },
      {
        question: 'Which is the smallest continent?',
        options: ['Asia', 'Africa', 'Australia', 'Europe'],
        correct: 2,
        difficulty: 'medium'
      },
      {
        question: 'What is the currency of India?',
        options: ['Dollar', 'Rupee', 'Euro', 'Yen'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'Who was the first Prime Minister of India?',
        options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Dr. Rajendra Prasad'],
        correct: 1,
        difficulty: 'medium'
      },
      {
        question: 'In which year did India gain independence?',
        options: ['1945', '1946', '1947', '1948'],
        correct: 2,
        difficulty: 'easy'
      },
      {
        question: 'What is the national animal of India?',
        options: ['Lion', 'Tiger', 'Elephant', 'Peacock'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: 'Which festival is known as the festival of lights?',
        options: ['Holi', 'Diwali', 'Dussehra', 'Eid'],
        correct: 1,
        difficulty: 'easy'
      }
    ];
  } else if (normalizedCategory.includes('PROGRAMMING') || normalizedCategory.includes('LANGUAGE')) {
    // Programming language category
    questionTemplates = [
      {
        question: `What is ${topicName} primarily used for?`,
        options: [
          `Writing computer programs and applications`,
          `Creating websites only`,
          `Database management only`,
          `File storage`
        ],
        correct: 0,
        difficulty: 'easy'
      },
      {
        question: `Which of the following is a key feature of ${topicName}?`,
        options: [
          `Syntax and structure`,
          `Memory management`,
          `Error handling`,
          `All of the above`
        ],
        correct: 3,
        difficulty: 'medium'
      },
      {
        question: `What is the best practice when coding in ${topicName}?`,
        options: [
          `Write code without comments`,
          `Follow coding standards and write readable code`,
          `Use only basic features`,
          `Avoid documentation`
        ],
        correct: 1,
        difficulty: 'medium'
      },
      {
        question: `Which tool is commonly used with ${topicName}?`,
        options: [
          `Version control systems like Git`,
          `Integrated Development Environments (IDEs)`,
          `Debugging tools`,
          `All of the above`
        ],
        correct: 3,
        difficulty: 'easy'
      },
      {
        question: `What should you focus on when learning ${topicName}?`,
        options: [
          `Only theoretical knowledge`,
          `Practical hands-on coding experience`,
          `Memorizing syntax only`,
          `Avoiding practice`
        ],
        correct: 1,
        difficulty: 'easy'
      }
    ];
  } else if (normalizedCategory.includes('DATABASE') || normalizedCategory.includes('DATABASES')) {
    // Database category
    questionTemplates = [
      {
        question: `What is ${topicName} primarily used for?`,
        options: [
          `Storing and managing data`,
          `Creating websites`,
          `Writing code`,
          `Designing UI`
        ],
        correct: 0,
        difficulty: 'easy'
      },
      {
        question: `Which of the following is a key feature of ${topicName}?`,
        options: [
          `Data storage`,
          `Query capabilities`,
          `Data security`,
          `All of the above`
        ],
        correct: 3,
        difficulty: 'medium'
      },
      {
        question: `What is the best practice when working with ${topicName}?`,
        options: [
          `Store all data in one table`,
          `Normalize data and use proper indexing`,
          `Avoid backups`,
          `No security measures needed`
        ],
        correct: 1,
        difficulty: 'hard'
      },
      {
        question: `What is a primary use case for ${topicName}?`,
        options: [
          `Web development only`,
          `Data persistence and retrieval`,
          `Image processing`,
          `Video editing`
        ],
        correct: 1,
        difficulty: 'easy'
      },
      {
        question: `What should you consider when using ${topicName}?`,
        options: [
          `Only speed`,
          `Data integrity, security, and performance`,
          `Only storage capacity`,
          `Only ease of use`
        ],
        correct: 1,
        difficulty: 'medium'
      }
    ];
  } else if (normalizedCategory.includes('FULL STACK') || normalizedCategory.includes('STACK')) {
    // Full Stack category
    questionTemplates = [
      {
        question: `What is ${topicName} used for in web development?`,
        options: [
          `Backend only`,
          `Frontend only`,
          `Both frontend and backend development`,
          `Database only`
        ],
        correct: 2,
        difficulty: 'easy'
      },
      {
        question: `Which of the following is a key feature of ${topicName}?`,
        options: [
          `User interface creation`,
          `Server-side logic`,
          `Data management`,
          `All of the above`
        ],
        correct: 3,
        difficulty: 'medium'
      },
      {
        question: `What is the best practice when using ${topicName}?`,
        options: [
          `Ignore user experience`,
          `Focus on responsive design and performance`,
          `Use only basic features`,
          `Avoid modern practices`
        ],
        correct: 1,
        difficulty: 'medium'
      },
      {
        question: `What is a common use case for ${topicName}?`,
        options: [
          `Building web applications`,
          `Mobile app development`,
          `Desktop applications`,
          `All of the above`
        ],
        correct: 0,
        difficulty: 'easy'
      },
      {
        question: `What should you learn alongside ${topicName}?`,
        options: [
          `Only this technology`,
          `Related technologies and best practices`,
          `Nothing else`,
          `Only theory`
        ],
        correct: 1,
        difficulty: 'easy'
      }
    ];
  } else {
    // Generic fallback - but still topic-specific
    questionTemplates = [
      {
        question: `What is ${topicName} primarily used for?`,
        options: [
          `Building applications and systems`,
          `Data storage only`,
          `Network configuration`,
          `File management only`
        ],
        correct: 0,
        difficulty: 'easy'
      },
      {
        question: `Which of the following is a key feature of ${topicName}?`,
        options: [
          `Performance optimization`,
          `Ease of use`,
          `Wide community support`,
          `All of the above`
        ],
        correct: 3,
        difficulty: 'medium'
      },
      {
        question: `What is the best practice when working with ${topicName}?`,
        options: [
          `Ignore documentation`,
          `Follow best practices and standards`,
          `Use only basic features`,
          `Avoid learning`
        ],
        correct: 1,
        difficulty: 'medium'
      },
      {
        question: `Which tool is commonly used with ${topicName}?`,
        options: [
          `Development tools`,
          `Version control systems`,
          `Testing frameworks`,
          `All of the above`
        ],
        correct: 3,
        difficulty: 'easy'
      },
      {
        question: `What should you consider when learning ${topicName}?`,
        options: [
          `Only theoretical knowledge`,
          `Practical hands-on experience`,
          `Memorizing only`,
          `Avoiding practice`
        ],
        correct: 1,
        difficulty: 'easy'
      }
    ];
  }
  
  // Repeat templates to reach numQuestions, with variety
  for (let i = 0; i < numQuestions; i++) {
    const templateIndex = i % questionTemplates.length;
    const question = { ...questionTemplates[templateIndex] };
    
    // Vary difficulty distribution: 40% easy, 40% medium, 20% hard
    if (!question.difficulty) {
      const ratio = i / numQuestions;
      if (ratio < 0.4) question.difficulty = 'easy';
      else if (ratio < 0.8) question.difficulty = 'medium';
      else question.difficulty = 'hard';
    }
    
    questions.push(question);
  }
  
  // Shuffle to avoid predictable patterns
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  
  return questions;
}

module.exports = {
  QUESTION_BANK,
  getQuestionsForTopic,
  generateGenericQuestions
};

