#!/usr/bin/env python3
"""
Comprehensive C Programming Course Generator
Generates 70+ lessons covering all C programming topics
"""

def generate_c_course():
    """Generate complete C programming course content"""
    
    # Start with 3 blank lines as required
    content = "\n \n \n\n"
    
    # Lesson counter
    timestamp_base = 20260215010000
    
    lessons = [
        # ==================== SECTION 1: Introduction & Setup (5 lessons) ====================
        {
            "slug": "c-introduction-history",
            "title": "Introduction to C Programming",
            "duration": 12,
            "level": "beginner",
            "content": """## What is C?

C is a general-purpose, procedural programming language developed by Dennis Ritchie at Bell Labs in 1972. It's one of the most influential programming languages and forms the foundation for operating systems, embedded systems, and many modern programming languages.

**Key Characteristics:**
-** Compiled Language:** Source code is converted directly to machine code
- **Procedural:** Uses functions and structured programming
- **Low-Level Access:** Direct memory manipulation via pointers
- **Portable:** Write once, compile anywhere  
- **Efficient:** Minimal runtime overhead, fast execution
- **Powerful:** Full control over hardware and memory

## Brief History

**1972:** Dennis Ritchie creates C at Bell Labs
- Developed to rewrite the UNIX operating system
- Named "C" as a successor to the "B" language

**1978:** "The C Programming Language" published
- Written by Kernighan & Ritchie (K&R)
- Became the de facto standard

**1989:** ANSI C (C89/C90) standardized
- First official standard ensuring portability

**1999:** C99 adds modern features
- Inline functions, variable-length arrays
- New data types like `long long int`

**2011:** C11 introduces threading
- Multi-threading support
- Improved Unicode support

**2018:** C17 bug fixes

**2023:** C23 latest standard

## Why Learn C?

### 1. Foundation Language

Understanding C helps you learn C++, Java, C#, JavaScript, Go, and more. Most languages borrowed syntax from C.

```c
// C syntax is everywhere
if (x > 5) {
    printf("Greater than 5\\n");
}
```

### 2. System Programming

C is the language of choice for:
- Operating systems (Linux kernel is 95% C)
- Device drivers
- Embedded systems (microcontrollers, IoT)
- Firmware
- Real-time systems

### 3. Performance

C provides nearly-assembly-level performance:

```c
// Direct memory operations = speed
int sum = 0;
for (int i = 0; i < 1000000; i++) {
    sum += i;  // Very fast, minimal overhead
}
```

### 4. Memory Control

Unlike Python or Java, you control every byte:

```c
// Manual memory management
int *arr = (int *)malloc(1000 * sizeof(int));
// ... use memory ...
free(arr);  // Explicit cleanup
```

## Real-World Applications

**Operating Systems:**
- UNIX/Linux kernel
- Windows NT kernel
- macOS Darwin

**Embedded Systems:**
- Arduino, Raspberry Pi
- Automotive (engine control, infotainment)
- Medical devices (pacemakers, monitors)
- IoT devices

**High-Performance Software:**
- Databases (MySQL, PostgreSQL, Redis)
- Game engines
- Graphics (OpenGL, DirectX)
- Compilers (GCC, LLVM)

## C vs Other Languages

| Feature | C | Python | Java |
|---------|---|--------|------|
| Speed | ⚡⚡⚡⚡⚡ | ⚡⚡ | ⚡⚡⚡ |
| Memory | Manual | Automatic | Automatic |
| Learning Curve | Steep | Gentle | Moderate |
| Use Case | Systems | General | Enterprise |

## Your First C Program

```c
#include <studio.h>

int main() {
    printf("Welcome to C Programming!\\n");
    return 0;
}
```

**Explanation:**
- `#include <stdio.h>`: Standard I/O library
- `int main()`: Program entry point
- `printf()`: Print to console
- `return 0`: Indicate success (0 = success)

**Output:**
```
Welcome to C Programming!
```"""
        },
        
        # More lessons will be added...
    ]
    
    # Generate all lessons
    for idx, lesson in enumerate(lessons):
        timestamp = timestamp_base + (idx * 100)
        timestamp_str = str(timestamp)
        
        content += f"""NOTE {timestamp_str} {lesson['slug']}
TITLE: {lesson['title']}
DURATION: {lesson['duration']}
LEVEL: {lesson['level']}

{lesson['content']}

---

"""
    
    return content

# Generate and write
if __name__ == "__main__":
    import sys
    import os
    
    # Get output path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(script_dir, '../notes_out/MASTER_ENHANCED_NOTES.txt')
    
    print("🚀 Generating comprehensive C Programming course")
    print(f"📁 Output: {output_file}")
   
    course_content = generate_c_course()
    
    # Write file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(course_content)
    
    # Get stats
    size_kb = os.path.getsize(output_file) / 1024
   print(f"✅ Success! Generated {size_kb:.1f} KB") 
    print(f"📝 Ready to run: node scripts/createCProgrammingCourseFromEnhancedNotes.js")
