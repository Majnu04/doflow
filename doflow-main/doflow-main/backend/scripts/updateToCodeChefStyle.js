// Script to update Python course to CodeChef Interactive Learning Style
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

const codeChefStyleCourse = {
  title: "Zero to Hero Python Course - Complete Edition",
  slug: "zero-to-hero-python-course-complete-edition",
  description: `Master Python programming from absolute scratch with an interactive, hands-on learning experience inspired by CodeChef's teaching methodology!

🎯 Why This Course?
• Clean, structured lessons broken into bite-sized sections
• Real-world analogies to understand complex concepts
• Interactive MCQ quizzes to test your knowledge
• Hands-on coding challenges to practice immediately
• No video distractions - pure, focused learning content
• Professional formatting with syntax cards and tip boxes

Perfect for absolute beginners with zero coding experience. Learn by doing, not just watching!`,
  
  shortDescription: "Master Python from scratch with CodeChef-style interactive lessons, real-world analogies, MCQs, and coding challenges.",
  category: "Programming",
  level: "Beginner",
  price: 0,
  discountPrice: 0,
  thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60",
  language: "English",
  requirements: [
    "No prior programming experience needed",
    "A computer with internet access",
    "Python 3.x installed (we'll guide you)",
    "Enthusiasm to learn coding!"
  ],
  whatYouWillLearn: [
    "Write and run Python programs from scratch",
    "Understand variables, data types, and operators",
    "Work with strings and perform text manipulation",
    "Take user inputs and build interactive programs",
    "Make decisions using conditionals (if/elif/else)",
    "Automate repetitive tasks using loops",
    "Create reusable code with functions",
    "Debug and troubleshoot your code",
    "Solve coding challenges and build projects"
  ],
  tags: ["Python", "Programming", "Beginner", "Interactive", "CodeChef", "Coding"],
  isPublished: true,
  isFeatured: true,
  sections: [
    // ==================== MODULE 1: OUTPUT & PRINTING ====================
    {
      title: "Module 1: Output & Printing",
      order: 1,
      lessons: [
        {
          title: "Introduction to Output & Printing",
          description: `## 📘 Understanding Output in Python

The \`print()\` function is Python's way of displaying information to the user. It's the most fundamental tool you'll use - every program needs to communicate its results!

**Why is printing important?**
- Shows results to users
- Helps debug your code
- Displays program status and messages

---

## 🟣 Real-World Analogy

Think of \`print()\` like a digital billboard on a highway:
- You (the programmer) decide what message to show
- The billboard (screen) displays it to everyone
- Drivers (users) see your message instantly

Just like a billboard can show text, numbers, or symbols - Python's print() can display any type of information!

---

## 💻 Syntax Card: Basic Printing

\`\`\`python
# Print text (use quotes!)
print("Hello, World!")
# Output: Hello, World!

# Print numbers (no quotes needed)
print(42)
# Output: 42

# Print multiple items (separated by commas)
print("The answer is", 42)
# Output: The answer is 42

# Print with calculations
print(10 + 5)
# Output: 15
\`\`\`

---

## 🟢 Quick Tip

**Remember:** Text needs quotes ("text" or 'text'), but numbers don't!
- ✅ \`print("123")\` → Shows text "123"
- ✅ \`print(123)\` → Shows number 123
- ❌ \`print(Hello)\` → ERROR (missing quotes)

---

## 📝 Interactive MCQ Quiz

**Question:** What will this code output?
\`\`\`python
print(5 + 3)
\`\`\`

A) 5 + 3
B) 8
C) "8"
D) Error

||ANSWER:B||
||EXPLANATION:Python evaluates the expression 5 + 3 first (which equals 8) and then prints the result. Since there are no quotes, it prints the number 8, not the text "5 + 3".||

---

## 🧪 Coding Challenge: Your First Program

**Task:** Write a program that prints:
1. Your name
2. Your age (as a number)
3. A message combining both

**Example Output:**
\`\`\`
Alice
25
My name is Alice and I am 25 years old.
\`\`\`

**Starter Code:**
\`\`\`python
# Write your code here
print("___")  # Your name
print(___)    # Your age
print("My name is ___ and I am ___ years old.")
\`\`\`

---

## 📺 Optional Video Resources

If you prefer video explanations, check out these curated tutorials:
- Python print() basics: https://www.youtube.com/watch?v=FhoASwgvZHk
- Print function deep dive: https://www.youtube.com/watch?v=6M7PBUq4SYQ

*(Note: Videos are optional - all content is available in text format above)*`,
          videoUrl: "https://placeholder-video.com/python-output",
          duration: 15,
          order: 1,
          isPreview: true,
          resources: []
        },
        {
          title: "Advanced Printing Techniques",
          description: `## 📘 Formatting Your Output

Python's \`print()\` function has powerful formatting options to make your output look professional and clean!

**Key Features:**
- Custom separators between items
- Custom line endings
- String formatting with f-strings
- Multiple line printing

---

## 💻 Syntax Card: Advanced Print Features

\`\`\`python
# Custom separator (default is space)
print("apple", "banana", "cherry", sep=", ")
# Output: apple, banana, cherry

# Custom ending (default is newline)
print("Loading", end="...")
print("Done!")
# Output: Loading...Done!

# F-strings for easy formatting
name = "Alice"
age = 25
print(f"Hello, I'm {name} and I'm {age} years old")
# Output: Hello, I'm Alice and I'm 25 years old

# Print multiple lines
print("""
This is line 1
This is line 2
This is line 3
""")
\`\`\`

---

## 🟢 Pro Tip: F-Strings vs Old Style

F-strings (Python 3.6+) are the modern, cleaner way:
- ❌ Old: \`print("Name: " + name + ", Age: " + str(age))\`
- ✅ New: \`print(f"Name: {name}, Age: {age}")\`

F-strings are faster, easier to read, and automatically convert types!

---

## 📝 Interactive MCQ Quiz

**Question:** What will this code output?
\`\`\`python
print("Python", "is", "awesome", sep="-")
\`\`\`

A) Python is awesome
B) Python-is-awesome
C) Python - is - awesome
D) Error

||ANSWER:B||
||EXPLANATION:The sep parameter changes the separator between items from the default space to a hyphen (-). So all items are joined with hyphens, resulting in "Python-is-awesome".||

---

## 🧪 Coding Challenge: Format a Receipt

**Task:** Create a program that prints a shopping receipt with:
- Store name (centered with asterisks)
- Three items with prices
- Total price
- Thank you message

**Example Output:**
\`\`\`
******** STORE NAME ********
Item 1: $10.99
Item 2: $5.50
Item 3: $3.25
--------------------------
Total: $19.74
Thank you for shopping!
\`\`\`

**Hint:** Use f-strings and multiple print statements!

---

## 📺 Optional Video Resources

- Python f-strings tutorial: https://www.youtube.com/watch?v=nghuHvKLhJA
- Print formatting guide: https://www.youtube.com/watch?v=7-RK0g82d4I`,
          videoUrl: "https://placeholder-video.com/python-formatting",
          duration: 20,
          order: 2,
          isPreview: false,
          resources: []
        }
      ]
    },

    // ==================== MODULE 2: VARIABLES & DATA TYPES ====================
    {
      title: "Module 2: Variables & Data Types",
      order: 2,
      lessons: [
        {
          title: "Understanding Variables",
          description: `## 📘 What Are Variables?

Variables are containers that store data in your program. Think of them as labeled boxes where you can keep information and retrieve it later by its name.

**Why use variables?**
- Store data for later use
- Make code reusable and dynamic
- Give meaningful names to values
- Update values without rewriting code

---

## 🟣 Real-World Analogy

Imagine your kitchen cabinet with labeled jars:
- A jar labeled "Sugar" contains sugar
- A jar labeled "Coffee" contains coffee
- You can empty a jar and refill it with something else

Variables work the same way - they're labeled containers you can fill, read, and update!

---

## 💻 Syntax Card: Creating Variables

\`\`\`python
# Simple assignment
name = "Alice"
age = 25
is_student = True
height = 5.8

# Using variables
print(name)  # Output: Alice
print(f"{name} is {age} years old")
# Output: Alice is 25 years old

# Updating variables
age = 26  # Changed from 25 to 26
score = 0
score = score + 10  # score is now 10

# Multiple assignments
x, y, z = 1, 2, 3
a = b = c = 0  # All three are 0
\`\`\`

---

## 🟢 Variable Naming Rules

**✅ Valid names:**
- \`student_name\`, \`age2\`, \`_temp\`, \`myVar\`

**❌ Invalid names:**
- \`2age\` (can't start with number)
- \`my-name\` (no hyphens)
- \`class\` (reserved keyword)

**Best practices:**
- Use descriptive names: \`student_age\` not \`x\`
- Use snake_case: \`first_name\` not \`firstName\`
- Avoid single letters (except in loops)

---

## 📝 Interactive MCQ Quiz

**Question:** Which variable name is INVALID in Python?

A) student_name
B) 2nd_place
C) _private
D) myAge

||ANSWER:B||
||EXPLANATION:Variable names cannot start with a number. "2nd_place" starts with "2", making it invalid. All other options follow Python's naming rules.||

---

## 🧪 Coding Challenge: Swap Variables

**Task:** Write a program that swaps the values of two variables.

**Initial values:**
\`\`\`python
a = 10
b = 20
\`\`\`

**After swap:**
\`\`\`
a should be 20
b should be 10
\`\`\`

**Hint:** Python has a clever one-line solution! Try: \`a, b = b, a\`

---

## 📺 Optional Video Resources

- Variables explained: https://www.youtube.com/watch?v=cQT33yu9pY8
- Variable naming best practices: https://www.youtube.com/watch?v=b7mF3xx1P_I`,
          videoUrl: "https://placeholder-video.com/python-variables",
          duration: 18,
          order: 1,
          isPreview: false,
          resources: []
        },
        {
          title: "Data Types in Python",
          description: `## 📘 Understanding Data Types

Python has several built-in data types to handle different kinds of information. Each type has specific properties and operations you can perform on it.

**Main data types:**
- **int** - Whole numbers (1, 42, -10)
- **float** - Decimal numbers (3.14, -0.5)
- **str** - Text ("hello", 'world')
- **bool** - True or False values
- **list** - Ordered collections [1, 2, 3]
- **dict** - Key-value pairs {"name": "Alice"}

---

## 💻 Syntax Card: Working with Types

\`\`\`python
# Integer
age = 25
print(type(age))  # Output: <class 'int'>

# Float
price = 19.99
print(type(price))  # Output: <class 'float'>

# String
name = "Alice"
print(type(name))  # Output: <class 'str'>

# Boolean
is_active = True
print(type(is_active))  # Output: <class 'bool'>

# Type conversion
x = "123"
y = int(x)  # Convert string to integer
print(y + 10)  # Output: 133

# Automatic type detection
z = 10 / 3
print(type(z))  # Output: <class 'float'> (division always gives float)
\`\`\`

---

## 🟢 Type Conversion Tips

**Common conversions:**
- \`int("42")\` → 42
- \`float("3.14")\` → 3.14
- \`str(100)\` → "100"
- \`bool(1)\` → True
- \`bool(0)\` → False

**Watch out for:**
- ❌ \`int("3.14")\` → ERROR (use float first)
- ❌ \`int("hello")\` → ERROR (can't convert text to number)

---

## 📝 Interactive MCQ Quiz

**Question:** What will this code output?
\`\`\`python
x = "10"
y = "20"
print(x + y)
\`\`\`

A) 30
B) 1020
C) "30"
D) Error

||ANSWER:B||
||EXPLANATION:Both x and y are strings (text), not numbers. The + operator on strings performs concatenation (joining), not addition. So "10" + "20" results in "1020".||

---

## 🧪 Coding Challenge: Type Detective

**Task:** Create a program that:
1. Takes three variables of different types
2. Prints each variable's value and type
3. Performs one operation on each type

**Example:**
\`\`\`python
# Your variables
num = 42
price = 9.99
text = "Python"

# Show type and perform operation
print(f"{num} is {type(num)} → doubled: {num * 2}")
print(f"{price} is {type(price)} → rounded: {round(price)}")
print(f"{text} is {type(text)} → uppercase: {text.upper()}")
\`\`\`

---

## 📺 Optional Video Resources

- Python data types: https://www.youtube.com/watch?v=ppsCxnNm-JI
- Type conversion guide: https://www.youtube.com/watch?v=Wu5AwJQ6mIc`,
          videoUrl: "https://placeholder-video.com/python-datatypes",
          duration: 22,
          order: 2,
          isPreview: false,
          resources: []
        }
      ]
    },

    // ==================== MODULE 3: ARITHMETIC OPERATIONS ====================
    {
      title: "Module 3: Arithmetic Operations",
      order: 3,
      lessons: [
        {
          title: "Basic Arithmetic Operators",
          description: `## 📘 Python as a Calculator

Python can perform all standard mathematical operations. These operators work on numbers (integers and floats) and follow standard mathematical rules.

**Basic operators:**
- **+** Addition
- **-** Subtraction
- ***** Multiplication
- **/** Division
- **//** Floor Division
- **%** Modulus (remainder)
- ****** Exponentiation (power)

---

## 💻 Syntax Card: Math Operations

\`\`\`python
# Basic arithmetic
print(10 + 5)   # 15 (addition)
print(10 - 5)   # 5 (subtraction)
print(10 * 5)   # 50 (multiplication)
print(10 / 5)   # 2.0 (division - always gives float)

# Special operators
print(10 // 3)  # 3 (floor division - removes decimal)
print(10 % 3)   # 1 (modulus - gives remainder)
print(2 ** 3)   # 8 (exponentiation - 2 to the power 3)

# Order of operations (PEMDAS)
result = 2 + 3 * 4
print(result)   # 14 (multiplication first)

result = (2 + 3) * 4
print(result)   # 20 (parentheses first)

# Combining variables
a = 10
b = 3
print(f"{a} + {b} = {a + b}")
print(f"{a} - {b} = {a - b}")
\`\`\`

---

## 🟢 Operator Shorthand

Python has convenient shortcuts for updating variables:

\`\`\`python
x = 10
x = x + 5  # Long way
x += 5     # Short way (same result)

# All shortcuts:
x += 5   # x = x + 5
x -= 3   # x = x - 3
x *= 2   # x = x * 2
x /= 4   # x = x / 4
x **= 2  # x = x ** 2
\`\`\`

---

## 📝 Interactive MCQ Quiz

**Question:** What will this code output?
\`\`\`python
x = 17 % 5
print(x)
\`\`\`

A) 3
B) 3.4
C) 2
D) 5

||ANSWER:C||
||EXPLANATION:The modulus operator (%) returns the remainder after division. 17 divided by 5 equals 3 with a remainder of 2. So 17 % 5 = 2.||

---

## 🧪 Coding Challenge: Calculate Compound Interest

**Task:** Write a program to calculate compound interest.

**Formula:** A = P(1 + r/n)^(nt)
- P = Principal amount (initial investment)
- r = Annual interest rate (as decimal)
- n = Times interest is compounded per year
- t = Number of years

**Example:**
\`\`\`python
P = 1000  # Initial investment
r = 0.05  # 5% annual rate
n = 12    # Compounded monthly
t = 10    # 10 years

# Calculate final amount
A = P * (1 + r/n) ** (n*t)
print("Final amount: $" + str(round(A, 2)))
\`\`\`

---

## 📺 Optional Video Resources

- Python operators: https://www.youtube.com/watch?v=v5MR5JnKcZI
- Math operations explained: https://www.youtube.com/watch?v=9W3yG_bbGMs`,
          videoUrl: "https://placeholder-video.com/python-arithmetic",
          duration: 20,
          order: 1,
          isPreview: false,
          resources: []
        }
      ]
    },

    // ==================== MODULE 4: STRING MANIPULATION ====================
    {
      title: "Module 4: String Manipulation",
      order: 4,
      lessons: [
        {
          title: "Working with Strings",
          description: `## 📘 Understanding Strings

Strings are sequences of characters used to represent text. In Python, strings are incredibly versatile and come with many built-in methods for manipulation.

**String basics:**
- Created with single or double quotes
- Can be concatenated (joined) with +
- Can be repeated with *
- Support indexing and slicing
- Immutable (cannot be changed in place)

---

## 💻 Syntax Card: String Operations

\`\`\`python
# Creating strings
name = "Alice"
message = 'Hello, World!'
long_text = """This is
a multi-line
string"""

# Concatenation
first = "Hello"
last = "World"
full = first + " " + last
print(full)  # Hello World

# Repetition
laugh = "ha" * 3
print(laugh)  # hahaha

# String methods
text = "  Python Programming  "
print(text.upper())      # "  PYTHON PROGRAMMING  "
print(text.lower())      # "  python programming  "
print(text.strip())      # "Python Programming" (removes spaces)
print(text.replace("Python", "Java"))  # "  Java Programming  "

# String indexing (starts at 0)
word = "Python"
print(word[0])    # "P" (first character)
print(word[-1])   # "n" (last character)
print(word[0:3])  # "Pyt" (slice from 0 to 3)
\`\`\`

---

## 🟢 Common String Methods

\`\`\`python
text = "hello world"

text.capitalize()  # "Hello world"
text.title()       # "Hello World"
text.split()       # ["hello", "world"]
text.startswith("he")  # True
text.endswith("ld")    # True
text.count("l")    # 3 (counts occurrences)
len(text)          # 11 (length of string)
\`\`\`

---

## 📝 Interactive MCQ Quiz

**Question:** What will this code output?
\`\`\`python
text = "Python"
print(text[1:4])
\`\`\`

A) Pyt
B) yth
C) ytho
D) tho

||ANSWER:B||
||EXPLANATION:String slicing [1:4] starts at index 1 (second character "y") and goes up to but NOT including index 4. So it includes indices 1, 2, 3 which are "y", "t", "h".||

---

## 🧪 Coding Challenge: Email Validator

**Task:** Create a program that checks if an email address is valid.

**Requirements:**
- Must contain exactly one "@" symbol
- Must contain at least one "." after the "@"
- Should not start or end with spaces

**Example:**
\`\`\`python
email = "user@example.com"

# Your validation code here
has_at = email.count("@") == 1
has_dot_after_at = "." in email.split("@")[1] if "@" in email else False
no_spaces = email == email.strip()

if has_at and has_dot_after_at and no_spaces:
    print("Valid email!")
else:
    print("Invalid email!")
\`\`\`

---

## 📺 Optional Video Resources

- Python strings tutorial: https://www.youtube.com/watch?v=k9TUPpGqYTo
- String methods guide: https://www.youtube.com/watch?v=9a3CzJhv5wQ`,
          videoUrl: "https://placeholder-video.com/python-strings",
          duration: 25,
          order: 1,
          isPreview: false,
          resources: []
        }
      ]
    },

    // ==================== MODULE 5: USER INPUTS ====================
    {
      title: "Module 5: User Inputs",
      order: 5,
      lessons: [
        {
          title: "Getting User Input",
          description: `## 📘 Interactive Programs with input()

The \`input()\` function allows your programs to interact with users by accepting data from the keyboard. This makes your programs dynamic and responsive!

**Key points:**
- \`input()\` always returns a string
- Use a prompt message to guide users
- Convert to other types as needed
- Validate user input when necessary

---

## 💻 Syntax Card: Using input()

\`\`\`python
# Basic input
name = input("Enter your name: ")
print(f"Hello, {name}!")

# Input always returns string
age = input("Enter your age: ")
print(type(age))  # <class 'str'>

# Convert to number
age = int(input("Enter your age: "))
print(f"Next year you'll be {age + 1}")

# Multiple inputs
city = input("Enter your city: ")
country = input("Enter your country: ")
print(f"You live in {city}, {country}")

# Input with calculation
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
result = num1 + num2
print(f"Sum: {result}")
\`\`\`

---

## 🟢 Input Best Practices

**Always validate user input:**
\`\`\`python
# Safe input conversion
try:
    age = int(input("Enter your age: "))
    print(f"You are {age} years old")
except ValueError:
    print("Please enter a valid number!")

# Check for empty input
name = input("Enter your name: ").strip()
if name:
    print(f"Hello, {name}!")
else:
    print("Name cannot be empty!")
\`\`\`

---

## 📝 Interactive MCQ Quiz

**Question:** What happens if the user enters "25" (text) for this code?
\`\`\`python
age = int(input("Enter age: "))
print(age + 5)
\`\`\`

A) Error
B) 255
C) 30
D) "25"

||ANSWER:C||
||EXPLANATION:Even though input() returns a string, int() successfully converts "25" to the integer 25. Then 25 + 5 = 30. The code works fine because "25" is a valid number string.||

---

## 🧪 Coding Challenge: Temperature Converter

**Task:** Build a program that converts temperature between Celsius and Fahrenheit.

**Requirements:**
- Ask user for temperature value
- Ask for current unit (C or F)
- Convert to the other unit
- Display the result

**Formulas:**
- Celsius to Fahrenheit: (C × 9/5) + 32
- Fahrenheit to Celsius: (F - 32) × 5/9

**Starter Code:**
\`\`\`python
temp = float(input("Enter temperature: "))
unit = input("Is this in (C)elsius or (F)ahrenheit? ").upper()

if unit == "C":
    result = (temp * 9/5) + 32
    print(f"{temp}°C = {result}°F")
elif unit == "F":
    result = (temp - 32) * 5/9
    print(f"{temp}°F = {result}°C")
else:
    print("Invalid unit!")
\`\`\`

---

## 📺 Optional Video Resources

- Python input() tutorial: https://www.youtube.com/watch?v=rz5Ao4QTYzs
- User input best practices: https://www.youtube.com/watch?v=9M4xFEBPRdA`,
          videoUrl: "https://placeholder-video.com/python-input",
          duration: 18,
          order: 1,
          isPreview: false,
          resources: []
        }
      ]
    },

    // ==================== MODULE 6: CONDITIONALS ====================
    {
      title: "Module 6: Conditionals (if/elif/else)",
      order: 6,
      lessons: [
        {
          title: "Making Decisions with if/else",
          description: `## 📘 Conditional Statements

Conditionals allow your program to make decisions and execute different code based on conditions. This is fundamental to creating intelligent, responsive programs!

**Conditional structure:**
- **if** - Execute code if condition is True
- **elif** - Check another condition if previous was False
- **else** - Execute code if all conditions are False

---

## 💻 Syntax Card: Conditionals

\`\`\`python
# Basic if statement
age = 18
if age >= 18:
    print("You are an adult")

# if-else
temperature = 30
if temperature > 25:
    print("It's hot!")
else:
    print("It's cool!")

# if-elif-else
score = 85
if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")

# Multiple conditions
age = 25
has_license = True
if age >= 18 and has_license:
    print("You can drive!")

# Nested conditionals
if age >= 18:
    if has_license:
        print("Can drive")
    else:
        print("Need license")
else:
    print("Too young")
\`\`\`

---

## 🟢 Comparison Operators

\`\`\`python
# Comparison operators
==  # Equal to
!=  # Not equal to
>   # Greater than
<   # Less than
>=  # Greater than or equal to
<=  # Less than or equal to

# Logical operators
and  # Both conditions must be True
or   # At least one condition must be True
not  # Inverts the condition

# Examples
x = 10
x > 5 and x < 15  # True (both are True)
x < 5 or x > 8    # True (second is True)
not (x == 5)      # True (x is not 5)
\`\`\`

---

## 📝 Interactive MCQ Quiz

**Question:** What will this code print?
\`\`\`python
x = 15
if x > 20:
    print("A")
elif x > 10:
    print("B")
elif x > 5:
    print("C")
else:
    print("D")
\`\`\`

A) A
B) B
C) C
D) D

||ANSWER:B||
||EXPLANATION:The code checks conditions in order. x > 20 is False (15 > 20). Then x > 10 is True (15 > 10), so it prints "B" and stops. It doesn't check the remaining conditions.||

---

## 🧪 Coding Challenge: Password Validator

**Task:** Create a strong password validator that checks:
- Minimum 8 characters
- Contains at least one uppercase letter
- Contains at least one number
- Contains at least one special character (@, #, $, etc.)

**Example:**
\`\`\`python
password = input("Enter password: ")

# Check conditions
length_ok = len(password) >= 8
has_upper = any(c.isupper() for c in password)
has_digit = any(c.isdigit() for c in password)
has_special = any(c in "@#$%^&*" for c in password)

# Validate
if length_ok and has_upper and has_digit and has_special:
    print("✅ Strong password!")
else:
    print("❌ Weak password. Requirements:")
    if not length_ok: print("  - At least 8 characters")
    if not has_upper: print("  - At least one uppercase letter")
    if not has_digit: print("  - At least one number")
    if not has_special: print("  - At least one special character")
\`\`\`

---

## 📺 Optional Video Resources

- Python conditionals: https://www.youtube.com/watch?v=DZwmZ8Usvnk
- If/elif/else explained: https://www.youtube.com/watch?v=AWek49wXGzI`,
          videoUrl: "https://placeholder-video.com/python-conditionals",
          duration: 22,
          order: 1,
          isPreview: false,
          resources: []
        }
      ]
    },

    // ==================== MODULE 7: LOOPS ====================
    {
      title: "Module 7: Loops (for & while)",
      order: 7,
      lessons: [
        {
          title: "Repeating with for Loops",
          description: `## 📘 Understanding for Loops

Loops allow you to repeat code multiple times without writing it over and over. The \`for\` loop is perfect when you know how many times you want to repeat or when iterating over a collection.

**When to use for loops:**
- Iterate over a range of numbers
- Process each item in a list
- Repeat an action a specific number of times
- Work with strings character by character

---

## 💻 Syntax Card: for Loops

\`\`\`python
# Basic for loop with range
for i in range(5):
    print(i)
# Output: 0, 1, 2, 3, 4

# Range with start and end
for i in range(1, 6):
    print(i)
# Output: 1, 2, 3, 4, 5

# Range with step
for i in range(0, 10, 2):
    print(i)
# Output: 0, 2, 4, 6, 8

# Loop through a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Loop through a string
for char in "Python":
    print(char)

# Loop with enumerate (index + value)
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")
\`\`\`

---

## 🟢 Loop Control Statements

\`\`\`python
# break - exit the loop early
for i in range(10):
    if i == 5:
        break
    print(i)
# Prints: 0, 1, 2, 3, 4

# continue - skip to next iteration
for i in range(5):
    if i == 2:
        continue
    print(i)
# Prints: 0, 1, 3, 4

# else with for - runs if loop completes normally
for i in range(3):
    print(i)
else:
    print("Loop completed!")
\`\`\`

---

## 📝 Interactive MCQ Quiz

**Question:** How many times will "Hello" be printed?
\`\`\`python
for i in range(2, 8, 2):
    print("Hello")
\`\`\`

A) 2
B) 3
C) 4
D) 6

||ANSWER:B||
||EXPLANATION:range(2, 8, 2) generates: 2, 4, 6 (starts at 2, goes up to but not including 8, with step of 2). That's 3 numbers, so "Hello" prints 3 times.||

---

## 🧪 Coding Challenge: Pattern Printer

**Task:** Create a program that prints a triangle pattern using loops.

**Example Output:**
\`\`\`
*
**
***
****
*****
\`\`\`

**Requirements:**
- Ask user for number of rows
- Use nested loops (loop inside a loop)
- Print stars in increasing pattern

**Starter Code:**
\`\`\`python
rows = int(input("Enter number of rows: "))

for i in range(1, rows + 1):
    for j in range(i):
        print("*", end="")
    print()  # New line after each row
\`\`\`

---

## 📺 Optional Video Resources

- Python for loops: https://www.youtube.com/watch?v=94UHCEmprCY
- Range function explained: https://www.youtube.com/watch?v=9LgyKiq_hU0`,
          videoUrl: "https://placeholder-video.com/python-for-loops",
          duration: 20,
          order: 1,
          isPreview: false,
          resources: []
        },
        {
          title: "Repeating with while Loops",
          description: `## 📘 Understanding while Loops

The \`while\` loop repeats code as long as a condition is True. Unlike \`for\` loops which repeat a specific number of times, \`while\` loops continue until the condition becomes False.

**When to use while loops:**
- Repeat until a condition changes
- Don't know how many iterations needed
- Wait for user input
- Keep a program running

---

## 💻 Syntax Card: while Loops

\`\`\`python
# Basic while loop
count = 0
while count < 5:
    print(count)
    count += 1
# Output: 0, 1, 2, 3, 4

# User input loop
password = ""
while password != "secret":
    password = input("Enter password: ")
print("Access granted!")

# Infinite loop with break
while True:
    user_input = input("Enter 'quit' to exit: ")
    if user_input == "quit":
        break
    print(f"You entered: {user_input}")

# Loop with multiple conditions
balance = 100
attempts = 0
while balance > 0 and attempts < 3:
    print("Balance: $" + str(balance))
    balance -= 20
    attempts += 1
\`\`\`

---

## 🟢 Avoiding Infinite Loops

**⚠️ Common mistake - infinite loop:**
\`\`\`python
# WRONG - Never ends!
count = 0
while count < 5:
    print(count)
    # Forgot to increment count!

# RIGHT - Condition eventually becomes False
count = 0
while count < 5:
    print(count)
    count += 1  # Updates the condition variable
\`\`\`

---

## 📝 Interactive MCQ Quiz

**Question:** What's the output of this code?
\`\`\`python
x = 10
while x > 5:
    print(x)
    x -= 2
\`\`\`

A) 10, 8, 6
B) 10, 8, 6, 4
C) 8, 6, 4
D) Infinite loop

||ANSWER:A||
||EXPLANATION:Loop starts with x=10. Prints 10, then x becomes 8. Prints 8, then x becomes 6. Prints 6, then x becomes 4. Now x=4 is not > 5, so loop stops. Output: 10, 8, 6.||

---

## 🧪 Coding Challenge: Number Guessing Game

**Task:** Create a number guessing game using a while loop.

**Requirements:**
- Program picks a random number between 1 and 100
- User has unlimited guesses
- Give hints: "Too high" or "Too low"
- Congratulate when correct
- Track number of attempts

**Starter Code:**
\`\`\`python
import random

secret_number = random.randint(1, 100)
attempts = 0
guessed = False

print("I'm thinking of a number between 1 and 100!")

while not guessed:
    guess = int(input("Your guess: "))
    attempts += 1
    
    if guess < secret_number:
        print("Too low!")
    elif guess > secret_number:
        print("Too high!")
    else:
        guessed = True
        print(f"Correct! You got it in {attempts} attempts!")
\`\`\`

---

## 📺 Optional Video Resources

- Python while loops: https://www.youtube.com/watch?v=6TEGxJaOBKM
- For vs While loops: https://www.youtube.com/watch?v=JkQ0Xeg8LRI`,
          videoUrl: "https://placeholder-video.com/python-while-loops",
          duration: 22,
          order: 2,
          isPreview: false,
          resources: []
        }
      ]
    },

    // ==================== MODULE 8: FUNCTIONS ====================
    {
      title: "Module 8: Functions",
      order: 8,
      lessons: [
        {
          title: "Creating and Using Functions",
          description: `## 📘 Understanding Functions

Functions are reusable blocks of code that perform specific tasks. They help organize code, avoid repetition, and make programs easier to understand and maintain.

**Why use functions?**
- Reuse code without copying
- Break complex problems into smaller pieces
- Make code easier to test and debug
- Improve code readability

---

## 💻 Syntax Card: Function Basics

\`\`\`python
# Basic function definition
def greet():
    print("Hello, World!")

# Call the function
greet()  # Output: Hello, World!

# Function with parameters
def greet_person(name):
    print(f"Hello, {name}!")

greet_person("Alice")  # Output: Hello, Alice!

# Function with return value
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # Output: 8

# Function with default parameters
def greet_with_title(name, title="Mr."):
    print(f"Hello, {title} {name}!")

greet_with_title("Smith")  # Output: Hello, Mr. Smith!
greet_with_title("Smith", "Dr.")  # Output: Hello, Dr. Smith!

# Multiple return values
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

minimum, maximum, total = get_stats([1, 2, 3, 4, 5])
print(f"Min: {minimum}, Max: {maximum}, Sum: {total}")
\`\`\`

---

## 🟢 Function Best Practices

\`\`\`python
# Good: Descriptive name, clear purpose
def calculate_circle_area(radius):
    return 3.14159 * radius ** 2

# Bad: Unclear name
def calc(r):
    return 3.14159 * r ** 2

# Use docstrings to document functions
def factorial(n):
    """
    Calculate the factorial of a number.
    
    Args:
        n (int): A positive integer
        
    Returns:
        int: The factorial of n
    """
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# Access docstring
print(factorial.__doc__)
\`\`\`

---

## 📝 Interactive MCQ Quiz

**Question:** What will this code output?
\`\`\`python
def multiply(x, y=2):
    return x * y

print(multiply(5))
\`\`\`

A) Error
B) 5
C) 10
D) 7

||ANSWER:C||
||EXPLANATION:The function has a default parameter y=2. When calling multiply(5), only x is provided (5), so y uses its default value of 2. Result: 5 * 2 = 10.||

---

## 🧪 Coding Challenge: Temperature Converter Functions

**Task:** Create a temperature converter with multiple functions.

**Requirements:**
- Function to convert Celsius to Fahrenheit
- Function to convert Fahrenheit to Celsius
- Function to convert Celsius to Kelvin
- Main function that uses all converters

**Starter Code:**
\`\`\`python
def celsius_to_fahrenheit(celsius):
    """Convert Celsius to Fahrenheit"""
    return (celsius * 9/5) + 32

def fahrenheit_to_celsius(fahrenheit):
    """Convert Fahrenheit to Celsius"""
    return (fahrenheit - 32) * 5/9

def celsius_to_kelvin(celsius):
    """Convert Celsius to Kelvin"""
    return celsius + 273.15

def convert_temperature():
    """Main converter function"""
    temp = float(input("Enter temperature: "))
    unit = input("Unit (C/F): ").upper()
    
    if unit == "C":
        print(f"{temp}°C = {celsius_to_fahrenheit(temp):.2f}°F")
        print(f"{temp}°C = {celsius_to_kelvin(temp):.2f}K")
    elif unit == "F":
        celsius = fahrenheit_to_celsius(temp)
        print(f"{temp}°F = {celsius:.2f}°C")
        print(f"{temp}°F = {celsius_to_kelvin(celsius):.2f}K")

# Run the converter
convert_temperature()
\`\`\`

---

## 📺 Optional Video Resources

- Python functions tutorial: https://www.youtube.com/watch?v=9Os0o3wzS_I
- Return values explained: https://www.youtube.com/watch?v=AZT9x_X_lzw`,
          videoUrl: "https://placeholder-video.com/python-functions",
          duration: 25,
          order: 1,
          isPreview: false,
          resources: []
        },
        {
          title: "Advanced Function Concepts",
          description: `## 📘 Advanced Function Features

Python functions have powerful features like variable-length arguments, lambda functions, and scope rules that make them even more flexible.

**Advanced concepts:**
- *args and **kwargs for flexible parameters
- Lambda functions for quick one-liners
- Variable scope (local vs global)
- Recursion (functions calling themselves)

---

## 💻 Syntax Card: Advanced Functions

\`\`\`python
# *args - variable number of positional arguments
def sum_all(*args):
    return sum(args)

print(sum_all(1, 2, 3))        # 6
print(sum_all(1, 2, 3, 4, 5))  # 15

# **kwargs - variable number of keyword arguments
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, city="NYC")

# Lambda functions (anonymous functions)
square = lambda x: x ** 2
print(square(5))  # 25

# Lambda with map
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

# Lambda with filter
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4]

# Recursion example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(6))  # 8 (0,1,1,2,3,5,8)
\`\`\`

---

## 🟢 Understanding Scope

\`\`\`python
# Global variable
x = 10

def example():
    # Local variable
    y = 5
    print(x)  # Can access global
    print(y)  # Can access local

example()
# print(y)  # Error! y is local to function

# Modifying global variable
def modify_global():
    global x
    x = 20

modify_global()
print(x)  # 20

# Nested functions and closures
def outer(x):
    def inner(y):
        return x + y
    return inner

add_5 = outer(5)
print(add_5(3))  # 8
\`\`\`

---

## 📝 Interactive MCQ Quiz

**Question:** What will this code output?
\`\`\`python
def func(*args):
    return len(args)

print(func(1, 2, 3, 4))
\`\`\`

A) 1
B) 4
C) 10
D) Error

||ANSWER:B||
||EXPLANATION:*args collects all positional arguments into a tuple. When calling func(1, 2, 3, 4), args becomes (1, 2, 3, 4). The len() function returns 4, the number of arguments.||

---

## 🧪 Coding Challenge: Flexible Calculator

**Task:** Create a calculator that accepts any number of numbers and an operation.

**Requirements:**
- Use *args for variable number of inputs
- Support operations: add, multiply, max, min
- Use lambda functions where appropriate
- Return the result

**Starter Code:**
\`\`\`python
def calculate(operation, *numbers):
    """
    Flexible calculator for multiple numbers
    
    Args:
        operation (str): 'add', 'multiply', 'max', or 'min'
        *numbers: Variable number of numbers
        
    Returns:
        Result of the operation
    """
    operations = {
        'add': lambda nums: sum(nums),
        'multiply': lambda nums: eval('*'.join(map(str, nums))),
        'max': lambda nums: max(nums),
        'min': lambda nums: min(nums)
    }
    
    if operation in operations:
        return operations[operation](numbers)
    else:
        return "Invalid operation"

# Test the calculator
print(calculate('add', 1, 2, 3, 4, 5))      # 15
print(calculate('multiply', 2, 3, 4))       # 24
print(calculate('max', 10, 5, 20, 15))      # 20
print(calculate('min', 10, 5, 20, 15))      # 5
\`\`\`

---

## 📺 Optional Video Resources

- Lambda functions: https://www.youtube.com/watch?v=Ob9rY6PQMfI
- *args and **kwargs: https://www.youtube.com/watch?v=kB829ciAXo4`,
          videoUrl: "https://placeholder-video.com/python-advanced-functions",
          duration: 28,
          order: 2,
          isPreview: false,
          resources: []
        }
      ]
    }
  ]
};

// Main seeding function
async function seedPythonCourseV2() {
  try {
    console.log('🚀 Starting Python Course update to CodeChef Style...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if course exists
    const existingCourse = await Course.findOne({ slug: codeChefStyleCourse.slug });
    
    if (existingCourse) {
      console.log('📝 Course found, updating to CodeChef style...');
      await Course.findOneAndUpdate(
        { slug: codeChefStyleCourse.slug },
        codeChefStyleCourse,
        { new: true }
      );
      console.log('✅ Course updated successfully!');
    } else {
      console.log('📝 Creating new CodeChef-style course...');
      await Course.create(codeChefStyleCourse);
      console.log('✅ Course created successfully!');
    }

    // Display course info
    const course = await Course.findOne({ slug: codeChefStyleCourse.slug });
    const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
    
    console.log('\n📊 Course Statistics:');
    console.log(`Title: ${course.title}`);
    console.log(`Slug: ${course.slug}`);
    console.log(`Modules: ${course.sections.length}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Price: ${course.price === 0 ? 'FREE' : `$${course.price}`}`);
    console.log(`Published: ${course.isPublished ? 'Yes' : 'No'}`);
    console.log(`Featured: ${course.isFeatured ? 'Yes' : 'No'}`);
    
    console.log('\n📚 Modules:');
    course.sections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title} (${section.lessons.length} lessons)`);
    });

    console.log('\n✨ Python Course updated to CodeChef Interactive Style!');
    console.log('🎯 Features:');
    console.log('   ✅ Clean section headings with emojis');
    console.log('   ✅ Syntax cards with code examples');
    console.log('   ✅ Real-world analogies (🟣)');
    console.log('   ✅ Interactive MCQ quizzes with hidden answers');
    console.log('   ✅ Hands-on coding challenges (🧪)');
    console.log('   ✅ Quick tips (🟢)');
    console.log('   ✅ Optional video links (not embedded)');
    console.log('   ✅ Professional formatting with markdown');
    
  } catch (error) {
    console.error('❌ Error updating course:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the seeding function
seedPythonCourseV2();
