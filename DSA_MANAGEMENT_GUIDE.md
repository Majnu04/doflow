# DSA Problem Management System - Complete Guide

## 🎯 Overview
Your DSA platform now has a **fully dynamic problem management system** where all problems are stored in MongoDB and can be managed via the admin dashboard with complete CRUD operations.

---

## 📊 Database Structure

### **Collections:**

1. **Course** - Main DSA course container
2. **RoadmapSection** - Sections within a DSA course (e.g., "Basic DSA", "Intermediate DSA")
3. **Problem** - Individual coding problems

### **Problem Schema:**
```javascript
{
  title: String,                    // "Two Sum"
  section: ObjectId,                // Reference to RoadmapSection
  course: ObjectId,                 // Reference to Course
  order: Number,                    // Display order within section
  difficulty: 'Easy|Medium|Hard',   
  description: String,              // Full problem description (Markdown supported)
  
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  
  constraints: [String],            // ["1 <= n <= 1000", "..."]
  
  hints: [String],                  // Student hints
  
  starterCode: [{
    language: 'javascript|python|java|cpp|c',
    visibleCode: String,        // Student-visible stub (e.g., LeetCode-style method)
    adapterCode: String,        // Hidden harness bridge that exposes solve(...)
    code: String                // Legacy fallback (mirror visibleCode)
  }],
  
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: Boolean               // Hidden test cases for submission
  }],
  
  leetcodeLink: String,             // Optional external reference
  isFree: Boolean,                  // Free preview or enrollment required
  
  timestamps: true                  // createdAt, updatedAt
}
```

### 🧪 Harness Mode Contracts

Every problem still executes via a canonical `solve` function per language, but you now control two separate snippets per language:

- **visibleCode** – what the learner sees/edits (e.g., `class Solution { public int[] twoSum(...) { ... } }`).
- **adapterCode** – hidden helper that exposes the canonical entrypoint (see table below), parses the JSON args coming from Judge0, and invokes the learner’s stub. Place imports, helper parsers, or JSON serialization here to mirror LeetCode’s trusted harness.

When you provide an adapter, you **must** export the following entrypoints so the Judge0 harness can invoke your hidden bridge:

| Language | Required entrypoint (defined in adapterCode) |
|----------|---------------------------------------------|
| JavaScript | `function __doflow_entry(...args) { /* return string */ }` |
| Python | `def __doflow_entry(*args): ...` |
| Java | `class DoFlowAdapter { public static Object __doflow_entry(String[] args) { ... } }` |
| C++ | `std::string __doflow_entry(const std::vector<std::string>& args)` |
| C | `const char* __doflow_entry(int argc, const char* argv[])`

Inside the entrypoint, parse the raw arguments (strings for C / C++ / Java, already-typed objects for JS/Python), call the learner’s visible stub (`twoSum`, `addTwoNumbers`, etc.), and format the return value exactly how your `expectedOutput` strings are stored. Our `ADAPTER_TEMPLATES.md` file contains ready-to-paste scaffolds for common use cases.

If `adapterCode` is empty we fall back to the original contract, so existing problems with direct `solve` implementations still work. Future problems should always provide both fields so the editor can stay clean.

| Language | Required Signature |
|----------|--------------------|
| JavaScript | `function solve(...args)` |
| Python | `def solve(*args)` |
| Java | `class Solution { static Object solve(String[] args) }` |
| C++ | `std::string solve(const std::vector<std::string>& args)` |
| C | `const char* solve(int argc, const char* argv[])` |

**Test Case Input Rules**

- Store each test case input as a JSON array representing the positional arguments: e.g. `[[2,7,11,15], 9]` calls `solve([2,7,11,15], 9)`.
- Legacy `name = value` comma-separated strings (such as `nums = [..], target = 9`) still work, but JSON arrays are the recommended format.
- `expectedOutput` must match the exact string your solution returns (Judge0 compares literal STDOUT). If you return JSON, keep spacing consistent (e.g., `[0,1]`, not `[0, 1]`).

**Run vs Submit**

- **Run** executes only the public test cases and shows every result.
- **Submit** executes public cases first, then hidden ones, and stops immediately on the first failure (revealing that hidden case’s input/output). All runs go through the harness and never execute user-defined `main` functions.

---

## 🔌 Backend API Endpoints

### **Sections**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/dsa/sections` | Create new section | Admin |
| GET | `/api/dsa/sections?courseId=xxx` | Get all sections for a course | Public |
| PUT | `/api/dsa/sections/:id` | Update section | Admin |
| DELETE | `/api/dsa/sections/:id` | Delete section (and all problems) | Admin |

**Create Section Example:**
```json
POST /api/dsa/sections
{
  "title": "Array Problems",
  "courseId": "69221b7d34a1c735a4c255ba",
  "order": 1,
  "description": "Master array manipulation techniques"
}
```

### **Problems**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/dsa/problems` | Create new problem | Admin |
| GET | `/api/dsa/problems?courseId=xxx` | Get all problems for a course | Public |
| GET | `/api/dsa/problems?sectionId=xxx` | Get all problems for a section | Public |
| GET | `/api/dsa/problems/:id` | Get single problem | Public |
| PUT | `/api/dsa/problems/:id` | Update problem | Admin |
| DELETE | `/api/dsa/problems/:id` | Delete problem | Admin |

**Create Problem Example:**
```json
POST /api/dsa/problems
{
  "title": "Two Sum",
  "section": "section_id_here",
  "course": "69221b7d34a1c735a4c255ba",
  "order": 1,
  "difficulty": "Easy",
  "description": "Find two numbers that add up to target...",
  "examples": [
    {
      "input": "[[2,7,11,15], 9]",
      "output": "[0,1]",
      "explanation": "solve receives ([2,7,11,15], 9) and returns the index pair."
    }
  ],
  "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
  "hints": ["Use a hash map", "Think about O(n) solution"],
  "starterCode": [
    {
      "language": "javascript",
      "code": "function solve(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (map.has(need)) return `[${map.get(need)},${i}]`;\n    map.set(nums[i], i);\n  }\n  return '[]';\n}"
    },
    {
      "language": "python",
      "code": "def solve(nums, target):\n    lookup = {}\n    for i, val in enumerate(nums):\n        need = target - val\n        if need in lookup:\n            return f\"[{lookup[need]},{i}]\"\n        lookup[val] = i\n    return '[]'"
    }
  ],
  "testCases": [
    {
      "input": "[[2,7,11,15], 9]",
      "expectedOutput": "[0,1]",
      "isHidden": false
    },
    {
      "input": "[[3,2,4], 6]",
      "expectedOutput": "[1,2]",
      "isHidden": true
    }
  ],
  "leetcodeLink": "https://leetcode.com/problems/two-sum",
  "isFree": true
}
```

---

## 🎨 Admin Dashboard Features

### **Access Admin Panel:**
```
http://localhost:5174/#/admin/dsa-course
```

### **Available Operations:**

#### **1. Course Selection**
- Select your DSA course from the dropdown
- All sections and problems will load dynamically

#### **2. Section Management**
- ✅ **Create Section:** Click "Add Section" button
  - Enter title, order, description
  - Save to database
  
- ✅ **Edit Section:** Click "Edit" button next to section
  - Modify any field
  - Updates in database immediately
  
- ✅ **Delete Section:** Click "Delete" button
  - Confirms before deletion
  - ⚠️ Deletes all problems in that section too

#### **3. Problem Management**
Click on a section to expand and see problems:

- ✅ **Create Problem:** Click "Add Problem" within a section
  - Fill comprehensive form with all fields:
    - Basic info (title, difficulty, description)
    - Examples with explanations
    - Constraints
    - Hints for students
    - Starter code for multiple languages (each with visible/adapters)
    - Test cases (visible and hidden)
    - LeetCode link (optional)
    - Free preview checkbox
  
- ✅ **Edit Problem:** Click "Edit" next to any problem
  - Modify any field
  - Updates instantly in database
  
- ✅ **Delete Problem:** Click "Delete" button
  - Confirms before deletion
  - Problem removed from database

---

## 🚀 How to Add a New DSA Problem (Step-by-Step)

### **Method 1: Via Admin Dashboard (Recommended)**

1. **Login as Admin:**
   ```
   http://localhost:5174/#/auth
   ```

2. **Navigate to DSA Management:**
   ```
   http://localhost:5174/#/admin/dsa-course
   ```

3. **Select Your DSA Course:**
   - Choose "Data Structures & Algorithms Mastery" from dropdown

4. **Create or Select a Section:**
   - If the section doesn't exist, click "Add Section"
   - Otherwise, click on the section name to expand it

5. **Click "Add Problem":**
   - A comprehensive form modal will open

6. **Fill in Problem Details:**
   ```
   Title: Two Sum
   Difficulty: Easy
   Description: Given an array of integers nums and an integer target, 
                return indices of the two numbers that add up to target.
   ```

7. **Add Examples:**
   - Click "Add Example"
  - Input: `[[2,7,11,15], 9]`
   - Output: `[0,1]`
   - Explanation: `Because nums[0] + nums[1] == 9`

8. **Add Constraints:**
   - Click "Add Constraint"
   - `2 <= nums.length <= 10^4`
   - `-10^9 <= nums[i] <= 10^9`

9. **Add Hints:**
   - Click "Add Hint"
   - `Try using a hash map to store complements`

10. **Add Starter Code:**
    - JavaScript is auto-added, add more languages
    - Click "Add Language" for Python, Java, C++, C and keep the `solve` signature. Example:
    ```javascript
    function solve(nums, target) {
      const seen = new Map();
      for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return `[${seen.get(need)},${i}]`;
        seen.set(nums[i], i);
      }
      return '[]';
    }
    ```

11. **Add Test Cases:**
    - Click "Add Test Case"
    - Input: `[[2,7,11,15], 9]`
    - Expected Output: `[0,1]`
    - Check "Hidden" for private test cases

12. **Optional Fields:**
    - LeetCode Link: `https://leetcode.com/problems/two-sum`
    - Check "Is this a free preview problem?" if applicable

13. **Click "Save Problem":**
    - Problem saved to MongoDB
    - Instantly available to students!

---

### **Method 2: Via API (Programmatic)**

Use Postman or any HTTP client:

```bash
POST http://localhost:5000/api/dsa/problems
Headers: {
  "Authorization": "Bearer YOUR_ADMIN_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "title": "Reverse String",
  "section": "SECTION_ID_HERE",
  "course": "69221b7d34a1c735a4c255ba",
  "difficulty": "Easy",
  "description": "Reverse a given string",
  "starterCode": [
    {
      "language": "javascript",
      "code": "function reverseString(s) {\n  // Your code\n}"
    }
  ],
  "testCases": [
    {
      "input": "hello",
      "expectedOutput": "olleh",
      "isHidden": false
    }
  ]
}
```

---

## 📚 Student Experience

Students can now:

1. **Browse Problems:**
   ```
   http://localhost:5174/#/dsa/problems/69221b7d34a1c735a4c255ba
   ```
   - See all sections and problems dynamically loaded from database
   - View difficulty badges
   - See problem counts per section

2. **Solve Problems:**
   ```
   http://localhost:5174/#/dsa/problem/{problem_id}
   ```
   - Read full description with examples
   - View constraints and hints
  - Write code in multiple languages (implementing only `solve`)
  - Run tests (public cases) and submit (public + hidden, stops on first failure)
   - Get instant feedback

---

## 🔒 Security & Access Control

- **Public Access:**
  - View course structure
  - View sections and problems
  - Solve problems (if enrolled or free)

- **Admin Only:**
  - Create/Edit/Delete sections
  - Create/Edit/Delete problems
  - Middleware: `protect` + `admin` in routes

---

## 🎯 Your DSA Course Status

**Current Setup:**
- ✅ Course ID: `69221b7d34a1c735a4c255ba`
- ✅ Title: "Data Structures & Algorithms Mastery"
- ✅ 3 Sections created
- ✅ 10 Sample problems added
- ✅ Full CRUD operations enabled
- ✅ Comprehensive admin UI ready

**Next Steps:**
1. Add more sections (Trees, Graphs, DP, etc.)
2. Add more problems to each section
3. Test the student problem-solving experience
4. Configure Judge0 for code execution (if not already done)

---

## 📞 Support & Maintenance

### **Check Database:**
```bash
# Connect to MongoDB
mongosh "mongodb+srv://your-connection-string"

# View all problems
use test
db.problems.find()

# View all sections
db.roadmapsections.find()
```

### **Backup Problems:**
```bash
# Export problems to JSON
mongoexport --uri="your-connection-string" --collection=problems --out=problems-backup.json
```

### **Bulk Import Problems:**
Create a script in `backend/scripts/` to seed multiple problems at once.

---

## 🎉 Summary

**✅ Everything is Dynamic!**
- No hardcoded problems in code
- All stored in MongoDB database
- Full admin dashboard control
- Complete CRUD operations
- Scalable architecture

**Your admin can now:**
1. Add unlimited DSA problems
2. Organize them into sections
3. Edit any problem details
4. Delete problems when needed
5. Manage everything through the UI

**No more static data!** 🚀
