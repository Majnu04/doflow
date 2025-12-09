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

const pythonCourse = {
  title: "Zero to Hero Python Course",
  slug: "python-zero-to-hero",
  description: "Master Python programming from scratch! This comprehensive beginner-friendly course takes you from writing your first line of code to building real programs. Learn variables, data types, conditionals, loops, functions, and more with hands-on coding exercises. Perfect for absolute beginners with no prior coding experience. By the end of this course, you'll have the confidence to write Python programs and solve real-world problems.",
  shortDescription: "Master Python from scratch with hands-on exercises and real-world projects. Perfect for absolute beginners!",
  category: "Web Development",
  level: "Beginner",
  price: 0,
  discountPrice: 0,
  thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60",
  language: "English",
  requirements: [
    "No prior programming experience needed",
    "A computer with internet access",
    "Enthusiasm to learn coding!"
  ],
  whatYouWillLearn: [
    "Write and run Python programs from scratch",
    "Understand variables, data types, and operators",
    "Work with strings, numbers, and user inputs",
    "Make decisions using conditionals (if/else)",
    "Automate tasks using loops (for/while)",
    "Create reusable code with functions",
    "Debug and troubleshoot your code",
    "Build mini projects and solve coding challenges"
  ],
  tags: ["Python", "Programming", "Beginner", "Coding", "Development"],
  isPublished: true,
  isFeatured: true,
  sections: [
    {
      title: "Module 1: Getting Started - Output & Printing",
      order: 1,
      lessons: [
        {
          title: "1.1 Your First Python Program - Hello World!",
          description: "Learn the print() function - Python's way of displaying output. Understand how to print text, numbers, and multiple items. The print() function is your first tool in Python! It displays text, numbers, or any information on the screen.",
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 15,
          order: 1,
          isPreview: true,
          resources: [
            { title: "Python Print Cheatsheet", url: "#", type: "pdf" }
          ]
        },
        {
          title: "1.2 Quiz & Practice: Output Basics",
          description: "Test your understanding with an interactive quiz. What does print('5 + 3') output? Practice printing different data types and multiple lines.",
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 10,
          order: 2,
          isPreview: false
        },
        {
          title: "1.3 Coding Challenge: Say Hello",
          description: "Your first coding challenge! Write a program that prints: Hello, I am learning Python! | Python is fun! | Let's code together!",
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 15,
          order: 3,
          isPreview: false
        }
      ]
    },
    {
      title: "Module 2: Variables & Data Types",
      order: 2,
      lessons: [
        {
          title: "2.1 Understanding Variables - Labeled Storage Boxes",
          description: "Variables are containers that store data. Learn to create variables using the = sign. Python auto-detects data types: integers (25), floats (99.99), strings ('Hello'), and booleans (True/False).",
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 20,
          order: 1,
          isPreview: true
        },
        {
          title: "2.2 Data Types Deep Dive: int, float, str, bool",
          description: "Master the four fundamental data types. Use type() to check data types. Understand the difference between '100' (string) and 100 (integer).",
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 15,
          order: 2,
          isPreview: false
        },
        {
          title: "2.3 Coding Challenge: Personal Info Card",
          description: "Create variables for name, age, city and print: 'Hi, I'm [name], [age] years old, from [city]'",
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 15,
          order: 3,
          isPreview: false
        }
      ]
    },
    {
      title: "Module 3: Arithmetic Operations",
      order: 3,
      lessons: [
        {
          title: "3.1 Python as a Calculator - Basic Math Operations",
          description: "Learn +, -, *, /, // (floor division), % (modulus), ** (exponent). Understand BODMAS/PEMDAS rules for order of operations.",
          videoUrl: "https://www.youtube.com/watch?v=Aj8LHqaP-Yk",
          duration: 20,
          order: 1,
          isPreview: true
        },
        {
          title: "3.2 Operator Precedence & Compound Assignments",
          description: "Master +=, -=, *=, /= shortcuts. Learn why (2+3)*4 = 20 but 2+3*4 = 14. Practice with real calculations.",
          videoUrl: "https://www.youtube.com/watch?v=Aj8LHqaP-Yk",
          duration: 15,
          order: 2,
          isPreview: false
        },
        {
          title: "3.3 Coding Challenge: Restaurant Bill Calculator",
          description: "Calculate tip (18%), total bill, and split among 5 friends for a ₹2500 bill. Practice real-world math!",
          videoUrl: "https://www.youtube.com/watch?v=Aj8LHqaP-Yk",
          duration: 15,
          order: 3,
          isPreview: false
        }
      ]
    },
    {
      title: "Module 4: String Manipulation",
      order: 4,
      lessons: [
        {
          title: "4.1 Strings: Your Text Toolkit",
          description: "Strings are sequences of characters. Learn concatenation (+), indexing (text[0]), and slicing (text[0:3]). Remember: indexing starts at 0!",
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 20,
          order: 1,
          isPreview: true
        },
        {
          title: "4.2 String Methods: upper(), lower(), replace(), len()",
          description: "Transform strings with built-in methods. Make text uppercase, lowercase, replace characters, find length.",
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 15,
          order: 2,
          isPreview: false
        },
        {
          title: "4.3 Coding Challenge: Username Generator",
          description: "Generate username from first 3 letters of first name + last 3 letters of last name, all lowercase. 'Rahul' + 'Sharma' = 'rahrma'",
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 15,
          order: 3,
          isPreview: false
        }
      ]
    },
    {
      title: "Module 5: User Inputs",
      order: 5,
      lessons: [
        {
          title: "5.1 Making Programs Interactive with input()",
          description: "The input() function waits for user input. IMPORTANT: input() always returns a string! Use int() or float() to convert to numbers.",
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 20,
          order: 1,
          isPreview: true
        },
        {
          title: "5.2 Type Conversion: str to int, int to str",
          description: "Master int(), float(), str() conversions. Avoid the '55' mistake: '5' + '5' = '55' but int('5') + int('5') = 10",
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 15,
          order: 2,
          isPreview: false
        },
        {
          title: "5.3 Coding Challenge: Age Calculator",
          description: "Ask for birth year, calculate current age (2025) and year when user turns 100. Practice input() with calculations!",
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 15,
          order: 3,
          isPreview: false
        }
      ]
    },
    {
      title: "Module 6: Conditionals - Making Decisions",
      order: 6,
      lessons: [
        {
          title: "6.1 if, elif, else - The Decision Makers",
          description: "Conditionals let your program make decisions! if checks a condition, elif for alternatives, else as default. Learn ==, !=, >, <, >=, <= operators.",
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 25,
          order: 1,
          isPreview: true
        },
        {
          title: "6.2 Logical Operators: and, or, not",
          description: "Combine conditions with and/or. 'if age >= 18 and has_license:' - both must be true. Understand truthiness in Python.",
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 15,
          order: 2,
          isPreview: false
        },
        {
          title: "6.3 Coding Challenge: Movie Ticket Price Calculator",
          description: "Calculate ticket price: Children (<12): ₹100, Teens (12-17): ₹150, Adults (18-59): ₹200, Seniors (60+): ₹120",
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 20,
          order: 3,
          isPreview: false
        }
      ]
    },
    {
      title: "Module 7: Loops - Automating Repetition",
      order: 7,
      lessons: [
        {
          title: "7.1 for Loops and range() Function",
          description: "for loops iterate over sequences. range(5) gives 0,1,2,3,4. range(1,6) gives 1,2,3,4,5. range(0,10,2) gives 0,2,4,6,8.",
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 25,
          order: 1,
          isPreview: true
        },
        {
          title: "7.2 while Loops, break, and continue",
          description: "while loops run while condition is True. break exits the loop. continue skips to next iteration. Don't forget to update your counter!",
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 20,
          order: 2,
          isPreview: false
        },
        {
          title: "7.3 Coding Challenge: Multiplication Table Generator",
          description: "Ask for a number, print its multiplication table 1-10. Example: '7 x 1 = 7' through '7 x 10 = 70'",
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 20,
          order: 3,
          isPreview: false
        }
      ]
    },
    {
      title: "Module 8: Functions - Reusable Code Blocks",
      order: 8,
      lessons: [
        {
          title: "8.1 Defining Functions with def",
          description: "Functions are reusable code blocks. def function_name(parameters): ... return value. Call functions by name: greet('Rahul')",
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 25,
          order: 1,
          isPreview: true
        },
        {
          title: "8.2 Parameters, Arguments & Return Values",
          description: "Functions can have default parameters: def power(base, exp=2). Multiple return values: return sum, diff. Understand scope.",
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 20,
          order: 2,
          isPreview: false
        },
        {
          title: "8.3 Coding Challenge: Grade Calculator Function",
          description: "Create calculate_grade(marks) that returns: A+ (90-100), A (80-89), B (70-79), C (60-69), F (<60)",
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 20,
          order: 3,
          isPreview: false
        },
        {
          title: "8.4 Course Completion & Next Steps",
          description: "Congratulations! You've completed the Python Zero to Hero course. Review what you learned and explore next steps: data structures, file handling, and the DSA Roadmap!",
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 10,
          order: 4,
          isPreview: false
        }
      ]
    }
  ]
};

async function seedPythonCourse() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

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

    console.log(`📝 Using instructor: ${instructor.name || instructor.email}`);

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
      console.log('✅ Python course UPDATED successfully!');
    } else {
      await Course.create(pythonCourse);
      console.log('✅ Python course CREATED successfully!');
    }

    console.log('\n📚 Course Details:');
    console.log(`   Title: ${pythonCourse.title}`);
    console.log(`   Sections: ${pythonCourse.sections.length}`);
    console.log(`   Total Lessons: ${pythonCourse.sections.reduce((acc, s) => acc + s.lessons.length, 0)}`);
    console.log(`   Level: ${pythonCourse.level}`);
    console.log(`   Price: FREE`);

  } catch (error) {
    console.error('❌ Error seeding course:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedPythonCourse();
