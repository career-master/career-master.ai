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
  
  // Extract the actual topic name if it's in format "CATEGORY - TOPIC"
  // e.g., "PROGRAMMING LANGAUGES - C" -> "C"
  if (normalizedTopic.includes(' - ')) {
    const parts = normalizedTopic.split(' - ');
    if (parts.length > 1) {
      normalizedTopic = parts[parts.length - 1].trim(); // Take the last part (the actual topic)
    }
  }
  
  // Try exact match first
  let topicQuestions = QUESTION_BANK[normalizedTopic] || [];
  
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

