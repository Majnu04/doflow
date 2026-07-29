// Script to update Python course to EXACT CodeChef Learn Platform Style
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
  console.error('MONGODB_URI not found in .env file');
  process.exit(1);
}

const codeChefCleanCourse = {
  title: "Zero to Hero Python Course - Complete Edition",
  slug: "zero-to-hero-python-course-complete-edition",
  description: `Master Python programming from absolute scratch with clean, focused learning inspired by CodeChef Learn platform.

This course features:
- Clear explanations without distractions
- Real-world analogies for better understanding
- Interactive MCQ checkpoints
- Hands-on coding challenges
- Clean, minimal design for focused learning

Perfect for absolute beginners with zero coding experience.`,
  
  shortDescription: "Master Python from scratch with CodeChef-style clean lessons, MCQs, and coding challenges.",
  category: "Programming",
  level: "Beginner",
  price: 0,
  discountPrice: 0,
  thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60",
  language: "English",
  requirements: [
    "No prior programming experience needed",
    "A computer with internet access",
    "Python 3.x installed",
    "Willingness to learn"
  ],
  whatYouWillLearn: [
    "Write and run Python programs",
    "Understand variables and data types",
    "Work with strings and numbers",
    "Take user inputs",
    "Use conditionals for decision making",
    "Automate tasks with loops",
    "Create reusable functions",
    "Solve coding challenges"
  ],
  tags: ["Python", "Programming", "Beginner", "CodeChef", "Coding"],
  isPublished: true,
  isFeatured: true,
  sections: [
    // ==================== MODULE 1: OUTPUT & PRINTING ====================
    {
      title: "Module 1: Output & Printing",
      order: 1,
      lessons: [
        {
          title: "Introduction to Output and Printing",
          description: `## Understanding Output in Python

The print() function is Python's way of displaying information on the screen. It is the most fundamental tool in programming - every program needs to communicate its results to the user.

When you run a Python program, the print() function shows text, numbers, or any data you want to display. Think of it as Python's voice - whatever you put inside print(), Python says it out loud on your screen.

### Real-World Analogy

Imagine a train station announcement system. The announcer has a microphone (the print function) that broadcasts messages to all passengers. Whatever message is given to the announcer gets displayed on screens and played through speakers. Similarly, print() takes your message and displays it on the computer screen for everyone to see.

---

## Syntax

\`\`\`python
# Print text (must use quotes)
print("Hello, World!")

# Print numbers (no quotes needed)
print(42)
print(3.14)

# Print multiple items (separated by commas)
print("The answer is", 42)

# Print calculations
print(10 + 5)
\`\`\`

---

## Key Notes

- Text must be inside quotes (either "text" or 'text')
- Numbers do not need quotes
- Multiple items can be printed together using commas
- Python automatically adds a space between items
- Each print() starts on a new line by default

---

## MCQ Checkpoint

Q1. What will be the output of print(5 + 3)?

A. 5 + 3
B. 8
C. "8"
D. Error

<details><summary>Correct Answer</summary>B. Python evaluates the expression 5 + 3 first, which equals 8, and then prints the result.</details>

---

Q2. Which of these will cause an error?

A. print("Hello")
B. print(100)
C. print(Hello)
D. print("100")

<details><summary>Correct Answer</summary>C. Text without quotes causes an error. Python thinks Hello is a variable name, not text to display.</details>

---

## Coding Task

Write a program that prints three things:
1. Your name
2. Your age (as a number)
3. A sentence combining both

Input Format:
No input required.

Output Format:
\`\`\`
Alice
25
My name is Alice and I am 25 years old.
\`\`\`

Sample Solution:
\`\`\`python
print("Alice")
print(25)
print("My name is Alice and I am 25 years old.")
\`\`\``,
          videoUrl: "https://placeholder-video.com/python-output",
          duration: 15,
          order: 1,
          isPreview: true,
          resources: []
        },
        {
          title: "Advanced Print Formatting",
          description: `## Formatting Output in Python

Python's print() function has several options to format output professionally. You can control how items are separated, how lines end, and use f-strings for easy variable insertion.

The sep parameter changes the separator between items. The end parameter changes what appears at the end of a print statement. F-strings allow you to insert variables directly into text using curly braces.

### Real-World Analogy

Think of formatting like organizing items on a shelf. Without organization, items are randomly placed. With formatting, you decide exactly how items should be arranged - with specific spacing, labels, and organization that makes everything easy to read and understand.

---

## Syntax

\`\`\`python
# Custom separator
print("apple", "banana", "cherry", sep=", ")
# Output: apple, banana, cherry

# Custom ending
print("Loading", end="...")
print("Done")
# Output: Loading...Done

# F-strings for variables
name = "Alice"
age = 25
print(f"Hello, I am {name} and I am {age} years old")
# Output: Hello, I am Alice and I am 25 years old

# Multi-line strings
print("""Line 1
Line 2
Line 3""")
\`\`\`

---

## Key Notes

- sep parameter controls separator between items (default is space)
- end parameter controls line ending (default is newline)
- F-strings use f before the quote and curly braces for variables
- Triple quotes allow multi-line text
- F-strings automatically convert data types

---

## MCQ Checkpoint

Q1. What will print("A", "B", "C", sep="-") output?

A. A B C
B. A-B-C
C. ABC
D. A - B - C

<details><summary>Correct Answer</summary>B. The sep parameter replaces the default space separator with a hyphen, resulting in A-B-C.</details>

---

Q2. What is the advantage of f-strings over string concatenation?

A. They are faster to type
B. They automatically handle type conversion
C. They use less memory
D. They work with older Python versions

<details><summary>Correct Answer</summary>B. F-strings automatically convert variables to strings, eliminating the need for manual str() conversion.</details>

---

## Coding Task

Create a receipt printer that displays:
- Store name (centered with dashes)
- Three items with prices
- Total amount
- Thank you message

Input Format:
No input required.

Output Format:
\`\`\`
-------- STORE NAME --------
Item 1: 10.99
Item 2: 5.50
Item 3: 3.25
Total: 19.74
Thank you for shopping!
\`\`\`

Sample Solution:
\`\`\`python
print("-------- STORE NAME --------")
price1 = 10.99
price2 = 5.50
price3 = 3.25
print(f"Item 1: {price1}")
print(f"Item 2: {price2}")
print(f"Item 3: {price3}")
total = price1 + price2 + price3
print(f"Total: {total}")
print("Thank you for shopping!")
\`\`\``,
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
      title: "Module 2: Variables and Data Types",
      order: 2,
      lessons: [
        {
          title: "Understanding Variables",
          description: `## What Are Variables?

Variables are named containers that store data in your program. You can think of them as labeled boxes where you keep information that you want to use later. Variables make programs dynamic and flexible because you can change their values without rewriting code.

In Python, creating a variable is simple - you just write a name, an equals sign, and the value you want to store. Python automatically figures out what type of data it is.

### Real-World Analogy

Think of variables like labeled containers in a kitchen pantry. You have one jar labeled "Sugar" that contains sugar, another labeled "Coffee" that contains coffee. When you need sugar for a recipe, you don't grab a random jar - you look for the one labeled "Sugar". Similarly, when your program needs data, it looks for the variable with that name.

---

## Syntax

\`\`\`python
# Creating variables
name = "Alice"
age = 25
height = 5.8
is_student = True

# Using variables
print(name)
print(f"{name} is {age} years old")

# Updating variables
age = 26
score = 0
score = score + 10

# Multiple assignment
x, y, z = 1, 2, 3
a = b = c = 0
\`\`\`

---

## Key Notes

- Variable names should be descriptive
- Use lowercase with underscores (snake_case)
- Cannot start with a number
- Cannot use Python keywords (like print, if, for)
- Case sensitive (Name and name are different)
- No spaces allowed in names

---

## MCQ Checkpoint

Q1. Which variable name is INVALID in Python?

A. student_name
B. 2nd_place
C. _private
D. myAge

<details><summary>Correct Answer</summary>B. Variable names cannot start with a number. "2nd_place" starts with "2" which makes it invalid.</details>

---

Q2. What happens when you assign a new value to an existing variable?

A. Error occurs
B. Creates a new variable
C. Old value is replaced with new value
D. Both values are stored

<details><summary>Correct Answer</summary>C. Assignment replaces the old value with the new one. Variables can only hold one value at a time.</details>

---

## Coding Task

Write a program that swaps the values of two variables.

Input Format:
No input required.

Output Format:
\`\`\`
Before swap: a = 10, b = 20
After swap: a = 20, b = 10
\`\`\`

Sample Solution:
\`\`\`python
a = 10
b = 20
print(f"Before swap: a = {a}, b = {b}")

# Swap using Python's tuple unpacking
a, b = b, a

print(f"After swap: a = {a}, b = {b}")
\`\`\``,
          videoUrl: "https://placeholder-video.com/python-variables",
          duration: 18,
          order: 1,
          isPreview: false,
          resources: []
        },
        {
          title: "Data Types in Python",
          description: `## Understanding Data Types

Python has several built-in data types to represent different kinds of information. Each type has specific properties and operations you can perform. The main types are integers (whole numbers), floats (decimals), strings (text), and booleans (True/False).

Python automatically determines the data type based on the value you assign. You can check a variable's type using the type() function and convert between types using functions like int(), float(), and str().

### Real-World Analogy

Data types are like different containers for different items. You store liquids in bottles, solids in boxes, and documents in folders. Similarly, numbers go in int or float types, text goes in string type, and true/false values go in boolean type. Using the right container makes everything work smoothly.

---

## Syntax

\`\`\`python
# Integer (whole numbers)
age = 25
print(type(age))  # <class 'int'>

# Float (decimal numbers)
price = 19.99
print(type(price))  # <class 'float'>

# String (text)
name = "Alice"
print(type(name))  # <class 'str'>

# Boolean (True/False)
is_active = True
print(type(is_active))  # <class 'bool'>

# Type conversion
x = "123"
y = int(x)  # Convert string to integer
print(y + 10)  # Output: 133

z = 10 / 3
print(type(z))  # <class 'float'> - division always gives float
\`\`\`

---

## Key Notes

- int stores whole numbers (positive or negative)
- float stores decimal numbers
- str stores text (must be in quotes)
- bool stores True or False
- type() function returns the data type
- Division always returns float, even if result is whole number
- Use int(), float(), str() to convert between types

---

## MCQ Checkpoint

Q1. What will print(type(10 / 2)) output?

A. <class 'int'>
B. <class 'float'>
C. <class 'number'>
D. 5

<details><summary>Correct Answer</summary>B. Division always returns a float in Python, even when dividing evenly. 10 / 2 = 5.0 (float).</details>

---

Q2. What happens with int("3.14")?

A. Returns 3
B. Returns 3.14
C. Returns 314
D. Causes an error

<details><summary>Correct Answer</summary>D. int() cannot directly convert a string with a decimal point. You must first convert to float, then to int.</details>

---

## Coding Task

Create a program that demonstrates type conversion.

Input Format:
No input required.

Output Format:
\`\`\`
Original: 42 (int)
As float: 42.0
As string: 42
String number: 100
As integer: 100
Sum: 142
\`\`\`

Sample Solution:
\`\`\`python
# Integer
num = 42
print(f"Original: {num} (int)")

# Convert to float
num_float = float(num)
print(f"As float: {num_float}")

# Convert to string
num_str = str(num)
print(f"As string: {num_str}")

# String to integer
text = "100"
print(f"String number: {text}")
text_int = int(text)
print(f"As integer: {text_int}")

# Use converted value
total = num + text_int
print(f"Sum: {total}")
\`\`\``,
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
          description: `## Python as a Calculator

Python can perform all standard mathematical operations. The basic operators are addition, subtraction, multiplication, division, floor division, modulus, and exponentiation. These operators follow standard mathematical rules including order of operations (PEMDAS).

Python also provides shorthand operators for updating variables. Instead of writing x = x + 5, you can write x += 5. This makes code cleaner and easier to read.

### Real-World Analogy

Think of Python as a powerful calculator that you carry everywhere. Just like a calculator has buttons for addition, subtraction, and multiplication, Python has operators. But Python is smarter - it can store results in variables and use them in complex calculations, like a calculator with memory functions.

---

## Syntax

\`\`\`python
# Basic operators
print(10 + 5)   # 15 (addition)
print(10 - 5)   # 5 (subtraction)
print(10 * 5)   # 50 (multiplication)
print(10 / 5)   # 2.0 (division - always returns float)

# Special operators
print(10 // 3)  # 3 (floor division - removes decimal)
print(10 % 3)   # 1 (modulus - gives remainder)
print(2 ** 3)   # 8 (exponentiation - 2 to power 3)

# Order of operations
result = 2 + 3 * 4
print(result)   # 14 (multiplication first)

result = (2 + 3) * 4
print(result)   # 20 (parentheses first)

# Shorthand operators
x = 10
x += 5   # Same as x = x + 5
x -= 3   # Same as x = x - 3
x *= 2   # Same as x = x * 2
x /= 4   # Same as x = x / 4
\`\`\`

---

## Key Notes

- Division (/) always returns a float
- Floor division (//) removes the decimal part
- Modulus (%) gives the remainder after division
- Exponentiation uses double asterisk (**)
- Order of operations: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction
- Shorthand operators make code more concise

---

## MCQ Checkpoint

Q1. What is the result of 17 % 5?

A. 3
B. 3.4
C. 2
D. 5

<details><summary>Correct Answer</summary>C. The modulus operator returns the remainder. 17 divided by 5 is 3 with remainder 2.</details>

---

Q2. What will x be after this code: x = 10; x += 5; x *= 2?

A. 20
B. 25
C. 30
D. 15

<details><summary>Correct Answer</summary>C. Step 1: x = 10. Step 2: x += 5 makes x = 15. Step 3: x *= 2 makes x = 30.</details>

---

## Coding Task

Write a program to calculate simple interest.

Formula: Simple Interest = (Principal * Rate * Time) / 100

Input Format:
No input required.

Output Format:
\`\`\`
Principal: 1000
Rate: 5%
Time: 2 years
Simple Interest: 100.0
Total Amount: 1100.0
\`\`\`

Sample Solution:
\`\`\`python
principal = 1000
rate = 5
time = 2

simple_interest = (principal * rate * time) / 100
total_amount = principal + simple_interest

print(f"Principal: {principal}")
print(f"Rate: {rate}%")
print(f"Time: {time} years")
print(f"Simple Interest: {simple_interest}")
print(f"Total Amount: {total_amount}")
\`\`\``,
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
          description: `## Understanding Strings

Strings are sequences of characters used to represent text. In Python, you create strings using single or double quotes. Strings support many operations like concatenation (joining), repetition, indexing (accessing individual characters), and slicing (getting substrings).

Python provides numerous built-in methods for string manipulation. These methods allow you to change case, remove whitespace, split strings into lists, replace text, and check string properties.

### Real-World Analogy

Think of a string as a chain of beads where each bead is a character. You can examine individual beads (indexing), take a section of the chain (slicing), join two chains together (concatenation), or rearrange the beads (methods like upper, lower, replace). The chain itself never changes unless you create a new one.

---

## Syntax

\`\`\`python
# Creating strings
name = "Alice"
message = 'Hello'
multiline = """Line 1
Line 2"""

# Concatenation
greeting = "Hello" + " " + "World"
print(greeting)  # Hello World

# Repetition
laugh = "ha" * 3
print(laugh)  # hahaha

# String methods
text = "  Python Programming  "
print(text.upper())      # "  PYTHON PROGRAMMING  "
print(text.lower())      # "  python programming  "
print(text.strip())      # "Python Programming"
print(text.replace("Python", "Java"))  # "  Java Programming  "

# Indexing and slicing
word = "Python"
print(word[0])     # "P" (first character)
print(word[-1])    # "n" (last character)
print(word[0:3])   # "Pyt" (characters 0, 1, 2)
print(word[2:])    # "thon" (from index 2 to end)

# String properties
print(len(word))   # 6 (length)
print("Py" in word)  # True (substring check)
\`\`\`

---

## Key Notes

- Strings are immutable (cannot be changed after creation)
- Single and double quotes work the same way
- Indexing starts at 0
- Negative indices count from the end
- Slicing syntax is [start:end] (end not included)
- Methods return new strings (original unchanged)
- len() function returns string length

---

## MCQ Checkpoint

Q1. What does "Python"[1:4] return?

A. Pyt
B. yth
C. ytho
D. Pyth

<details><summary>Correct Answer</summary>B. Slicing [1:4] starts at index 1 and goes up to (but not including) index 4. Characters at indices 1, 2, 3 are y, t, h.</details>

---

Q2. What is the result of "Hi" * 3?

A. Hi3
B. HiHiHi
C. Hi Hi Hi
D. Error

<details><summary>Correct Answer</summary>B. The * operator repeats the string. "Hi" * 3 creates "HiHiHi" with no spaces.</details>

---

## Coding Task

Write a program to validate an email address format.

Check if the email:
- Contains exactly one @ symbol
- Has at least one dot after the @ symbol
- Does not have spaces

Input Format:
No input required (use test email in code).

Output Format:
\`\`\`
Email: user@example.com
Valid: True

Email: invalid.email
Valid: False
\`\`\`

Sample Solution:
\`\`\`python
def validate_email(email):
    # Check for exactly one @
    if email.count("@") != 1:
        return False
    
    # Check for dot after @
    at_position = email.index("@")
    after_at = email[at_position:]
    if "." not in after_at:
        return False
    
    # Check for spaces
    if " " in email:
        return False
    
    return True

# Test emails
email1 = "user@example.com"
email2 = "invalid.email"

print(f"Email: {email1}")
print(f"Valid: {validate_email(email1)}")
print()
print(f"Email: {email2}")
print(f"Valid: {validate_email(email2)}")
\`\`\``,
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
          description: `## Interactive Programs with input()

The input() function allows your programs to interact with users by accepting data from the keyboard. This makes programs dynamic and responsive. The function displays a prompt message and waits for the user to type something and press Enter.

An important point to remember: input() always returns a string, even if the user types numbers. To use the input as a number, you must convert it using int() or float().

### Real-World Analogy

Think of input() like a form you fill out at a doctor's office. The form has questions (prompts) and blank spaces where you write your answers. The receptionist (program) reads your answers and uses that information. Similarly, input() asks questions and your program uses the answers to perform tasks.

---

## Syntax

\`\`\`python
# Basic input
name = input("Enter your name: ")
print(f"Hello, {name}!")

# Input returns string
age_str = input("Enter your age: ")
print(type(age_str))  # <class 'str'>

# Convert to number
age = int(input("Enter your age: "))
next_year = age + 1
print(f"Next year you will be {next_year}")

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

## Key Notes

- input() always returns a string
- Use int() to convert string to integer
- Use float() to convert string to decimal number
- The prompt message is optional but recommended
- User must press Enter to submit input
- Invalid conversions cause errors (handle with care)

---

## MCQ Checkpoint

Q1. What type of data does input() return?

A. Integer
B. Float
C. String
D. Depends on what user enters

<details><summary>Correct Answer</summary>C. input() always returns a string, regardless of what the user types. You must convert it if you need a number.</details>

---

Q2. What happens with int(input("Enter: ")) if user types "hello"?

A. Returns 0
B. Returns "hello"
C. Causes an error
D. Returns None

<details><summary>Correct Answer</summary>C. int() cannot convert "hello" to a number, so it raises a ValueError.</details>

---

## Coding Task

Write a temperature converter program.

The program should:
- Ask user for temperature value
- Ask for current unit (C or F)
- Convert to the other unit
- Display the result

Formulas:
- Celsius to Fahrenheit: (C * 9/5) + 32
- Fahrenheit to Celsius: (F - 32) * 5/9

Input Format:
\`\`\`
Enter temperature: 100
Enter unit (C/F): F
\`\`\`

Output Format:
\`\`\`
100.0F = 37.78C
\`\`\`

Sample Solution:
\`\`\`python
temp = float(input("Enter temperature: "))
unit = input("Enter unit (C/F): ").upper()

if unit == "C":
    fahrenheit = (temp * 9/5) + 32
    print(f"{temp}C = {fahrenheit:.2f}F")
elif unit == "F":
    celsius = (temp - 32) * 5/9
    print(f"{temp}F = {celsius:.2f}C")
else:
    print("Invalid unit. Use C or F.")
\`\`\``,
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
      title: "Module 6: Conditionals",
      order: 6,
      lessons: [
        {
          title: "Making Decisions with if/elif/else",
          description: `## Conditional Statements

Conditionals allow your program to make decisions based on conditions. The if statement checks if a condition is True and executes code only when the condition is met. elif (else if) checks additional conditions, and else runs when all previous conditions are False.

Conditions use comparison operators (equal to, greater than, etc.) and logical operators (and, or, not) to evaluate expressions. Python evaluates conditions from top to bottom and stops at the first True condition.

### Real-World Analogy

Think of conditionals like a flowchart at a help desk. "If customer has technical issue, direct to IT department. Else if customer has billing question, direct to accounts. Else direct to general reception." The helper follows these rules in order and stops at the first matching condition.

---

## Syntax

\`\`\`python
# Basic if
age = 18
if age >= 18:
    print("You are an adult")

# if-else
temperature = 30
if temperature > 25:
    print("It's hot")
else:
    print("It's cool")

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

# Multiple conditions with and/or
age = 25
has_license = True
if age >= 18 and has_license:
    print("Can drive")

# Nested conditionals
if age >= 18:
    if has_license:
        print("Can drive")
    else:
        print("Need license")
\`\`\`

---

## Key Notes

- Conditions must evaluate to True or False
- Comparison operators: ==, !=, >, <, >=, <=
- Logical operators: and (both true), or (at least one true), not (reverse)
- Indentation is required for code blocks
- Only the first True condition executes
- else is optional and catches all other cases

---

## MCQ Checkpoint

Q1. What will this print if x = 15?

\`\`\`python
if x > 20:
    print("A")
elif x > 10:
    print("B")
elif x > 5:
    print("C")
\`\`\`

A. A
B. B
C. C
D. Nothing

<details><summary>Correct Answer</summary>B. Conditions are checked in order. x > 20 is False (15 > 20). x > 10 is True (15 > 10), so it prints "B" and stops.</details>

---

Q2. What does "and" operator require?

A. At least one condition is True
B. Both conditions are True
C. Both conditions are False
D. Exactly one condition is True

<details><summary>Correct Answer</summary>B. The and operator returns True only when both conditions are True. If either is False, the result is False.</details>

---

## Coding Task

Write a password strength checker.

Check if password is:
- At least 8 characters long
- Contains at least one digit
- Contains at least one uppercase letter

Classify as: Strong, Medium, or Weak

Input Format:
No input required (test with sample passwords).

Output Format:
\`\`\`
Password: Abc123xyz
Length: 9 characters
Has digit: True
Has uppercase: True
Strength: Strong
\`\`\`

Sample Solution:
\`\`\`python
def check_password(password):
    length_ok = len(password) >= 8
    has_digit = any(c.isdigit() for c in password)
    has_upper = any(c.isupper() for c in password)
    
    print(f"Password: {password}")
    print(f"Length: {len(password)} characters")
    print(f"Has digit: {has_digit}")
    print(f"Has uppercase: {has_upper}")
    
    if length_ok and has_digit and has_upper:
        print("Strength: Strong")
    elif length_ok and (has_digit or has_upper):
        print("Strength: Medium")
    else:
        print("Strength: Weak")

check_password("Abc123xyz")
\`\`\``,
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
      title: "Module 7: Loops",
      order: 7,
      lessons: [
        {
          title: "For Loops",
          description: `## Repeating Code with for Loops

For loops allow you to repeat code a specific number of times or iterate over a collection of items. The range() function is commonly used with for loops to generate a sequence of numbers. You can also loop through strings, lists, and other iterable objects.

For loops are perfect when you know exactly how many times you want to repeat something or when you need to process each item in a collection.

### Real-World Analogy

Think of a for loop like an assembly line worker who has to check 100 products. The worker knows there are exactly 100 items and will check each one in order. Similarly, a for loop processes a known number of items or repetitions, working through them one by one until complete.

---

## Syntax

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

# Loop with enumerate (index and value)
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

# Loop control: break and continue
for i in range(10):
    if i == 5:
        break  # Exit loop
    if i == 2:
        continue  # Skip to next iteration
    print(i)
\`\`\`

---

## Key Notes

- range(n) generates numbers from 0 to n-1
- range(start, end) generates from start to end-1
- range(start, end, step) allows custom increments
- break exits the loop immediately
- continue skips current iteration and moves to next
- Indentation defines the loop body

---

## MCQ Checkpoint

Q1. How many times does this loop run?

\`\`\`python
for i in range(2, 8, 2):
    print("Hello")
\`\`\`

A. 2
B. 3
C. 4
D. 6

<details><summary>Correct Answer</summary>B. range(2, 8, 2) generates 2, 4, 6. That is 3 numbers, so the loop runs 3 times.</details>

---

Q2. What does enumerate() do in a for loop?

A. Counts loop iterations
B. Provides both index and value
C. Speeds up the loop
D. Creates a range of numbers

<details><summary>Correct Answer</summary>B. enumerate() returns pairs of (index, value) for each item, allowing you to access both the position and the element.</details>

---

## Coding Task

Write a program that prints a multiplication table.

Ask user for a number and print its multiplication table from 1 to 10.

Input Format:
No input required (use number 5 as example).

Output Format:
\`\`\`
Multiplication Table of 5:
5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
...
5 x 10 = 50
\`\`\`

Sample Solution:
\`\`\`python
number = 5
print(f"Multiplication Table of {number}:")

for i in range(1, 11):
    result = number * i
    print(f"{number} x {i} = {result}")
\`\`\``,
          videoUrl: "https://placeholder-video.com/python-for-loops",
          duration: 20,
          order: 1,
          isPreview: false,
          resources: []
        },
        {
          title: "While Loops",
          description: `## Repeating with while Loops

While loops repeat code as long as a condition remains True. Unlike for loops that run a predetermined number of times, while loops continue until the condition becomes False. This makes them useful for situations where you don't know in advance how many iterations you need.

Be careful with while loops - if the condition never becomes False, you create an infinite loop that never stops. Always ensure your loop has a way to end.

### Real-World Analogy

Think of a while loop like a security guard checking for unauthorized access. The guard keeps monitoring "while" the system is on, not for a fixed number of checks. The monitoring continues as long as the condition (system on) is true. Once the condition changes (system off), the monitoring stops.

---

## Syntax

\`\`\`python
# Basic while loop
count = 0
while count < 5:
    print(count)
    count += 1
# Output: 0, 1, 2, 3, 4

# While loop with user input
password = ""
while password != "secret":
    password = input("Enter password: ")
print("Access granted")

# Infinite loop with break
while True:
    user_input = input("Enter 'quit' to exit: ")
    if user_input == "quit":
        break
    print(f"You entered: {user_input}")

# While loop with multiple conditions
balance = 100
attempts = 0
while balance > 0 and attempts < 3:
    print(f"Balance: {balance}")
    balance -= 20
    attempts += 1
\`\`\`

---

## Key Notes

- Condition is checked before each iteration
- Loop continues while condition is True
- Must update variables to eventually make condition False
- break exits the loop immediately
- continue skips to next iteration
- Infinite loops occur when condition never becomes False

---

## MCQ Checkpoint

Q1. What is the output of this code?

\`\`\`python
x = 10
while x > 5:
    print(x)
    x -= 2
\`\`\`

A. 10, 8, 6
B. 10, 8, 6, 4
C. 8, 6, 4
D. Infinite loop

<details><summary>Correct Answer</summary>A. Loop starts with x=10 (prints 10), then x=8 (prints 8), then x=6 (prints 6), then x=4 which is not > 5, so loop stops.</details>

---

Q2. What causes an infinite loop?

A. Forgetting to update the loop variable
B. Using break statement
C. Condition is initially False
D. Using continue statement

<details><summary>Correct Answer</summary>A. If the loop variable never changes, the condition remains True forever, creating an infinite loop.</details>

---

## Coding Task

Write a number guessing game.

Program picks a secret number between 1 and 100. User guesses until correct. Give hints (too high/too low).

Input Format:
User enters guesses (simulate with fixed guesses in code).

Output Format:
\`\`\`
Guess the number (1-100)
Your guess: 50
Too high!
Your guess: 25
Too low!
Your guess: 35
Correct! You got it in 3 attempts.
\`\`\`

Sample Solution:
\`\`\`python
import random

secret = random.randint(1, 100)
attempts = 0

print("Guess the number (1-100)")

# Simulated guesses for demonstration
guesses = [50, 25, 35]  # Replace with input() for real game

for guess in guesses:
    attempts += 1
    print(f"Your guess: {guess}")
    
    if guess < secret:
        print("Too low!")
    elif guess > secret:
        print("Too high!")
    else:
        print(f"Correct! You got it in {attempts} attempts.")
        break
\`\`\``,
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
          description: `## Understanding Functions

Functions are reusable blocks of code that perform specific tasks. Instead of writing the same code multiple times, you define it once in a function and call it whenever needed. Functions can accept input (parameters) and return output (return values).

Functions make code organized, easier to test, and more maintainable. They follow the DRY principle - Don't Repeat Yourself.

### Real-World Analogy

Think of a function like a recipe. A recipe for chocolate cake is a set of instructions you can use any time you want to make that cake. You don't need to memorize the steps - you just follow the recipe. Similarly, a function contains instructions that you can execute any time by calling the function name.

---

## Syntax

\`\`\`python
# Basic function
def greet():
    print("Hello, World!")

greet()  # Call the function

# Function with parameters
def greet_person(name):
    print(f"Hello, {name}!")

greet_person("Alice")

# Function with return value
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8

# Function with default parameters
def greet_with_title(name, title="Mr."):
    print(f"Hello, {title} {name}")

greet_with_title("Smith")  # Hello, Mr. Smith
greet_with_title("Smith", "Dr.")  # Hello, Dr. Smith

# Multiple return values
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

minimum, maximum, total = get_stats([1, 2, 3, 4, 5])
\`\`\`

---

## Key Notes

- Use def keyword to define functions
- Function names follow same rules as variables
- Parameters are optional
- return statement sends value back to caller
- Functions without return implicitly return None
- Default parameters provide fallback values
- Call function by writing name followed by parentheses

---

## MCQ Checkpoint

Q1. What does this function return?

\`\`\`python
def multiply(x, y=2):
    return x * y

print(multiply(5))
\`\`\`

A. Error
B. 5
C. 10
D. 7

<details><summary>Correct Answer</summary>C. The function has a default parameter y=2. When called with multiply(5), x=5 and y=2 (default), so it returns 5 * 2 = 10.</details>

---

Q2. What happens if a function has no return statement?

A. Error occurs
B. Returns 0
C. Returns None
D. Returns empty string

<details><summary>Correct Answer</summary>C. Functions without an explicit return statement automatically return None.</details>

---

## Coding Task

Create a calculator with functions.

Write functions for:
- Addition
- Subtraction
- Multiplication
- Division

Each function should take two numbers and return the result.

Input Format:
No input required.

Output Format:
\`\`\`
10 + 5 = 15
10 - 5 = 5
10 * 5 = 50
10 / 5 = 2.0
\`\`\`

Sample Solution:
\`\`\`python
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        return "Error: Division by zero"
    return a / b

# Test the calculator
x, y = 10, 5
print(f"{x} + {y} = {add(x, y)}")
print(f"{x} - {y} = {subtract(x, y)}")
print(f"{x} * {y} = {multiply(x, y)}")
print(f"{x} / {y} = {divide(x, y)}")
\`\`\``,
          videoUrl: "https://placeholder-video.com/python-functions",
          duration: 25,
          order: 1,
          isPreview: false,
          resources: []
        }
      ]
    }
  ]
};

// Main seeding function
async function seedPythonCourseClean() {
  try {
    console.log('Starting Python Course update to CodeChef Clean Style...');
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existingCourse = await Course.findOne({ slug: codeChefCleanCourse.slug });
    
    if (existingCourse) {
      console.log('Course found, updating...');
      await Course.findOneAndUpdate(
        { slug: codeChefCleanCourse.slug },
        codeChefCleanCourse,
        { new: true }
      );
      console.log('Course updated successfully');
    } else {
      console.log('Creating new course...');
      await Course.create(codeChefCleanCourse);
      console.log('Course created successfully');
    }

    const course = await Course.findOne({ slug: codeChefCleanCourse.slug });
    const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
    
    console.log('\nCourse Statistics:');
    console.log(`Title: ${course.title}`);
    console.log(`Modules: ${course.sections.length}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Published: ${course.isPublished ? 'Yes' : 'No'}`);
    
    console.log('\nModules:');
    course.sections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title} (${section.lessons.length} lessons)`);
    });

    console.log('\nCodeChef Clean Style Features:');
    console.log('- Clean white background design');
    console.log('- No emojis or fancy icons');
    console.log('- Simple bordered cards for MCQs');
    console.log('- CodeChef orange accent color');
    console.log('- Minimal, focused content');
    console.log('- Clean code blocks');
    console.log('- Professional formatting');
    
  } catch (error) {
    console.error('Error updating course:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedPythonCourseClean();
