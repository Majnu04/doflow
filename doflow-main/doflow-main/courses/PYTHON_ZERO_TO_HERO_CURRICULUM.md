# 🐍 Zero to Hero Python Course

## Course #2 | Elite Digital Academy

---

# Module 1: Output & Printing

## 📘 Concept Explanation

The `print()` function is your first tool in Python! It displays text, numbers, or any information on the screen. Think of it as Python's way of talking to you. Whatever you put inside the parentheses gets shown as output. You can print words (in quotes), numbers, or even calculations.

---

## 🌍 Real-World Analogy

Imagine a **loudspeaker at a train station**. The announcer speaks into it, and everyone hears the message. Similarly, `print()` is Python's loudspeaker — whatever you "say" inside it gets displayed on screen for the user to see.

---

## 💻 Syntax Example

```python
# Printing text
print("Hello, World!")

# Printing numbers
print(42)
print(3.14)

# Printing multiple items
print("The answer is", 42)

# Printing with special characters
print("Line 1\nLine 2")  # \n creates a new line
```

**Output:**
```
Hello, World!
42
3.14
The answer is 42
Line 1
Line 2
```

---

## 🧠 Interactive MCQ

**Question:** What will be the output of `print("5 + 3")`?

A) `8`  
B) `5 + 3`  
C) `"5 + 3"`  
D) `Error`

<details>
<summary>✅ Click to reveal answer</summary>

**Correct Answer: B) `5 + 3`**

When text is inside quotes, Python treats it as a string (text), not as a math calculation. It prints exactly what's inside the quotes.

</details>

---

## 🏆 Coding Challenge

**Task:** Write a Python program that prints the following output:

```
Hello, I am learning Python!
Python is fun!
Let's code together!
```

**Hint:** Use three separate `print()` statements.

---

## 🎬 Recommended Videos

| Title | Channel | Link |
|-------|---------|------|
| Python Tutorial for Beginners - Print Function | Programming with Mosh | [Watch](https://www.youtube.com/watch?v=kqtD5dpn9C8) |
| Python print() Function Explained | Corey Schafer | [Watch](https://www.youtube.com/watch?v=FhoASwgvZHk) |

---

---

# Module 2: Variables & Data Types

## 📘 Concept Explanation

Variables are **containers** that store data with a name. Think of them as labeled boxes where you can put values. Python automatically detects the type of data you store. The four main types are: **integers** (whole numbers), **floats** (decimals), **strings** (text), and **booleans** (True/False).

---

## 🌍 Real-World Analogy

Imagine a **storage locker** at a gym. Each locker has a number (name), and you can store different items inside. Variables work the same way — `age = 25` creates a locker named "age" and stores 25 inside. Later, you can open the locker (use the variable) to get the value.

---

## 💻 Syntax Example

```python
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
print(age)              # Output: 26
```

---

## 🧠 Interactive MCQ

**Question:** What is the data type of the variable `price = "99.99"`?

A) `int`  
B) `float`  
C) `str`  
D) `bool`

<details>
<summary>✅ Click to reveal answer</summary>

**Correct Answer: C) `str`**

Even though 99.99 looks like a number, it's wrapped in quotes (`"99.99"`), making it a **string** (text), not a float. Always check: quotes = string!

</details>

---

## 🏆 Coding Challenge

**Task:** Create a digital ID card using variables!

1. Create variables for: `name`, `age`, `city`, `is_employed`
2. Assign appropriate values to each
3. Print all values with labels

**Expected Output:**
```
Name: John
Age: 28
City: Mumbai
Employed: True
```

---

## 🎬 Recommended Videos

| Title | Channel | Link |
|-------|---------|------|
| Python Variables and Data Types | freeCodeCamp | [Watch](https://www.youtube.com/watch?v=cQT33yu9pY8) |
| Variables in Python - Beginner Tutorial | Tech With Tim | [Watch](https://www.youtube.com/watch?v=Z1Yd7upQsXY) |

---

---

# Module 3: Arithmetic Operations

## 📘 Concept Explanation

Python can perform math like a calculator! The basic operators are: `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `//` (floor division), `%` (modulus/remainder), and `**` (power). These work with numbers stored in variables too, making Python great for calculations.

---

## 🌍 Real-World Analogy

Think of Python as a **smart calculator** on your phone. Just like you punch in numbers and operations, Python takes your numbers and operators, processes them, and gives you the answer. The difference? Python can save results and do complex calculations automatically!

---

## 💻 Syntax Example

```python
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
print(score) # Output: 110
```

---

## 🧠 Interactive MCQ

**Question:** What is the output of `print(17 % 5)`?

A) `3.4`  
B) `3`  
C) `2`  
D) `12`

<details>
<summary>✅ Click to reveal answer</summary>

**Correct Answer: C) `2`**

The `%` operator gives the **remainder** after division. 17 ÷ 5 = 3 remainder **2**. So `17 % 5` equals 2.

</details>

---

## 🏆 Coding Challenge

**Task:** Build a Simple Bill Calculator!

Write a program that:
1. Creates variables for `item_price = 250` and `quantity = 3`
2. Calculates `subtotal`
3. Adds 18% GST to get `total`
4. Prints the final bill

**Expected Output:**
```
Subtotal: 750
GST (18%): 135.0
Total: 885.0
```

---

## 🎬 Recommended Videos

| Title | Channel | Link |
|-------|---------|------|
| Python Arithmetic Operators | Programiz | [Watch](https://www.youtube.com/watch?v=v5MR5JnKcZI) |
| Math in Python for Beginners | CS Dojo | [Watch](https://www.youtube.com/watch?v=khKv-8q7YmY) |

---

---

# Module 4: String Manipulation

## 📘 Concept Explanation

Strings are sequences of characters (text) enclosed in quotes. Python offers powerful tools to manipulate strings: concatenation (`+`), repetition (`*`), slicing (`[start:end]`), and built-in methods like `.upper()`, `.lower()`, `.replace()`, and `.split()`. Master these to handle text like a pro!

---

## 🌍 Real-World Analogy

Think of a string as a **train with letter carriages**. Each carriage (character) has a seat number (index) starting from 0. You can access any carriage by its number, combine trains (concatenation), or even detach specific carriages (slicing) to create new trains!

---

## 💻 Syntax Example

```python
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
print(text.replace("world", "Python"))  # Output: hello Python
print(len(text))          # Output: 11 (length)
```

---

## 🧠 Interactive MCQ

**Question:** What is the output of `"Python"[1:4]`?

A) `Pyt`  
B) `yth`  
C) `ytho`  
D) `Pyth`

<details>
<summary>✅ Click to reveal answer</summary>

**Correct Answer: B) `yth`**

Slicing `[1:4]` starts at index 1 (y) and goes up to but **not including** index 4. So we get characters at positions 1, 2, 3 → "yth".

</details>

---

## 🏆 Coding Challenge

**Task:** Create a Username Generator!

Write a program that:
1. Takes a `first_name = "john"` and `birth_year = "1995"`
2. Creates a username: first 3 letters of name (uppercase) + last 2 digits of year
3. Print the username

**Expected Output:**
```
Generated Username: JOH95
```

---

## 🎬 Recommended Videos

| Title | Channel | Link |
|-------|---------|------|
| Python Strings Tutorial | Corey Schafer | [Watch](https://www.youtube.com/watch?v=k9TUPpGqYTo) |
| String Manipulation in Python | Programming with Mosh | [Watch](https://www.youtube.com/watch?v=ioi__WRETk4) |

---

---

# Module 5: User Inputs

## 📘 Concept Explanation

The `input()` function lets your program talk to users! It pauses execution, shows a prompt, waits for the user to type something, and returns that text as a string. To use numbers from input, convert them using `int()` or `float()`. This makes your programs interactive!

---

## 🌍 Real-World Analogy

Imagine a **restaurant waiter** asking "What would you like to order?" and waiting for your answer. The `input()` function is like that waiter — it asks a question (prompt), waits for your response, and takes it back to the kitchen (your program) to process.

---

## 💻 Syntax Example

```python
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
```

**Sample Run:**
```
Enter your name: Alice
Hello, Alice!
Enter your age: 25
Next year you'll be 26
```

---

## 🧠 Interactive MCQ

**Question:** What will happen if a user enters "twenty" when this code runs: `age = int(input("Age: "))`?

A) It stores "twenty" as the age  
B) It converts "twenty" to 20  
C) It causes a ValueError (crash)  
D) It stores 0 as the age

<details>
<summary>✅ Click to reveal answer</summary>

**Correct Answer: C) It causes a ValueError (crash)**

`int()` can only convert numeric strings like "25" to integers. The word "twenty" cannot be converted, so Python raises a **ValueError**. Always validate user input!

</details>

---

## 🏆 Coding Challenge

**Task:** Build a Simple Age Calculator!

Write a program that:
1. Asks the user for their `birth_year`
2. Calculates their age (assume current year is 2025)
3. Tells them how many years until they turn 100

**Expected Output:**
```
Enter your birth year: 1995
You are 30 years old.
You will turn 100 in 70 years!
```

---

## 🎬 Recommended Videos

| Title | Channel | Link |
|-------|---------|------|
| Python Input Function | Telusko | [Watch](https://www.youtube.com/watch?v=I9h1c-121Uk) |
| Taking User Input in Python | Bro Code | [Watch](https://www.youtube.com/watch?v=I57fsvLEEog) |

---

---

# Module 6: Conditionals (if/elif/else)

## 📘 Concept Explanation

Conditionals let your program make decisions! Use `if` to check a condition, `elif` (else if) for additional checks, and `else` for everything else. Comparison operators include: `==` (equal), `!=` (not equal), `<`, `>`, `<=`, `>=`. Combine conditions with `and`, `or`, `not`.

---

## 🌍 Real-World Analogy

Imagine a **traffic signal**. If the light is green, you go. Elif (else if) it's yellow, you slow down. Else (red), you stop. Conditionals work exactly like this — your program checks conditions and takes different actions based on what's true.

---

## 💻 Syntax Example

```python
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

print("Your grade:", grade)  # Output: Your grade: C

# Multiple conditions with and/or
age = 25
has_license = True

if age >= 18 and has_license:
    print("You can drive! 🚗")

# Checking membership
fruits = ["apple", "banana", "cherry"]
if "apple" in fruits:
    print("Apple is available!")
```

---

## 🧠 Interactive MCQ

**Question:** What is the output of this code?

```python
x = 10
if x > 5:
    print("A")
elif x > 8:
    print("B")
else:
    print("C")
```

A) `A`  
B) `B`  
C) `A` and `B`  
D) `C`

<details>
<summary>✅ Click to reveal answer</summary>

**Correct Answer: A) `A`**

Python checks conditions **in order**. Since `x > 5` is True (10 > 5), it prints "A" and **skips** all remaining elif/else blocks. Even though `x > 8` is also true, it's never checked!

</details>

---

## 🏆 Coding Challenge

**Task:** Build a Movie Ticket Price Calculator!

Write a program that:
1. Asks for the user's `age`
2. Calculates ticket price based on:
   - Children (under 12): ₹100
   - Adults (12-59): ₹250
   - Seniors (60+): ₹150
3. Print the ticket price

**Expected Output:**
```
Enter your age: 35
Your ticket price: ₹250
```

---

## 🎬 Recommended Videos

| Title | Channel | Link |
|-------|---------|------|
| Python If Else Statements | Programming with Mosh | [Watch](https://www.youtube.com/watch?v=Zp5MuPOtsSY) |
| Conditionals in Python | CS50 | [Watch](https://www.youtube.com/watch?v=5pPKYWqkoek) |

---

---

# Module 7: Loops (for & while)

## 📘 Concept Explanation

Loops repeat code automatically! The `for` loop iterates over a sequence (list, string, range). The `while` loop repeats as long as a condition is true. Use `break` to exit early, `continue` to skip iterations, and `range()` to generate number sequences. Loops eliminate repetitive coding!

---

## 🌍 Real-World Analogy

Imagine a **washing machine**. It repeats the same cycle — wash, rinse, spin — until the timer ends (like a `for` loop with fixed iterations). Or think of eating at a buffet — you keep going back **while** you're hungry (like a `while` loop that stops when the condition changes).

---

## 💻 Syntax Example

```python
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
    print()  # New line
```

---

## 🧠 Interactive MCQ

**Question:** How many times will this loop run?

```python
for i in range(2, 10, 3):
    print(i)
```

A) 10 times  
B) 3 times  
C) 8 times  
D) 4 times

<details>
<summary>✅ Click to reveal answer</summary>

**Correct Answer: B) 3 times**

`range(2, 10, 3)` starts at 2, goes up to (not including) 10, stepping by 3. So it generates: 2, 5, 8. That's **3 iterations**!

</details>

---

## 🏆 Coding Challenge

**Task:** Build a Number Guessing Game!

Write a program that:
1. Sets a `secret_number = 7`
2. Uses a `while` loop to keep asking until they guess correctly
3. Gives hints: "Too high!" or "Too low!"
4. Congratulates them when correct

**Expected Output:**
```
Guess the number (1-10): 5
Too low! Try again.
Guess the number (1-10): 9
Too high! Try again.
Guess the number (1-10): 7
🎉 Correct! You guessed it!
```

---

## 🎬 Recommended Videos

| Title | Channel | Link |
|-------|---------|------|
| Python Loops Tutorial | Corey Schafer | [Watch](https://www.youtube.com/watch?v=6iF8Xb7Z3wQ) |
| For and While Loops in Python | freeCodeCamp | [Watch](https://www.youtube.com/watch?v=94UHCEmprCY) |

---

---

# Module 8: Functions

## 📘 Concept Explanation

Functions are reusable blocks of code! Define them with `def`, give them a name, add parameters (inputs), and use `return` to send back results. Functions make code organized, reusable, and easier to debug. You can have default parameters, multiple returns, and even functions inside functions!

---

## 🌍 Real-World Analogy

Think of a **coffee machine**. You press a button (call the function), it takes your input (coffee type), does the work internally (brewing), and gives you output (coffee). You don't need to know HOW it makes coffee — you just use it! Functions work the same way — reusable, encapsulated, and efficient.

---

## 💻 Syntax Example

```python
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

print(greet("Bob"))              # Output: Hello, Bob!
print(greet("Bob", "Welcome"))   # Output: Welcome, Bob!

# Multiple return values
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

low, high, total = get_stats([1, 2, 3, 4, 5])
print(f"Min: {low}, Max: {high}, Sum: {total}")
```

---

## 🧠 Interactive MCQ

**Question:** What does this function return?

```python
def mystery(x):
    if x > 0:
        return "Positive"
    return "Not Positive"

result = mystery(0)
```

A) `"Positive"`  
B) `"Not Positive"`  
C) `0`  
D) `None`

<details>
<summary>✅ Click to reveal answer</summary>

**Correct Answer: B) `"Not Positive"`**

Since `0 > 0` is False, the first `return` is skipped. The function continues to the second `return` and returns "Not Positive".

</details>

---

## 🏆 Coding Challenge

**Task:** Build a Temperature Converter!

Create two functions:
1. `celsius_to_fahrenheit(c)` - Returns temperature in Fahrenheit
   - Formula: F = (C × 9/5) + 32
2. `fahrenheit_to_celsius(f)` - Returns temperature in Celsius
   - Formula: C = (F - 32) × 5/9

Test both functions and print results.

**Expected Output:**
```
37°C = 98.6°F
98.6°F = 37.0°C
```

---

## 🎬 Recommended Videos

| Title | Channel | Link |
|-------|---------|------|
| Python Functions Tutorial | Corey Schafer | [Watch](https://www.youtube.com/watch?v=9Os0o3wzS_I) |
| Functions in Python for Beginners | Programming with Mosh | [Watch](https://www.youtube.com/watch?v=u-OmVr_fT4s) |

---

---

# 🎓 Course Completion

Congratulations! You've completed the **Zero to Hero Python Course**! 🎉

## What You've Learned:
- ✅ Printing output to the screen
- ✅ Working with variables and data types
- ✅ Performing arithmetic operations
- ✅ Manipulating strings
- ✅ Taking user inputs
- ✅ Making decisions with conditionals
- ✅ Automating with loops
- ✅ Creating reusable functions

## Next Steps:
1. 🔄 Practice daily on platforms like LeetCode, HackerRank
2. 📚 Learn about Lists, Dictionaries, and File Handling
3. 🛠️ Build mini-projects (Calculator, To-Do App, Quiz Game)
4. 🚀 Explore Python libraries (NumPy, Pandas, Flask)

**Keep coding, keep learning!** 💪🐍
