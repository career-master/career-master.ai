const Subject = require('../subjects/subjects.model');
const Topic = require('../topics/topics.model');
const Quiz = require('../quiz/quiz.model');
const QuizSet = require('../quiz-sets/quiz-sets.model');
const Cheatsheet = require('../cheatsheets/cheatsheets.model');
const User = require('../user/users.model');
const { QUESTION_TYPES } = require('../quiz/question-types.config');

/**
 * Default Course Seed
 * Creates a default "General Knowledge" course with topic, quiz, and cheatsheet
 * 
 * IMPORTANT: All quizzes created by this seed MUST be linked to topics via QuizSet.
 * The General Knowledge quiz is linked to ALL topics in the subject to ensure
 * users can access it from any subtopic.
 */
class DefaultCourseSeed {
  /**
   * Seed default course data
   * @returns {Promise<void>}
   */
  static async seedDefaultCourse() {
    try {
      // Find or get admin user for createdBy fields
      const adminUser = await User.findOne({ roles: { $in: ['super_admin'] } });
      if (!adminUser) {
        console.log('⚠️  No admin user found. Skipping default course seed.');
        return;
      }

      const createdBy = adminUser._id;

      // Check if default course already exists
      let savedSubject = await Subject.findOne({ 
        title: 'General Knowledge',
        createdBy: createdBy
      });

      if (savedSubject) {
        // Check if topics exist
        const existingTopics = await Topic.find({ subjectId: savedSubject._id });
        if (existingTopics.length > 0) {
          // Backfill level on existing General Knowledge quiz for filter testing
          const gkQuiz = await Quiz.findOne({ title: 'General Knowledge Quiz - 20 Questions' });
          if (gkQuiz && !gkQuiz.level) {
            gkQuiz.level = 'basic';
            await gkQuiz.save();
            console.log('✅ Set level on existing General Knowledge quiz');
          }
          console.log('✅ Default course already exists with topics');
          return;
        }
        console.log('⚠️  Subject exists but no topics found. Adding topics...');
      } else {
        console.log('🔄 Seeding default course...');

        // 1. Create Subject (Course)
        const subject = new Subject({
          title: 'General Knowledge',
          description: 'Test your knowledge with this comprehensive general knowledge quiz covering various topics including science, history, geography, and more.',
          category: 'General',
          level: 'basic',
          isActive: true,
          requiresApproval: false, // Make it accessible to all
          createdBy: createdBy,
          order: 1,
          courseCategories: [] // Empty array means available to all users regardless of course selection
        });

        savedSubject = await subject.save();
        console.log('✅ Created subject: General Knowledge');
      }

      // 2. Create Multiple Topics (Subtopics) with Theory Content
      const topicsData = [
        {
          title: 'Geography Fundamentals',
          description: 'Learn about world geography including countries, capitals, rivers, oceans, and continents.',
          order: 1,
          theory: `# Geography Fundamentals

## Introduction to World Geography

Geography is the study of places and the relationships between people and their environments. It helps us understand the world we live in.

## Continents

There are **7 continents** on Earth:

1. **Asia** - The largest continent, home to over 4.6 billion people
2. **Africa** - The second-largest continent, rich in natural resources
3. **North America** - Includes countries like USA, Canada, and Mexico
4. **South America** - Known for the Amazon rainforest
5. **Antarctica** - The coldest and most remote continent
6. **Europe** - Rich in history and culture
7. **Australia** - The smallest continent, also called Oceania

## Major Oceans

The world has **5 major oceans**:

1. **Pacific Ocean** - The largest ocean, covering about one-third of Earth's surface
2. **Atlantic Ocean** - The second-largest, separating Americas from Europe and Africa
3. **Indian Ocean** - Located between Africa, Asia, and Australia
4. **Southern Ocean** - Surrounds Antarctica
5. **Arctic Ocean** - The smallest and coldest ocean

## Important Countries and Capitals

### Asia
- **Japan**: Tokyo
- **China**: Beijing
- **India**: New Delhi
- **South Korea**: Seoul
- **Thailand**: Bangkok

### Europe
- **United Kingdom**: London
- **France**: Paris
- **Germany**: Berlin
- **Italy**: Rome
- **Spain**: Madrid

### Americas
- **United States**: Washington D.C.
- **Canada**: Ottawa
- **Brazil**: Brasília
- **Mexico**: Mexico City
- **Argentina**: Buenos Aires

### Africa
- **South Africa**: Cape Town (legislative), Pretoria (administrative)
- **Egypt**: Cairo
- **Nigeria**: Abuja
- **Kenya**: Nairobi

### Oceania
- **Australia**: Canberra
- **New Zealand**: Wellington

## Major Rivers

1. **Nile River** (6,650 km) - Longest river in the world, flows through Egypt
2. **Amazon River** (6,400 km) - Largest by volume, flows through South America
3. **Yangtze River** (6,300 km) - Longest in Asia, flows through China
4. **Mississippi River** (3,730 km) - Major river in North America
5. **Ganges River** (2,525 km) - Sacred river in India

## Major Deserts

1. **Sahara Desert** - Largest hot desert, located in Africa
2. **Arabian Desert** - Located in the Arabian Peninsula
3. **Gobi Desert** - Located in Asia (Mongolia and China)
4. **Kalahari Desert** - Located in Southern Africa
5. **Patagonian Desert** - Located in South America

## Key Facts

- **Smallest Country**: Vatican City (0.44 km²)
- **Largest Country**: Russia (17.1 million km²)
- **Highest Mountain**: Mount Everest (8,848 meters)
- **Deepest Ocean Trench**: Mariana Trench (11,034 meters)
- **Largest Lake**: Caspian Sea (371,000 km²)

## Climate Zones

1. **Tropical** - Hot and humid year-round
2. **Temperate** - Moderate temperatures with distinct seasons
3. **Polar** - Very cold, near the poles
4. **Desert** - Very dry with extreme temperatures
5. **Mediterranean** - Mild, wet winters and hot, dry summers

Understanding geography helps us appreciate the diversity of our planet and understand how physical features influence human activities.`
        },
        {
          title: 'Science Basics',
          description: 'Explore fundamental scientific concepts including chemistry, physics, and biology.',
          order: 2,
          theory: `# Science Basics

## Introduction to Science

Science is the systematic study of the natural world through observation and experimentation. It helps us understand how things work.

## Chemistry Fundamentals

### Chemical Elements

**Elements** are pure substances that cannot be broken down into simpler substances. There are 118 known elements.

### Important Chemical Symbols

- **H** - Hydrogen (lightest element)
- **O** - Oxygen (essential for life)
- **C** - Carbon (basis of organic chemistry)
- **N** - Nitrogen (78% of Earth's atmosphere)
- **Fe** - Iron (most common metal)
- **Au** - Gold (precious metal)
- **Ag** - Silver (precious metal)
- **Na** - Sodium
- **Cl** - Chlorine

### Common Chemical Formulas

- **H₂O** - Water (two hydrogen atoms, one oxygen atom)
- **CO₂** - Carbon Dioxide (one carbon, two oxygen)
- **NaCl** - Salt (Sodium Chloride)
- **C₆H₁₂O₆** - Glucose (sugar)
- **O₂** - Oxygen gas
- **H₂** - Hydrogen gas

### States of Matter

1. **Solid** - Has definite shape and volume
2. **Liquid** - Has definite volume but no definite shape
3. **Gas** - No definite shape or volume
4. **Plasma** - Ionized gas (found in stars)

## Physics Fundamentals

### Speed of Light

- **Speed of Light in Vacuum**: Approximately **300,000 km/s** (186,000 miles/s)
- Light travels fastest in vacuum
- Nothing can travel faster than light
- Light from the Sun takes about 8 minutes to reach Earth

### Gravity

- **Gravity** is the force that attracts objects toward each other
- On Earth, gravity pulls objects downward at 9.8 m/s²
- The Moon's gravity is about 1/6th of Earth's gravity

### Energy

- **Kinetic Energy** - Energy of motion
- **Potential Energy** - Stored energy
- **Energy cannot be created or destroyed**, only converted (Law of Conservation of Energy)

### Matter Properties

- **Density** - Mass per unit volume
- **Hardest Natural Substance**: Diamond
- **Most Dense Element**: Osmium
- **Lightest Element**: Hydrogen

## Biology Fundamentals

### Classification of Living Things

Living things are classified into **5 kingdoms**:

1. **Animalia** - Animals
2. **Plantae** - Plants
3. **Fungi** - Mushrooms, yeasts
4. **Protista** - Single-celled organisms
5. **Monera** - Bacteria

### Largest and Smallest

- **Largest Mammal**: Blue Whale (up to 30 meters long, 200 tons)
- **Largest Land Animal**: African Elephant
- **Tallest Animal**: Giraffe (up to 6 meters)
- **Smallest Mammal**: Bumblebee Bat (2 grams)

### Human Body Facts

- **Number of Bones**: 206 (adults)
- **Largest Organ**: Skin
- **Strongest Muscle**: Jaw muscle
- **Fastest Growing Organ**: Liver

## Scientific Discoveries

### Important Discoveries

- **Penicillin** (1928) - Discovered by **Alexander Fleming**, revolutionized medicine
- **Gravity** (1687) - Described by **Isaac Newton**
- **Theory of Relativity** (1905) - Developed by **Albert Einstein**
- **DNA Structure** (1953) - Discovered by Watson and Crick
- **Evolution** (1859) - Theory proposed by **Charles Darwin**

### Famous Scientists

- **Isaac Newton** - Laws of motion and gravity
- **Albert Einstein** - Theory of relativity
- **Marie Curie** - Radioactivity research
- **Charles Darwin** - Theory of evolution
- **Galileo Galilei** - Astronomy and physics

## Space Science

### Our Solar System

- **8 Planets**: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
- **Largest Planet**: Jupiter
- **Smallest Planet**: Mercury
- **Hottest Planet**: Venus
- **Coldest Planet**: Neptune

### Moon Landing

- **First Man on Moon**: **Neil Armstrong** (July 20, 1969)
- **Mission**: Apollo 11
- **Famous Quote**: "That's one small step for man, one giant leap for mankind"

### Space Facts

- **Distance to Moon**: ~384,400 km
- **Distance to Sun**: ~150 million km (1 Astronomical Unit)
- **Speed of Earth's Rotation**: ~1,670 km/h at equator
- **Age of Universe**: ~13.8 billion years

Understanding science helps us make sense of the world around us and drives technological advancement.`
        },
        {
          title: 'World History',
          description: 'Learn about major historical events, wars, and important figures that shaped our world.',
          order: 3,
          theory: `# World History

## Introduction to History

History is the study of past events, particularly human affairs. Understanding history helps us learn from the past and shape the future.

## Major Wars

### World War I (1914-1918)

- **Duration**: 4 years
- **Main Participants**: Allied Powers (UK, France, Russia) vs Central Powers (Germany, Austria-Hungary)
- **Key Event**: Assassination of Archduke Franz Ferdinand (1914)
- **Result**: Allied victory, Treaty of Versailles
- **Casualties**: Over 20 million deaths

### World War II (1939-1945)

- **Duration**: 6 years
- **End Date**: **1945**
- **Main Participants**: Allies (USA, UK, USSR, France) vs Axis (Germany, Italy, Japan)
- **Key Events**:
  - Invasion of Poland (1939) - Start of war
  - Pearl Harbor attack (1941) - USA enters war
  - D-Day (1944) - Allied invasion of Normandy
  - Atomic bombs on Hiroshima and Nagasaki (1945)
- **Result**: Allied victory
- **Casualties**: Over 70 million deaths (deadliest conflict in history)

## Important Historical Figures

### Explorers

- **Christopher Columbus** (1451-1506) - Discovered America (1492)
- **Marco Polo** (1254-1324) - Traveled to China and Asia
- **Vasco da Gama** (1460-1524) - First European to reach India by sea

### Scientists and Inventors

- **Alexander Fleming** (1881-1955) - Discovered **penicillin** (1928)
- **Isaac Newton** (1643-1727) - Laws of motion and gravity
- **Albert Einstein** (1879-1955) - Theory of relativity
- **Marie Curie** (1867-1934) - Radioactivity research

### Space Exploration

- **Yuri Gagarin** (1934-1968) - First human in space (1961)
- **Neil Armstrong** (1930-2012) - **First man on the moon** (1969)
- **Buzz Aldrin** - Second man on the moon (1969)

## Ancient Civilizations

### Ancient Egypt

- **Pyramids of Giza** - Built around 2580-2560 BC
- **Pharaohs** - Rulers of ancient Egypt
- **Hieroglyphics** - Ancient Egyptian writing system

### Ancient Greece

- **Democracy** - Invented in Athens (5th century BC)
- **Famous Philosophers**: Socrates, Plato, Aristotle
- **Olympic Games** - Started in ancient Greece (776 BC)

### Roman Empire

- **Duration**: 27 BC - 476 AD
- **Famous Emperors**: Julius Caesar, Augustus, Nero
- **Contributions**: Law, architecture, engineering

## Modern History

### Industrial Revolution (1760-1840)

- **Started in**: Great Britain
- **Key Inventions**: Steam engine, spinning jenny, power loom
- **Impact**: Transformed society from agricultural to industrial

### Renaissance (14th-17th century)

- **Meaning**: "Rebirth" of art, culture, and learning
- **Key Figures**: Leonardo da Vinci, Michelangelo, Shakespeare
- **Location**: Started in Italy, spread throughout Europe

## Important Dates

- **1492** - Columbus discovers America
- **1776** - American Declaration of Independence
- **1789** - French Revolution begins
- **1914-1918** - World War I
- **1939-1945** - World War II
- **1969** - First moon landing
- **1989** - Fall of Berlin Wall

## Historical Discoveries

### Medical Breakthroughs

- **Penicillin** (1928) - First antibiotic, saved millions of lives
- **Vaccination** (1796) - Smallpox vaccine by Edward Jenner
- **X-rays** (1895) - Discovered by Wilhelm Röntgen

### Technological Advances

- **Printing Press** (1440) - Invented by Johannes Gutenberg
- **Telephone** (1876) - Invented by Alexander Graham Bell
- **Internet** (1960s-1990s) - Developed gradually

Understanding history helps us appreciate how past events shaped our present world and guides us in making better decisions for the future.`
        },
        {
          title: 'Literature and Arts',
          description: 'Explore famous authors, literary works, and artistic masterpieces from around the world.',
          order: 4,
          theory: `# Literature and Arts

## Introduction to Literature

Literature is written works, especially those considered of superior or lasting artistic merit. It reflects human experiences and emotions.

## Famous Authors and Their Works

### William Shakespeare (1564-1616)

**The Bard of Avon** - Considered the greatest writer in the English language.

**Famous Works**:
- **Romeo and Juliet** - Tragic love story of two young lovers
- **Hamlet** - "To be or not to be, that is the question"
- **Macbeth** - Tragedy about ambition and power
- **Othello** - Tragedy about jealousy
- **A Midsummer Night's Dream** - Comedy
- **Julius Caesar** - Historical tragedy

**Famous Quotes**:
- "All the world's a stage" (As You Like It)
- "To be or not to be" (Hamlet)
- "What's in a name? That which we call a rose by any other name would smell as sweet" (Romeo and Juliet)

### George Orwell (1903-1950)

**Famous Works**:
- **1984** (1949) - Dystopian novel about totalitarianism
- **Animal Farm** (1945) - Political allegory
- **Down and Out in Paris and London** (1933)

**Key Themes**: Political oppression, surveillance, truth manipulation

### Other Famous Authors

- **Charles Dickens** (1812-1870) - "A Tale of Two Cities", "Oliver Twist"
- **Jane Austen** (1775-1817) - "Pride and Prejudice", "Sense and Sensibility"
- **Mark Twain** (1835-1910) - "The Adventures of Tom Sawyer", "Huckleberry Finn"
- **J.K. Rowling** - "Harry Potter" series
- **J.R.R. Tolkien** - "The Lord of the Rings", "The Hobbit"

## Famous Paintings and Artists

### Leonardo da Vinci (1452-1519)

**The Renaissance Master** - Painter, inventor, scientist, and polymath.

**Famous Works**:
- **Mona Lisa** (1503-1519) - World's most famous painting, located in Louvre Museum, Paris
- **The Last Supper** (1495-1498) - Mural painting in Milan
- **Vitruvian Man** (1490) - Drawing showing human proportions

**Interesting Facts**:
- Painted the Mona Lisa over 16 years
- The painting was stolen in 1911 and recovered in 1913
- Estimated value: Over $850 million

### Other Famous Artists

- **Vincent van Gogh** (1853-1890) - "Starry Night", "Sunflowers"
- **Pablo Picasso** (1881-1973) - Co-founder of Cubism, "Guernica"
- **Michelangelo** (1475-1564) - "The Creation of Adam" (Sistine Chapel ceiling)
- **Claude Monet** (1840-1926) - Impressionist painter, "Water Lilies"

## Literary Genres

### Fiction Genres

1. **Novel** - Long fictional narrative
2. **Short Story** - Brief fictional narrative
3. **Poetry** - Verse writing with rhythm and imagery
4. **Drama** - Plays written for performance
5. **Science Fiction** - Stories about future and technology
6. **Fantasy** - Stories with magical elements
7. **Mystery** - Stories involving puzzles and crimes
8. **Romance** - Stories focused on romantic relationships

### Non-Fiction Genres

1. **Biography** - Life story of a person
2. **Autobiography** - Life story written by the person themselves
3. **History** - Accounts of past events
4. **Essay** - Short piece of writing on a subject
5. **Memoir** - Personal account of experiences

## Famous Literary Quotes

- **"It was the best of times, it was the worst of times"** - Charles Dickens, A Tale of Two Cities
- **"All happy families are alike; each unhappy family is unhappy in its own way"** - Leo Tolstoy, Anna Karenina
- **"It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife"** - Jane Austen, Pride and Prejudice
- **"Call me Ishmael"** - Herman Melville, Moby-Dick
- **"In a hole in the ground there lived a hobbit"** - J.R.R. Tolkien, The Hobbit

## Art Movements

### Renaissance (14th-17th century)
- **Focus**: Realism, humanism, perspective
- **Artists**: Leonardo da Vinci, Michelangelo, Raphael

### Impressionism (1860s-1880s)
- **Focus**: Light, color, everyday scenes
- **Artists**: Claude Monet, Pierre-Auguste Renoir, Edgar Degas

### Modern Art (Late 19th-20th century)
- **Focus**: Experimentation, abstraction
- **Artists**: Pablo Picasso, Vincent van Gogh, Salvador Dalí

## World's Most Famous Paintings

1. **Mona Lisa** - Leonardo da Vinci (Louvre, Paris)
2. **The Starry Night** - Vincent van Gogh (MoMA, New York)
3. **The Last Supper** - Leonardo da Vinci (Milan, Italy)
4. **The Scream** - Edvard Munch (National Gallery, Oslo)
5. **Guernica** - Pablo Picasso (Reina Sofía, Madrid)

## Literature Awards

- **Nobel Prize in Literature** - Most prestigious literary award
- **Pulitzer Prize** - American literary award
- **Booker Prize** - British literary award
- **Man Booker Prize** - International literary award

Literature and arts enrich our lives, help us understand different perspectives, and preserve human culture and history for future generations.`
        },
        {
          title: 'Mathematics Fundamentals',
          description: 'Learn basic mathematical concepts including numbers, operations, and important mathematical facts.',
          order: 5,
          theory: `# Mathematics Fundamentals

## Introduction to Mathematics

Mathematics is the study of numbers, quantities, shapes, and patterns. It's a universal language that helps us understand and describe the world.

## Number Systems

### Types of Numbers

1. **Natural Numbers** - Counting numbers: 1, 2, 3, 4, 5...
2. **Whole Numbers** - Natural numbers plus zero: 0, 1, 2, 3, 4...
3. **Integers** - Positive and negative whole numbers: ...-3, -2, -1, 0, 1, 2, 3...
4. **Rational Numbers** - Numbers that can be expressed as fractions: 1/2, 3/4, 0.5
5. **Irrational Numbers** - Cannot be expressed as fractions: π, √2
6. **Real Numbers** - All rational and irrational numbers

## Prime Numbers

### What are Prime Numbers?

**Prime numbers** are numbers greater than 1 that have only two factors: 1 and themselves.

### Smallest Prime Number

- **2** is the smallest and only even prime number
- All other even numbers are divisible by 2, so they cannot be prime

### First 10 Prime Numbers

2, 3, 5, 7, 11, 13, 17, 19, 23, 29

### Interesting Facts

- There are infinitely many prime numbers
- **1 is NOT a prime number** (it only has one factor)
- **0 is NOT a prime number** (it has infinite factors)

## Basic Operations

### Addition (+)
- Combining two or more numbers
- Example: 5 + 3 = 8

### Subtraction (-)
- Taking away one number from another
- Example: 10 - 4 = 6

### Multiplication (×)
- Repeated addition
- Example: 4 × 3 = 12 (4 + 4 + 4)

### Division (÷)
- Splitting into equal parts
- Example: 12 ÷ 3 = 4

## Mathematical Constants

### Pi (π)
- **Value**: Approximately 3.14159...
- **Definition**: Ratio of a circle's circumference to its diameter
- **Used in**: Circle calculations, trigonometry
- **Decimal places**: Infinite (never repeats)

### Euler's Number (e)
- **Value**: Approximately 2.71828...
- **Used in**: Exponential growth, logarithms

### Golden Ratio (φ)
- **Value**: Approximately 1.618...
- **Found in**: Nature, art, architecture

## Geometry Basics

### Shapes

**2D Shapes**:
- **Circle** - All points equidistant from center
- **Square** - 4 equal sides, 4 right angles
- **Rectangle** - 4 sides, opposite sides equal, 4 right angles
- **Triangle** - 3 sides, 3 angles
- **Pentagon** - 5 sides
- **Hexagon** - 6 sides

**3D Shapes**:
- **Cube** - 6 square faces
- **Sphere** - All points equidistant from center
- **Cylinder** - Circular base and top
- **Cone** - Circular base, pointed top

### Important Formulas

- **Area of Circle**: π × r² (r = radius)
- **Circumference of Circle**: 2 × π × r
- **Area of Rectangle**: length × width
- **Area of Triangle**: ½ × base × height
- **Volume of Cube**: side³
- **Volume of Sphere**: (4/3) × π × r³

## Number Facts

### Even and Odd Numbers

- **Even Numbers**: Divisible by 2 (0, 2, 4, 6, 8, 10...)
- **Odd Numbers**: Not divisible by 2 (1, 3, 5, 7, 9, 11...)

### Perfect Numbers

Numbers equal to the sum of their proper divisors:
- **6** = 1 + 2 + 3
- **28** = 1 + 2 + 4 + 7 + 14

### Fibonacci Sequence

Each number is the sum of the two preceding ones:
0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55...

Found in nature: flower petals, pinecones, shells

## Measurement Units

### Length
- **Millimeter (mm)** - Smallest common unit
- **Centimeter (cm)** - 10 mm
- **Meter (m)** - 100 cm
- **Kilometer (km)** - 1000 m

### Weight/Mass
- **Gram (g)**
- **Kilogram (kg)** - 1000 g
- **Tonne** - 1000 kg

### Time
- **Second (s)**
- **Minute** - 60 seconds
- **Hour** - 60 minutes
- **Day** - 24 hours
- **Week** - 7 days
- **Month** - 28-31 days
- **Year** - 365 days (366 in leap year)

## Mathematical Symbols

- **+** - Plus (addition)
- **-** - Minus (subtraction)
- **× or ·** - Multiply
- **÷ or /** - Divide
- **=** - Equals
- **≠** - Not equal
- **<** - Less than
- **>** - Greater than
- **≤** - Less than or equal
- **≥** - Greater than or equal
- **√** - Square root
- **π** - Pi
- **∞** - Infinity
- **%** - Percent

## Famous Mathematicians

- **Pythagoras** (570-495 BC) - Pythagorean theorem
- **Euclid** (300 BC) - "Father of Geometry"
- **Archimedes** (287-212 BC) - Calculated pi
- **Isaac Newton** (1643-1727) - Calculus
- **Albert Einstein** (1879-1955) - Used advanced mathematics in physics

Mathematics is everywhere in our daily lives and helps us solve problems, make decisions, and understand the world around us.`
        }
      ];

      // Create topics with theory content
      const createdTopics = [];
      for (const topicData of topicsData) {
        const topic = new Topic({
          subjectId: savedSubject._id,
          title: topicData.title,
          description: topicData.description,
          order: topicData.order,
          isActive: true,
          requiredQuizzesToUnlock: 0, // All topics unlocked from start for General Knowledge course
          createdBy: createdBy
        });

        const savedTopic = await topic.save();
        createdTopics.push({ topic: savedTopic, theory: topicData.theory });
        console.log(`✅ Created topic: ${topicData.title}`);
      }

      const mainTopic = createdTopics[0].topic; // Use first topic for the quiz

      // 3. Create Quiz with 20 General Knowledge Questions
      const quiz = new Quiz({
        title: 'General Knowledge Quiz - 20 Questions',
        description: 'Test your general knowledge with 20 questions covering various topics including science, history, geography, literature, and more.',
        durationMinutes: 30,
        availableToEveryone: true,
        isActive: true,
        useSections: false,
        level: 'basic',
        questions: [
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the capital city of Australia?',
            options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'Who wrote the novel "1984"?',
            options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'J.D. Salinger'],
            correctOptionIndex: 0,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the chemical symbol for gold?',
            options: ['Go', 'Gd', 'Au', 'Ag'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'medium'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'In which year did World War II end?',
            options: ['1943', '1944', '1945', '1946'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the largest planet in our solar system?',
            options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'Who painted the Mona Lisa?',
            options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the smallest prime number?',
            options: ['0', '1', '2', '3'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'Which ocean is the largest?',
            options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
            correctOptionIndex: 3,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the speed of light in vacuum (approximately)?',
            options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
            correctOptionIndex: 0,
            marks: 2,
            negativeMarks: 0.5,
            difficulty: 'hard'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'Who discovered penicillin?',
            options: ['Marie Curie', 'Alexander Fleming', 'Louis Pasteur', 'Robert Koch'],
            correctOptionIndex: 1,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'medium'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the longest river in the world?',
            options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
            correctOptionIndex: 1,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'medium'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'In which continent is the Sahara Desert located?',
            options: ['Asia', 'Africa', 'Australia', 'South America'],
            correctOptionIndex: 1,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the hardest natural substance on Earth?',
            options: ['Gold', 'Iron', 'Diamond', 'Platinum'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'Who wrote "Romeo and Juliet"?',
            options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
            correctOptionIndex: 1,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the capital city of Japan?',
            options: ['Osaka', 'Kyoto', 'Tokyo', 'Yokohama'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'How many continents are there?',
            options: ['5', '6', '7', '8'],
            correctOptionIndex: 2,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the chemical formula for water?',
            options: ['H2O', 'CO2', 'O2', 'NaCl'],
            correctOptionIndex: 0,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'Who was the first person to step on the moon?',
            options: ['Buzz Aldrin', 'Neil Armstrong', 'Michael Collins', 'Yuri Gagarin'],
            correctOptionIndex: 1,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the largest mammal in the world?',
            options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
            correctOptionIndex: 1,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          },
          {
            questionType: QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE,
            questionText: 'What is the smallest country in the world?',
            options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
            correctOptionIndex: 1,
            marks: 1,
            negativeMarks: 0,
            difficulty: 'easy'
          }
        ],
        createdBy: createdBy
      });

      // Add course categories - empty array means available to all users
      quiz.courseCategories = [];
      
      const savedQuiz = await quiz.save();
      console.log('✅ Created quiz: General Knowledge Quiz - 20 Questions');

      // 4. Create Quiz Sets (Link quiz to ALL topics so users can access it from any subtopic)
      // CRITICAL: Every quiz MUST be linked to at least one topic via QuizSet
      let quizSetsCreated = 0;
      for (let i = 0; i < createdTopics.length; i++) {
        const topic = createdTopics[i].topic;
        
        // Check if QuizSet already exists
        const existingQuizSet = await QuizSet.findOne({
          topicId: topic._id,
          quizId: savedQuiz._id
        });
        
        if (!existingQuizSet) {
          const quizSet = new QuizSet({
            topicId: topic._id,
            quizId: savedQuiz._id,
            setName: 'General Knowledge Assessment',
            order: 1,
            isActive: true,
            assignedBy: createdBy
          });

          await quizSet.save();
          console.log(`✅ Created quiz set: Linked quiz to topic "${topic.title}"`);
          quizSetsCreated++;
        } else {
          console.log(`ℹ️  Quiz set already exists for topic "${topic.title}"`);
        }
      }
      
      // Verify at least one QuizSet was created
      if (quizSetsCreated === 0 && createdTopics.length > 0) {
        const existingCount = await QuizSet.countDocuments({ quizId: savedQuiz._id, isActive: true });
        if (existingCount === 0) {
          throw new Error(`Failed to create QuizSet for quiz "${savedQuiz.title}". Quiz must be linked to at least one topic.`);
        }
      }
      
      console.log(`✅ Quiz linked to ${createdTopics.length} topic(s) via QuizSet`);

      // 5. Create Cheatsheets (Theory Content) for each topic
      for (const { topic, theory } of createdTopics) {
        const cheatsheet = new Cheatsheet({
          topicId: topic._id,
          createdBy: createdBy,
          content: theory,
          contentType: 'markdown',
          estReadMinutes: Math.ceil(theory.length / 1000) + 5, // Estimate based on content length
          resources: [
            {
              title: 'Additional Learning Resources',
              url: 'https://www.britannica.com',
              type: 'link'
            },
            {
              title: 'Educational Videos',
              url: 'https://www.khanacademy.org',
              type: 'video'
            }
          ]
        });

        await cheatsheet.save();
        console.log(`✅ Created cheatsheet for topic: ${topic.title}`);
      }

      console.log('✅ Default course seeded successfully!');
      console.log(`   Subject: ${savedSubject.title}`);
      console.log(`   Topics Created: ${createdTopics.length}`);
      createdTopics.forEach(({ topic }) => {
        console.log(`     - ${topic.title}`);
      });
      console.log(`   Quiz: ${savedQuiz.title} (${savedQuiz.questions.length} questions)`);
      console.log(`   Quiz Sets: ${createdTopics.length} (quiz linked to all topics)`);
      console.log(`   Cheatsheets: ${createdTopics.length} created with theory content`);

    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Default course already exists (duplicate key)');
        return;
      }
      console.error('❌ Error seeding default course:', error.message);
      // Don't throw - allow server to start even if course seeding fails
    }
  }
}

module.exports = DefaultCourseSeed;

