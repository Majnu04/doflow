import mongoose from 'mongoose';
import Roadmap from '../models/Roadmap.js';
import dotenv from 'dotenv';

dotenv.config();

const dsaProblems = {
  basic: [
    { title: 'Two Sum', difficulty: 'easy', description: 'Find two numbers that add up to a target value' },
    { title: 'Reverse String', difficulty: 'easy', description: 'Reverse a given string' },
    { title: 'Valid Palindrome', difficulty: 'easy', description: 'Check if a string is a palindrome' },
    { title: 'Find Maximum in Array', difficulty: 'easy', description: 'Find the maximum element in an array' },
    { title: 'Remove Duplicates from Sorted Array', difficulty: 'easy', description: 'Remove duplicates in-place from a sorted array' },
    { title: 'Move Zeroes', difficulty: 'easy', description: 'Move all zeros to the end of array' },
    { title: 'Single Number', difficulty: 'easy', description: 'Find the element that appears only once' },
    { title: 'Contains Duplicate', difficulty: 'easy', description: 'Check if array contains duplicates' },
    { title: 'Rotate Array', difficulty: 'easy', description: 'Rotate array by k steps' },
    { title: 'Best Time to Buy and Sell Stock', difficulty: 'easy', description: 'Find maximum profit from stock prices' },
    { title: 'Valid Anagram', difficulty: 'easy', description: 'Check if two strings are anagrams' },
    { title: 'First Unique Character in String', difficulty: 'easy', description: 'Find first non-repeating character' },
    { title: 'Intersection of Two Arrays', difficulty: 'easy', description: 'Find intersection of two arrays' },
    { title: 'Plus One', difficulty: 'easy', description: 'Add one to number represented as array' },
    { title: 'Missing Number', difficulty: 'easy', description: 'Find missing number in array from 0 to n' },
    { title: 'Climbing Stairs', difficulty: 'easy', description: 'Count distinct ways to climb n stairs' },
    { title: 'Merge Sorted Array', difficulty: 'easy', description: 'Merge two sorted arrays' },
    { title: 'Reverse Linked List', difficulty: 'easy', description: 'Reverse a singly linked list' },
    { title: 'Linked List Cycle', difficulty: 'easy', description: 'Detect if linked list has a cycle' },
    { title: 'Remove Linked List Elements', difficulty: 'easy', description: 'Remove all elements with given value' },
    { title: 'Middle of Linked List', difficulty: 'easy', description: 'Find middle node of linked list' },
    { title: 'Binary Search', difficulty: 'easy', description: 'Search for target in sorted array' },
    { title: 'Valid Parentheses', difficulty: 'easy', description: 'Check if parentheses are valid' },
    { title: 'Implement Queue using Stacks', difficulty: 'easy', description: 'Implement queue using two stacks' },
    { title: 'Implement Stack using Queues', difficulty: 'easy', description: 'Implement stack using queues' },
    { title: 'Min Stack', difficulty: 'easy', description: 'Design stack with constant time min operation' },
    { title: 'Invert Binary Tree', difficulty: 'easy', description: 'Invert a binary tree' },
    { title: 'Maximum Depth of Binary Tree', difficulty: 'easy', description: 'Find maximum depth of tree' },
    { title: 'Symmetric Tree', difficulty: 'easy', description: 'Check if tree is symmetric' },
    { title: 'Same Tree', difficulty: 'easy', description: 'Check if two trees are identical' },
    { title: 'Path Sum', difficulty: 'easy', description: 'Check if root-to-leaf path sum exists' },
    { title: 'Merge Two Sorted Lists', difficulty: 'easy', description: 'Merge two sorted linked lists' },
    { title: 'Palindrome Linked List', difficulty: 'easy', description: 'Check if linked list is palindrome' },
    { title: 'Sqrt(x)', difficulty: 'easy', description: 'Compute square root of x' },
    { title: 'Power of Two', difficulty: 'easy', description: 'Check if number is power of two' },
    { title: 'Fizz Buzz', difficulty: 'easy', description: 'Classic FizzBuzz problem' },
    { title: 'Happy Number', difficulty: 'easy', description: 'Determine if number is happy' },
    { title: 'Isomorphic Strings', difficulty: 'easy', description: 'Check if two strings are isomorphic' },
    { title: 'Word Pattern', difficulty: 'easy', description: 'Check if string follows pattern' },
    { title: 'Range Sum Query - Immutable', difficulty: 'easy', description: 'Calculate sum of elements in range' },
    { title: 'Power of Three', difficulty: 'easy', description: 'Check if number is power of three' },
    { title: 'Count Primes', difficulty: 'easy', description: 'Count prime numbers less than n' },
    { title: 'Reverse Bits', difficulty: 'easy', description: 'Reverse bits of unsigned integer' },
    { title: 'Number of 1 Bits', difficulty: 'easy', description: 'Count set bits in integer' },
    { title: 'House Robber', difficulty: 'easy', description: 'Maximum money that can be robbed' }
  ],
  intermediate: [
    { title: '3Sum', difficulty: 'medium', description: 'Find three numbers that sum to zero' },
    { title: 'Container With Most Water', difficulty: 'medium', description: 'Find container with most water' },
    { title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', description: 'Find longest substring without repeating characters' },
    { title: 'Longest Palindromic Substring', difficulty: 'medium', description: 'Find longest palindromic substring' },
    { title: 'Zigzag Conversion', difficulty: 'medium', description: 'Convert string in zigzag pattern' },
    { title: 'String to Integer (atoi)', difficulty: 'medium', description: 'Implement atoi function' },
    { title: 'Generate Parentheses', difficulty: 'medium', description: 'Generate all valid parentheses combinations' },
    { title: 'Permutations', difficulty: 'medium', description: 'Generate all permutations of array' },
    { title: 'Subsets', difficulty: 'medium', description: 'Generate all subsets of array' },
    { title: 'Word Search', difficulty: 'medium', description: 'Search word in 2D board' },
    { title: 'Jump Game', difficulty: 'medium', description: 'Check if can reach last index' },
    { title: 'Unique Paths', difficulty: 'medium', description: 'Count unique paths in grid' },
    { title: 'Coin Change', difficulty: 'medium', description: 'Minimum coins needed for amount' },
    { title: 'Longest Increasing Subsequence', difficulty: 'medium', description: 'Find longest increasing subsequence' },
    { title: 'Product of Array Except Self', difficulty: 'medium', description: 'Product of array except self' },
    { title: 'Search in Rotated Sorted Array', difficulty: 'medium', description: 'Search in rotated sorted array' },
    { title: 'Find Minimum in Rotated Sorted Array', difficulty: 'medium', description: 'Find minimum in rotated array' },
    { title: 'Maximum Subarray', difficulty: 'medium', description: 'Find contiguous subarray with largest sum' },
    { title: 'Spiral Matrix', difficulty: 'medium', description: 'Return spiral order of matrix' },
    { title: 'Rotate Image', difficulty: 'medium', description: 'Rotate matrix 90 degrees' },
    { title: 'Set Matrix Zeroes', difficulty: 'medium', description: 'Set row and column to zeros' },
    { title: 'Group Anagrams', difficulty: 'medium', description: 'Group strings that are anagrams' },
    { title: 'Longest Consecutive Sequence', difficulty: 'medium', description: 'Find longest consecutive sequence' },
    { title: 'Add Two Numbers', difficulty: 'medium', description: 'Add two numbers represented as linked lists' },
    { title: 'Merge Intervals', difficulty: 'medium', description: 'Merge overlapping intervals' },
    { title: 'Insert Interval', difficulty: 'medium', description: 'Insert interval and merge if necessary' },
    { title: 'Sort Colors', difficulty: 'medium', description: 'Sort array with three colors' },
    { title: 'Kth Largest Element', difficulty: 'medium', description: 'Find kth largest element' },
    { title: 'Top K Frequent Elements', difficulty: 'medium', description: 'Find k most frequent elements' },
    { title: 'Daily Temperatures', difficulty: 'medium', description: 'Days until warmer temperature' },
    { title: 'Evaluate Reverse Polish Notation', difficulty: 'medium', description: 'Evaluate RPN expression' },
    { title: 'Binary Tree Level Order Traversal', difficulty: 'medium', description: 'Level order traversal of tree' },
    { title: 'Binary Tree Zigzag Level Order', difficulty: 'medium', description: 'Zigzag level order traversal' },
    { title: 'Validate Binary Search Tree', difficulty: 'medium', description: 'Check if tree is valid BST' },
    { title: 'Kth Smallest in BST', difficulty: 'medium', description: 'Find kth smallest element in BST' },
    { title: 'Lowest Common Ancestor of BST', difficulty: 'medium', description: 'Find LCA in BST' },
    { title: 'Binary Tree Right Side View', difficulty: 'medium', description: 'Return right side view of tree' },
    { title: 'Count Good Nodes in Binary Tree', difficulty: 'medium', description: 'Count good nodes in tree' },
    { title: 'Construct Binary Tree', difficulty: 'medium', description: 'Construct tree from traversals' },
    { title: 'Path Sum II', difficulty: 'medium', description: 'Find all root-to-leaf paths with sum' },
    { title: 'Flatten Binary Tree', difficulty: 'medium', description: 'Flatten tree to linked list' },
    { title: 'Clone Graph', difficulty: 'medium', description: 'Deep copy of undirected graph' },
    { title: 'Course Schedule', difficulty: 'medium', description: 'Check if can finish all courses' },
    { title: 'Number of Islands', difficulty: 'medium', description: 'Count number of islands in grid' },
    { title: 'Pacific Atlantic Water Flow', difficulty: 'medium', description: 'Find cells that can flow to both oceans' },
    { title: 'Letter Combinations of Phone Number', difficulty: 'medium', description: 'Generate letter combinations' },
    { title: 'Combination Sum', difficulty: 'medium', description: 'Find all combinations that sum to target' },
    { title: 'Palindrome Partitioning', difficulty: 'medium', description: 'Partition string into palindromes' },
    { title: 'N-Queens', difficulty: 'medium', description: 'Place N queens on board' },
    { title: 'House Robber II', difficulty: 'medium', description: 'Houses arranged in circle' },
    { title: 'Decode Ways', difficulty: 'medium', description: 'Number of ways to decode string' },
    { title: 'Unique Binary Search Trees', difficulty: 'medium', description: 'Count structurally unique BSTs' },
    { title: 'Partition Equal Subset Sum', difficulty: 'medium', description: 'Check if can partition into equal subsets' },
    { title: 'Word Break', difficulty: 'medium', description: 'Check if string can be segmented' },
    { title: 'Longest Common Subsequence', difficulty: 'medium', description: 'Find LCS of two strings' },
    { title: 'Edit Distance', difficulty: 'medium', description: 'Minimum operations to convert strings' },
    { title: 'Target Sum', difficulty: 'medium', description: 'Ways to assign symbols to reach target' },
    { title: 'Interleaving String', difficulty: 'medium', description: 'Check if s3 is interleaving of s1 and s2' },
    { title: 'Maximum Product Subarray', difficulty: 'medium', description: 'Find contiguous subarray with largest product' },
    { title: 'Design Add and Search Words Data Structure', difficulty: 'medium', description: 'Design data structure for word dictionary' }
  ],
  advanced: [
    { title: 'Median of Two Sorted Arrays', difficulty: 'hard', description: 'Find median of two sorted arrays' },
    { title: 'Regular Expression Matching', difficulty: 'hard', description: 'Implement regex matching with . and *' },
    { title: 'Wildcard Matching', difficulty: 'hard', description: 'Implement wildcard pattern matching' },
    { title: 'Trapping Rain Water', difficulty: 'hard', description: 'Calculate trapped rain water' },
    { title: 'First Missing Positive', difficulty: 'hard', description: 'Find smallest missing positive integer' },
    { title: 'Jump Game II', difficulty: 'hard', description: 'Minimum jumps to reach end' },
    { title: 'N-Queens II', difficulty: 'hard', description: 'Count distinct N-Queens solutions' },
    { title: 'Edit Distance', difficulty: 'hard', description: 'Minimum operations to convert one word to another' },
    { title: 'Minimum Window Substring', difficulty: 'hard', description: 'Find minimum window containing all characters' },
    { title: 'Largest Rectangle in Histogram', difficulty: 'hard', description: 'Find largest rectangle in histogram' },
    { title: 'Maximal Rectangle', difficulty: 'hard', description: 'Find maximal rectangle in binary matrix' },
    { title: 'Binary Tree Maximum Path Sum', difficulty: 'hard', description: 'Find maximum path sum in tree' },
    { title: 'Word Ladder', difficulty: 'hard', description: 'Transform one word to another' },
    { title: 'Word Ladder II', difficulty: 'hard', description: 'Find all shortest transformation sequences' },
    { title: 'Sudoku Solver', difficulty: 'hard', description: 'Solve Sudoku puzzle' },
    { title: 'Merge k Sorted Lists', difficulty: 'hard', description: 'Merge k sorted linked lists' },
    { title: 'Reverse Nodes in k-Group', difficulty: 'hard', description: 'Reverse linked list in groups of k' },
    { title: 'Sliding Window Maximum', difficulty: 'hard', description: 'Find maximum in sliding window' },
    { title: 'Serialize and Deserialize Binary Tree', difficulty: 'hard', description: 'Serialize and deserialize tree' },
    { title: 'Find Median from Data Stream', difficulty: 'hard', description: 'Find median from data stream' },
    { title: 'LRU Cache', difficulty: 'hard', description: 'Implement LRU cache' },
    { title: 'LFU Cache', difficulty: 'hard', description: 'Implement LFU cache' },
    { title: 'Alien Dictionary', difficulty: 'hard', description: 'Derive order of alien language' },
    { title: 'Critical Connections in Network', difficulty: 'hard', description: 'Find critical connections' },
    { title: 'Shortest Path in Grid with Obstacles', difficulty: 'hard', description: 'Find shortest path with obstacle elimination' },
    { title: 'Count of Smaller Numbers After Self', difficulty: 'hard', description: 'Count smaller numbers after self' },
    { title: 'Burst Balloons', difficulty: 'hard', description: 'Maximize coins by bursting balloons' },
    { title: 'Dungeon Game', difficulty: 'hard', description: 'Minimum initial health to save princess' },
    { title: 'Best Time to Buy and Sell Stock IV', difficulty: 'hard', description: 'Maximum profit with k transactions' },
    { title: 'Maximum Sum of 3 Non-Overlapping Subarrays', difficulty: 'hard', description: 'Find three non-overlapping subarrays' },
    { title: 'Distinct Subsequences', difficulty: 'hard', description: 'Count distinct subsequences' },
    { title: 'Scramble String', difficulty: 'hard', description: 'Check if string is scrambled version' },
    { title: 'Palindrome Partitioning II', difficulty: 'hard', description: 'Minimum cuts for palindrome partitioning' },
    { title: 'Word Break II', difficulty: 'hard', description: 'All possible sentences from word break' },
    { title: 'Minimum Cost to Merge Stones', difficulty: 'hard', description: 'Minimum cost to merge stones' },
    { title: 'Frog Jump', difficulty: 'hard', description: 'Check if frog can cross river' },
    { title: 'Russian Doll Envelopes', difficulty: 'hard', description: 'Maximum nested envelopes' },
    { title: 'Split Array Largest Sum', difficulty: 'hard', description: 'Minimize largest sum in m subarrays' },
    { title: 'Count Different Palindromic Subsequences', difficulty: 'hard', description: 'Count distinct palindromic subsequences' },
    { title: 'Shortest Palindrome', difficulty: 'hard', description: 'Find shortest palindrome by prepending' },
    { title: 'Palindrome Pairs', difficulty: 'hard', description: 'Find all palindrome pairs' },
    { title: 'Super Egg Drop', difficulty: 'hard', description: 'Minimum trials to find critical floor' },
    { title: 'Cherry Pickup', difficulty: 'hard', description: 'Maximum cherries collected' },
    { title: 'Longest Valid Parentheses', difficulty: 'hard', description: 'Find longest valid parentheses substring' },
    { title: 'Remove Invalid Parentheses', difficulty: 'hard', description: 'Remove minimum parentheses to make valid' },
    { title: 'Expression Add Operators', difficulty: 'hard', description: 'Add operators to reach target' },
    { title: 'Basic Calculator', difficulty: 'hard', description: 'Implement basic calculator' },
    { title: 'Text Justification', difficulty: 'hard', description: 'Justify text to given width' },
    { title: 'Longest Increasing Path in Matrix', difficulty: 'hard', description: 'Find longest increasing path' },
    { title: 'The Skyline Problem', difficulty: 'hard', description: 'Find skyline of buildings' }
  ],
  miscellaneous: [
    { title: 'Design HashMap', difficulty: 'easy', description: 'Design and implement a HashMap' },
    { title: 'Design HashSet', difficulty: 'easy', description: 'Design and implement a HashSet' },
    { title: 'Implement Trie', difficulty: 'medium', description: 'Implement prefix tree' },
    { title: 'Design Twitter', difficulty: 'medium', description: 'Design simplified Twitter' },
    { title: 'Design Underground System', difficulty: 'medium', description: 'Design metro card system' },
    { title: 'Design File System', difficulty: 'medium', description: 'Design in-memory file system' },
    { title: 'Design Snake Game', difficulty: 'medium', description: 'Design snake game' },
    { title: 'Design Tic-Tac-Toe', difficulty: 'medium', description: 'Design Tic-Tac-Toe game' },
    { title: 'Design Hit Counter', difficulty: 'medium', description: 'Design hit counter for last 5 minutes' },
    { title: 'Design Log Storage', difficulty: 'medium', description: 'Design log storage system' },
    { title: 'Implement Rand10() Using Rand7()', difficulty: 'medium', description: 'Generate random 1-10 using 1-7' },
    { title: 'Random Pick with Weight', difficulty: 'medium', description: 'Pick index with probability' },
    { title: 'Insert Delete GetRandom O(1)', difficulty: 'medium', description: 'Design data structure with O(1) operations' },
    { title: 'Shuffle an Array', difficulty: 'medium', description: 'Shuffle array randomly' },
    { title: 'Majority Element', difficulty: 'easy', description: 'Find majority element in array' },
    { title: 'Majority Element II', difficulty: 'medium', description: 'Find elements appearing > n/3 times' },
    { title: 'Find Peak Element', difficulty: 'medium', description: 'Find peak element in array' },
    { title: 'Single Number II', difficulty: 'medium', description: 'Find element appearing once (others thrice)' },
    { title: 'Single Number III', difficulty: 'medium', description: 'Find two elements appearing once' },
    { title: 'Task Scheduler', difficulty: 'medium', description: 'Schedule tasks with cooling interval' },
    { title: 'Design Circular Queue', difficulty: 'medium', description: 'Design circular queue' },
    { title: 'Design Circular Deque', difficulty: 'medium', description: 'Design circular deque' },
    { title: 'Design Browser History', difficulty: 'medium', description: 'Design browser history' },
    { title: 'Design Parking System', difficulty: 'easy', description: 'Design parking lot system' },
    { title: 'Time Based Key-Value Store', difficulty: 'medium', description: 'Design time-based key-value store' }
  ]
};

async function seedDSARoadmap() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elite-academy');
    console.log('Connected to MongoDB');

    // Clear existing roadmaps
    await Roadmap.deleteMany({});
    console.log('Cleared existing roadmaps');

    // Create DSA Roadmap
    const roadmap = new Roadmap({
      title: 'Complete DSA Roadmap',
      description: 'Master Data Structures & Algorithms with 180+ carefully curated problems',
      course: new mongoose.Types.ObjectId('6741234567890abcdef12345'), // Placeholder course ID
      sections: [
        {
          title: 'Basic DSA',
          description: 'Start your journey with fundamental data structures and algorithms',
          order: 1,
          problems: dsaProblems.basic.map((p, index) => ({
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            order: index + 1,
            testCases: [
              { input: 'Sample input', expectedOutput: 'Sample output', isHidden: false }
            ],
            solutions: {
              javascript: '// Solution code here\nfunction solve() {\n  // Your code\n}',
              python: '# Solution code here\ndef solve():\n    # Your code\n    pass',
              java: '// Solution code here\nclass Solution {\n    public void solve() {\n        // Your code\n    }\n}'
            },
            hints: ['Think about the problem step by step', 'Consider edge cases']
          }))
        },
        {
          title: 'Intermediate DSA',
          description: 'Level up with medium difficulty problems and advanced techniques',
          order: 2,
          problems: dsaProblems.intermediate.map((p, index) => ({
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            order: index + 1,
            testCases: [
              { input: 'Sample input', expectedOutput: 'Sample output', isHidden: false }
            ],
            solutions: {
              javascript: '// Solution code here\nfunction solve() {\n  // Your code\n}',
              python: '# Solution code here\ndef solve():\n    # Your code\n    pass',
              java: '// Solution code here\nclass Solution {\n    public void solve() {\n        // Your code\n    }\n}'
            },
            hints: ['Consider the time complexity', 'Can you optimize the space?']
          }))
        },
        {
          title: 'Advanced DSA',
          description: 'Master hard problems and interview-level questions',
          order: 3,
          problems: dsaProblems.advanced.map((p, index) => ({
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            order: index + 1,
            testCases: [
              { input: 'Sample input', expectedOutput: 'Sample output', isHidden: false }
            ],
            solutions: {
              javascript: '// Solution code here\nfunction solve() {\n  // Your code\n}',
              python: '# Solution code here\ndef solve():\n    # Your code\n    pass',
              java: '// Solution code here\nclass Solution {\n    public void solve() {\n        // Your code\n    }\n}'
            },
            hints: ['This requires advanced algorithmic thinking', 'Consider dynamic programming or graph algorithms']
          }))
        },
        {
          title: 'Miscellaneous',
          description: 'Design problems, system design, and special topics',
          order: 4,
          problems: dsaProblems.miscellaneous.map((p, index) => ({
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            order: index + 1,
            testCases: [
              { input: 'Sample input', expectedOutput: 'Sample output', isHidden: false }
            ],
            solutions: {
              javascript: '// Solution code here\nfunction solve() {\n  // Your code\n}',
              python: '# Solution code here\ndef solve():\n    # Your code\n    pass',
              java: '// Solution code here\nclass Solution {\n    public void solve() {\n        // Your code\n    }\n}'
            },
            hints: ['Focus on system design principles', 'Think about API design']
          }))
        }
      ]
    });

    await roadmap.save();
    console.log(`✅ Created DSA Roadmap with ${roadmap.totalProblems} problems`);
    console.log(`   - Basic: ${dsaProblems.basic.length} problems`);
    console.log(`   - Intermediate: ${dsaProblems.intermediate.length} problems`);
    console.log(`   - Advanced: ${dsaProblems.advanced.length} problems`);
    console.log(`   - Miscellaneous: ${dsaProblems.miscellaneous.length} problems`);
    console.log(`\n📝 Roadmap ID: ${roadmap._id}`);
    console.log(`\nUpdate DSARoadmapPage.tsx with this ID:`);
    console.log(`const courseId = '${roadmap.course}';`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding DSA roadmap:', error);
    process.exit(1);
  }
}

seedDSARoadmap();
