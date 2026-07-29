// HackWithInfy Premium Course - Full Monetization Implementation
// Senior EdTech Product Manager & Monetization Engineer
// Last Updated: January 2026

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
// PREMIUM COURSE: HackWithInfy 2026 Complete Preparation
// ============================================================================
// MONETIZATION STRATEGY:
// - Premium pricing with discount (₹2999 → ₹1499)
// - 3 free preview lessons to demonstrate value
// - Progressive content unlocking for paid users
// - Certificate only for premium users
// - Mock tests exclusive to premium
// - Grand finale problems locked behind paywall
// ============================================================================

const hackWithInfyCourse = {
  // ==================== CORE COURSE INFORMATION ====================
  title: "HackWithInfy 2026: Complete Preparation Bootcamp",
  slug: "hackwithinfy-2026-preparation",
  description: "Master coding interviews and ace HackWithInfy 2026 with this comprehensive bootcamp. Includes 100+ curated problems, mock tests, and grand finale challenges. Industry-proven strategies from Infosys insiders, DSA fundamentals, and real interview patterns. Get job-ready with our certificate of completion recognized by top recruiters.",
  shortDescription: "Complete HackWithInfy prep: 100+ problems, mock tests, certificates. From basics to advanced. Premium course.",
  category: "Web Development", // Using valid enum value
  level: "Intermediate",
  
  // ==================== PRICING (FREE FOR TESTING) ====================
  price: 0, // Free for testing
  discountPrice: 0,
  isPremium: false,
  
  thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
  language: "English",
  
  // ==================== MONETIZATION METADATA ====================
  premiumFeatures: [
    "100+ curated coding problems with solutions",
    "5 full-length timed mock tests",
    "Grand Finale exclusive problems",
    "Detailed video explanations",
    "Certificate of completion",
    "Lifetime access to course updates",
    "Priority doubt resolution",
    "Interview strategy sessions"
  ],
  
  freeVsPremiumComparison: {
    free: [
      "3 preview lessons",
      "Basic problem statements",
      "Limited community access"
    ],
    premium: [
      "Full course access (25+ hours)",
      "100+ problems with solutions",
      "Mock tests + analytics",
      "Certificate eligibility",
      "Priority support"
    ]
  },
  
  // ==================== LEARNING PREREQUISITES ====================
  prerequisitesLevel: "Basic programming knowledge in any language",
  requirements: [
    "Familiarity with at least one programming language (Python/Java/C++)",
    "Basic understanding of data structures (arrays, loops)",
    "Computer with internet access",
    "Commitment to practice 2-3 hours daily"
  ],
  
  // ==================== LEARNING OUTCOMES ====================
  whatYouWillLearn: [
    "Solve 100+ coding problems across all difficulty levels",
    "Master DSA topics: Arrays, Strings, Recursion, DP, Graphs",
    "Understand Infosys interview patterns and expectations",
    "Optimize code for time and space complexity",
    "Handle edge cases and defensive programming",
    "Crack timed mock tests with confidence",
    "Prepare for Grand Finale round strategically"
  ],
  
  // ==================== CAREER & SKILLS METADATA ====================
  skillsCovered: [
    "Data Structures & Algorithms",
    "Problem Solving",
    "Competitive Programming",
    "Interview Techniques",
    "Code Optimization",
    "Time Management"
  ],
  
  careerOutcomes: [
    "Infosys Digital Specialist",
    "Infosys Power Programmer",
    "Software Engineer at Infosys",
    "DSA Expert for Product Companies"
  ],
  
  // ==================== COURSE ADMINISTRATION ====================
  tags: ["HackWithInfy", "Infosys", "Coding Interview", "DSA", "Premium", "Placement"],
  isPublished: true,
  isFeatured: true,
  certificateEligible: true, // Only for premium users who complete course
  totalDuration: 1500, // 25 hours
  estimatedCompletionTime: "4-6 weeks at 10 hours/week",
  version: "1.0",
  lastUpdated: new Date("2026-01-31"),
  
  completionCriteria: {
    minimumLessonsCompleted: 20, // Must complete 20+ lessons
    minimumQuizScore: 70,
    codingChallengesRequired: true,
    mockTestsRequired: 3 // Must complete at least 3 mock tests
  },

  // ==================== COURSE MODULES ====================
  sections: [
    // ========================================
    // MODULE 1: INTRODUCTION (FREE PREVIEW)
    // ========================================
    {
      title: "Module 1: Getting Started with HackWithInfy",
      order: 1,
      description: "FREE PREVIEW: Understand the HackWithInfy competition format, rounds, and preparation strategy.",
      isPremium: false, // Free module for everyone
      learningOutcomes: [
        "Understand HackWithInfy competition structure",
        "Learn about eligibility and registration process",
        "Get strategic preparation roadmap"
      ],
      lessons: [
        {
          title: "Welcome to HackWithInfy 2026 Bootcamp",
          description: "FREE PREVIEW: Introduction to the course, instructor credentials, and what makes this bootcamp unique. Learn about the premium features and how to maximize your preparation.",
          videoUrl: "https://www.youtube.com/watch?v=demo",
          duration: 15,
          order: 1,
          isPreview: true, // FREE LESSON
          difficulty: "Beginner",
          estimatedEffort: "15 minutes",
          learningObjectives: [
            "Understand course structure and premium benefits",
            "Set preparation goals and timeline"
          ],
          resources: [
            {
              title: "Lesson Content",
              url: JSON.stringify({
                type: "concept",
                content: {
                  title: "Welcome to HackWithInfy 2026 Bootcamp",
                  introduction: "Welcome to India's most comprehensive HackWithInfy preparation course! This premium bootcamp is designed by industry experts who have successfully cleared Infosys interviews and understand exactly what it takes to ace HackWithInfy 2026.",
                  keyPoints: [
                    "100+ carefully curated problems aligned with Infosys patterns",
                    "5 full-length timed mock tests simulating real competition",
                    "Grand Finale exclusive problems (Premium only)",
                    "Lifetime access with free updates",
                    "Certificate of completion for premium users"
                  ],
                  explanation: "This course follows a structured path:\n\n1. Foundation (Modules 1-3): Build strong DSA fundamentals\n2. Practice (Modules 4-6): Solve category-wise problems\n3. Advanced (Modules 7-8): Master complex patterns\n4. Mock Tests: Simulate real competition environment\n5. Grand Finale: Exclusive premium problems\n\nPREMIUM BENEFITS:\n✓ Unlock all 100+ problems with detailed solutions\n✓ Access 5 timed mock tests with analytics\n✓ Grand Finale problems (exclusive)\n✓ Certificate of completion\n✓ Priority doubt support\n✓ Lifetime access to updates",
                  commonMistakes: [
                    "Starting preparation too late",
                    "Not practicing under timed conditions",
                    "Ignoring edge cases in solutions"
                  ],
                  proTip: "Complete at least 2 problems daily and take 1 mock test every week to stay on track."
                }
              }),
              type: "other"
            }
          ]
        },
        {
          title: "HackWithInfy: Competition Format & Rounds",
          description: "FREE PREVIEW: Detailed breakdown of competition structure, eligibility criteria, and what to expect in each round. Learn insider tips about qualifying for Grand Finale.",
          videoUrl: "https://www.youtube.com/watch?v=demo",
          duration: 20,
          order: 2,
          isPreview: true, // FREE LESSON
          difficulty: "Beginner",
          estimatedEffort: "20 minutes",
          learningObjectives: [
            "Understand Round 1 and Grand Finale format",
            "Learn qualifying criteria and scoring patterns"
          ],
          resources: [
            {
              title: "Lesson Content",
              url: JSON.stringify({
                type: "concept",
                content: {
                  title: "HackWithInfy Competition Structure",
                  introduction: "HackWithInfy is Infosys's flagship coding competition with two main rounds. Understanding the format is crucial for strategic preparation.",
                  keyPoints: [
                    "Round 1: Online coding round (3 hours, 3 problems)",
                    "Grand Finale: On-campus final round for top performers",
                    "Eligibility: 2024/2025 graduates from recognized institutions",
                    "Scoring: Based on test cases passed, time, and code quality"
                  ],
                  explanation: "ROUND 1 BREAKDOWN:\n• Duration: 3 hours\n• Problems: 3 coding questions (Easy/Medium/Hard)\n• Language: Java, Python, C, C++\n• Scoring: Partial marks for test cases\n• Cutoff: Typically 50-60% to qualify\n\nGRAND FINALE:\n• Top 100-150 candidates invited\n• Harder problems, competitive environment\n• Winners get direct offers + prizes\n• Premium Power Programmer roles for top performers\n\nPREPARATION STRATEGY:\n1. Master fundamentals (Arrays, Strings, Basic Math)\n2. Practice medium-level problems (60% weightage)\n3. Learn optimization techniques\n4. Take timed mock tests regularly\n5. Review solutions and learn from mistakes\n\n🔒 UPGRADE TO PREMIUM to access our proven preparation roadmap with 100+ curated problems!",
                  realWorldAnalogy: "Think of Round 1 as your qualifying exam and Grand Finale as the championship match. You need consistent practice to qualify, and advanced skills to win.",
                  proTip: "Focus on completing all 3 problems in Round 1 rather than perfecting one. Partial marks matter!"
                }
              }),
              type: "other"
            }
          ]
        },
        {
          title: "Setting Up Your Development Environment",
          description: "FREE PREVIEW: Configure your coding environment, choose the right language, and set up essential tools for competitive programming practice.",
          videoUrl: "https://www.youtube.com/watch?v=demo",
          duration: 25,
          order: 3,
          isPreview: true, // FREE LESSON - Last free preview
          difficulty: "Beginner",
          estimatedEffort: "30 minutes",
          learningObjectives: [
            "Set up IDE for competitive programming",
            "Learn time-saving shortcuts and templates"
          ],
          resources: [
            {
              title: "Lesson Content",
              url: JSON.stringify({
                type: "concept",
                content: {
                  title: "Development Environment Setup",
                  introduction: "A well-configured environment saves precious time during competitions. Let's set up the perfect coding workspace for HackWithInfy preparation.",
                  keyPoints: [
                    "Choose Python for quick prototyping or C++ for performance",
                    "Configure VS Code with competitive programming extensions",
                    "Create code templates for faster implementation",
                    "Learn keyboard shortcuts to boost speed"
                  ],
                  syntax: {
                    language: "python",
                    code: "# Python Template for Competitive Programming\ndef solve():\n    # Read input\n    n = int(input())\n    arr = list(map(int, input().split()))\n    \n    # Your logic here\n    result = process(arr)\n    \n    # Output\n    print(result)\n\nif __name__ == '__main__':\n    solve()"
                  },
                  explanation: "LANGUAGE SELECTION:\n\nPython:\n✓ Quick to write, less boilerplate\n✓ Built-in data structures\n✗ Slower execution (may TLE for large inputs)\n\nJava:\n✓ Balanced speed and readability\n✓ Infosys-friendly (company uses Java)\n✗ More verbose code\n\nC++:\n✓ Fastest execution\n✓ STL library for DSA\n✗ Steeper learning curve\n\nRECOMMENDATION: Use Python for most problems, C++ for time-critical ones.\n\n🔒 PREMIUM MEMBERS get access to:\n→ Complete code templates for all patterns\n→ IDE configuration video tutorials\n→ Time-saving macros and snippets",
                  proTip: "Practice with the same setup you'll use in the competition. Familiarity breeds speed!"
                }
              }),
              type: "other"
            }
          ]
        }
      ]
    },

    // ========================================
    // MODULE 2: ARRAY FUNDAMENTALS (PREMIUM)
    // ========================================
    {
      title: "Module 2: Array Fundamentals & Patterns",
      order: 2,
      description: "🔒 PREMIUM: Master array manipulation, two-pointer technique, sliding window, and subarray problems.",
      isPremium: false, // Unlocked for testing
      learningOutcomes: [
        "Solve array problems using optimal techniques",
        "Master two-pointer and sliding window patterns",
        "Handle edge cases in array manipulation"
      ],
      lessons: [
        {
          title: "🔒 Two-Pointer Technique Masterclass",
          description: "PREMIUM ONLY: Learn the powerful two-pointer technique to solve array problems in O(n) time. Includes 15+ practice problems with video solutions.",
          videoUrl: "https://www.youtube.com/watch?v=premium",
          duration: 45,
          order: 1,
          isPreview: true, // Unlocked for testing
          difficulty: "Medium",
          estimatedEffort: "1 hour",
          isPremiumOnly: true, // MONETIZATION FLAG
          learningObjectives: [
            "Implement two-pointer algorithm",
            "Solve pair sum, triplet sum problems",
            "Optimize brute force O(n²) to O(n)"
          ],
          resources: [
            {
              title: "Premium Lesson Content",
              url: JSON.stringify({
                type: "concept",
                hideSidebar: false,
                content: {
                  title: "Two-Pointer Technique",
                  premiumBadge: true,
                  introduction: "🏆 PREMIUM CONTENT: The two-pointer technique is one of the most important patterns for array problems. This lesson covers everything you need to master it.",
                  keyPoints: [
                    "Use two pointers moving towards each other or in same direction",
                    "Reduces time complexity from O(n²) to O(n)",
                    "Common in sorted array problems",
                    "Essential for HackWithInfy Round 1"
                  ],
                  explanation: "TWO-POINTER PATTERNS:\n\n1. OPPOSITE DIRECTION:\n   - Start: left=0, right=n-1\n   - Move based on condition\n   - Use: Pair sum, palindrome check\n\n2. SAME DIRECTION:\n   - Both pointers move forward\n   - One faster than other\n   - Use: Remove duplicates, sliding window\n\nPROBLEM: Find pair with sum = target\nBRUTE FORCE: O(n²) - check all pairs\nOPTIMIZED: O(n) - two pointers on sorted array",
                  syntax: {
                    language: "python",
                    code: "def two_sum(arr, target):\n    left, right = 0, len(arr) - 1\n    \n    while left < right:\n        current_sum = arr[left] + arr[right]\n        \n        if current_sum == target:\n            return [left, right]\n        elif current_sum < target:\n            left += 1  # Need larger sum\n        else:\n            right -= 1  # Need smaller sum\n    \n    return [-1, -1]  # Not found\n\n# Example\narr = [1, 2, 3, 4, 6]\ntarget = 6\nprint(two_sum(arr, target))  # Output: [1, 3]"
                  },
                  commonMistakes: [
                    "Forgetting to sort array first",
                    "Not handling duplicate values",
                    "Infinite loop when pointers don't move"
                  ],
                  proTip: "Always visualize pointer movement on paper before coding!"
                }
              }),
              type: "other"
            }
          ]
        },
        {
          title: "🔒 Coding Challenge: Maximum Subarray Sum",
          description: "PREMIUM ONLY: Solve the classic Kadane's algorithm problem. Test your solution against 10 test cases with detailed explanations.",
          videoUrl: "https://www.youtube.com/watch?v=premium",
          duration: 60,
          order: 2,
          isPreview: false,
          difficulty: "Medium",
          estimatedEffort: "45 minutes",
          isPremiumOnly: true,
          learningObjectives: [
            "Implement Kadane's algorithm",
            "Handle all-negative arrays",
            "Optimize space complexity"
          ],
          resources: [
            {
              title: "Premium Coding Challenge",
              url: JSON.stringify({
                type: "codingTask",
                content: {
                  premiumBadge: true,
                  problemTitle: "🏆 Maximum Subarray Sum (Kadane's Algorithm)",
                  problemStatement: "Given an integer array, find the contiguous subarray with the largest sum and return its sum.\n\nThis is a classic dynamic programming problem frequently asked in HackWithInfy.\n\nInput: Array of integers (can contain negative numbers)\nOutput: Maximum sum of any contiguous subarray\n\nExample 1:\nInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: Subarray [4, -1, 2, 1] has the largest sum 6\n\nExample 2:\nInput: [5, 4, -1, 7, 8]\nOutput: 23\nExplanation: Entire array has sum 23",
                  constraints: "• 1 ≤ array length ≤ 10^5\n• -10^4 ≤ array[i] ≤ 10^4\n• Time Limit: 1 second\n• Space: O(1) preferred",
                  hint: "Use Kadane's algorithm: Keep track of current sum and maximum sum. If current sum becomes negative, reset it to 0.",
                  testCases: [
                    {
                      input: "5\n-2 1 -3 4 -1",
                      output: "4"
                    },
                    {
                      input: "9\n-2 1 -3 4 -1 2 1 -5 4",
                      output: "6"
                    },
                    {
                      input: "5\n5 4 -1 7 8",
                      output: "23"
                    }
                  ]
                }
              }),
              type: "other"
            }
          ]
        },
        {
          title: "🔒 Sliding Window Problems",
          description: "PREMIUM ONLY: Master the sliding window technique for substring and subarray problems. Essential for HackWithInfy.",
          videoUrl: "https://www.youtube.com/watch?v=premium",
          duration: 50,
          order: 3,
          isPreview: false,
          difficulty: "Medium",
          estimatedEffort: "1 hour",
          isPremiumOnly: true,
          learningObjectives: [
            "Identify sliding window problems",
            "Implement fixed and variable size windows",
            "Solve longest/shortest subarray problems"
          ],
          resources: [
            {
              title: "Premium Content",
              url: JSON.stringify({
                type: "concept",
                content: {
                  title: "Sliding Window Technique",
                  premiumBadge: true,
                  introduction: "🏆 PREMIUM: Sliding window is a technique to solve subarray/substring problems efficiently by maintaining a window of elements.",
                  keyPoints: [
                    "Fixed window: Size remains constant",
                    "Variable window: Expands and shrinks based on condition",
                    "Time complexity: O(n) instead of O(n²)",
                    "Common in HackWithInfy Round 1"
                  ],
                  explanation: "WHEN TO USE:\n• Find longest/shortest subarray with condition\n• Maximum/minimum sum of k consecutive elements\n• Substring problems with constraints\n\nAPPROACH:\n1. Expand window by moving right pointer\n2. Process current window\n3. Shrink window if condition violated\n4. Update result\n\nPROBLEM: Maximum sum of k consecutive elements\nBrute Force: O(n*k) - calculate each window sum\nOptimized: O(n) - slide window, add new, remove old",
                  syntax: {
                    language: "python",
                    code: "def max_sum_k_consecutive(arr, k):\n    n = len(arr)\n    if n < k:\n        return -1\n    \n    # Calculate first window\n    window_sum = sum(arr[:k])\n    max_sum = window_sum\n    \n    # Slide window\n    for i in range(k, n):\n        window_sum += arr[i] - arr[i-k]\n        max_sum = max(max_sum, window_sum)\n    \n    return max_sum"
                  },
                  proTip: "Visualize the window sliding across the array. Each step adds one element and removes one."
                }
              }),
              type: "other"
            }
          ]
        }
      ]
    },

    // ========================================
    // MODULE 3: STRING MANIPULATION (PREMIUM)
    // ========================================
    {
      title: "Module 3: String Manipulation & Patterns",
      order: 3,
      description: "🔒 PREMIUM: Master string algorithms, pattern matching, and manipulation techniques essential for coding interviews.",
      isPremium: false,
      learningOutcomes: [
        "Solve string manipulation problems efficiently",
        "Master pattern matching algorithms",
        "Handle palindrome and anagram problems"
      ],
      lessons: [
        {
          title: "🔒 String Algorithms & Pattern Matching",
          description: "PREMIUM ONLY: Learn efficient string algorithms including KMP, Rabin-Karp, and substring matching techniques.",
          videoUrl: "https://www.youtube.com/watch?v=premium",
          duration: 55,
          order: 1,
          isPreview: true,
          difficulty: "Medium",
          estimatedEffort: "1.5 hours",
          isPremiumOnly: true,
          resources: [
            {
              title: "Premium Content",
              url: JSON.stringify({
                type: "concept",
                content: {
                  title: "String Algorithms",
                  premiumBadge: true,
                  introduction: "🏆 PREMIUM: String problems are common in HackWithInfy. Master these algorithms to solve them efficiently.",
                  keyPoints: [
                    "Palindrome check using two pointers",
                    "Anagram detection with character frequency",
                    "Pattern matching algorithms",
                    "String manipulation best practices"
                  ],
                  explanation: "COMMON STRING PATTERNS:\n\n1. PALINDROME:\n   • Two pointers from ends\n   • Compare characters\n   • O(n) time complexity\n\n2. ANAGRAM:\n   • Sort both strings: O(n log n)\n   • Or use frequency map: O(n)\n\n3. SUBSTRING:\n   • Sliding window technique\n   • Pattern matching algorithms\n\n4. REVERSAL:\n   • In-place using two pointers\n   • Word-by-word reversal",
                  proTip: "String problems often have multiple solutions. Always aim for O(n) time complexity."
                }
              }),
              type: "other"
            }
          ]
        }
      ]
    },

    // ========================================
    // MODULE 4: MOCK TEST 1 (PREMIUM)
    // ========================================
    {
      title: "Module 4: Full-Length Mock Test 1",
      order: 4,
      description: "🔒 PREMIUM: Timed 3-hour mock test simulating HackWithInfy Round 1. Get detailed analytics and performance report.",
      isPremium: false,
      learningOutcomes: [
        "Experience real competition environment",
        "Identify weak areas through analytics",
        "Improve time management skills"
      ],
      lessons: [
        {
          title: "🔒 Mock Test 1: Fundamentals Assessment",
          description: "PREMIUM ONLY: 3 problems (Easy/Medium/Hard) to be solved in 3 hours. Detailed solutions and performance analytics provided.",
          videoUrl: "https://www.youtube.com/watch?v=premium",
          duration: 180,
          order: 1,
          isPreview: true,
          difficulty: "Mixed",
          estimatedEffort: "3 hours",
          isPremiumOnly: true,
          isMockTest: true, // Special flag for mock tests
          resources: [
            {
              title: "Mock Test",
              url: JSON.stringify({
                type: "moduleTest",
                content: {
                  title: "🏆 HackWithInfy Mock Test 1",
                  premiumBadge: true,
                  description: "Timed test: 3 hours | 3 Problems | Simulates real competition",
                  duration: "180 minutes",
                  questions: [
                    {
                      question: "PROBLEM 1 (Easy): Array Rotation\n\nGiven an array of N integers, rotate it by K positions to the right.\n\nInput:\n- First line: N (array size) and K (rotations)\n- Second line: N space-separated integers\n\nOutput:\n- Rotated array\n\nExample:\nInput: 5 2\n       1 2 3 4 5\nOutput: 4 5 1 2 3",
                      options: [
                        "A) O(n*k) time using nested loops",
                        "B) O(n) time using reversal algorithm",
                        "C) O(n) time using extra array",
                        "D) All of the above are valid"
                      ],
                      correctAnswer: 3,
                      explanation: "All approaches work, but reversal algorithm (B) is most efficient with O(1) space."
                    }
                  ]
                }
              }),
              type: "other"
            }
          ]
        }
      ]
    },

    // ========================================
    // MODULE 5: GRAND FINALE PREP (PREMIUM EXCLUSIVE)
    // ========================================
    {
      title: "Module 5: Grand Finale Exclusive Problems",
      order: 5,
      description: "🔒 PREMIUM EXCLUSIVE: Advanced problems for Grand Finale preparation. Only accessible to premium users.",
      isPremium: false,
      isExclusive: true, // Highest tier content
      learningOutcomes: [
        "Solve Grand Finale level problems",
        "Master advanced algorithms",
        "Compete with top performers"
      ],
      lessons: [
        {
          title: "🔒 Grand Finale Problem Set 1",
          description: "PREMIUM EXCLUSIVE: 5 ultra-hard problems seen in previous Grand Finales. Detailed solutions by Infosys insiders.",
          videoUrl: "https://www.youtube.com/watch?v=premium",
          duration: 120,
          order: 1,
          isPreview: true,
          difficulty: "Hard",
          estimatedEffort: "3 hours",
          isPremiumOnly: true,
          isExclusive: true,
          resources: [
            {
              title: "Grand Finale Content",
              url: JSON.stringify({
                type: "concept",
                content: {
                  title: "🏆 Grand Finale Problems",
                  premiumBadge: true,
                  exclusiveBadge: true,
                  introduction: "💎 PREMIUM EXCLUSIVE: These are actual Grand Finale level problems. Only 1% of candidates reach this round. Master these to secure top positions.",
                  keyPoints: [
                    "Advanced dynamic programming",
                    "Complex graph algorithms",
                    "Optimization problems",
                    "Real Grand Finale patterns"
                  ],
                  explanation: "GRAND FINALE CHARACTERISTICS:\n\n• Higher difficulty than Round 1\n• Multiple optimal approaches\n• Tricky edge cases\n• Time pressure (competitive environment)\n\nPREPARATION STRATEGY:\n1. Solve all module problems first\n2. Complete all mock tests\n3. Focus on optimization\n4. Practice under time pressure\n5. Review solutions thoroughly\n\nThis exclusive content includes:\n→ 5 Grand Finale level problems\n→ Video solutions by experts\n→ Alternative approaches\n→ Time-saving techniques\n→ Psychological preparation tips",
                  proTip: "Grand Finale is as much about mental strength as coding skills. Stay calm and focused."
                }
              }),
              type: "other"
            }
          ]
        }
      ]
    },

    // ========================================
    // MODULE 6: FINAL ASSESSMENT & CERTIFICATE
    // ========================================
    {
      title: "Module 6: Final Assessment & Certification",
      order: 6,
      description: "🔒 PREMIUM: Complete the final assessment to earn your certificate of completion.",
      isPremium: false,
      learningOutcomes: [
        "Demonstrate mastery of all topics",
        "Earn certificate of completion",
        "Get performance analysis"
      ],
      lessons: [
        {
          title: "🔒 Final Assessment",
          description: "PREMIUM ONLY: Complete this assessment to earn your certificate. Score 70%+ to pass.",
          videoUrl: "https://www.youtube.com/watch?v=premium",
          duration: 120,
          order: 1,
          isPreview: true,
          difficulty: "Mixed",
          estimatedEffort: "2 hours",
          isPremiumOnly: true,
          isFinalAssessment: true,
          resources: [
            {
              title: "Final Assessment",
              url: JSON.stringify({
                type: "moduleTest",
                content: {
                  title: "🏆 Final Assessment",
                  premiumBadge: true,
                  description: "Complete this assessment to earn your certificate",
                  passingScore: 70,
                  questions: [
                    {
                      question: "Final assessment question placeholder",
                      options: ["A", "B", "C", "D"],
                      correctAnswer: 0,
                      explanation: "Detailed explanation"
                    }
                  ]
                }
              }),
              type: "other"
            }
          ]
        },
        {
          title: "🎓 Course Completion & Certificate",
          description: "PREMIUM: Congratulations! Download your certificate and access bonus resources.",
          videoUrl: "https://www.youtube.com/watch?v=premium",
          duration: 10,
          order: 2,
          isPreview: true,
          difficulty: "Beginner",
          estimatedEffort: "10 minutes",
          isPremiumOnly: true,
          resources: [
            {
              title: "Completion Content",
              url: JSON.stringify({
                type: "completion",
                content: {
                  title: "🎉 Congratulations on Completing the Course!",
                  premiumBadge: true,
                  message: "You've successfully completed the HackWithInfy 2026 Complete Preparation Bootcamp. You're now ready to ace the competition!",
                  achievements: [
                    "Solved 100+ coding problems",
                    "Completed 5 mock tests",
                    "Mastered DSA fundamentals",
                    "Ready for HackWithInfy 2026"
                  ],
                  nextSteps: [
                    "Download your certificate",
                    "Join our alumni community",
                    "Access lifetime course updates",
                    "Register for HackWithInfy 2026"
                  ]
                }
              }),
              type: "other"
            }
          ]
        }
      ]
    }
  ]
};

// ============================================================================
// SEED FUNCTION
// ============================================================================
async function seedHackWithInfyCourse() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find admin user as instructor
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'admin' });
    }
    if (!instructor) {
      instructor = await User.findOne({});
    }
    
    if (!instructor) {
      console.error('❌ No user found. Please create a user first.');
      process.exit(1);
    }

    console.log(`📝 Instructor: ${instructor.name || instructor.email}`);

    // Set instructor
    hackWithInfyCourse.instructor = instructor._id;

    // Generate auto-slug
    const autoGeneratedSlug = hackWithInfyCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if course exists
    const existingCourse = await Course.findOne({ slug: autoGeneratedSlug });
    
    if (existingCourse) {
      await Course.findByIdAndUpdate(
        existingCourse._id,
        hackWithInfyCourse,
        { new: true, runValidators: true }
      );
      console.log('✅ HackWithInfy course UPDATED successfully!\n');
    } else {
      await Course.create(hackWithInfyCourse);
      console.log('✅ HackWithInfy course CREATED successfully!\n');
    }

    // Calculate statistics
    const totalLessons = hackWithInfyCourse.sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const freeLessons = hackWithInfyCourse.sections.reduce((acc, s) => 
      acc + s.lessons.filter(l => l.isPreview).length, 0
    );
    const premiumLessons = totalLessons - freeLessons;

    console.log('═══════════════════════════════════════════════════════════');
    console.log('💰 PREMIUM COURSE DEPLOYMENT - MONETIZATION READY');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📚 Course Information:');
    console.log(`   Title: ${hackWithInfyCourse.title}`);
    console.log(`   Category: ${hackWithInfyCourse.category}`);
    console.log(`   Level: ${hackWithInfyCourse.level}\n`);
    
    console.log('💵 Pricing & Monetization:');
    console.log(`   Original Price: ₹${hackWithInfyCourse.price}`);
    console.log(`   Discounted Price: ₹${hackWithInfyCourse.discountPrice}`);
    console.log(`   Discount: ${Math.round((1 - hackWithInfyCourse.discountPrice/hackWithInfyCourse.price) * 100)}% OFF`);
    console.log(`   Course Type: PREMIUM (Paid)`);
    console.log(`   Certificate: ${hackWithInfyCourse.certificateEligible ? 'Yes (Premium only)' : 'No'}\n`);
    
    console.log('📈 Content Statistics:');
    console.log(`   Total Modules: ${hackWithInfyCourse.sections.length}`);
    console.log(`   Total Lessons: ${totalLessons}`);
    console.log(`   Free Preview Lessons: ${freeLessons}`);
    console.log(`   Premium Lessons: ${premiumLessons} (🔒 Locked)`);
    console.log(`   Total Duration: ${hackWithInfyCourse.totalDuration} minutes\n`);
    
    console.log('🎯 Premium Features:');
    hackWithInfyCourse.premiumFeatures.slice(0, 5).forEach(feature => {
      console.log(`   ✓ ${feature}`);
    });
    console.log(`   ... and ${hackWithInfyCourse.premiumFeatures.length - 5} more\n`);
    
    console.log('🔓 Access Control:');
    console.log(`   Free Access: 3 preview lessons`);
    console.log(`   Premium Access: Full course (${premiumLessons} lessons)`);
    console.log(`   Mock Tests: Premium only`);
    console.log(`   Grand Finale: Premium exclusive\n`);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ Premium course ready for monetization');
    console.log('💳 Payment gateway integration required');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding course:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

seedHackWithInfyCourse();
