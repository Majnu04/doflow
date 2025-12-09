// Script to seed the comprehensive Python Zero to Hero course into MongoDB
// Course #2 - Following the exact curriculum format
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

const pythonCourseV2 = {
  title: "Zero to Hero Python Course - Complete Edition",
  slug: "python-zero-to-hero-complete",
  description: `Master Python programming from absolute scratch! This comprehensive beginner-friendly course is designed following the best curriculum practices with:

🎯 Each module includes:
• Concept Explanation (Simple, 80-100 words)
• Real-World Analogy (Relatable examples)
• Syntax Examples (Clean, commented code)
• Interactive MCQ (Test your understanding)
• Coding Challenge (Hands-on practice)
• Curated Video Resources (Handpicked YouTube tutorials)

Perfect for absolute beginners with zero coding experience. By the end, you'll confidently write Python programs and solve real-world problems!`,
  
  shortDescription: "Master Python from scratch with interactive lessons, real-world analogies, MCQs, and coding challenges. Course #2 on our platform!",
  category: "Web Development",
  level: "Beginner",
  price: 0,
  discountPrice: 0,
  thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60",
  language: "English",
  requirements: [
    "No prior programming experience needed",
    "A computer with internet access",
    "Python installed (we'll help you set up)",
    "Enthusiasm to learn coding!"
  ],
  whatYouWillLearn: [
    "Write and run Python programs from scratch",
    "Understand variables, data types, and operators",
    "Work with strings and perform text manipulation",
    "Take user inputs and build interactive programs",
    "Make decisions using conditionals (if/elif/else)",
    "Automate repetitive tasks using loops (for/while)",
    "Create reusable code with functions",
    "Debug and troubleshoot your code like a pro",
    "Solve coding challenges and build mini projects"
  ],
  tags: ["Python", "Programming", "Beginner", "Coding", "Zero to Hero", "Interactive"],
  isPublished: true,
  isFeatured: true,
  sections: [
    // ==================== MODULE 1: OUTPUT & PRINTING ====================
    {
      title: "Module 1: Output & Printing",
      order: 1,
      lessons: [
        {
          title: "1.1 Concept: Your First Python Program",
          description: `📘 CONCEPT EXPLANATION

The print() function is your first tool in Python! It displays text, numbers, or any information on the screen. Think of it as Python's way of talking to you. Whatever you put inside the parentheses gets shown as output. You can print words (in quotes), numbers, or even calculations.

🌍 REAL-WORLD ANALOGY

Imagine a loudspeaker at a train station. The announcer speaks into it, and everyone hears the message. Similarly, print() is Python's loudspeaker — whatever you "say" inside it gets displayed on screen for the user to see.`,
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 15,
          order: 1,
          isPreview: true,
          resources: [
            { title: "Print Function Cheatsheet", url: "#", type: "pdf" }
          ]
        },
        {
          title: "1.2 Syntax: print() in Action",
          description: `💻 SYNTAX EXAMPLES

# Printing text
print("Hello, World!")

# Printing numbers
print(42)
print(3.14)

# Printing multiple items
print("The answer is", 42)

# Printing with special characters
print("Line 1\\nLine 2")  # \\n creates a new line

OUTPUT:
Hello, World!
42
3.14
The answer is 42
Line 1
Line 2`,
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 10,
          order: 2,
          isPreview: true
        },
        {
          title: "1.3 MCQ: Test Your Understanding",
          description: `🧠 INTERACTIVE MCQ

Question: What will be the output of print("5 + 3")?

A) 8
B) 5 + 3
C) "5 + 3"
D) Error

Think about it... When text is inside quotes, how does Python treat it?

✅ CORRECT ANSWER: B) 5 + 3

When text is inside quotes, Python treats it as a string (text), not as a math calculation. It prints exactly what's inside the quotes.`,
          videoUrl: "https://www.youtube.com/watch?v=FhoASwgvZHk",
          duration: 8,
          order: 3,
          isPreview: false
        },
        {
          title: "1.4 Coding Challenge: Say Hello",
          description: `🏆 CODING CHALLENGE

TASK: Write a Python program that prints the following output:

Hello, I am learning Python!
Python is fun!
Let's code together!

HINT: Use three separate print() statements.

🎬 RECOMMENDED VIDEOS:
• "Python Print Function" - Programming with Mosh
• "Python print() Explained" - Corey Schafer`,
          videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
          duration: 15,
          order: 4,
          isPreview: false
        }
      ]
    },
    
    // ==================== MODULE 2: VARIABLES & DATA TYPES ====================
    {
      title: "Module 2: Variables & Data Types",
      order: 2,
      lessons: [
        {
          title: "2.1 Concept: Understanding Variables",
          description: `📘 CONCEPT EXPLANATION

Variables are containers that store data with a name. Think of them as labeled boxes where you can put values. Python automatically detects the type of data you store. The four main types are: integers (whole numbers), floats (decimals), strings (text), and booleans (True/False).

🌍 REAL-WORLD ANALOGY

Imagine a storage locker at a gym. Each locker has a number (name), and you can store different items inside. Variables work the same way — age = 25 creates a locker named "age" and stores 25 inside. Later, you can open the locker (use the variable) to get the value.`,
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: "2.2 Syntax: Creating Variables",
          description: `💻 SYNTAX EXAMPLES

# Creating variables
name = "Alice"          # String (text)
age = 25                # Integer (whole number)
height = 5.6            # Float (decimal number)
is_student = True       # Boolean (True/False)

# Printing variables
print(name)             # Output: Alice
print(age)              # Output: 25

# Checking data types
print(type(name))       # Output: <class 'str'>
print(type(age))        # Output: <class 'int'>
print(type(height))     # Output: <class 'float'>
print(type(is_student)) # Output: <class 'bool'>

# Updating variables
age = 26                # Now age is 26
print(age)              # Output: 26`,
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 12,
          order: 2,
          isPreview: true
        },
        {
          title: "2.3 MCQ: Data Types Quiz",
          description: `🧠 INTERACTIVE MCQ

Question: What is the data type of the variable price = "99.99"?

A) int
B) float
C) str
D) bool

Think about it... What do the quotes around 99.99 indicate?

✅ CORRECT ANSWER: C) str

Even though 99.99 looks like a number, it's wrapped in quotes ("99.99"), making it a string (text), not a float. Always check: quotes = string!`,
          videoUrl: "https://www.youtube.com/watch?v=Z1Yd7upQsXY",
          duration: 8,
          order: 3,
          isPreview: false
        },
        {
          title: "2.4 Coding Challenge: Digital ID Card",
          description: `🏆 CODING CHALLENGE

TASK: Create a digital ID card using variables!

1. Create variables for: name, age, city, is_employed
2. Assign appropriate values to each
3. Print all values with labels

EXPECTED OUTPUT:
Name: John
Age: 28
City: Mumbai
Employed: True

🎬 RECOMMENDED VIDEOS:
• "Python Variables and Data Types" - freeCodeCamp
• "Variables in Python" - Tech With Tim`,
          videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
          duration: 15,
          order: 4,
          isPreview: false
        }
      ]
    },
    
    // ==================== MODULE 3: ARITHMETIC OPERATIONS ====================
    {
      title: "Module 3: Arithmetic Operations",
      order: 3,
      lessons: [
        {
          title: "3.1 Concept: Python as a Calculator",
          description: `📘 CONCEPT EXPLANATION

Python can perform math like a calculator! The basic operators are: + (add), - (subtract), * (multiply), / (divide), // (floor division), % (modulus/remainder), and ** (power). These work with numbers stored in variables too, making Python great for calculations.

🌍 REAL-WORLD ANALOGY

Think of Python as a smart calculator on your phone. Just like you punch in numbers and operations, Python takes your numbers and operators, processes them, and gives you the answer. The difference? Python can save results and do complex calculations automatically!`,
          videoUrl: "https://www.youtube.com/watch?v=v5MR5JnKcZI",
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: "3.2 Syntax: Arithmetic Operators",
          description: `💻 SYNTAX EXAMPLES

# Basic arithmetic
a = 15
b = 4

print(a + b)   # Addition: 19
print(a - b)   # Subtraction: 11
print(a * b)   # Multiplication: 60
print(a / b)   # Division: 3.75
print(a // b)  # Floor Division: 3 (removes decimal)
print(a % b)   # Modulus: 3 (remainder)
print(a ** b)  # Power: 50625 (15^4)

# Order of operations (PEMDAS)
result = 10 + 5 * 2    # 20 (multiplication first)
result2 = (10 + 5) * 2 # 30 (parentheses first)

# Compound assignment
score = 100
score += 10  # Same as: score = score + 10
print(score) # Output: 110`,
          videoUrl: "https://www.youtube.com/watch?v=v5MR5JnKcZI",
          duration: 12,
          order: 2,
          isPreview: true
        },
        {
          title: "3.3 MCQ: Modulus Operator",
          description: `🧠 INTERACTIVE MCQ

Question: What is the output of print(17 % 5)?

A) 3.4
B) 3
C) 2
D) 12

Think about it... The % operator gives the remainder after division.

✅ CORRECT ANSWER: C) 2

The % operator gives the remainder after division. 17 ÷ 5 = 3 remainder 2. So 17 % 5 equals 2.`,
          videoUrl: "https://www.youtube.com/watch?v=khKv-8q7YmY",
          duration: 8,
          order: 3,
          isPreview: false
        },
        {
          title: "3.4 Coding Challenge: Bill Calculator",
          description: `🏆 CODING CHALLENGE

TASK: Build a Simple Bill Calculator!

Write a program that:
1. Creates variables for item_price = 250 and quantity = 3
2. Calculates subtotal
3. Adds 18% GST to get total
4. Prints the final bill

EXPECTED OUTPUT:
Subtotal: 750
GST (18%): 135.0
Total: 885.0

🎬 RECOMMENDED VIDEOS:
• "Python Arithmetic Operators" - Programiz
• "Math in Python" - CS Dojo`,
          videoUrl: "https://www.youtube.com/watch?v=v5MR5JnKcZI",
          duration: 15,
          order: 4,
          isPreview: false
        }
      ]
    },
    
    // ==================== MODULE 4: STRING MANIPULATION ====================
    {
      title: "Module 4: String Manipulation",
      order: 4,
      lessons: [
        {
          title: "4.1 Concept: Working with Text",
          description: `📘 CONCEPT EXPLANATION

Strings are sequences of characters (text) enclosed in quotes. Python offers powerful tools to manipulate strings: concatenation (+), repetition (*), slicing ([start:end]), and built-in methods like .upper(), .lower(), .replace(), and .split(). Master these to handle text like a pro!

🌍 REAL-WORLD ANALOGY

Think of a string as a train with letter carriages. Each carriage (character) has a seat number (index) starting from 0. You can access any carriage by its number, combine trains (concatenation), or even detach specific carriages (slicing) to create new trains!`,
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: "4.2 Syntax: String Operations",
          description: `💻 SYNTAX EXAMPLES

# Creating strings
greeting = "Hello"
name = "Alice"

# Concatenation (joining)
message = greeting + ", " + name + "!"
print(message)  # Output: Hello, Alice!

# Repetition
stars = "*" * 5
print(stars)    # Output: *****

# Indexing (accessing characters)
word = "Python"
print(word[0])   # Output: P (first character)
print(word[-1])  # Output: n (last character)

# Slicing
print(word[0:3])  # Output: Pyt (index 0 to 2)
print(word[2:])   # Output: thon (index 2 to end)

# String methods
text = "hello world"
print(text.upper())       # Output: HELLO WORLD
print(text.capitalize())  # Output: Hello world
print(text.replace("world", "Python"))  # hello Python
print(len(text))          # Output: 11 (length)`,
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 15,
          order: 2,
          isPreview: true
        },
        {
          title: "4.3 MCQ: String Slicing",
          description: `🧠 INTERACTIVE MCQ

Question: What is the output of "Python"[1:4]?

A) Pyt
B) yth
C) ytho
D) Pyth

Think about it... Slicing starts at the first index and goes up to (not including) the second index.

✅ CORRECT ANSWER: B) yth

Slicing [1:4] starts at index 1 (y) and goes up to but not including index 4. So we get characters at positions 1, 2, 3 → "yth".`,
          videoUrl: "https://www.youtube.com/watch?v=ioi__WRETk4",
          duration: 8,
          order: 3,
          isPreview: false
        },
        {
          title: "4.4 Coding Challenge: Username Generator",
          description: `🏆 CODING CHALLENGE

TASK: Create a Username Generator!

Write a program that:
1. Takes first_name = "john" and birth_year = "1995"
2. Creates username: first 3 letters of name (uppercase) + last 2 digits of year
3. Print the username

EXPECTED OUTPUT:
Generated Username: JOH95

HINT: Use slicing and .upper() method

🎬 RECOMMENDED VIDEOS:
• "Python Strings Tutorial" - Corey Schafer
• "String Manipulation" - Programming with Mosh`,
          videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
          duration: 15,
          order: 4,
          isPreview: false
        }
      ]
    },
    
    // ==================== MODULE 5: USER INPUTS ====================
    {
      title: "Module 5: User Inputs",
      order: 5,
      lessons: [
        {
          title: "5.1 Concept: Making Programs Interactive",
          description: `📘 CONCEPT EXPLANATION

The input() function lets your program talk to users! It pauses execution, shows a prompt, waits for the user to type something, and returns that text as a string. To use numbers from input, convert them using int() or float(). This makes your programs interactive!

🌍 REAL-WORLD ANALOGY

Imagine a restaurant waiter asking "What would you like to order?" and waiting for your answer. The input() function is like that waiter — it asks a question (prompt), waits for your response, and takes it back to the kitchen (your program) to process.`,
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: "5.2 Syntax: input() Function",
          description: `💻 SYNTAX EXAMPLES

# Basic input (returns string)
name = input("Enter your name: ")
print("Hello, " + name + "!")

# Input with type conversion
age = int(input("Enter your age: "))
print("Next year you'll be", age + 1)

# Float input
price = float(input("Enter item price: "))
tax = price * 0.18
print("Tax amount:", tax)

# Multiple inputs
first = input("First name: ")
last = input("Last name: ")
full_name = first + " " + last
print("Full name:", full_name)

SAMPLE RUN:
Enter your name: Alice
Hello, Alice!
Enter your age: 25
Next year you'll be 26`,
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 12,
          order: 2,
          isPreview: true
        },
        {
          title: "5.3 MCQ: Input Type Conversion",
          description: `🧠 INTERACTIVE MCQ

Question: What will happen if a user enters "twenty" when this code runs: age = int(input("Age: "))?

A) It stores "twenty" as the age
B) It converts "twenty" to 20
C) It causes a ValueError (crash)
D) It stores 0 as the age

Think about it... Can int() convert the word "twenty" to a number?

✅ CORRECT ANSWER: C) It causes a ValueError (crash)

int() can only convert numeric strings like "25" to integers. The word "twenty" cannot be converted, so Python raises a ValueError. Always validate user input!`,
          videoUrl: "https://www.youtube.com/watch?v=I57fsvLEEog",
          duration: 8,
          order: 3,
          isPreview: false
        },
        {
          title: "5.4 Coding Challenge: Age Calculator",
          description: `🏆 CODING CHALLENGE

TASK: Build a Simple Age Calculator!

Write a program that:
1. Asks the user for their birth_year
2. Calculates their age (assume current year is 2025)
3. Tells them how many years until they turn 100

EXPECTED OUTPUT:
Enter your birth year: 1995
You are 30 years old.
You will turn 100 in 70 years!

🎬 RECOMMENDED VIDEOS:
• "Python Input Function" - Telusko
• "Taking User Input" - Bro Code`,
          videoUrl: "https://www.youtube.com/watch?v=I9h1c-121Uk",
          duration: 15,
          order: 4,
          isPreview: false
        }
      ]
    },
    
    // ==================== MODULE 6: CONDITIONALS ====================
    {
      title: "Module 6: Conditionals (if/elif/else)",
      order: 6,
      lessons: [
        {
          title: "6.1 Concept: Making Decisions",
          description: `📘 CONCEPT EXPLANATION

Conditionals let your program make decisions! Use "if" to check a condition, "elif" (else if) for additional checks, and "else" for everything else. Comparison operators include: == (equal), != (not equal), <, >, <=, >=. Combine conditions with "and", "or", "not".

🌍 REAL-WORLD ANALOGY

Imagine a traffic signal. If the light is green, you go. Elif (else if) it's yellow, you slow down. Else (red), you stop. Conditionals work exactly like this — your program checks conditions and takes different actions based on what's true.`,
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: "6.2 Syntax: if-elif-else Statements",
          description: `💻 SYNTAX EXAMPLES

# Basic if-else
age = 18

if age >= 18:
    print("You can vote! 🗳️")
else:
    print("Too young to vote.")

# if-elif-else chain
score = 75

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print("Your grade:", grade)  # Output: C

# Multiple conditions with and/or
age = 25
has_license = True

if age >= 18 and has_license:
    print("You can drive! 🚗")

# Checking membership
fruits = ["apple", "banana", "cherry"]
if "apple" in fruits:
    print("Apple is available!")`,
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 15,
          order: 2,
          isPreview: true
        },
        {
          title: "6.3 MCQ: Conditional Flow",
          description: `🧠 INTERACTIVE MCQ

Question: What is the output of this code?

x = 10
if x > 5:
    print("A")
elif x > 8:
    print("B")
else:
    print("C")

A) A
B) B
C) A and B
D) C

Think about it... Once a condition is True, does Python check the rest?

✅ CORRECT ANSWER: A) A

Python checks conditions in order. Since x > 5 is True (10 > 5), it prints "A" and skips all remaining elif/else blocks. Even though x > 8 is also true, it's never checked!`,
          videoUrl: "https://www.youtube.com/watch?v=5pPKYWqkoek",
          duration: 8,
          order: 3,
          isPreview: false
        },
        {
          title: "6.4 Coding Challenge: Ticket Price Calculator",
          description: `🏆 CODING CHALLENGE

TASK: Build a Movie Ticket Price Calculator!

Write a program that:
1. Asks for the user's age
2. Calculates ticket price based on:
   - Children (under 12): ₹100
   - Adults (12-59): ₹250
   - Seniors (60+): ₹150
3. Print the ticket price

EXPECTED OUTPUT:
Enter your age: 35
Your ticket price: ₹250

🎬 RECOMMENDED VIDEOS:
• "Python If Else" - Programming with Mosh
• "Conditionals in Python" - CS50`,
          videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
          duration: 15,
          order: 4,
          isPreview: false
        }
      ]
    },
    
    // ==================== MODULE 7: LOOPS ====================
    {
      title: "Module 7: Loops (for & while)",
      order: 7,
      lessons: [
        {
          title: "7.1 Concept: Repeating Code Automatically",
          description: `📘 CONCEPT EXPLANATION

Loops repeat code automatically! The "for" loop iterates over a sequence (list, string, range). The "while" loop repeats as long as a condition is true. Use "break" to exit early, "continue" to skip iterations, and range() to generate number sequences. Loops eliminate repetitive coding!

🌍 REAL-WORLD ANALOGY

Imagine a washing machine. It repeats the same cycle — wash, rinse, spin — until the timer ends (like a for loop with fixed iterations). Or think of eating at a buffet — you keep going back while you're hungry (like a while loop that stops when the condition changes).`,
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: "7.2 Syntax: for and while Loops",
          description: `💻 SYNTAX EXAMPLES

# For loop with range
for i in range(5):
    print(i)  # Prints 0, 1, 2, 3, 4

# For loop with list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# For loop with string
for char in "Python":
    print(char)

# While loop
count = 0
while count < 5:
    print("Count:", count)
    count += 1

# Break and Continue
for i in range(10):
    if i == 3:
        continue  # Skip 3
    if i == 7:
        break     # Stop at 7
    print(i)      # Prints 0, 1, 2, 4, 5, 6

# Nested loop (multiplication table)
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end=" ")
    print()  # New line`,
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 18,
          order: 2,
          isPreview: true
        },
        {
          title: "7.3 MCQ: Range Function",
          description: `🧠 INTERACTIVE MCQ

Question: How many times will this loop run?

for i in range(2, 10, 3):
    print(i)

A) 10 times
B) 3 times
C) 8 times
D) 4 times

Think about it... range(start, stop, step) generates: start, start+step, start+2*step... until reaching stop.

✅ CORRECT ANSWER: B) 3 times

range(2, 10, 3) starts at 2, goes up to (not including) 10, stepping by 3. So it generates: 2, 5, 8. That's 3 iterations!`,
          videoUrl: "https://www.youtube.com/watch?v=94UHCEmprCY",
          duration: 8,
          order: 3,
          isPreview: false
        },
        {
          title: "7.4 Coding Challenge: Number Guessing Game",
          description: `🏆 CODING CHALLENGE

TASK: Build a Number Guessing Game!

Write a program that:
1. Sets a secret_number = 7
2. Uses a while loop to keep asking until they guess correctly
3. Gives hints: "Too high!" or "Too low!"
4. Congratulates them when correct

EXPECTED OUTPUT:
Guess the number (1-10): 5
Too low! Try again.
Guess the number (1-10): 9
Too high! Try again.
Guess the number (1-10): 7
🎉 Correct! You guessed it!

🎬 RECOMMENDED VIDEOS:
• "Python Loops Tutorial" - Corey Schafer
• "For and While Loops" - freeCodeCamp`,
          videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
          duration: 20,
          order: 4,
          isPreview: false
        }
      ]
    },
    
    // ==================== MODULE 8: FUNCTIONS ====================
    {
      title: "Module 8: Functions",
      order: 8,
      lessons: [
        {
          title: "8.1 Concept: Reusable Code Blocks",
          description: `📘 CONCEPT EXPLANATION

Functions are reusable blocks of code! Define them with "def", give them a name, add parameters (inputs), and use "return" to send back results. Functions make code organized, reusable, and easier to debug. You can have default parameters, multiple returns, and even functions inside functions!

🌍 REAL-WORLD ANALOGY

Think of a coffee machine. You press a button (call the function), it takes your input (coffee type), does the work internally (brewing), and gives you output (coffee). You don't need to know HOW it makes coffee — you just use it! Functions work the same way — reusable, encapsulated, and efficient.`,
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: "8.2 Syntax: Defining Functions",
          description: `💻 SYNTAX EXAMPLES

# Basic function
def greet():
    print("Hello, World!")

greet()  # Call the function

# Function with parameters
def greet_user(name):
    print(f"Hello, {name}!")

greet_user("Alice")  # Output: Hello, Alice!

# Function with return value
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # Output: 8

# Default parameters
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Bob"))              # Hello, Bob!
print(greet("Bob", "Welcome"))   # Welcome, Bob!

# Multiple return values
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

low, high, total = get_stats([1, 2, 3, 4, 5])
print(f"Min: {low}, Max: {high}, Sum: {total}")`,
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 18,
          order: 2,
          isPreview: true
        },
        {
          title: "8.3 MCQ: Function Returns",
          description: `🧠 INTERACTIVE MCQ

Question: What does this function return?

def mystery(x):
    if x > 0:
        return "Positive"
    return "Not Positive"

result = mystery(0)

A) "Positive"
B) "Not Positive"
C) 0
D) None

Think about it... Is 0 > 0 True or False?

✅ CORRECT ANSWER: B) "Not Positive"

Since 0 > 0 is False, the first return is skipped. The function continues to the second return and returns "Not Positive".`,
          videoUrl: "https://www.youtube.com/watch?v=u-OmVr_fT4s",
          duration: 8,
          order: 3,
          isPreview: false
        },
        {
          title: "8.4 Coding Challenge: Temperature Converter",
          description: `🏆 CODING CHALLENGE

TASK: Build a Temperature Converter!

Create two functions:
1. celsius_to_fahrenheit(c) - Returns temperature in Fahrenheit
   - Formula: F = (C × 9/5) + 32
2. fahrenheit_to_celsius(f) - Returns temperature in Celsius
   - Formula: C = (F - 32) × 5/9

Test both functions and print results.

EXPECTED OUTPUT:
37°C = 98.6°F
98.6°F = 37.0°C

🎬 RECOMMENDED VIDEOS:
• "Python Functions Tutorial" - Corey Schafer
• "Functions in Python" - Programming with Mosh`,
          videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
          duration: 20,
          order: 4,
          isPreview: false
        },
        {
          title: "8.5 Course Completion 🎓",
          description: `🎓 CONGRATULATIONS!

You've completed the Zero to Hero Python Course! 🎉

WHAT YOU'VE LEARNED:
✅ Printing output to the screen
✅ Working with variables and data types
✅ Performing arithmetic operations
✅ Manipulating strings
✅ Taking user inputs
✅ Making decisions with conditionals
✅ Automating with loops
✅ Creating reusable functions

NEXT STEPS:
1. 🔄 Practice daily on LeetCode, HackerRank
2. 📚 Learn Lists, Dictionaries, File Handling
3. 🛠️ Build mini-projects (Calculator, To-Do App)
4. 🚀 Explore Python libraries (NumPy, Pandas, Flask)

Keep coding, keep learning! 💪🐍`,
          videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
          duration: 5,
          order: 5,
          isPreview: false
        }
      ]
    }
  ]
};

async function seedPythonCourse() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user to be the instructor
    let instructor = await User.findOne({ role: 'admin' });
    
    if (!instructor) {
      instructor = await User.findOne({ role: 'instructor' });
    }
    
    if (!instructor) {
      instructor = await User.findOne();
    }

    if (!instructor) {
      console.error('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`📝 Using instructor: ${instructor.name || instructor.email}`);

    // Check if course already exists
    const existingCourse = await Course.findOne({ slug: pythonCourseV2.slug });
    
    if (existingCourse) {
      console.log('🔄 Course exists. Updating...');
      Object.assign(existingCourse, {
        ...pythonCourseV2,
        instructor: instructor._id
      });
      await existingCourse.save();
      console.log('✅ Python course UPDATED successfully!');
    } else {
      console.log('➕ Creating new course...');
      const course = new Course({
        ...pythonCourseV2,
        instructor: instructor._id
      });
      await course.save();
      console.log('✅ Python course CREATED successfully!');
    }

    // Count total lessons
    let totalLessons = 0;
    pythonCourseV2.sections.forEach(section => {
      totalLessons += section.lessons.length;
    });

    console.log(`
📊 Course Summary:
   - Title: ${pythonCourseV2.title}
   - Slug: ${pythonCourseV2.slug}
   - Modules: ${pythonCourseV2.sections.length}
   - Total Lessons: ${totalLessons}
   - Level: ${pythonCourseV2.level}
   - Price: ${pythonCourseV2.price === 0 ? 'FREE' : '₹' + pythonCourseV2.price}
   - Featured: ${pythonCourseV2.isFeatured}
`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding course:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedPythonCourse();
