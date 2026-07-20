# 🐍 Zero to Hero Python Course

> **Course #2 on DoFlow Academy**  
> Master Python programming from scratch — perfect for absolute beginners!

---

## 📋 Course Overview

| Property | Value |
|----------|-------|
| **Duration** | 8 hours |
| **Level** | Beginner |
| **Modules** | 8 |
| **Prerequisites** | None |
| **Certificate** | Yes ✅ |

---

## 📚 Syllabus

1. [Module 1: Output & Printing](#module-1-output--printing)
2. [Module 2: Variables & Data Types](#module-2-variables--data-types)
3. [Module 3: Arithmetic Operations](#module-3-arithmetic-operations)
4. [Module 4: String Manipulation](#module-4-string-manipulation)
5. [Module 5: User Inputs](#module-5-user-inputs)
6. [Module 6: Conditionals](#module-6-conditionals)
7. [Module 7: Loops](#module-7-loops)
8. [Module 8: Functions](#module-8-functions)

---

# Module 1: Output & Printing
**Duration: 45 mins**

## 📖 Concept Explanation

The `print()` function is your first tool in Python! It displays text, numbers, or any information on the screen. Think of it as Python's way of talking to you. Whatever you put inside the parentheses gets shown as output. Text must be wrapped in quotes (single or double), but numbers don't need quotes.

## 🌍 Real-World Analogy: The Announcement Speaker

Imagine a school announcement speaker. Whatever message you give it, it broadcasts to everyone. The `print()` function works the same way — it takes your message and displays it on the screen for everyone (or just you!) to see.

## 🐍 Syntax Showcase

```python
# Printing text (use quotes)
print("Hello, World!")
print('Welcome to Python!')

# Printing numbers (no quotes needed)
print(42)
print(3.14)

# Printing multiple items
print("My age is", 25)

# Printing on multiple lines
print("Line 1")
print("Line 2")
print("Line 3")
```

## 🧠 Interactive MCQ

**Question:** What will be the output of: `print("5 + 3")`?

- A) 8
- B) 5 + 3
- C) "5 + 3"
- D) Error

<details>
<summary>🔍 Click to reveal answer</summary>

**Answer: B) 5 + 3**

Since "5 + 3" is inside quotes, Python treats it as text (string), not a math operation. It prints exactly what's inside the quotes.

</details>

## 💻 Coding Challenge: Say Hello

**Problem:** Write a Python program that prints the following three lines:
```
Hello, I am learning Python!
Python is fun!
Let's code together!
```

<details>
<summary>💡 Solution</summary>

```python
print("Hello, I am learning Python!")
print("Python is fun!")
print("Let's code together!")
```

</details>

---

# Module 2: Variables & Data Types
**Duration: 60 mins**

## 📖 Concept Explanation

Variables are containers that store data in your program. You create a variable by giving it a name and assigning a value using the `=` sign. Python automatically figures out what type of data you're storing — whether it's a number (integer/float), text (string), or true/false (boolean).

## 🌍 Real-World Analogy: Labeled Boxes

Imagine you're moving houses and using labeled boxes. One box says 'Books', another says 'Clothes'. You know exactly what's inside each box by its label. Variables work the same way — they're labeled containers where you store different types of information.

## 🐍 Syntax Showcase

```python
# Integer (whole numbers)
age = 25
students = 100

# Float (decimal numbers)
price = 99.99
temperature = 36.5

# String (text)
name = "Rahul"
city = 'Mumbai'

# Boolean (True/False)
is_student = True
has_license = False

# Checking data type
print(type(age))      # <class 'int'>
print(type(price))    # <class 'float'>
print(type(name))     # <class 'str'>

# Using variables
print("My name is", name)
print("I am", age, "years old")
```

## 🧠 Interactive MCQ

**Question:** What is the data type of the variable: `score = "100"`?

- A) int
- B) float
- C) str
- D) bool

<details>
<summary>🔍 Click to reveal answer</summary>

**Answer: C) str**

Even though 100 looks like a number, it's wrapped in quotes (""), which makes it a string. To make it an integer: `score = 100` (without quotes).

</details>

## 💻 Coding Challenge: Personal Info Card

**Problem:** Create variables to store your personal information and display them:
1. Create a variable `name` with your name
2. Create a variable `age` with your age (as a number)
3. Create a variable `city` with your city
4. Print: "Hi, I'm [name], [age] years old, from [city]"

<details>
<summary>💡 Solution</summary>

```python
name = "Rahul"
age = 22
city = "Mumbai"

print("Hi, I'm", name + ",", age, "years old, from", city)
```

</details>

---

# Module 3: Arithmetic Operations
**Duration: 50 mins**

## 📖 Concept Explanation

Python is a powerful calculator! You can perform addition (+), subtraction (-), multiplication (*), division (/), floor division (//), modulus (%), and exponentiation (**). Python follows BODMAS/PEMDAS rules — parentheses first, then exponents, multiplication/division, and finally addition/subtraction.

## 🌍 Real-World Analogy: The Smart Calculator

Think of Python as a super-smart calculator that never makes mistakes. Just like you'd punch numbers into a calculator for your monthly budget or splitting a restaurant bill, Python handles all the math — but it can also remember results and use them later!

## 🐍 Syntax Showcase

```python
# Basic Operations
a = 10
b = 3

print(a + b)   # Addition: 13
print(a - b)   # Subtraction: 7
print(a * b)   # Multiplication: 30
print(a / b)   # Division: 3.333...
print(a // b)  # Floor Division: 3 (no decimal)
print(a % b)   # Modulus (remainder): 1
print(a ** b)  # Exponent (10³): 1000

# Order of Operations (BODMAS)
result = 2 + 3 * 4      # 14 (not 20!)
result = (2 + 3) * 4    # 20 (parentheses first)

# Storing results
total = 100 + 50
tax = total * 0.18
final_price = total + tax
print("Final Price:", final_price)
```

## 🧠 Interactive MCQ

**Question:** What is the result of: `17 // 5`?

- A) 3.4
- B) 3
- C) 2
- D) 4

<details>
<summary>🔍 Click to reveal answer</summary>

**Answer: B) 3**

The `//` operator performs floor division, which divides and rounds DOWN to the nearest whole number. 17 ÷ 5 = 3.4, rounded down = 3.

</details>

## 💻 Coding Challenge: Bill Calculator

**Problem:** You went to a restaurant with 4 friends. The total bill is ₹2500, and you want to add an 18% tip. Calculate:
1. The tip amount
2. The total amount (bill + tip)
3. How much each person pays (split equally among 5 people)

<details>
<summary>💡 Solution</summary>

```python
bill = 2500
people = 5
tip_percent = 0.18

tip_amount = bill * tip_percent
total_amount = bill + tip_amount
per_person = total_amount / people

print("Tip Amount:", tip_amount)
print("Total Amount:", total_amount)
print("Per Person:", per_person)
```

**Output:**
```
Tip Amount: 450.0
Total Amount: 2950.0
Per Person: 590.0
```

</details>

---

# Module 4: String Manipulation
**Duration: 55 mins**

## 📖 Concept Explanation

Strings are sequences of characters (text). You can combine strings (concatenation), access individual characters using their position (indexing starts at 0), and extract portions (slicing). Python strings are immutable — you can't change them directly, but you can create new strings.

## 🌍 Real-World Analogy: A Necklace of Beads

Imagine a string as a necklace with beads, where each bead is a character. The first bead is at position 0, the second at position 1, and so on. You can look at any bead by its position, or take a section of beads (slicing) to make a smaller necklace.

## 🐍 Syntax Showcase

```python
# String Creation
message = "Hello Python"
name = 'DoFlow'

# Concatenation (joining strings)
first = "Hello"
last = "World"
full = first + " " + last  # "Hello World"

# Indexing (accessing characters)
# Index:  0 1 2 3 4 5
# String: P y t h o n
text = "Python"
print(text[0])   # 'P' (first character)
print(text[2])   # 't' (third character)
print(text[-1])  # 'n' (last character)

# Slicing [start:end] (end not included)
print(text[0:3])   # 'Pyt' (index 0,1,2)
print(text[2:5])   # 'tho' (index 2,3,4)
print(text[:4])    # 'Pyth' (from start)
print(text[2:])    # 'thon' (to end)

# String Methods
print(text.upper())      # 'PYTHON'
print(text.lower())      # 'python'
print(len(text))         # 6 (length)
```

## 🧠 Interactive MCQ

**Question:** Given `word = "Programming"`, what is `word[3:7]`?

- A) "gram"
- B) "gra"
- C) "ogra"
- D) "ramm"

<details>
<summary>🔍 Click to reveal answer</summary>

**Answer: A) "gram"**

Slicing [3:7] extracts characters at indices 3, 4, 5, 6 (7 is not included).
`P-r-o-g-r-a-m-m-i-n-g` has indices `0-1-2-3-4-5-6-7-8-9-10`.
So indices 3-6 give us 'gram'.

</details>

## 💻 Coding Challenge: Username Generator

**Problem:** Create a username generator! Given a first name and last name:
1. Take the first 3 letters of the first name
2. Take the last 3 letters of the last name
3. Combine them and convert to lowercase

Example: "Rahul" + "Sharma" → "rahrma"

<details>
<summary>💡 Solution</summary>

```python
first_name = "Rahul"
last_name = "Sharma"

part1 = first_name[:3]
part2 = last_name[-3:]
username = (part1 + part2).lower()

print("Username:", username)
```

</details>

---

# Module 5: User Inputs
**Duration: 50 mins**

## 📖 Concept Explanation

The `input()` function pauses your program and waits for the user to type something. It always returns a string, even if the user types a number! To use numbers in calculations, convert them using `int()` for whole numbers or `float()` for decimals.

## 🌍 Real-World Analogy: The Interview

Think of input() as an interviewer asking you questions. The interviewer (your program) asks a question, waits for your answer, and writes it down exactly as you said it (as text). If they need to do math with your answer, they first convert your words into numbers.

## 🐍 Syntax Showcase

```python
# Basic input (returns string)
name = input("What is your name? ")
print("Hello,", name)

# Input with type conversion
age = int(input("Enter your age: "))
price = float(input("Enter price: "))

# Using input in calculations
num1 = int(input("Enter first number: "))
num2 = int(input("Enter second number: "))
total = num1 + num2
print("Sum =", total)

# Common mistake to avoid!
x = input("Number: ")  # x is "5" (string)
y = x + x              # "55" not 10!

# Correct way:
x = int(input("Number: "))  # x is 5 (int)
y = x + x                    # 10 ✓
```

## 🧠 Interactive MCQ

**Question:** What happens if you run: `x = input("Enter: ")` and the user types `42`?

- A) x stores the integer 42
- B) x stores the float 42.0
- C) x stores the string "42"
- D) Python throws an error

<details>
<summary>🔍 Click to reveal answer</summary>

**Answer: C) x stores the string "42"**

The `input()` function ALWAYS returns a string, regardless of what the user types. You need `int(input())` to get an integer.

</details>

## 💻 Coding Challenge: Age Calculator

**Problem:** Create a program that:
1. Asks the user for their birth year
2. Calculates their age (assume current year is 2025)
3. Calculates the year they will turn 100
4. Prints both results

<details>
<summary>💡 Solution</summary>

```python
birth_year = int(input("Enter your birth year: "))

current_year = 2025
age = current_year - birth_year
year_100 = birth_year + 100

print("Your age is:", age)
print("You will turn 100 in:", year_100)
```

</details>

---

# Module 6: Conditionals
**Duration: 65 mins**

## 📖 Concept Explanation

Conditionals let your program make decisions! The `if` statement checks a condition — if it's True, the indented code runs. Use `else` for what happens when False. Use `elif` (else if) to check multiple conditions. Comparison operators: == (equal), != (not equal), > < >= <=.

## 🌍 Real-World Analogy: Traffic Signal

Conditionals work like traffic rules. IF the light is green, you go. ELIF (else if) the light is yellow, you slow down. ELSE (red light), you stop. Your program checks conditions and takes different actions based on what's true.

## 🐍 Syntax Showcase

```python
# Simple if statement
age = 18
if age >= 18:
    print("You can vote!")

# if-else
temperature = 35
if temperature > 30:
    print("It's hot! 🔥")
else:
    print("Nice weather! 😊")

# if-elif-else (multiple conditions)
marks = 75

if marks >= 90:
    grade = "A+"
elif marks >= 80:
    grade = "A"
elif marks >= 70:
    grade = "B"
elif marks >= 60:
    grade = "C"
else:
    grade = "F"

print("Grade:", grade)  # Output: Grade: B

# Logical Operators
age = 25
has_license = True

if age >= 18 and has_license:
    print("You can drive!")
```

## 🧠 Interactive MCQ

**Question:** What will this code print?
```python
x = 10
if x > 5:
    print("A")
elif x > 8:
    print("B")
else:
    print("C")
```

- A) A
- B) B
- C) A and B
- D) C

<details>
<summary>🔍 Click to reveal answer</summary>

**Answer: A) A**

Python checks conditions from top to bottom. The first condition (x > 5) is True, so it prints "A" and skips ALL remaining elif/else blocks. Even though x > 8 is also True, it's never checked!

</details>

## 💻 Coding Challenge: Ticket Price Calculator

**Problem:** Create a movie ticket price calculator based on age:
- Children (under 12): ₹100
- Teenagers (12-17): ₹150
- Adults (18-59): ₹200
- Seniors (60+): ₹120

<details>
<summary>💡 Solution</summary>

```python
age = int(input("Enter your age: "))

if age < 12:
    price = 100
elif age < 18:
    price = 150
elif age < 60:
    price = 200
else:
    price = 120

print("Ticket Price: ₹" + str(price))
```

</details>

---

# Module 7: Loops
**Duration: 70 mins**

## 📖 Concept Explanation

Loops repeat code automatically! `for` loops iterate over a sequence (like a range of numbers or characters). `while` loops keep running as long as a condition is True. Use `break` to exit early, and `continue` to skip to the next iteration.

## 🌍 Real-World Analogy: Assembly Line

Imagine an assembly line in a factory. A FOR loop is like saying "paint exactly 100 cars" — you know how many times to repeat. A WHILE loop is like saying "keep painting cars until the paint runs out" — you keep going until a condition changes.

## 🐍 Syntax Showcase

```python
# FOR loop with range
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):     # 1, 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2): # 0, 2, 4, 6, 8 (step of 2)
    print(i)

# FOR loop with string
for char in "Python":
    print(char)  # P y t h o n

# WHILE loop
count = 1
while count <= 5:
    print(count)
    count += 1

# break - exit loop early
for i in range(10):
    if i == 5:
        break
    print(i)  # Prints 0, 1, 2, 3, 4

# continue - skip current iteration
for i in range(5):
    if i == 2:
        continue
    print(i)  # Prints 0, 1, 3, 4
```

## 🧠 Interactive MCQ

**Question:** How many times will this loop print "Hello"?
```python
for i in range(2, 8, 2):
    print("Hello")
```

- A) 6 times
- B) 4 times
- C) 3 times
- D) 8 times

<details>
<summary>🔍 Click to reveal answer</summary>

**Answer: C) 3 times**

`range(2, 8, 2)` generates: 2, 4, 6 (starts at 2, stops before 8, steps by 2). That's 3 values, so "Hello" prints 3 times.

</details>

## 💻 Coding Challenge: Multiplication Table

**Problem:** Create a program that:
1. Asks the user for a number
2. Prints the multiplication table (1 to 10)

<details>
<summary>💡 Solution</summary>

```python
num = int(input("Enter a number: "))

print(f"Multiplication Table for {num}")
print("-" * 20)

for i in range(1, 11):
    result = num * i
    print(f"{num} x {i} = {result}")
```

</details>

---

# Module 8: Functions
**Duration: 75 mins**

## 📖 Concept Explanation

Functions are reusable blocks of code that perform specific tasks. Define a function using `def function_name():`. Functions can accept inputs (parameters) and return outputs using `return`. This makes your code organized, reusable, and easier to debug.

## 🌍 Real-World Analogy: Recipe Book

A function is like a recipe. You write it once (define it), and you can use it whenever you want (call it). The recipe might need ingredients (parameters) and produces a dish (return value). Just like you don't rewrite the recipe every time you cook!

## 🐍 Syntax Showcase

```python
# Simple function (no parameters)
def greet():
    print("Hello, Welcome!")

greet()  # Call the function

# Function with parameters
def greet_user(name):
    print(f"Hello, {name}!")

greet_user("Rahul")    # Hello, Rahul!

# Function with return value
def add(a, b):
    return a + b

result = add(5, 3)     # result = 8

# Function with default parameter
def power(base, exp=2):
    return base ** exp

print(power(5))        # 25 (uses default)
print(power(5, 3))     # 125

# Multiple return values
def calculate(a, b):
    return a + b, a - b

s, d = calculate(10, 4)
print(f"Sum: {s}, Difference: {d}")
```

## 🧠 Interactive MCQ

**Question:** What does this function return?
```python
def mystery(x):
    if x > 0:
        return "Positive"
    elif x < 0:
        return "Negative"

print(mystery(0))
```

- A) "Positive"
- B) "Negative"
- C) 0
- D) None

<details>
<summary>🔍 Click to reveal answer</summary>

**Answer: D) None**

When x is 0, neither condition is True, so no return statement executes. In Python, if a function doesn't explicitly return something, it returns None.

</details>

## 💻 Coding Challenge: Grade Calculator Function

**Problem:** Create a function `calculate_grade` that:
1. Takes marks (0-100)
2. Returns the grade:
   - 90-100: "A+"
   - 80-89: "A"
   - 70-79: "B"
   - 60-69: "C"
   - Below 60: "F"

<details>
<summary>💡 Solution</summary>

```python
def calculate_grade(marks):
    if marks >= 90:
        grade = "A+"
    elif marks >= 80:
        grade = "A"
    elif marks >= 70:
        grade = "B"
    elif marks >= 60:
        grade = "C"
    else:
        grade = "F"
    return grade

print("95 marks:", calculate_grade(95))  # A+
print("82 marks:", calculate_grade(82))  # A
print("73 marks:", calculate_grade(73))  # B
print("58 marks:", calculate_grade(58))  # F
```

</details>

---

# 🎉 Congratulations!

You've completed the **Zero to Hero Python Course**!

## ✅ What You Learned

- ✅ Printing output with `print()`
- ✅ Variables and data types
- ✅ Arithmetic operations
- ✅ String manipulation
- ✅ Taking user input
- ✅ Making decisions with conditionals
- ✅ Automating with loops
- ✅ Creating reusable functions

## 🚀 Next Steps

1. Practice more coding challenges
2. Build mini projects
3. Explore data structures (lists, dictionaries)
4. Learn about file handling
5. Try the DSA Roadmap course!

---

> **Developed by DoFlow Academy**  
> © 2025 Elite Digital Solutions
