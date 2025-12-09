// CodeChef-Style Interactive Python Course
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// No video - pure text-based learning
const NO_VIDEO = "https://www.youtube.com/watch?v=_uQrJ0TkZlc";

const codeChefStylePythonCourse = {
  title: "Python Zero to Hero - Interactive Course",
  slug: "zero-to-hero-python-course-complete-edition",
  description: `Learn Python the CodeChef way! Clean, interactive, card-based lessons with no video dependency.

✨ What You Get:
• Clean, readable sections
• Syntax cards with highlighted code
• Real-world analogies
• Interactive MCQ checkpoints
• Coding challenges
• Quick tips and notes

Perfect for beginners who prefer reading over watching videos!`,
  
  shortDescription: "CodeChef-style interactive Python course with clean cards, syntax examples, MCQs, and coding challenges. No videos required!",
  category: "Web Development",
  level: "Beginner",
  price: 0,
  discountPrice: 0,
  thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60",
  language: "English",
  requirements: [
    "No programming experience needed",
    "Computer with Python installed",
    "Text editor (VS Code, PyCharm, or IDLE)",
    "Willingness to practice!"
  ],
  whatYouWillLearn: [
    "Read interactive card-based lessons",
    "Practice with clean syntax examples",
    "Test knowledge with MCQ checkpoints",
    "Solve coding challenges",
    "Build strong Python fundamentals"
  ],
  tags: ["Python", "CodeChef Style", "Interactive", "Text-Based", "Beginner Friendly"],
  isPublished: true,
  isFeatured: true,
  sections: [
    // ==================== MODULE 1 ====================
    {
      title: "Module 1: Output & Printing",
      order: 1,
      lessons: [
        {
          title: "📘 Introduction to print()",
          description: `## Your First Python Tool

The \`print()\` function displays information on the screen. It's your way of making Python "speak" to you. Whatever you put inside the parentheses appears as output. You can print text (in quotes), numbers, or results of calculations.

---

### 🟣 Real-World Analogy

Think of \`print()\` as a **loudspeaker at a railway station**. The announcer speaks into it, and everyone hears the message. Similarly, \`print()\` broadcasts whatever you tell it to display on your screen!

---

### 🟦 Syntax Card

\`\`\`python
# Printing text (use quotes)
print("Hello, World!")

# Printing numbers (no quotes needed)
print(42)
print(3.14)

# Printing multiple items (comma-separated)
print("The answer is", 42)

# Special characters
print("Line 1\\nLine 2")  # \\n creates new line
\`\`\`

**Output:**
\`\`\`
Hello, World!
42
3.14
The answer is 42
Line 1
Line 2
\`\`\`

---

### 🟡 Quick Notes

• Text must be in quotes: \`"Hello"\` or \`'Hello'\`
• Numbers don't need quotes: \`42\` not \`"42"\`
• Use commas to print multiple things
• \`\\n\` creates a new line

---

### 🔗 Recommended Resources (Optional)

If you want video explanations:
• Python Print Function - Programming with Mosh: https://youtu.be/kqtD5dpn9C8
• Python Basics - freeCodeCamp: https://youtu.be/rfscVS0vtbw`,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: "🟢 MCQ Checkpoint",
          description: `## Test Your Understanding

**QUESTION:**
What will be the output of this code?

\`\`\`python
print("5 + 3")
\`\`\`

**Options:**

A) 8

B) 5 + 3

C) "5 + 3"

D) Error

---

**ANSWER: B) 5 + 3**

**EXPLANATION:**
When text is inside quotes, Python treats it as a **string** (text), not a math calculation. It prints exactly what's in the quotes: \`5 + 3\`

If you wanted the math result, you'd write: \`print(5 + 3)\` (no quotes) which gives \`8\`.`,
          videoUrl: NO_VIDEO,
          duration: 5,
          order: 2,
          isPreview: true
        },
        {
          title: "🟠 Coding Challenge",
          description: `## 🧪 Challenge: Print a Message

**TASK:**
Write a program that prints these three lines:

\`\`\`
Hello, I am learning Python!
Python is fun!
Let's code together!
\`\`\`

---

**🎯 Your Goal:**
• Use three separate \`print()\` statements
• Each statement prints one line
• Match the exact text shown above

---

**💡 HINT:**
Remember to put text in quotes!

---

**✅ SOLUTION:**

\`\`\`python
print("Hello, I am learning Python!")
print("Python is fun!")
print("Let's code together!")
\`\`\``,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 3,
          isPreview: false
        }
      ]
    },

    // ==================== MODULE 2 ====================
    {
      title: "Module 2: Variables & Data Types",
      order: 2,
      lessons: [
        {
          title: "📘 Understanding Variables",
          description: `## Storing Data with Variables

Variables are **labeled containers** that store values. You create them using the \`=\` sign. Python automatically detects what type of data you're storing: numbers, text, or True/False values.

**Four Main Types:**
• **int** - Whole numbers (25, -10, 0)
• **float** - Decimal numbers (3.14, -0.5)
• **str** - Text in quotes ("Hello")
• **bool** - True or False

---

### 🟣 Real-World Analogy

Imagine **gym lockers** with name tags. Each locker (variable) has a label like "age" and stores something inside (25). Later, you can open the locker using its name to get the value!

---

### 🟦 Syntax Card

\`\`\`python
# Creating variables
name = "Alice"          # String (text)
age = 25                # Integer (whole number)
height = 5.6            # Float (decimal)
is_student = True       # Boolean (True/False)

# Using variables
print(name)             # Alice
print(age)              # 25

# Checking types
print(type(name))       # <class 'str'>
print(type(age))        # <class 'int'>
print(type(height))     # <class 'float'>

# Updating variables
age = 26                # Changes age to 26
print(age)              # 26
\`\`\`

---

### 🟡 Quick Notes

• Variable names: lowercase, use underscores (\`user_name\`)
• Can't start with numbers: ❌ \`2fast\` ✅ \`fast2\`
• Case-sensitive: \`Age\` and \`age\` are different
• Use \`type()\` to check data type`,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: "🟢 MCQ Checkpoint",
          description: `## Test Your Understanding

**QUESTION:**
What is the data type of this variable?

\`\`\`python
price = "99.99"
\`\`\`

**Options:**

A) int

B) float

C) str

D) bool

---

**ANSWER: C) str**

**EXPLANATION:**
Even though \`99.99\` looks like a number, it's wrapped in **quotes** (\`"99.99"\`), making it a **string** (text). 

To make it a float (decimal number), remove the quotes: \`price = 99.99\`

**Remember:** Quotes = String!`,
          videoUrl: NO_VIDEO,
          duration: 5,
          order: 2,
          isPreview: false
        },
        {
          title: "🟠 Coding Challenge",
          description: `## 🧪 Challenge: Digital ID Card

**TASK:**
Create a simple digital ID card using variables.

---

**🎯 Your Goal:**
1. Create variables: \`name\`, \`age\`, \`city\`, \`is_employed\`
2. Assign appropriate values
3. Print each with a label

---

**📝 Expected Output:**
\`\`\`
Name: Gouri
Age: 25
City: Bangalore
Employed: True
\`\`\`

---

**✅ SOLUTION:**

\`\`\`python
# Create variables
name = "Gouri"
age = 25
city = "Bangalore"
is_employed = True

# Print ID card
print("Name:", name)
print("Age:", age)
print("City:", city)
print("Employed:", is_employed)
\`\`\``,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 3,
          isPreview: false
        }
      ]
    },

    // ==================== MODULE 3 ====================
    {
      title: "Module 3: Arithmetic Operations",
      order: 3,
      lessons: [
        {
          title: "📘 Python as Your Calculator",
          description: `## Math Operations in Python

Python can do math just like a calculator! Use these operators:

**Basic Operators:**
• \`+\` Addition
• \`-\` Subtraction
• \`*\` Multiplication
• \`/\` Division
• \`//\` Floor Division (removes decimal)
• \`%\` Modulus (remainder)
• \`**\` Power (exponent)

---

### 🟣 Real-World Analogy

Think of Python as a **smart calculator** in your pocket. Just like you punch numbers and operators on a calculator, Python processes your math and gives results. Bonus: Python can save results in variables for later use!

---

### 🟦 Syntax Card

\`\`\`python
a = 15
b = 4

print(a + b)   # 19 (addition)
print(a - b)   # 11 (subtraction)
print(a * b)   # 60 (multiplication)
print(a / b)   # 3.75 (division)
print(a // b)  # 3 (floor division, removes decimal)
print(a % b)   # 3 (remainder: 15÷4 = 3 remainder 3)
print(a ** b)  # 50625 (power: 15^4)

# Order of operations (PEMDAS)
result = 10 + 5 * 2    # 20 (multiply first)
result2 = (10 + 5) * 2 # 30 (parentheses first)

# Shorthand
score = 100
score += 10    # Same as: score = score + 10
print(score)   # 110
\`\`\`

---

### 🟡 Quick Notes

• Python follows PEMDAS (order of operations)
• Use parentheses \`()\` to control order
• \`//\` removes decimals: \`7 // 2 = 3\`
• \`%\` gives remainder: \`7 % 2 = 1\``,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: "🟢 MCQ Checkpoint",
          description: `## Test Your Understanding

**QUESTION:**
What is the output of this code?

\`\`\`python
print(17 % 5)
\`\`\`

**Options:**

A) 3.4

B) 3

C) 2

D) 12

---

**ANSWER: C) 2**

**EXPLANATION:**
The \`%\` (modulus) operator gives the **remainder** after division.

\`17 ÷ 5 = 3\` with remainder \`2\`

So \`17 % 5 = 2\`

**Common Uses:**
• Check if number is even: \`num % 2 == 0\`
• Get last digit: \`num % 10\``,
          videoUrl: NO_VIDEO,
          duration: 5,
          order: 2,
          isPreview: false
        },
        {
          title: "🟠 Coding Challenge",
          description: `## 🧪 Challenge: Bill Calculator

**TASK:**
Build a simple restaurant bill calculator with GST.

---

**🎯 Your Goal:**
1. Create variables: \`item_price = 250\`, \`quantity = 3\`
2. Calculate \`subtotal\` (price × quantity)
3. Calculate \`gst\` (18% of subtotal)
4. Calculate \`total\` (subtotal + gst)
5. Print the bill

---

**📝 Expected Output:**
\`\`\`
Subtotal: 750
GST (18%): 135.0
Total: 885.0
\`\`\`

---

**✅ SOLUTION:**

\`\`\`python
# Input values
item_price = 250
quantity = 3

# Calculations
subtotal = item_price * quantity
gst = subtotal * 0.18
total = subtotal + gst

# Display bill
print("Subtotal:", subtotal)
print("GST (18%):", gst)
print("Total:", total)
\`\`\``,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 3,
          isPreview: false
        }
      ]
    },

    // ==================== MODULE 4 ====================
    {
      title: "Module 4: String Manipulation",
      order: 4,
      lessons: [
        {
          title: "📘 Working with Text",
          description: `## String Operations

Strings are sequences of characters (text) in quotes. Python provides powerful tools to work with them:

**Key Operations:**
• **Concatenation** - Join strings with \`+\`
• **Repetition** - Repeat with \`*\`
• **Indexing** - Access characters by position
• **Slicing** - Extract portions
• **Methods** - Built-in functions like \`.upper()\`, \`.lower()\`

---

### 🟣 Real-World Analogy

Think of a string as a **train with letter carriages**. Each carriage has a seat number (index) starting from 0. You can:
• View any carriage: \`word[0]\`
• Connect trains: \`"Hello" + " " + "World"\`
• Detach carriages: \`word[1:4]\`

---

### 🟦 Syntax Card

\`\`\`python
# Creating & joining strings
greeting = "Hello"
name = "Gouri"
message = greeting + ", " + name + "!"
print(message)  # Hello, Gouri!

# Repetition
stars = "*" * 5
print(stars)    # *****

# Indexing (0-based)
word = "Python"
print(word[0])   # P (first)
print(word[-1])  # n (last)

# Slicing [start:end]
print(word[0:3])  # Pyt
print(word[2:])   # thon

# String methods
text = "hello world"
print(text.upper())       # HELLO WORLD
print(text.capitalize())  # Hello world
print(text.replace("world", "Python"))  # hello Python
print(len(text))          # 11
\`\`\`

---

### 🟡 Quick Notes

• Strings are immutable (can't change after creation)
• Index starts at 0, not 1
• Negative index: -1 is last, -2 is second-last
• Slicing [a:b] includes a, excludes b`,
          videoUrl: NO_VIDEO,
          duration: 12,
          order: 1,
          isPreview: true
        },
        {
          title: "🟢 MCQ Checkpoint",
          description: `## Test Your Understanding

**QUESTION:**
What is the output?

\`\`\`python
print("Python"[1:4])
\`\`\`

**Options:**

A) Pyt

B) yth

C) ytho

D) Pyth

---

**ANSWER: B) yth**

**EXPLANATION:**
Slicing \`[1:4]\` means:
• Start at index 1 (y)
• Go up to (but NOT including) index 4

\`\`\`
 P  y  t  h  o  n
 0  1  2  3  4  5
    ^  ^  ^
    |  |  |
  start | end (excluded)
\`\`\`

Result: "yth"`,
          videoUrl: NO_VIDEO,
          duration: 5,
          order: 2,
          isPreview: false
        },
        {
          title: "🟠 Coding Challenge",
          description: `## 🧪 Challenge: Username Generator

**TASK:**
Create a username from a name and birth year.

---

**🎯 Your Goal:**
1. Use \`first_name = "gouri"\` and \`birth_year = "1999"\`
2. Take first 3 letters of name (uppercase)
3. Add last 2 digits of year
4. Print the username

---

**📝 Expected Output:**
\`\`\`
Username: GOU99
\`\`\`

---

**💡 HINTS:**
• Use slicing to get parts: \`[:3]\` and \`[-2:]\`
• Use \`.upper()\` to make uppercase

---

**✅ SOLUTION:**

\`\`\`python
first_name = "gouri"
birth_year = "1999"

# Extract parts
name_part = first_name[:3].upper()  # First 3, uppercase
year_part = birth_year[-2:]         # Last 2 digits

# Combine
username = name_part + year_part
print("Username:", username)
\`\`\``,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 3,
          isPreview: false
        }
      ]
    },

    // ==================== MODULE 5 ====================
    {
      title: "Module 5: User Inputs",
      order: 5,
      lessons: [
        {
          title: "📘 Making Programs Interactive",
          description: `## Getting User Input

The \`input()\` function makes your program interactive! It:
1. Shows a prompt message
2. Waits for the user to type something
3. Returns what they typed (always as a string)

**Type Conversion:**
• \`int()\` - Convert to integer
• \`float()\` - Convert to decimal
• \`str()\` - Convert to string

---

### 🟣 Real-World Analogy

Think of \`input()\` as a **waiter at a restaurant**. The waiter asks "What would you like?", waits for your answer, and takes it back to the kitchen (your program). Your program then processes the order!

---

### 🟦 Syntax Card

\`\`\`python
# Basic input (returns string)
name = input("Enter your name: ")
print("Hello, " + name + "!")

# Input as number
age = int(input("Enter your age: "))
print("Next year you'll be", age + 1)

# Float input
price = float(input("Enter price: "))
tax = price * 0.18
print("Tax:", tax)

# Multiple inputs
first = input("First name: ")
last = input("Last name: ")
full = first + " " + last
print("Full name:", full)
\`\`\`

**Sample Run:**
\`\`\`
Enter your name: Gouri
Hello, Gouri!
Enter your age: 25
Next year you'll be 26
\`\`\`

---

### 🟡 Quick Notes

• \`input()\` always returns a string
• Use \`int()\` for whole numbers
• Use \`float()\` for decimals
• Invalid conversion causes ValueError`,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: "🟢 MCQ Checkpoint",
          description: `## Test Your Understanding

**QUESTION:**
What happens if a user enters "twenty" for this code?

\`\`\`python
age = int(input("Age: "))
\`\`\`

**Options:**

A) Stores "twenty" as the age

B) Converts "twenty" to 20

C) Causes a ValueError (error)

D) Stores 0 as the age

---

**ANSWER: C) Causes a ValueError**

**EXPLANATION:**
\`int()\` can only convert **numeric strings** like "25" to integers. The word "twenty" cannot be converted, so Python raises a **ValueError**.

**Valid conversions:**
• \`int("25")\` ✅ Works → 25
• \`int("twenty")\` ❌ ValueError

Always validate user input!`,
          videoUrl: NO_VIDEO,
          duration: 5,
          order: 2,
          isPreview: false
        },
        {
          title: "🟠 Coding Challenge",
          description: `## 🧪 Challenge: Age Calculator

**TASK:**
Create a program that calculates age and years until turning 100.

---

**🎯 Your Goal:**
1. Ask for birth year
2. Calculate current age (assume 2025)
3. Calculate years until 100
4. Display results

---

**📝 Expected Output:**
\`\`\`
Enter birth year: 1995
You are 30 years old.
You will turn 100 in 70 years!
\`\`\`

---

**✅ SOLUTION:**

\`\`\`python
# Get user input
birth_year = int(input("Enter birth year: "))

# Calculations
current_year = 2025
age = current_year - birth_year
years_to_100 = 100 - age

# Display results
print(f"You are {age} years old.")
print(f"You will turn 100 in {years_to_100} years!")
\`\`\``,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 3,
          isPreview: false
        }
      ]
    },

    // ==================== MODULE 6 ====================
    {
      title: "Module 6: Conditionals (if/elif/else)",
      order: 6,
      lessons: [
        {
          title: "📘 Making Decisions",
          description: `## Conditional Statements

Conditionals let your program make decisions based on conditions.

**Structure:**
• \`if\` - Check first condition
• \`elif\` - Check alternate conditions
• \`else\` - Default case if nothing matches

**Comparison Operators:**
• \`==\` Equal to
• \`!=\` Not equal
• \`<\` Less than
• \`>\` Greater than
• \`<=\` Less than or equal
• \`>=\` Greater than or equal

---

### 🟣 Real-World Analogy

Think of a **traffic signal**:
• **IF** light is green → Go
• **ELIF** light is yellow → Slow down
• **ELSE** (red) → Stop

Your program checks conditions in order and takes the first matching action!

---

### 🟦 Syntax Card

\`\`\`python
# Basic if-else
age = 18
if age >= 18:
    print("You can vote!")
else:
    print("Too young to vote")

# if-elif-else chain
score = 75
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
print("Grade:", grade)  # C

# Multiple conditions (and, or)
age = 25
has_license = True
if age >= 18 and has_license:
    print("Can drive!")

# Membership check
fruits = ["apple", "banana"]
if "apple" in fruits:
    print("Apple available!")
\`\`\`

---

### 🟡 Quick Notes

• Indentation (4 spaces) is REQUIRED
• First true condition wins (rest are skipped)
• Use \`and\` / \`or\` for multiple conditions
• \`in\` checks if item exists in list`,
          videoUrl: NO_VIDEO,
          duration: 12,
          order: 1,
          isPreview: true
        },
        {
          title: "🟢 MCQ Checkpoint",
          description: `## Test Your Understanding

**QUESTION:**
What is the output?

\`\`\`python
x = 10
if x > 5:
    print("A")
elif x > 8:
    print("B")
else:
    print("C")
\`\`\`

**Options:**

A) A

B) B

C) A and B

D) C

---

**ANSWER: A) A**

**EXPLANATION:**
Python checks conditions **in order**:
1. \`x > 5\` → True (10 > 5) ✅
2. Prints "A"
3. **STOPS** and skips remaining elif/else

Even though \`x > 8\` is also true, it's never checked because the first condition already matched!

**Key Point:** Only ONE block executes.`,
          videoUrl: NO_VIDEO,
          duration: 5,
          order: 2,
          isPreview: false
        },
        {
          title: "🟠 Coding Challenge",
          description: `## 🧪 Challenge: Movie Ticket Pricer

**TASK:**
Calculate movie ticket price based on age.

---

**🎯 Your Goal:**
• Children (under 12): ₹100
• Adults (12-59): ₹250
• Seniors (60+): ₹150

---

**📝 Expected Output:**
\`\`\`
Enter your age: 28
Your ticket price: ₹250
\`\`\`

---

**✅ SOLUTION:**

\`\`\`python
# Get age
age = int(input("Enter your age: "))

# Determine price
if age < 12:
    price = 100
elif age <= 59:
    price = 250
else:
    price = 150

# Display
print(f"Your ticket price: ₹{price}")
\`\`\``,
          videoUrl: NO_VIDEO,
          duration: 10,
          order: 3,
          isPreview: false
        }
      ]
    },

    // ==================== MODULE 7 ====================
    {
      title: "Module 7: Loops (for & while)",
      order: 7,
      lessons: [
        {
          title: "📘 Repeating Actions",
          description: `## Loop Fundamentals

Loops repeat code automatically, saving you from writing the same thing over and over.

**Two Types:**
• **for loop** - Repeat a fixed number of times
• **while loop** - Repeat while condition is true

**Control Statements:**
• \`break\` - Exit loop early
• \`continue\` - Skip current iteration
• \`range()\` - Generate number sequences

---

### 🟣 Real-World Analogy

**For Loop:** Like a **washing machine cycle** - it runs a fixed number of times (wash, rinse, spin) and then stops.

**While Loop:** Like eating at a **buffet** - you keep going back **while** you're hungry. When full, you stop.

---

### 🟦 Syntax Card

\`\`\`python
# For loop with range
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# For loop with list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# While loop
count = 0
while count < 5:
    print(count)
    count += 1

# Break and continue
for i in range(10):
    if i == 3:
        continue  # Skip 3
    if i == 7:
        break     # Stop at 7
    print(i)      # 0,1,2,4,5,6

# Nested loop
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end=" ")
    print()
\`\`\`

---

### 🟡 Quick Notes

• \`range(5)\` generates: 0, 1, 2, 3, 4
• \`range(2, 8)\` generates: 2, 3, 4, 5, 6, 7
• \`range(0, 10, 2)\` generates: 0, 2, 4, 6, 8
• Infinite loop danger with \`while True\``,
          videoUrl: NO_VIDEO,
          duration: 12,
          order: 1,
          isPreview: true
        },
        {
          title: "🟢 MCQ Checkpoint",
          description: `## Test Your Understanding

**QUESTION:**
How many times does this loop run?

\`\`\`python
for i in range(2, 10, 3):
    print(i)
\`\`\`

**Options:**

A) 10 times

B) 3 times

C) 8 times

D) 4 times

---

**ANSWER: B) 3 times**

**EXPLANATION:**
\`range(2, 10, 3)\` means:
• Start: 2
• Stop: 10 (not included)
• Step: 3

Generated sequence: **2, 5, 8**

That's **3 numbers**, so the loop runs **3 times**!`,
          videoUrl: NO_VIDEO,
          duration: 5,
          order: 2,
          isPreview: false
        },
        {
          title: "🟠 Coding Challenge",
          description: `## 🧪 Challenge: Number Guessing Game

**TASK:**
Build a game where user guesses a secret number!

---

**🎯 Your Goal:**
• Secret number is 7
• Keep asking until correct
• Give "Too high" or "Too low" hints
• Congratulate when correct

---

**📝 Expected Output:**
\`\`\`
Guess (1-10): 5
Too low!
Guess (1-10): 9
Too high!
Guess (1-10): 7
🎉 Correct!
\`\`\`

---

**✅ SOLUTION:**

\`\`\`python
secret = 7

while True:
    guess = int(input("Guess (1-10): "))
    
    if guess < secret:
        print("Too low!")
    elif guess > secret:
        print("Too high!")
    else:
        print("🎉 Correct!")
        break  # Exit loop
\`\`\``,
          videoUrl: NO_VIDEO,
          duration: 12,
          order: 3,
          isPreview: false
        }
      ]
    },

    // ==================== MODULE 8 ====================
    {
      title: "Module 8: Functions",
      order: 8,
      lessons: [
        {
          title: "📘 Reusable Code Blocks",
          description: `## Function Fundamentals

Functions are **reusable blocks of code** with a name. They help you:
• Organize code into logical pieces
• Reuse code without rewriting
• Make programs easier to understand

**Key Concepts:**
• **Define** with \`def\`
• **Parameters** - inputs to function
• **Return** - output from function
• **Call** - use the function

---

### 🟣 Real-World Analogy

Think of a **coffee machine**:
• **Input:** You press a button (call function)
• **Process:** Machine brews coffee internally (function code)
• **Output:** You get coffee (return value)

You don't need to know HOW it makes coffee - just press the button!

---

### 🟦 Syntax Card

\`\`\`python
# Basic function
def greet():
    print("Hello!")

greet()  # Call it

# Function with parameter
def greet_user(name):
    print(f"Hello, {name}!")

greet_user("Gouri")  # Hello, Gouri!

# Function with return
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8

# Default parameters
def greet(name, msg="Hello"):
    return f"{msg}, {name}!"

print(greet("Bob"))           # Hello, Bob!
print(greet("Bob", "Hi"))     # Hi, Bob!

# Multiple returns
def stats(nums):
    return min(nums), max(nums), sum(nums)

low, high, total = stats([1,2,3,4,5])
print(f"Min:{low} Max:{high} Sum:{total}")
\`\`\`

---

### 🟡 Quick Notes

• Function names: lowercase, underscores
• Parameters are optional
• \`return\` is optional (defaults to \`None\`)
• Can return multiple values`,
          videoUrl: NO_VIDEO,
          duration: 12,
          order: 1,
          isPreview: true
        },
        {
          title: "🟢 MCQ Checkpoint",
          description: `## Test Your Understanding

**QUESTION:**
What does this function return?

\`\`\`python
def mystery(x):
    if x > 0:
        return "Positive"
    return "Not Positive"

result = mystery(0)
\`\`\`

**Options:**

A) "Positive"

B) "Not Positive"

C) 0

D) None

---

**ANSWER: B) "Not Positive"**

**EXPLANATION:**
1. \`mystery(0)\` is called with x=0
2. Check: \`0 > 0\` → False
3. Skip first return
4. Execute second return: \`"Not Positive"\`

**Key Point:** When return executes, function stops immediately!`,
          videoUrl: NO_VIDEO,
          duration: 5,
          order: 2,
          isPreview: false
        },
        {
          title: "🟠 Coding Challenge",
          description: `## 🧪 Challenge: Temperature Converter

**TASK:**
Create functions to convert between Celsius and Fahrenheit.

---

**🎯 Your Goal:**
Create two functions:
1. \`celsius_to_fahrenheit(c)\` → F = (C × 9/5) + 32
2. \`fahrenheit_to_celsius(f)\` → C = (F - 32) × 5/9

---

**📝 Expected Output:**
\`\`\`
37°C = 98.6°F
98.6°F = 37.0°C
\`\`\`

---

**✅ SOLUTION:**

\`\`\`python
def celsius_to_fahrenheit(c):
    return (c * 9/5) + 32

def fahrenheit_to_celsius(f):
    return (f - 32) * 5/9

# Test functions
c = 37
f = 98.6

print(f"{c}°C = {celsius_to_fahrenheit(c)}°F")
print(f"{f}°F = {fahrenheit_to_celsius(f)}°C")
\`\`\`

---

## 🎓 Congratulations!

You've completed all 8 modules of the Python Zero to Hero course! 🎉

**What's Next?**
• Practice on CodeChef, LeetCode, HackerRank
• Build mini projects (Calculator, To-Do App, Quiz)
• Learn Lists, Dictionaries, File Handling
• Explore libraries (NumPy, Pandas, Flask)

Keep coding! 💪`,
          videoUrl: NO_VIDEO,
          duration: 15,
          order: 3,
          isPreview: false
        }
      ]
    }
  ]
};

async function updateToCodingChefStyle() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const existingCourse = await Course.findOne({ slug: codeChefStylePythonCourse.slug });
    
    if (existingCourse) {
      console.log('🔄 Updating course to CodeChef interactive style...');
      Object.assign(existingCourse, codeChefStylePythonCourse);
      await existingCourse.save();
      console.log('✅ Course UPDATED to CodeChef style!');
    } else {
      console.error('❌ Course not found.');
      process.exit(1);
    }

    let totalLessons = 0;
    codeChefStylePythonCourse.sections.forEach(section => {
      totalLessons += section.lessons.length;
    });

    console.log(`
📊 CodeChef-Style Course Summary:
   - Format: Interactive cards (like CodeChef Learn)
   - No video autoplay
   - Modules: ${codeChefStylePythonCourse.sections.length}
   - Total Lessons: ${totalLessons}
   - Features: Clean headings, syntax cards, MCQs, challenges
   - Style: Professional, minimal, beginner-friendly
`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating course:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

updateToCodingChefStyle();
