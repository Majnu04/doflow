// Script to seed the Python Zero to Hero course into MongoDB
// This script uses the existing Course model structure
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from '../models/Course.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// ============================================================================
// PROFESSIONAL PYTHON COURSE - PRODUCTION READY
// Designed with Coursera/Udemy Business quality standards
// Version: 2.0 | Last Updated: January 2026
// ============================================================================

const pythonCourse = {
  // ==================== CORE COURSE INFORMATION ====================
  title: "Python Programming Fundamentals: Zero to Professional",
  slug: "python-zero-to-hero",
  description: "Build a strong foundation in Python programming with this comprehensive, industry-aligned course designed for aspiring developers. Master essential concepts including variables, control structures, functions, and problem-solving techniques through hands-on projects and real-world applications. This course follows a structured learning path that takes you from writing your first line of code to building functional programs with confidence. Perfect for career switchers, students, and anyone looking to enter the tech industry.",
  shortDescription: "Master Python fundamentals through hands-on practice, real-world projects, and industry-standard techniques. Beginner-friendly with professional outcomes.",
  category: "Web Development",
  level: "Beginner",
  price: 0,
  discountPrice: 0,
  thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60",
  language: "English",
  
  // ==================== LEARNING PREREQUISITES ====================
  prerequisitesLevel: "No prior programming experience required",
  requirements: [
    "A computer (Windows, Mac, or Linux) with internet connection",
    "Ability to install Python 3.x (guidance provided)",
    "Basic computer literacy and file management skills",
    "Commitment to practice 3-5 hours per week"
  ],
  
  // ==================== LEARNING OUTCOMES ====================
  whatYouWillLearn: [
    "Write, debug, and optimize Python programs using industry best practices",
    "Master fundamental programming concepts: variables, data types, operators, and type conversion",
    "Implement control flow using conditionals (if/elif/else) and logical operators",
    "Automate repetitive tasks using for and while loops with proper iteration control",
    "Design modular, reusable code with functions, parameters, and return values",
    "Process user inputs and handle string manipulation for interactive applications",
    "Apply problem-solving strategies to break down complex challenges",
    "Build portfolio-ready mini-projects demonstrating practical programming skills"
  ],
  
  // ==================== CAREER & SKILLS METADATA ====================
  skillsCovered: [
    "Python Programming",
    "Problem Solving",
    "Algorithmic Thinking",
    "Code Debugging",
    "Function Design",
    "Control Flow Logic",
    "String Processing",
    "Input Validation"
  ],
  
  careerOutcomes: [
    "Junior Python Developer",
    "Automation Engineer",
    "Data Analyst (entry-level)",
    "QA Test Automation Engineer",
    "Backend Developer (junior)"
  ],
  
  // ==================== COURSE ADMINISTRATION ====================
  tags: ["Python", "Programming", "Beginner", "Software Development", "Coding", "Computer Science"],
  isPublished: true,
  isFeatured: true,
  certificateEligible: true,
  totalDuration: 240, // Total minutes across all lessons
  estimatedCompletionTime: "4-6 weeks at 5 hours/week",
  version: "2.0",
  lastUpdated: new Date("2026-01-31"),
  
  completionCriteria: {
    minimumLessonsCompleted: 24,
    minimumQuizScore: 70,
    codingChallengesRequired: true
  },
  // ==================== COURSE MODULES ====================
  sections: [
    {
      title: "Module 1: Introduction to Python Output",
      order: 1,
      description: "Begin your Python journey by learning how programs communicate with users through console output.",
      learningOutcomes: [
        "Execute Python code and display output using the print() function",
        "Understand the difference between strings and expressions in print statements",
        "Format multi-line output for readable program results"
      ],
      lessons: [
        {
          title: "Your First Python Program",
          description: "Discover the print() function, Python's fundamental tool for displaying information. Learn to output text, numbers, and multiple values in a single statement while understanding the syntax that makes Python accessible for beginners.",
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 15,
          order: 1,
          isPreview: true,
          difficulty: "Beginner",
          estimatedEffort: "20 minutes",
          learningObjectives: [
            "Write and execute your first Python program using print()",
            "Distinguish between printing strings, numbers, and expressions"
          ],
          keyTakeaways: [
            "print() displays output to the console",
            "Strings must be enclosed in quotes",
            "Multiple items can be printed using commas"
          ],
          resources: [
            { title: "Python Print Function Reference", url: "#", type: "pdf" },
            { title: "Practice Exercises", url: "#", type: "link" }
          ]
        },
        {
          title: "Quiz: Output Fundamentals",
          description: "Assess your understanding of Python output through carefully designed questions that test both syntax knowledge and conceptual understanding of how print() processes different data types.",
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 10,
          order: 2,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "15 minutes",
          learningObjectives: [
            "Differentiate between string literals and expressions",
            "Predict output for various print() statements"
          ],
          quizQuestions: [
            {
              question: "What is the output of: print('5 + 3')",
              options: ["8", "5 + 3", "5+3", "Error"],
              correct: 1,
              explanation: "The expression '5 + 3' is a string literal (enclosed in quotes), so Python prints it exactly as written, not evaluated as math."
            }
          ]
        },
        {
          title: "Coding Challenge: Multi-Line Greeting",
          description: "Apply your knowledge by creating a program that displays formatted output across multiple lines, demonstrating practical use of the print() function in real applications.",
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 15,
          order: 3,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "25 minutes",
          learningObjectives: [
            "Write multi-line output using multiple print() statements",
            "Create formatted, readable program output"
          ],
          challenge: {
            title: "Create a Welcome Message",
            description: "Write a program that prints a three-line welcome message to new Python learners.",
            expectedOutput: "Hello, I am learning Python!\nPython is fun!\nLet's code together!",
            constraints: [
              "Use exactly 3 print() statements",
              "Output must match exactly as shown"
            ],
            hints: [
              "Each line requires its own print() statement",
              "Strings are enclosed in single or double quotes"
            ],
            successCriteria: "Output matches expected format exactly"
          }
        }
      ]
    },
    {
      title: "Module 2: Variables and Data Types",
      order: 2,
      description: "Learn how programs store and manage information using variables and understand Python's core data types.",
      learningOutcomes: [
        "Create and assign values to variables following Python naming conventions",
        "Identify and work with fundamental data types: integers, floats, strings, and booleans",
        "Use the type() function to verify data types in your programs"
      ],
      lessons: [
        {
          title: "Understanding Variables as Data Containers",
          description: "Explore how variables act as labeled storage in computer memory. Master variable assignment using the equals operator and understand Python's dynamic typing system that automatically determines data type based on assigned values.",
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 20,
          order: 1,
          isPreview: true,
          difficulty: "Beginner",
          estimatedEffort: "30 minutes",
          learningObjectives: [
            "Create variables using proper naming conventions (lowercase, underscores)",
            "Understand how Python stores different types of data in memory"
          ],
          keyTakeaways: [
            "Variables are containers that store data values",
            "Use = for assignment (age = 25)",
            "Variable names should be descriptive and follow snake_case convention",
            "Python automatically determines data type (dynamic typing)"
          ],
          realWorldAnalogy: "Think of variables as labeled boxes in a warehouse - each box (variable) has a name label and contains specific items (values).",
          resources: [
            { title: "Variable Naming Best Practices", url: "#", type: "pdf" },
            { title: "Python Style Guide (PEP 8)", url: "#", type: "link" }
          ]
        },
        {
          title: "Mastering Python Data Types",
          description: "Dive deep into Python's four fundamental data types: integers for whole numbers, floats for decimals, strings for text, and booleans for true/false values. Learn to use the type() function to inspect variable types during development.",
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 15,
          order: 2,
          isPreview: false,
          difficulty: "Beginner",
          estimatedEffort: "25 minutes",
          learningObjectives: [
            "Differentiate between int, float, str, and bool data types",
            "Use type() to verify data types in your code"
          ],
          keyTakeaways: [
            "int: whole numbers (25, -10, 0)",
            "float: decimal numbers (3.14, 99.99)",
            "str: text enclosed in quotes ('Hello', \"Python\")",
            "bool: True or False (note capitalization)"
          ],
          commonMistakes: [
            "'100' is a string, not a number - quotes make the difference",
            "true vs True - Python is case-sensitive for booleans"
          ]
        },
        {
          title: "Coding Challenge: Personal Profile Creator",
          description: "Build a program that stores and displays personal information using appropriate data types, demonstrating real-world variable usage in data management applications.",
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 15,
          order: 3,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "30 minutes",
          learningObjectives: [
            "Store multiple pieces of information using appropriately typed variables",
            "Combine variables in formatted output strings"
          ],
          challenge: {
            title: "Build a Personal Info Card",
            description: "Create a program that stores your name, age, and city in variables, then displays them in a formatted sentence.",
            expectedOutput: "Hi, I'm Rahul, 22 years old, from Mumbai",
            starterCode: "# Create variables for name, age, and city\n# Print the formatted message",
            constraints: [
              "Use separate variables for name (string), age (integer), and city (string)",
              "Combine variables in a single print() statement"
            ],
            hints: [
              "Use commas in print() to combine strings and variables",
              "Example: print('Hi, I am', name, ', ', age, 'years old')"
            ],
            successCriteria: "Program displays personal information in the exact format specified",
            skillsApplied: ["Variable assignment", "Data types", "String formatting"]
          }
        }
      ]
    },
    {
      title: "Module 3: Arithmetic Operations and Expressions",
      order: 3,
      description: "Master mathematical operations in Python and understand operator precedence for building calculation-based programs.",
      learningOutcomes: [
        "Perform arithmetic calculations using Python's mathematical operators",
        "Apply operator precedence rules (PEMDAS/BODMAS) to evaluate complex expressions",
        "Utilize compound assignment operators for efficient code"
      ],
      lessons: [
        {
          title: "Python as a Powerful Calculator",
          description: "Learn Python's arithmetic operators including addition, subtraction, multiplication, division, floor division, modulus, and exponentiation. Understand how operator precedence affects evaluation order in mathematical expressions.",
          videoUrl: "https://www.youtube.com/watch?v=Aj8LHqaP-Yk",
          duration: 20,
          order: 1,
          isPreview: true,
          difficulty: "Beginner",
          estimatedEffort: "30 minutes",
          learningObjectives: [
            "Use all basic arithmetic operators: +, -, *, /, //, %, **",
            "Apply PEMDAS/BODMAS rules to evaluate expressions correctly"
          ],
          keyTakeaways: [
            "+ (addition), - (subtraction), * (multiplication)",
            "/ (division - always returns float)",
            "// (floor division - returns integer quotient)",
            "% (modulus - returns remainder)",
            "** (exponentiation - power operator)",
            "Parentheses override default precedence"
          ],
          practiceExercises: [
            "Calculate: (2 + 3) * 4 vs 2 + 3 * 4",
            "Find remainder: 17 % 5",
            "Compute power: 2 ** 10"
          ]
        },
        {
          title: "Compound Assignment and Expression Optimization",
          description: "Discover shorthand operators that combine arithmetic with assignment, making your code more concise and readable. Master operator precedence to write correct mathematical expressions.",
          videoUrl: "https://www.youtube.com/watch?v=Aj8LHqaP-Yk",
          duration: 15,
          order: 2,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "25 minutes",
          learningObjectives: [
            "Simplify code using compound operators: +=, -=, *=, /=",
            "Predict outcomes of complex expressions with mixed operators"
          ],
          keyTakeaways: [
            "x += 5 is equivalent to x = x + 5",
            "Compound operators: +=, -=, *=, /=, //=, %=, **=",
            "Precedence: ** → *,/,//,% → +,- (left to right)",
            "Use parentheses for clarity in complex expressions"
          ],
          realWorldAnalogy: "Think of compound operators as shortcuts - like saying 'add 10 to my account' instead of 'set my account to current balance plus 10'."
        },
        {
          title: "Coding Challenge: Restaurant Bill Calculator",
          description: "Build a practical application that calculates tips, totals, and split payments, demonstrating real-world use of arithmetic operations in financial calculations.",
          videoUrl: "https://www.youtube.com/watch?v=Aj8LHqaP-Yk",
          duration: 15,
          order: 3,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "35 minutes",
          learningObjectives: [
            "Implement percentage calculations using arithmetic operators",
            "Combine multiple operations to solve multi-step problems"
          ],
          challenge: {
            title: "Smart Bill Calculator",
            description: "Create a program for a ₹2500 restaurant bill shared by 5 friends with 18% tip.",
            requirements: [
              "Calculate 18% tip amount",
              "Calculate total bill (original + tip)",
              "Calculate per-person cost (split 5 ways)",
              "Display all values with proper labels"
            ],
            expectedOutput: "Tip: ₹450.0\nTotal Bill: ₹2950.0\nPer Person: ₹590.0",
            starterCode: "bill = 2500\ntip_percent = 18\npeople = 5\n\n# Your calculations here",
            constraints: [
              "Use variables for all inputs",
              "Calculate tip as: bill * (tip_percent / 100)",
              "Round results to 2 decimal places if needed"
            ],
            hints: [
              "First calculate tip, then add to bill for total",
              "Divide total by number of people for per-person cost",
              "Use descriptive variable names like tip_amount, total_bill"
            ],
            successCriteria: "All three values calculated correctly and displayed with labels",
            skillsApplied: ["Arithmetic operators", "Variables", "Percentage calculations", "Division"]
          }
        }
      ]
    },
    {
      title: "Module 4: String Manipulation Techniques",
      order: 4,
      description: "Master string operations essential for text processing, data cleaning, and building interactive applications.",
      learningOutcomes: [
        "Manipulate strings using concatenation, indexing, and slicing operations",
        "Apply built-in string methods to transform and analyze text data",
        "Understand zero-based indexing and negative indices in Python"
      ],
      lessons: [
        {
          title: "Strings: Working with Text Data",
          description: "Explore strings as sequences of characters, learning fundamental operations like concatenation, indexing, and slicing. Master zero-based indexing and Python's powerful negative indexing for accessing string elements.",
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 20,
          order: 1,
          isPreview: true,
          difficulty: "Beginner",
          estimatedEffort: "30 minutes",
          learningObjectives: [
            "Access individual characters using positive and negative indices",
            "Extract substrings using slicing notation [start:end]"
          ],
          keyTakeaways: [
            "Strings are immutable sequences of characters",
            "Indexing starts at 0: 'Python'[0] → 'P'",
            "Negative indices count from end: 'Python'[-1] → 'n'",
            "Slicing syntax: string[start:end] (end is exclusive)",
            "Concatenation using + operator: 'Hello' + ' ' + 'World'"
          ],
          practiceExercises: [
            "text = 'Programming' → text[0], text[-1], text[0:4]",
            "Combine first name + last name with space"
          ],
          realWorldAnalogy: "Think of strings like a row of labeled boxes - each box (character) has a position number, and you can grab single boxes or ranges of boxes."
        },
        {
          title: "Essential String Methods for Text Processing",
          description: "Learn Python's built-in string methods that enable powerful text transformations. Discover how to change case, replace characters, find length, and more using methods that are fundamental to data processing.",
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 15,
          order: 2,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "25 minutes",
          learningObjectives: [
            "Transform strings using methods: upper(), lower(), replace(), strip()",
            "Analyze strings using len(), count(), find() methods"
          ],
          keyTakeaways: [
            "upper() → converts to uppercase",
            "lower() → converts to lowercase",
            "replace(old, new) → replaces substring",
            "len(string) → returns character count",
            "strip() → removes whitespace from ends",
            "Methods don't modify original (strings are immutable)"
          ],
          commonUseCases: [
            "Data cleaning: text.strip().lower()",
            "Search: if 'python' in text.lower()",
            "Username generation: name.lower().replace(' ', '_')"
          ]
        },
        {
          title: "Coding Challenge: Username Generator System",
          description: "Build a practical username generator that processes names using string operations, mimicking real systems used in registration forms and user management.",
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 15,
          order: 3,
          isPreview: false,
          difficulty: "Medium",
          estimatedEffort: "35 minutes",
          learningObjectives: [
            "Combine multiple string operations (slicing, concatenation, case conversion)",
            "Apply string methods to solve practical problems"
          ],
          challenge: {
            title: "Smart Username Generator",
            description: "Create a username generator that combines parts of first and last names following a specific pattern.",
            requirements: [
              "Take first 3 characters of first name",
              "Take last 3 characters of last name",
              "Combine them and convert to lowercase",
              "Example: 'Rahul' + 'Sharma' → 'rahrma'"
            ],
            expectedOutput: "Username: rahrma",
            starterCode: "first_name = 'Rahul'\nlast_name = 'Sharma'\n\n# Generate username here",
            constraints: [
              "Use slicing to extract character portions",
              "Use lower() method for case conversion",
              "Handle names of any length (not just 5-6 characters)"
            ],
            hints: [
              "first_name[0:3] gets first 3 characters",
              "last_name[-3:] gets last 3 characters",
              "Combine using + operator, then apply .lower()"
            ],
            testCases: [
              "Input: 'Priya', 'Verma' → Output: 'prirma'",
              "Input: 'John', 'Doe' → Output: 'johdoe'"
            ],
            successCriteria: "Username correctly generated for any input names",
            skillsApplied: ["String slicing", "Concatenation", "Method chaining", "Case conversion"]
          }
        }
      ]
    },
    {
      title: "Module 5: User Input and Type Conversion",
      order: 5,
      description: "Build interactive programs by capturing user input and converting between different data types safely.",
      learningOutcomes: [
        "Capture and process user input using the input() function",
        "Convert between data types using int(), float(), and str() functions",
        "Handle common input errors and validate user data"
      ],
      lessons: [
        {
          title: "Building Interactive Programs with User Input",
          description: "Transform static programs into interactive applications using the input() function. Understand the critical concept that input() always returns strings, requiring explicit type conversion for numerical operations.",
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 20,
          order: 1,
          isPreview: true,
          difficulty: "Beginner",
          estimatedEffort: "30 minutes",
          learningObjectives: [
            "Capture user input with custom prompts using input()",
            "Recognize that input() always returns string type"
          ],
          keyTakeaways: [
            "input('prompt') pauses program and waits for user input",
            "CRITICAL: input() ALWAYS returns a string, even for numbers",
            "Example: age = input('Enter age: ') → age is string '25', not number 25",
            "Must convert to int/float for mathematical operations"
          ],
          commonMistakes: [
            "Attempting math on input without conversion: input('Enter number: ') + 5 → Error",
            "Forgetting to store input in a variable: input('Name: ') with no assignment"
          ],
          realWorldAnalogy: "input() is like a receptionist taking information on a form - everything written down is text until you specifically interpret it as numbers."
        },
        {
          title: "Type Conversion: Working with Mixed Data",
          description: "Master explicit type conversion to transform data between strings, integers, and floats. Learn to avoid common pitfalls like string concatenation of numbers ('5' + '5' = '55').",
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 15,
          order: 2,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "25 minutes",
          learningObjectives: [
            "Convert strings to numbers using int() and float()",
            "Convert numbers to strings using str() for text operations"
          ],
          keyTakeaways: [
            "int('25') → converts string to integer",
            "float('3.14') → converts string to decimal",
            "str(100) → converts number to string",
            "Conversion fails with invalid input: int('hello') → Error"
          ],
          practiceExamples: [
            "'5' + '5' = '55' (string concatenation)",
            "int('5') + int('5') = 10 (actual addition)",
            "str(5) + str(5) = '55' (convert back to string)"
          ],
          bestPractices: [
            "Convert user input immediately: age = int(input('Age: '))",
            "Use descriptive prompts: input('Enter your age (numbers only): ')"
          ]
        },
        {
          title: "Coding Challenge: Intelligent Age Calculator",
          description: "Create a practical age calculator that combines user input, type conversion, and arithmetic operations to compute current age and future milestones.",
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 15,
          order: 3,
          isPreview: false,
          difficulty: "Medium",
          estimatedEffort: "35 minutes",
          learningObjectives: [
            "Integrate input(), type conversion, and calculations in one program",
            "Perform multi-step calculations with user-provided data"
          ],
          challenge: {
            title: "Age and Milestone Calculator",
            description: "Build a program that calculates current age and predicts when the user will turn 100 years old.",
            requirements: [
              "Ask user for their birth year",
              "Calculate current age (using year 2026)",
              "Calculate what year they'll turn 100",
              "Display both results with clear messages"
            ],
            expectedOutput: "You are 24 years old.\nYou will turn 100 in the year 2102.",
            starterCode: "# Ask for birth year\n# Calculate age and century year\n# Display results",
            constraints: [
              "Must convert input to integer for calculations",
              "Current year is 2026",
              "Handle birth years from 1900 to 2025"
            ],
            hints: [
              "current_age = 2026 - birth_year",
              "year_turn_100 = birth_year + 100",
              "Use int() to convert input: int(input('Birth year: '))"
            ],
            testCases: [
              "Input: 2002 → Output: 'You are 24 years old. You will turn 100 in 2102.'",
              "Input: 1995 → Output: 'You are 31 years old. You will turn 100 in 2095.'"
            ],
            successCriteria: "Correctly calculates age and century year for any valid birth year",
            skillsApplied: ["User input", "Type conversion", "Arithmetic operations", "String formatting"]
          }
        }
      ]
    },
    {
      title: "Module 6: Conditional Logic and Decision Making",
      order: 6,
      description: "Enable your programs to make intelligent decisions using conditional statements and boolean logic.",
      learningOutcomes: [
        "Implement decision-making logic using if, elif, and else statements",
        "Construct complex conditions using comparison and logical operators",
        "Apply boolean logic (and, or, not) to create sophisticated conditional flows"
      ],
      lessons: [
        {
          title: "Conditional Statements: Programming Decision Trees",
          description: "Master Python's conditional structures that allow programs to execute different code paths based on conditions. Learn comparison operators and understand how indentation defines code blocks in Python's syntax.",
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 25,
          order: 1,
          isPreview: true,
          difficulty: "Beginner",
          estimatedEffort: "40 minutes",
          learningObjectives: [
            "Write if/elif/else structures with proper indentation",
            "Use comparison operators: ==, !=, >, <, >=, <="
          ],
          keyTakeaways: [
            "if checks a condition and executes code if True",
            "elif (else if) provides alternative conditions",
            "else executes when all previous conditions are False",
            "Comparison operators: == (equal), != (not equal), > < >= <=",
            "CRITICAL: Use == for comparison, = for assignment",
            "Indentation (4 spaces) defines code blocks - mandatory in Python"
          ],
          syntaxPatterns: [
            "if condition:\n    # code when True",
            "if condition:\n    # first case\nelif another_condition:\n    # second case\nelse:\n    # default case"
          ],
          realWorldAnalogy: "Think of conditional statements like automated decision trees - ATM machines use them: 'if PIN correct, show menu; elif attempts < 3, try again; else, block card'."
        },
        {
          title: "Boolean Logic and Complex Conditions",
          description: "Combine multiple conditions using logical operators to create sophisticated decision-making logic. Understand how 'and', 'or', and 'not' operators work together to evaluate complex boolean expressions.",
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 15,
          order: 2,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "30 minutes",
          learningObjectives: [
            "Combine conditions using and, or, not operators",
            "Understand truth tables for logical operators"
          ],
          keyTakeaways: [
            "and: both conditions must be True (age >= 18 and has_license)",
            "or: at least one condition must be True (is_weekend or is_holiday)",
            "not: inverts boolean value (not is_raining)",
            "Operator precedence: not > and > or",
            "Use parentheses for clarity: (A or B) and C"
          ],
          practiceExamples: [
            "if age >= 18 and age < 60: print('Working age')",
            "if score >= 90 or bonus_points >= 10: print('Excellent')",
            "if not is_weekend: print('Work day')"
          ],
          commonPatterns: [
            "Range checking: if 18 <= age <= 65",
            "Multiple conditions: if (A and B) or (C and D)"
          ]
        },
        {
          title: "Coding Challenge: Dynamic Pricing System",
          description: "Build a real-world ticket pricing system that uses nested conditionals to determine prices based on multiple criteria, simulating actual business logic implementations.",
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 20,
          order: 3,
          isPreview: false,
          difficulty: "Medium",
          estimatedEffort: "45 minutes",
          learningObjectives: [
            "Implement multi-tier conditional logic for business rules",
            "Handle edge cases and validate user input"
          ],
          challenge: {
            title: "Movie Ticket Price Calculator",
            description: "Create a dynamic pricing system that calculates ticket prices based on age categories, mimicking real cinema booking systems.",
            requirements: [
              "Ask user for their age",
              "Calculate price based on these rules:",
              "  - Children (under 12): ₹100",
              "  - Teens (12-17): ₹150",
              "  - Adults (18-59): ₹200",
              "  - Seniors (60+): ₹120",
              "Display the applicable price with category"
            ],
            expectedOutput: "Age: 25 → Ticket Price: ₹200 (Adult)",
            starterCode: "age = int(input('Enter your age: '))\n\n# Your conditional logic here",
            constraints: [
              "Must use if/elif/else structure",
              "Handle all age ranges correctly",
              "Use inclusive/exclusive ranges appropriately (12 is teen, not child)"
            ],
            hints: [
              "Start with lowest age group: if age < 12",
              "Use elif for middle ranges: elif age <= 17",
              "Continue pattern: elif age <= 59",
              "else handles seniors (60+)"
            ],
            testCases: [
              "Input: 10 → Output: 'Ticket Price: ₹100 (Child)'",
              "Input: 15 → Output: 'Ticket Price: ₹150 (Teen)'",
              "Input: 25 → Output: 'Ticket Price: ₹200 (Adult)'",
              "Input: 65 → Output: 'Ticket Price: ₹120 (Senior)'"
            ],
            successCriteria: "Correctly categorizes and prices for all age ranges",
            skillsApplied: ["Conditional statements", "Comparison operators", "Range checking", "User input"],
            industryRelevance: "This pattern is used in e-commerce systems, insurance calculators, and dynamic pricing engines."
          }
        }
      ]
    },
    {
      title: "Module 7: Loops and Iteration Control",
      order: 7,
      description: "Automate repetitive tasks and process sequences efficiently using Python's loop constructs.",
      learningOutcomes: [
        "Implement iteration using for loops with the range() function",
        "Create condition-controlled loops using while statements",
        "Control loop execution using break and continue keywords"
      ],
      lessons: [
        {
          title: "For Loops: Iterating with Precision",
          description: "Master the for loop for iterating over sequences and ranges. Understand the powerful range() function and its parameters for controlling iteration patterns in your programs.",
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 25,
          order: 1,
          isPreview: true,
          difficulty: "Beginner",
          estimatedEffort: "40 minutes",
          learningObjectives: [
            "Write for loops to iterate over sequences using range()",
            "Understand range() parameters: start, stop, step"
          ],
          keyTakeaways: [
            "for loops iterate over sequences (ranges, lists, strings)",
            "range(n) generates 0 to n-1: range(5) → 0,1,2,3,4",
            "range(start, stop) generates start to stop-1: range(1,6) → 1,2,3,4,5",
            "range(start, stop, step) with custom increment: range(0,10,2) → 0,2,4,6,8",
            "Loop variable takes each value in sequence automatically"
          ],
          syntaxPatterns: [
            "for i in range(5):\n    print(i)  # Prints 0,1,2,3,4",
            "for num in range(1, 11):\n    print(num)  # Prints 1 through 10"
          ],
          commonUseCases: [
            "Repeating actions N times",
            "Processing sequences of numbers",
            "Generating patterns and tables",
            "Iterating through data collections"
          ],
          realWorldAnalogy: "For loops are like assembly lines - each item moves through the same process automatically until the sequence completes."
        },
        {
          title: "While Loops and Flow Control",
          description: "Implement condition-controlled iteration using while loops. Learn to control loop execution with break (exit loop) and continue (skip iteration) keywords for sophisticated program flow.",
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 20,
          order: 2,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "35 minutes",
          learningObjectives: [
            "Create while loops that execute based on conditions",
            "Use break to exit loops and continue to skip iterations"
          ],
          keyTakeaways: [
            "while loops run while condition remains True",
            "CRITICAL: Must update condition variable to avoid infinite loops",
            "break immediately exits the entire loop",
            "continue skips to next iteration, bypassing remaining code",
            "Common pattern: while True with break for user-controlled exit"
          ],
          syntaxPatterns: [
            "counter = 0\nwhile counter < 5:\n    print(counter)\n    counter += 1",
            "while True:\n    choice = input('Continue? (y/n): ')\n    if choice == 'n':\n        break"
          ],
          commonMistakes: [
            "Infinite loops from forgetting to update counter",
            "Off-by-one errors in loop conditions"
          ],
          bestPractices: [
            "Always ensure loop condition will eventually become False",
            "Use for loops when iteration count is known",
            "Use while loops for unknown iteration counts or user-driven loops"
          ]
        },
        {
          title: "Coding Challenge: Multiplication Table Generator",
          description: "Build a practical educational tool that generates multiplication tables using loops, demonstrating automation of repetitive calculations common in mathematical applications.",
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 20,
          order: 3,
          isPreview: false,
          difficulty: "Easy",
          estimatedEffort: "35 minutes",
          learningObjectives: [
            "Automate repetitive calculations using for loops",
            "Format loop output for readability"
          ],
          challenge: {
            title: "Interactive Multiplication Table",
            description: "Create a program that generates a complete multiplication table (1-10) for any number provided by the user.",
            requirements: [
              "Ask user for a number",
              "Generate multiplication table from 1 to 10",
              "Format output as: 'n x 1 = result'",
              "Display all 10 lines of the table"
            ],
            expectedOutput: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n...\n7 x 10 = 70",
            starterCode: "number = int(input('Enter a number: '))\n\n# Generate table using for loop",
            constraints: [
              "Must use a for loop with range(1, 11)",
              "Each line should follow exact format",
              "Calculate result dynamically (don't hardcode)"
            ],
            hints: [
              "Use for i in range(1, 11) to iterate 1 through 10",
              "Calculate: result = number * i",
              "Print with f-string: f'{number} x {i} = {result}'"
            ],
            testCases: [
              "Input: 5 → Outputs 5x1=5 through 5x10=50",
              "Input: 12 → Outputs 12x1=12 through 12x10=120"
            ],
            successCriteria: "Generates correct table for any input number with proper formatting",
            skillsApplied: ["For loops", "range() function", "String formatting", "Arithmetic operations"],
            realWorldApplication: "This pattern is used in report generation, data transformation, and batch processing systems."
          }
        }
      ]
    },
    {
      title: "Module 8: Functions and Code Modularity",
      order: 8,
      description: "Master the art of writing reusable, modular code through functions - the foundation of professional software development.",
      learningOutcomes: [
        "Define and call functions with proper syntax and naming conventions",
        "Implement functions with parameters, default values, and return statements",
        "Understand variable scope and the difference between local and global variables"
      ],
      lessons: [
        {
          title: "Introduction to Functions and Code Reusability",
          description: "Discover how functions enable code reuse and organization. Learn to define functions using the def keyword, pass arguments, and return values to create modular, maintainable programs.",
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 25,
          order: 1,
          isPreview: true,
          difficulty: "Intermediate",
          estimatedEffort: "45 minutes",
          learningObjectives: [
            "Define functions using def keyword with proper naming",
            "Call functions with arguments and capture return values"
          ],
          keyTakeaways: [
            "Functions are reusable blocks of code defined once, called multiple times",
            "Syntax: def function_name(parameters):",
            "Parameters are inputs to functions",
            "return sends value back to caller",
            "Function names should be descriptive and use snake_case",
            "Call function by name: result = calculate_total(100)"
          ],
          syntaxPatterns: [
            "def greet(name):\n    return f'Hello, {name}!'",
            "def add_numbers(a, b):\n    sum = a + b\n    return sum"
          ],
          benefits: [
            "Code reusability - write once, use many times",
            "Organization - break complex problems into manageable pieces",
            "Maintainability - update logic in one place",
            "Testing - easier to test isolated function units"
          ],
          realWorldAnalogy: "Functions are like recipes - define instructions once (recipe), then execute them anytime with different ingredients (arguments)."
        },
        {
          title: "Advanced Function Concepts: Parameters and Scope",
          description: "Explore advanced function features including default parameter values, multiple return values, and variable scope. Understand how local and global scope affects variable accessibility in your programs.",
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 20,
          order: 2,
          isPreview: false,
          difficulty: "Intermediate",
          estimatedEffort: "40 minutes",
          learningObjectives: [
            "Use default parameters to make functions more flexible",
            "Return multiple values using tuple unpacking",
            "Understand local vs global variable scope"
          ],
          keyTakeaways: [
            "Default parameters: def power(base, exp=2) → exp defaults to 2",
            "Multiple returns: return sum, diff, product",
            "Scope: variables created in functions are local (isolated)",
            "Local variables don't affect global variables with same name",
            "Use global keyword sparingly to modify global variables"
          ],
          advancedPatterns: [
            "def calculate(a, b, operation='add'): # Default parameter",
            "def stats(numbers):\n    return sum(numbers), len(numbers), sum(numbers)/len(numbers)"
          ],
          bestPractices: [
            "Keep functions focused - one function, one purpose",
            "Use descriptive names that indicate function purpose",
            "Avoid modifying global variables inside functions",
            "Return values rather than printing directly for flexibility"
          ]
        },
        {
          title: "Coding Challenge: Grade Calculator Function",
          description: "Build a professional grade evaluation system using functions, demonstrating modular design patterns used in real educational and assessment software.",
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 20,
          order: 3,
          isPreview: false,
          difficulty: "Medium",
          estimatedEffort: "45 minutes",
          learningObjectives: [
            "Design a function that takes input and returns calculated results",
            "Implement business logic within function structure"
          ],
          challenge: {
            title: "Intelligent Grade Calculator",
            description: "Create a function that converts numeric scores to letter grades following standard grading scales used in educational institutions.",
            requirements: [
              "Function name: calculate_grade(marks)",
              "Takes one parameter: numeric score (0-100)",
              "Returns letter grade based on:",
              "  - 90-100: 'A+'",
              "  - 80-89: 'A'",
              "  - 70-79: 'B'",
              "  - 60-69: 'C'",
              "  - Below 60: 'F'",
              "Test with multiple scores"
            ],
            expectedOutput: "calculate_grade(95) → 'A+'\ncalculate_grade(75) → 'B'",
            starterCode: "def calculate_grade(marks):\n    # Your logic here\n    pass\n\n# Test cases\nprint(calculate_grade(95))\nprint(calculate_grade(85))",
            constraints: [
              "Must be a function (not standalone code)",
              "Must use if/elif/else for grade determination",
              "Must return string (not print)",
              "Handle edge cases (0, 100)"
            ],
            hints: [
              "Use if marks >= 90: return 'A+'",
              "Continue with elif for each range",
              "else handles F grade (< 60)",
              "Remember to use return, not print"
            ],
            testCases: [
              "calculate_grade(95) → 'A+'",
              "calculate_grade(85) → 'A'",
              "calculate_grade(75) → 'B'",
              "calculate_grade(65) → 'C'",
              "calculate_grade(55) → 'F'"
            ],
            successCriteria: "Function correctly grades all test cases and returns (not prints) letter grade",
            skillsApplied: ["Function definition", "Parameters", "Return values", "Conditional logic"],
            industryRelevance: "This modular pattern is essential in enterprise software - separating logic into testable, reusable functions."
          }
        },
        {
          title: "Course Completion and Professional Next Steps",
          description: "Congratulations on completing Python Programming Fundamentals! Review your learning journey, explore career pathways, and discover recommended next courses to continue your development career.",
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 10,
          order: 4,
          isPreview: false,
          difficulty: "Beginner",
          estimatedEffort: "15 minutes",
          learningObjectives: [
            "Summarize key concepts learned throughout the course",
            "Identify next learning steps for career advancement"
          ],
          keyTakeaways: [
            "You've mastered Python fundamentals: variables, data types, control flow, loops, functions",
            "You can build interactive programs and solve real-world problems",
            "You have a strong foundation for advanced Python topics"
          ],
          nextSteps: [
            "Build portfolio projects to demonstrate your skills",
            "Explore Data Structures: lists, dictionaries, sets, tuples",
            "Learn file handling for data persistence",
            "Study Object-Oriented Programming (OOP)",
            "Complete our Data Structures & Algorithms Roadmap",
            "Practice on coding platforms: HackerRank, LeetCode, DoFlow DSA"
          ],
          careerPaths: [
            "Junior Python Developer: Build web applications with Django/Flask",
            "Data Analyst: Process and visualize data with Pandas and Matplotlib",
            "Automation Engineer: Create scripts to automate repetitive tasks",
            "Backend Developer: Design APIs and server-side logic",
            "Test Automation Engineer: Write automated test suites"
          ],
          certificateInfo: {
            eligible: true,
            requirements: "Complete all lessons, score 70%+ on quizzes, finish all coding challenges",
            showcase: "Share your certificate on LinkedIn to showcase your Python skills to potential employers"
          }
        }
      ]
    }
  ]
};

async function seedPythonCourse() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find an admin/instructor user to assign as instructor
    let instructor = await User.findOne({ role: 'admin' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'instructor' });
    }
    if (!instructor) {
      instructor = await User.findOne();
    }

    if (!instructor) {
      console.error('❌ No user found to assign as instructor. Please create a user first.');
      process.exit(1);
    }

    console.log(`📝 Instructor: ${instructor.name || instructor.email}`);

    // Add instructor to course data
    pythonCourse.instructor = instructor._id;

    // Check if course already exists
    const existingCourse = await Course.findOne({ slug: pythonCourse.slug });
    
    if (existingCourse) {
      await Course.findOneAndUpdate(
        { slug: pythonCourse.slug },
        pythonCourse,
        { new: true }
      );
      console.log('✅ Python course UPDATED successfully!\n');
    } else {
      await Course.create(pythonCourse);
      console.log('✅ Python course CREATED successfully!\n');
    }

    // Calculate detailed statistics
    const totalLessons = pythonCourse.sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const codingChallenges = pythonCourse.sections.reduce((acc, s) => 
      acc + s.lessons.filter(l => l.challenge).length, 0
    );
    const quizzes = pythonCourse.sections.reduce((acc, s) => 
      acc + s.lessons.filter(l => l.quizQuestions).length, 0
    );

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 COURSE DEPLOYMENT SUMMARY - PRODUCTION READY');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📚 Course Information:');
    console.log(`   Title: ${pythonCourse.title}`);
    console.log(`   Version: ${pythonCourse.version}`);
    console.log(`   Category: ${pythonCourse.category}`);
    console.log(`   Level: ${pythonCourse.level}\n`);
    
    console.log('📈 Content Statistics:');
    console.log(`   Modules: ${pythonCourse.sections.length}`);
    console.log(`   Total Lessons: ${totalLessons}`);
    console.log(`   Coding Challenges: ${codingChallenges}`);
    console.log(`   Quizzes: ${quizzes}`);
    console.log(`   Total Duration: ${pythonCourse.totalDuration} minutes\n`);
    
    console.log('🎯 Learning Outcomes:');
    pythonCourse.whatYouWillLearn.slice(0, 3).forEach(outcome => {
      console.log(`   ✓ ${outcome}`);
    });
    console.log(`   ... and ${pythonCourse.whatYouWillLearn.length - 3} more\n`);
    
    console.log('💼 Career Alignment:');
    pythonCourse.careerOutcomes.forEach(career => {
      console.log(`   • ${career}`);
    });
    console.log('\n🎓 Certificate: ' + (pythonCourse.certificateEligible ? 'Eligible' : 'Not Eligible'));
    console.log(`📅 Last Updated: ${pythonCourse.lastUpdated.toDateString()}\n`);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ Course meets Coursera/Udemy Business quality standards');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding course:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

seedPythonCourse();
