// Original practice course content for DoFlow (not copied from any proprietary source)

export const HACKWITHINFY_COURSE_SEED = {
  course: {
    title: 'HackWithInfy 2025 — DSA PYQ-Style Prep (50 Problems)',
    shortDescription:
      'A focused 50-problem DSA practice track inspired by common HackWithInfy patterns: arrays, strings, stacks/queues/heaps, greedy, DP, trees, graphs, backtracking, and math.',
    description:
      'Prepare end-to-end for HackWithInfy-style coding rounds with a curated set of 50 original problems. Each problem is designed to train the exact patterns that show up repeatedly in online assessments: two pointers, sliding windows, hashing, monotonic stack/queue, greedy scheduling, dynamic programming transitions, BFS/DFS, tree recursion, and bitmask/backtracking.\n\nSolve each problem by implementing the function in the starter code and returning the required value (e.g., a number, boolean, string, or array), as described in the problem statement.',
    tags: ['DSA', 'HackWithInfy', 'PYQ', 'Interview Prep', 'Coding'],
    category: 'Other',
    level: 'Beginner',
    price: 0,
    thumbnail:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=630&fit=crop',
    language: 'English',
    isPublished: true,
    isFeatured: true,
    isDSA: true,
    whatYouWillLearn: [
      'Build speed with arrays/strings patterns (two pointers, sliding window, hashing)',
      'Use monotonic stacks/queues and heaps for range and top-k problems',
      'Apply greedy choice proofs for scheduling and interval problems',
      'Write clean DP with correct states/transitions and boundary handling',
      'Solve tree/graph problems using DFS/BFS and standard templates',
      'Use backtracking and bitmask techniques for combinatorial tasks',
    ],
    requirements: [
      'Basic programming (variables, loops, functions)',
      'Willingness to practice consistently',
    ],
  },

  sections: [
    {
      title: 'Arrays & Two Pointers',
      order: 1,
      description:
        'Warm up with core array patterns: prefix sums, sliding windows, two pointers, and interval merging.',
    },
    {
      title: 'Strings & Hashing',
      order: 2,
      description:
        'Frequency maps, pattern matching, anagrams, windows, and string normalization.',
    },
    {
      title: 'Stack, Queue & Heap',
      order: 3,
      description:
        'Monotonic stacks, deque windows, top-k with heaps, and streaming problems.',
    },
    {
      title: 'Greedy',
      order: 4,
      description:
        'Greedy scheduling, interval selection, and “best local choice” strategies.',
    },
    {
      title: 'Dynamic Programming',
      order: 5,
      description:
        'Classic DP transitions: 1D, 2D grid DP, subset DP, and string DP.',
    },
    {
      title: 'Trees & BST',
      order: 6,
      description:
        'Binary tree recursion, traversals, BST properties, and tree DP basics.',
    },
    {
      title: 'Graphs',
      order: 7,
      description:
        'BFS/DFS, topo sort, cycle detection, and shortest paths.',
    },
    {
      title: 'Backtracking & Bitmask',
      order: 8,
      description:
        'Generate/choose/arrange patterns, pruning, and bit tricks.',
    },
    {
      title: 'Math & Number Theory',
      order: 9,
      description:
        'Primes, divisors, modular exponentiation, and numeric reasoning.',
    },
  ],

  problems: [
    // Arrays & Two Pointers (7)
    {
      section: 'Arrays & Two Pointers',
      order: 1,
      title: 'Pair With Given Difference',
      difficulty: 'Easy',
      params: ['arr', 'k'],
      description:
        'Given an integer array `arr` and an integer `k`, return `true` if there exist indices `i != j` such that `|arr[i] - arr[j]| = k`, otherwise return `false`.\n\nTry to do it in $O(n)$ average time.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '-1e9 ≤ arr[i] ≤ 1e9', '0 ≤ k ≤ 1e9'],
      hints: [
        'Use a hash set of seen numbers.',
        'When you see x, check if x-k or x+k is already seen.',
      ],
      examples: [
        {
          input: 'arr=[1,5,3,4,2], k=2',
          output: 'true',
          explanation: 'Pairs (1,3), (5,3), (4,2) have difference 2.',
        },
      ],
      testCases: [
        { input: '[[1,5,3,4,2], 2]', expectedOutput: 'true', isHidden: false },
        { input: '[[10,20,30], 7]', expectedOutput: 'false', isHidden: false },
        { input: '[[5,5,5], 0]', expectedOutput: 'true', isHidden: true },
      ],
    },
    {
      section: 'Arrays & Two Pointers',
      order: 2,
      title: 'Longest Subarray With Sum K',
      difficulty: 'Medium',
      params: ['arr', 'k'],
      description:
        'Given an integer array `arr` (can contain negatives) and integer `k`, return the length of the longest contiguous subarray whose sum equals `k`.\n\nReturn `0` if no such subarray exists.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '-1e4 ≤ arr[i] ≤ 1e4', '-1e9 ≤ k ≤ 1e9'],
      hints: ['Prefix sums + earliest index map.'],
      examples: [
        {
          input: 'arr=[1,-1,5,-2,3], k=3',
          output: '4',
          explanation: 'Subarray [1,-1,5,-2] sums to 3 with length 4.',
        },
      ],
      testCases: [
        { input: '[[1,-1,5,-2,3], 3]', expectedOutput: '4', isHidden: false },
        { input: '[[2,3,-2,4,-4,6], 6]', expectedOutput: '6', isHidden: false },
        { input: '[[1,2,3], 7]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Arrays & Two Pointers',
      order: 3,
      title: 'Count Subarrays With Product < K',
      difficulty: 'Medium',
      params: ['arr', 'k'],
      description:
        'Given an array of **positive** integers `arr` and integer `k`, return the number of contiguous subarrays whose product is strictly less than `k`.\n\nIf `k <= 1`, answer is `0`.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '1 ≤ arr[i] ≤ 1000', '-1e9 ≤ k ≤ 1e9'],
      hints: ['Two pointers window with product maintenance.'],
      examples: [
        {
          input: 'arr=[10,5,2,6], k=100',
          output: '8',
          explanation: 'There are 8 valid subarrays.',
        },
      ],
      testCases: [
        { input: '[[10,5,2,6], 100]', expectedOutput: '8', isHidden: false },
        { input: '[[1,1,1], 2]', expectedOutput: '6', isHidden: false },
        { input: '[[3,4], 1]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Arrays & Two Pointers',
      order: 4,
      title: 'Minimum Swaps to Group Ones',
      difficulty: 'Medium',
      params: ['arr'],
      description:
        'Given a binary array `arr` (only 0 and 1), return the minimum number of swaps required to group all `1`s together in a contiguous block.\n\nA swap can exchange any two elements (not necessarily adjacent).',
      constraints: ['1 ≤ arr.length ≤ 2e5', 'arr[i] ∈ {0,1}'],
      hints: [
        'Let w be count of ones. Find a window of length w with maximum ones.',
        'Answer = w - maxOnesInAnyWindow.',
      ],
      examples: [
        {
          input: 'arr=[1,0,1,0,1]',
          output: '1',
          explanation: 'Group the ones by swapping one 0 out of the best window.',
        },
      ],
      testCases: [
        { input: '[[1,0,1,0,1]]', expectedOutput: '1', isHidden: false },
        { input: '[[1,1,1,1]]', expectedOutput: '0', isHidden: false },
        { input: '[[0,0,0]]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Arrays & Two Pointers',
      order: 5,
      title: 'Merge Overlapping Intervals',
      difficulty: 'Medium',
      params: ['intervals'],
      description:
        'Given an array of intervals `intervals` where each interval is `[start, end]`, merge all overlapping intervals and return the merged list sorted by start.\n\nIntervals overlap if the start of one is `<=` the end of the other.',
      constraints: ['1 ≤ intervals.length ≤ 2e5', '-1e9 ≤ start ≤ end ≤ 1e9'],
      hints: ['Sort by start, then sweep and merge.'],
      examples: [
        {
          input: 'intervals=[[1,3],[2,6],[8,10],[15,18]]',
          output: '[[1,6],[8,10],[15,18]]',
          explanation: 'First two intervals overlap and merge to [1,6].',
        },
      ],
      testCases: [
        {
          input: '[[[1,3],[2,6],[8,10],[15,18]]]',
          expectedOutput: '[[1,6],[8,10],[15,18]]',
          isHidden: false,
        },
        {
          input: '[[[1,4],[4,5]]]',
          expectedOutput: '[[1,5]]',
          isHidden: false,
        },
        {
          input: '[[[5,7],[1,2],[3,4]]]',
          expectedOutput: '[[1,2],[3,4],[5,7]]',
          isHidden: true,
        },
      ],
    },
    {
      section: 'Arrays & Two Pointers',
      order: 6,
      title: 'K-th Missing Positive',
      difficulty: 'Easy',
      params: ['arr', 'k'],
      description:
        'Given a strictly increasing array `arr` of positive integers and an integer `k`, return the `k`-th missing positive integer.\n\nExample: `arr=[2,3,4]` is missing `1,5,6,...` so k=2 returns 5.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '1 ≤ arr[i] ≤ 1e9', '1 ≤ k ≤ 1e9'],
      hints: ['Binary search on how many numbers are missing up to index i.'],
      examples: [
        {
          input: 'arr=[2,3,4,7,11], k=5',
          output: '9',
          explanation: 'Missing positives are 1,5,6,8,9,...',
        },
      ],
      testCases: [
        { input: '[[2,3,4,7,11], 5]', expectedOutput: '9', isHidden: false },
        { input: '[[1,2,3,4], 2]', expectedOutput: '6', isHidden: false },
        { input: '[[5,6,7], 1]', expectedOutput: '1', isHidden: true },
      ],
    },
    {
      section: 'Arrays & Two Pointers',
      order: 7,
      title: 'Trapping Rainwater',
      difficulty: 'Hard',
      params: ['heights'],
      description:
        'Given `heights` where `heights[i]` is the height of a bar, return how much water can be trapped after raining.\n\nReturn an integer amount of water.',
      constraints: ['1 ≤ heights.length ≤ 2e5', '0 ≤ heights[i] ≤ 1e6'],
      hints: ['Two pointers with leftMax/rightMax, or prefix max arrays.'],
      examples: [
        {
          input: 'heights=[0,1,0,2,1,0,1,3,2,1,2,1]',
          output: '6',
          explanation: 'Total trapped water is 6.',
        },
      ],
      testCases: [
        { input: '[[0,1,0,2,1,0,1,3,2,1,2,1]]', expectedOutput: '6', isHidden: false },
        { input: '[[4,2,0,3,2,5]]', expectedOutput: '9', isHidden: false },
        { input: '[[1,2,3]]', expectedOutput: '0', isHidden: true },
      ],
    },

    // Strings & Hashing (6)
    {
      section: 'Strings & Hashing',
      order: 1,
      title: 'Longest Common Prefix',
      difficulty: 'Easy',
      params: ['words'],
      description:
        'Given an array of strings `words`, return the longest common prefix shared by all strings. If none, return an empty string.',
      constraints: ['1 ≤ words.length ≤ 1e5', '0 ≤ words[i].length ≤ 200', 'All strings contain lowercase/uppercase letters only'],
      hints: ['Compare character by character using the shortest word.'],
      examples: [
        { input: 'words=["flower","flow","flight"]', output: '"fl"', explanation: 'All start with "fl".' },
      ],
      testCases: [
        { input: '[["flower","flow","flight"]]', expectedOutput: 'fl', isHidden: false },
        { input: '[["dog","racecar","car"]]', expectedOutput: '', isHidden: false },
        { input: '[[""]]', expectedOutput: '', isHidden: true },
      ],
    },
    {
      section: 'Strings & Hashing',
      order: 2,
      title: 'Isomorphic Strings',
      difficulty: 'Easy',
      params: ['s', 't'],
      description:
        'Return `true` if strings `s` and `t` are isomorphic: characters in `s` can be replaced to get `t` with a one-to-one mapping.\n\nOrder must be preserved, and no two characters may map to the same character.',
      constraints: ['1 ≤ s.length, t.length ≤ 2e5', 's.length == t.length'],
      hints: ['Maintain two maps: s→t and t→s.'],
      examples: [
        { input: 's="egg", t="add"', output: 'true', explanation: 'e→a, g→d' },
      ],
      testCases: [
        { input: '["egg","add"]', expectedOutput: 'true', isHidden: false },
        { input: '["foo","bar"]', expectedOutput: 'false', isHidden: false },
        { input: '["paper","title"]', expectedOutput: 'true', isHidden: true },
      ],
    },
    {
      section: 'Strings & Hashing',
      order: 3,
      title: 'Minimum Deletions for Unique Frequencies',
      difficulty: 'Medium',
      params: ['s'],
      description:
        'Given a string `s`, return the minimum number of deletions needed so that no two different characters have the same frequency.\n\nYou may delete any characters.',
      constraints: ['1 ≤ s.length ≤ 2e5', 's contains lowercase English letters'],
      hints: ['Greedily reduce frequencies using a set of used frequencies.'],
      examples: [
        { input: 's="aaabbbcc"', output: '2', explanation: 'Make frequencies 3,2,1 via 2 deletions.' },
      ],
      testCases: [
        { input: '["aaabbbcc"]', expectedOutput: '2', isHidden: false },
        { input: '["ceabaacb"]', expectedOutput: '2', isHidden: false },
        { input: '["a"]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Strings & Hashing',
      order: 4,
      title: 'Find All Anagram Start Indices',
      difficulty: 'Medium',
      params: ['s', 'p'],
      description:
        'Given strings `s` and `p`, return all start indices in `s` where the substring of length `p.length` is an anagram of `p`.\n\nReturn the indices in increasing order.',
      constraints: ['1 ≤ s.length ≤ 2e5', '1 ≤ p.length ≤ 2e5', 'p.length ≤ s.length', 'Lowercase English letters'],
      hints: ['Sliding window with frequency arrays.'],
      examples: [
        { input: 's="cbaebabacd", p="abc"', output: '[0,6]', explanation: '"cba" and "bac" are anagrams.' },
      ],
      testCases: [
        { input: '["cbaebabacd","abc"]', expectedOutput: '[0,6]', isHidden: false },
        { input: '["abab","ab"]', expectedOutput: '[0,1,2]', isHidden: false },
        { input: '["aaaaa","b"]', expectedOutput: '[]', isHidden: true },
      ],
    },
    {
      section: 'Strings & Hashing',
      order: 5,
      title: 'Longest Palindrome Length (From Letters)',
      difficulty: 'Easy',
      params: ['s'],
      description:
        'Given a string `s`, return the length of the longest palindrome that can be built using the letters of `s`.\n\nLetters are case-sensitive.',
      constraints: ['1 ≤ s.length ≤ 2e5'],
      hints: ['Use counts. Add even parts; one odd can contribute +1 center.'],
      examples: [
        { input: 's="abccccdd"', output: '7', explanation: 'One palindrome is "dccaccd".' },
      ],
      testCases: [
        { input: '["abccccdd"]', expectedOutput: '7', isHidden: false },
        { input: '["aA"]', expectedOutput: '1', isHidden: false },
        { input: '["aaa"]', expectedOutput: '3', isHidden: true },
      ],
    },
    {
      section: 'Strings & Hashing',
      order: 6,
      title: 'Smallest Window Containing Pattern',
      difficulty: 'Hard',
      params: ['s', 't'],
      description:
        'Given strings `s` and `t`, return the **smallest substring** of `s` that contains all characters of `t` (including multiplicity). If there is no such substring, return an empty string.\n\nIf multiple answers exist, return any one.',
      constraints: ['1 ≤ s.length ≤ 2e5', '1 ≤ t.length ≤ 2e5'],
      hints: ['Classic sliding window: expand until valid, then shrink.'],
      examples: [
        { input: 's="ADOBECODEBANC", t="ABC"', output: '"BANC"', explanation: 'The minimum valid window is "BANC".' },
      ],
      testCases: [
        { input: '["ADOBECODEBANC","ABC"]', expectedOutput: 'BANC', isHidden: false },
        { input: '["a","aa"]', expectedOutput: '', isHidden: false },
        { input: '["aa","aa"]', expectedOutput: 'aa', isHidden: true },
      ],
    },

    // Stack, Queue & Heap (6)
    {
      section: 'Stack, Queue & Heap',
      order: 1,
      title: 'Next Greater Element (Circular)',
      difficulty: 'Medium',
      params: ['arr'],
      description:
        'Given a circular array `arr`, return an array `res` where `res[i]` is the next greater element of `arr[i]` when traversing forward (wrapping around). If none exists, `res[i] = -1`.\n\nExample: for [1,2,1] output [2,-1,2].',
      constraints: ['1 ≤ arr.length ≤ 2e5', '-1e9 ≤ arr[i] ≤ 1e9'],
      hints: ['Use a monotonic decreasing stack over indices; iterate 2*n.'],
      examples: [
        { input: 'arr=[1,2,1]', output: '[2,-1,2]', explanation: 'Circularly, last 1 sees 2.' },
      ],
      testCases: [
        { input: '[[1,2,1]]', expectedOutput: '[2,-1,2]', isHidden: false },
        { input: '[[3,8,4,1,2]]', expectedOutput: '[8,-1,8,2,3]', isHidden: false },
        { input: '[[5,4,3]]', expectedOutput: '[-1,5,5]', isHidden: true },
      ],
    },
    {
      section: 'Stack, Queue & Heap',
      order: 2,
      title: 'Stock Span',
      difficulty: 'Medium',
      params: ['prices'],
      description:
        'Given `prices[i]` for each day, return an array `span` where `span[i]` is the number of consecutive days ending at `i` for which the price was `<= prices[i]`.\n\nThis is the classic Stock Span problem.',
      constraints: ['1 ≤ prices.length ≤ 2e5', '0 ≤ prices[i] ≤ 1e9'],
      hints: ['Monotonic stack of indices with decreasing prices.'],
      examples: [
        { input: 'prices=[100,80,60,70,60,75,85]', output: '[1,1,1,2,1,4,6]', explanation: 'Spans accumulate when popping smaller/equal.' },
      ],
      testCases: [
        { input: '[[100,80,60,70,60,75,85]]', expectedOutput: '[1,1,1,2,1,4,6]', isHidden: false },
        { input: '[[10,20,30]]', expectedOutput: '[1,2,3]', isHidden: false },
        { input: '[[30,20,10]]', expectedOutput: '[1,1,1]', isHidden: true },
      ],
    },
    {
      section: 'Stack, Queue & Heap',
      order: 3,
      title: 'Sliding Window Maximum',
      difficulty: 'Hard',
      params: ['arr', 'k'],
      description:
        'Given an integer array `arr` and window size `k`, return an array of the maximum value in every contiguous window of size `k`.\n\nMust be faster than $O(nk)$.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '1 ≤ k ≤ arr.length', '-1e9 ≤ arr[i] ≤ 1e9'],
      hints: ['Use a deque storing indices with decreasing values.'],
      examples: [
        { input: 'arr=[1,3,-1,-3,5,3,6,7], k=3', output: '[3,3,5,5,6,7]', explanation: 'Use monotonic deque.' },
      ],
      testCases: [
        { input: '[[1,3,-1,-3,5,3,6,7], 3]', expectedOutput: '[3,3,5,5,6,7]', isHidden: false },
        { input: '[[9,11], 2]', expectedOutput: '[11]', isHidden: false },
        { input: '[[4,4,4,4], 1]', expectedOutput: '[4,4,4,4]', isHidden: true },
      ],
    },
    {
      section: 'Stack, Queue & Heap',
      order: 4,
      title: 'K Most Frequent Elements',
      difficulty: 'Medium',
      params: ['arr', 'k'],
      description:
        'Given an integer array `arr`, return the `k` most frequent elements.\n\nIf there are ties, you may return the tied elements in any order.\n\nNote: For stable evaluation, this problem expects you to return the **set** of results sorted ascending.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '1 ≤ k ≤ number of distinct elements'],
      hints: ['Count frequencies, then use bucket sort or heap; sort final answer.'],
      examples: [
        { input: 'arr=[1,1,1,2,2,3], k=2', output: '[1,2]', explanation: '1 occurs 3 times, 2 occurs 2 times.' },
      ],
      testCases: [
        { input: '[[1,1,1,2,2,3], 2]', expectedOutput: '[1,2]', isHidden: false },
        { input: '[[4,4,4,5,5,6], 1]', expectedOutput: '[4]', isHidden: false },
        { input: '[[7,7,8,8,9,9], 2]', expectedOutput: '[7,8]', isHidden: true },
      ],
    },
    {
      section: 'Stack, Queue & Heap',
      order: 5,
      title: 'Merge K Sorted Arrays',
      difficulty: 'Hard',
      params: ['arrays'],
      description:
        'Given `arrays`, a list of sorted integer arrays, merge them into a single sorted array and return it.\n\nTry to do better than concatenating and sorting everything.',
      constraints: ['1 ≤ arrays.length ≤ 2e4', 'Total elements ≤ 2e5', '-1e9 ≤ value ≤ 1e9'],
      hints: ['Min-heap of (value, arrayIndex, elementIndex).'],
      examples: [
        { input: 'arrays=[[1,4,7],[2,5,8],[3,6,9]]', output: '[1,2,3,4,5,6,7,8,9]', explanation: 'Standard heap merge.' },
      ],
      testCases: [
        { input: '[[[1,4,7],[2,5,8],[3,6,9]]]', expectedOutput: '[1,2,3,4,5,6,7,8,9]', isHidden: false },
        { input: '[[[1],[0],[2]]]', expectedOutput: '[0,1,2]', isHidden: false },
        { input: '[[[],[1,2]]] ', expectedOutput: '[1,2]', isHidden: true },
      ],
    },
    {
      section: 'Stack, Queue & Heap',
      order: 6,
      title: 'First Non-Repeating Character in Stream',
      difficulty: 'Medium',
      params: ['stream'],
      description:
        'You receive a stream of lowercase characters as a string `stream`. After processing each character, output the first character that has appeared exactly once so far; if none exists output `#`.\n\nReturn the final output as a string of the same length.',
      constraints: ['1 ≤ stream.length ≤ 2e5', 'stream contains lowercase English letters'],
      hints: ['Queue + frequency array. Pop from queue while front is repeating.'],
      examples: [
        { input: 'stream="aabc"', output: '"a#bb"', explanation: 'After a→a, a→#, b→b, c→b.' },
      ],
      testCases: [
        { input: '["aabc"]', expectedOutput: 'a#bb', isHidden: false },
        { input: '["zz"]', expectedOutput: 'z#', isHidden: false },
        { input: '["abac"]', expectedOutput: 'aabb', isHidden: true },
      ],
    },

    // Greedy (6)
    {
      section: 'Greedy',
      order: 1,
      title: 'Minimum Platforms Needed',
      difficulty: 'Medium',
      params: ['arrivals', 'departures'],
      description:
        'Given arrival times and departure times (same length), return the minimum number of platforms needed so that no train waits.\n\nTimes are integers (e.g. minutes). A train arriving at time `t` can use a platform freed at time `t`.',
      constraints: ['1 ≤ n ≤ 2e5', '0 ≤ arrivals[i], departures[i] ≤ 1e9'],
      hints: ['Sort arrivals and departures. Two pointers sweep.'],
      examples: [
        { input: 'arrivals=[1,3,5], departures=[2,6,10]', output: '2', explanation: 'At time 5, two trains overlap (3-6 and 5-10).' },
      ],
      testCases: [
        { input: '[[1,3,5],[2,6,10]]', expectedOutput: '2', isHidden: false },
        { input: '[[1,2,3],[1,2,3]]', expectedOutput: '1', isHidden: false },
        { input: '[[1,2,2],[2,2,3]]', expectedOutput: '2', isHidden: true },
      ],
    },
    {
      section: 'Greedy',
      order: 2,
      title: 'Jump Game (Reach the End)',
      difficulty: 'Medium',
      params: ['arr'],
      description:
        'You are given an array `arr` where `arr[i]` is the maximum jump length from index `i`. Return `true` if you can reach the last index starting from index 0, else return `false`.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '0 ≤ arr[i] ≤ 1e9'],
      hints: ['Track the farthest reachable index greedily.'],
      examples: [
        { input: 'arr=[2,3,1,1,4]', output: 'true', explanation: '0→1→4.' },
      ],
      testCases: [
        { input: '[[2,3,1,1,4]]', expectedOutput: 'true', isHidden: false },
        { input: '[[3,2,1,0,4]]', expectedOutput: 'false', isHidden: false },
        { input: '[[0]]', expectedOutput: 'true', isHidden: true },
      ],
    },
    {
      section: 'Greedy',
      order: 3,
      title: 'Maximize Sum After K Negations',
      difficulty: 'Easy',
      params: ['arr', 'k'],
      description:
        'You can negate (multiply by -1) any element of `arr` exactly `k` times (you may negate the same element multiple times). Return the maximum possible sum of the array after `k` operations.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '-1e4 ≤ arr[i] ≤ 1e4', '0 ≤ k ≤ 1e9'],
      hints: ['Sort. Flip negatives first. If k left odd, flip smallest abs value.'],
      examples: [
        { input: 'arr=[4,2,3], k=1', output: '5', explanation: 'No negatives exist, so flip the smallest value (2→-2). Sum becomes 4-2+3=5.' },
      ],
      testCases: [
        { input: '[[4,2,3], 1]', expectedOutput: '5', isHidden: false },
        { input: '[[-2,9,3], 1]', expectedOutput: '14', isHidden: false },
        { input: '[[-8,-3,-5], 2]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Greedy',
      order: 4,
      title: 'Assign Cookies',
      difficulty: 'Easy',
      params: ['greed', 'cookies'],
      description:
        'Each child has a greed factor `greed[i]`. Each cookie has size `cookies[j]`. A child is content if assigned a cookie with size >= greed. Each cookie can be assigned to at most one child. Return the maximum number of content children.',
      constraints: ['0 ≤ greed.length, cookies.length ≤ 2e5', '0 ≤ values ≤ 1e9'],
      hints: ['Sort both arrays and use two pointers.'],
      examples: [
        { input: 'greed=[1,2,3], cookies=[1,1]', output: '1', explanation: 'Only one child can be satisfied.' },
      ],
      testCases: [
        { input: '[[1,2,3],[1,1]]', expectedOutput: '1', isHidden: false },
        { input: '[[1,2],[1,2,3]]', expectedOutput: '2', isHidden: false },
        { input: '[[],[1,2]]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Greedy',
      order: 5,
      title: 'Max Non-Overlapping Intervals',
      difficulty: 'Medium',
      params: ['intervals'],
      description:
        'Given intervals `intervals` as `[start,end]`, return the maximum number of non-overlapping intervals you can pick.\n\nAssume touching endpoints is allowed (i.e. [1,2] and [2,3] do not overlap).',
      constraints: ['1 ≤ intervals.length ≤ 2e5', '-1e9 ≤ start ≤ end ≤ 1e9'],
      hints: ['Sort by end time and greedily pick earliest ending intervals.'],
      examples: [
        { input: 'intervals=[[1,2],[2,3],[3,4],[1,3]]', output: '3', explanation: 'Pick [1,2],[2,3],[3,4].' },
      ],
      testCases: [
        { input: '[[[1,2],[2,3],[3,4],[1,3]]]', expectedOutput: '3', isHidden: false },
        { input: '[[[1,1],[1,2],[2,2]]]', expectedOutput: '3', isHidden: false },
        { input: '[[[1,10],[2,3],[4,5],[6,7]]]', expectedOutput: '3', isHidden: true },
      ],
    },
    {
      section: 'Greedy',
      order: 6,
      title: 'Minimum Number of Arrows to Burst Balloons',
      difficulty: 'Medium',
      params: ['intervals'],
      description:
        'Each balloon is an interval `[start,end]` on the x-axis. An arrow shot at position `x` bursts all balloons with `start <= x <= end`. Return the minimum number of arrows needed to burst all balloons.',
      constraints: ['1 ≤ intervals.length ≤ 2e5', '-1e9 ≤ start ≤ end ≤ 1e9'],
      hints: ['Sort by end coordinate; greedy shoot at current end.'],
      examples: [
        { input: 'intervals=[[10,16],[2,8],[1,6],[7,12]]', output: '2', explanation: 'Shoot at 6 and 12.' },
      ],
      testCases: [
        { input: '[[[10,16],[2,8],[1,6],[7,12]]]', expectedOutput: '2', isHidden: false },
        { input: '[[[1,2],[3,4],[5,6]]]', expectedOutput: '3', isHidden: false },
        { input: '[[[1,10],[2,3],[4,5]]]', expectedOutput: '1', isHidden: true },
      ],
    },

    // Dynamic Programming (7)
    {
      section: 'Dynamic Programming',
      order: 1,
      title: 'Climb Stairs (1/2/3 Steps)',
      difficulty: 'Easy',
      params: ['n'],
      description:
        'You are at step 0 and want to reach step `n`. You may climb 1, 2, or 3 steps at a time. Return the number of distinct ways.\n\nReturn the answer as an integer.',
      constraints: ['0 ≤ n ≤ 1e6'],
      hints: ['DP with dp[i]=dp[i-1]+dp[i-2]+dp[i-3]. Use O(1) space.'],
      examples: [
        { input: 'n=4', output: '7', explanation: 'Ways: 1111,112,121,211,22,13,31.' },
      ],
      testCases: [
        { input: '[4]', expectedOutput: '7', isHidden: false },
        { input: '[0]', expectedOutput: '1', isHidden: false },
        { input: '[10]', expectedOutput: '274', isHidden: true },
      ],
    },
    {
      section: 'Dynamic Programming',
      order: 2,
      title: 'House Robber (Linear)',
      difficulty: 'Medium',
      params: ['arr'],
      description:
        'Given non-negative integers `arr` where each value is money in a house, you cannot rob adjacent houses. Return the maximum money you can rob.',
      constraints: ['0 ≤ arr.length ≤ 2e5', '0 ≤ arr[i] ≤ 1e9'],
      hints: ['Maintain take/skip DP iteratively.'],
      examples: [
        { input: 'arr=[2,7,9,3,1]', output: '12', explanation: 'Rob houses 2,9,1.' },
      ],
      testCases: [
        { input: '[[2,7,9,3,1]]', expectedOutput: '12', isHidden: false },
        { input: '[[1,2,3,1]]', expectedOutput: '4', isHidden: false },
        { input: '[[]]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Dynamic Programming',
      order: 3,
      title: 'Longest Increasing Subsequence Length',
      difficulty: 'Medium',
      params: ['arr'],
      description:
        'Return the length of the longest strictly increasing subsequence in `arr`.\n\nTry to do it in $O(n \log n)$.',
      constraints: ['1 ≤ arr.length ≤ 2e5', '-1e9 ≤ arr[i] ≤ 1e9'],
      hints: ['Patience sorting: maintain tails and binary search.'],
      examples: [
        { input: 'arr=[10,9,2,5,3,7,101,18]', output: '4', explanation: 'One LIS is [2,3,7,101].' },
      ],
      testCases: [
        { input: '[[10,9,2,5,3,7,101,18]]', expectedOutput: '4', isHidden: false },
        { input: '[[0,1,0,3,2,3]]', expectedOutput: '4', isHidden: false },
        { input: '[[7,7,7,7]]', expectedOutput: '1', isHidden: true },
      ],
    },
    {
      section: 'Dynamic Programming',
      order: 4,
      title: 'Minimum Path Sum in Grid',
      difficulty: 'Medium',
      params: ['grid'],
      description:
        'Given a grid of non-negative integers `grid`, start at top-left and reach bottom-right. You may only move right or down. Return the minimum path sum.',
      constraints: ['1 ≤ rows, cols ≤ 500', '0 ≤ grid[i][j] ≤ 1e6'],
      hints: ['DP over cells; can reuse grid for in-place DP.'],
      examples: [
        { input: 'grid=[[1,3,1],[1,5,1],[4,2,1]]', output: '7', explanation: '1→3→1→1→1.' },
      ],
      testCases: [
        { input: '[[[1,3,1],[1,5,1],[4,2,1]]]', expectedOutput: '7', isHidden: false },
        { input: '[[[1,2,3],[4,5,6]]]', expectedOutput: '12', isHidden: false },
        { input: '[[[0]]]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Dynamic Programming',
      order: 5,
      title: 'Partition Equal Subset Sum',
      difficulty: 'Medium',
      params: ['arr'],
      description:
        'Given a list of positive integers `arr`, return `true` if you can partition it into two subsets with equal sum, else return `false`.',
      constraints: ['1 ≤ arr.length ≤ 2000', '1 ≤ arr[i] ≤ 1000'],
      hints: ['Subset sum DP to reach target=sum/2 (bitset works well).'],
      examples: [
        { input: 'arr=[1,5,11,5]', output: 'true', explanation: '11 = 5+5+1.' },
      ],
      testCases: [
        { input: '[[1,5,11,5]]', expectedOutput: 'true', isHidden: false },
        { input: '[[1,2,3,5]]', expectedOutput: 'false', isHidden: false },
        { input: '[[2,2,3,5]]', expectedOutput: 'false', isHidden: true },
      ],
    },
    {
      section: 'Dynamic Programming',
      order: 6,
      title: 'Coin Change — Number of Ways',
      difficulty: 'Medium',
      params: ['coins', 'amount'],
      description:
        'Given coin denominations `coins` and target `amount`, return the number of ways to make up the amount using unlimited coins.\n\nOrder does not matter.',
      constraints: ['0 ≤ amount ≤ 1e5', '1 ≤ coins.length ≤ 200', '1 ≤ coins[i] ≤ 1e4'],
      hints: ['1D DP where dp[x] += dp[x-coin] iterating coins outer loop.'],
      examples: [
        { input: 'coins=[1,2,5], amount=5', output: '4', explanation: 'Ways: 5, 2+2+1, 2+1+1+1, 1x5.' },
      ],
      testCases: [
        { input: '[[1,2,5], 5]', expectedOutput: '4', isHidden: false },
        { input: '[[2], 3]', expectedOutput: '0', isHidden: false },
        { input: '[[10], 0]', expectedOutput: '1', isHidden: true },
      ],
    },
    {
      section: 'Dynamic Programming',
      order: 7,
      title: 'Edit Distance',
      difficulty: 'Hard',
      params: ['a', 'b'],
      description:
        'Given strings `a` and `b`, return the minimum number of operations to convert `a` into `b`. Allowed operations: insert, delete, replace a character.',
      constraints: ['0 ≤ a.length, b.length ≤ 4000'],
      hints: ['Classic DP on prefixes. Optimize memory with two rows.'],
      examples: [
        { input: 'a="horse", b="ros"', output: '3', explanation: 'horse→rorse→rose→ros.' },
      ],
      testCases: [
        { input: '["horse","ros"]', expectedOutput: '3', isHidden: false },
        { input: '["intention","execution"]', expectedOutput: '5', isHidden: false },
        { input: '["","abc"]', expectedOutput: '3', isHidden: true },
      ],
    },

    // Trees & BST (6)
    {
      section: 'Trees & BST',
      order: 1,
      title: 'Max Depth of Binary Tree (Level-Order Array)',
      difficulty: 'Easy',
      params: ['tree'],
      description:
        'A binary tree is given as a level-order array `tree` where missing children are `null`. Return the maximum depth (number of nodes along the longest path from root to leaf).\n\nExample: `[3,9,20,null,null,15,7]` has depth 3.',
      constraints: ['0 ≤ tree.length ≤ 2e5'],
      hints: ['Build indices recursion: for node i, children are 2i+1 and 2i+2.', 'Or BFS counting levels.'],
      examples: [
        { input: 'tree=[3,9,20,null,null,15,7]', output: '3', explanation: 'Longest path has 3 nodes.' },
      ],
      testCases: [
        { input: '[[3,9,20,null,null,15,7]]', expectedOutput: '3', isHidden: false },
        { input: '[[1,null,2,null,3]]', expectedOutput: '3', isHidden: false },
        { input: '[[]]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Trees & BST',
      order: 2,
      title: 'Validate BST (Level-Order Array)',
      difficulty: 'Medium',
      params: ['tree'],
      description:
        'Given a binary tree as a level-order array with `null`s, return `true` if it is a valid binary search tree (BST).\n\nA BST requires all nodes in left subtree < node < all nodes in right subtree.',
      constraints: ['0 ≤ tree.length ≤ 2e5'],
      hints: ['Use bounds (min,max) recursion rather than just parent comparisons.'],
      examples: [
        { input: 'tree=[2,1,3]', output: 'true', explanation: 'Valid BST.' },
      ],
      testCases: [
        { input: '[[2,1,3]]', expectedOutput: 'true', isHidden: false },
        { input: '[[5,1,4,null,null,3,6]]', expectedOutput: 'false', isHidden: false },
        { input: '[[1,1]]', expectedOutput: 'false', isHidden: true },
      ],
    },
    {
      section: 'Trees & BST',
      order: 3,
      title: 'Diameter of Binary Tree',
      difficulty: 'Medium',
      params: ['tree'],
      description:
        'Given a binary tree as a level-order array with `null`s, return the diameter of the tree: the number of edges on the longest path between any two nodes.',
      constraints: ['0 ≤ tree.length ≤ 2e5'],
      hints: ['Compute height; update best with leftHeight+rightHeight.'],
      examples: [
        { input: 'tree=[1,2,3,4,5]', output: '3', explanation: 'Path 4-2-1-3 has 3 edges.' },
      ],
      testCases: [
        { input: '[[1,2,3,4,5]]', expectedOutput: '3', isHidden: false },
        { input: '[[1,2]]', expectedOutput: '1', isHidden: false },
        { input: '[[1]]', expectedOutput: '0', isHidden: true },
      ],
    },
    {
      section: 'Trees & BST',
      order: 4,
      title: 'Zigzag Level Order Traversal',
      difficulty: 'Medium',
      params: ['tree'],
      description:
        'Given a binary tree in level-order array form with `null`s, return its level order traversal but alternating direction each level (left-to-right, then right-to-left, ...).',
      constraints: ['0 ≤ tree.length ≤ 2e5'],
      hints: ['BFS level by level; reverse every other level or fill accordingly.'],
      examples: [
        { input: 'tree=[3,9,20,null,null,15,7]', output: '[[3],[20,9],[15,7]]', explanation: 'Second level reversed.' },
      ],
      testCases: [
        { input: '[[3,9,20,null,null,15,7]]', expectedOutput: '[[3],[20,9],[15,7]]', isHidden: false },
        { input: '[[1]]', expectedOutput: '[[1]]', isHidden: false },
        { input: '[[1,2,3,4,null,null,5]]', expectedOutput: '[[1],[3,2],[4,5]]', isHidden: true },
      ],
    },
    {
      section: 'Trees & BST',
      order: 5,
      title: 'K-th Smallest in BST',
      difficulty: 'Medium',
      params: ['tree', 'k'],
      description:
        'Given a BST as a level-order array with `null`s, return the k-th smallest value (1-indexed).',
      constraints: ['1 ≤ k ≤ number of non-null nodes', '0 ≤ tree.length ≤ 2e5'],
      hints: ['Inorder traversal yields sorted order.'],
      examples: [
        { input: 'tree=[5,3,6,2,4,null,null,1], k=3', output: '3', explanation: 'Sorted: 1,2,3,4,5,6.' },
      ],
      testCases: [
        { input: '[[5,3,6,2,4,null,null,1], 3]', expectedOutput: '3', isHidden: false },
        { input: '[[3,1,4,null,2], 1]', expectedOutput: '1', isHidden: false },
        { input: '[[2,1,3], 2]', expectedOutput: '2', isHidden: true },
      ],
    },
    {
      section: 'Trees & BST',
      order: 6,
      title: 'Lowest Common Ancestor in BST',
      difficulty: 'Medium',
      params: ['tree', 'p', 'q'],
      description:
        'Given a BST as a level-order array with `null`s and two values `p` and `q` guaranteed to exist in the BST, return the value of their lowest common ancestor.',
      constraints: ['0 ≤ tree.length ≤ 2e5'],
      hints: ['Use BST property: move left/right based on p and q relative to node.'],
      examples: [
        { input: 'tree=[6,2,8,0,4,7,9,null,null,3,5], p=2, q=8', output: '6', explanation: '6 is the split point.' },
      ],
      testCases: [
        { input: '[[6,2,8,0,4,7,9,null,null,3,5], 2, 8]', expectedOutput: '6', isHidden: false },
        { input: '[[6,2,8,0,4,7,9,null,null,3,5], 2, 4]', expectedOutput: '2', isHidden: false },
        { input: '[[2,1,3], 1, 3]', expectedOutput: '2', isHidden: true },
      ],
    },

    // Graphs (6)
    {
      section: 'Graphs',
      order: 1,
      title: 'Number of Islands',
      difficulty: 'Medium',
      params: ['grid'],
      description:
        'Given a 2D grid of characters `grid` containing only "0" and "1", return the number of islands.\n\nAn island is formed by connecting adjacent lands horizontally or vertically.',
      constraints: ['1 ≤ rows, cols ≤ 500', 'grid[i][j] ∈ {"0","1"}'],
      hints: ['DFS/BFS flood fill from each unvisited land cell.'],
      examples: [
        { input: 'grid=[["1","1","0"],["1","0","0"],["0","0","1"]]', output: '2', explanation: 'Two separate islands.' },
      ],
      testCases: [
        { input: '[[["1","1","0"],["1","0","0"],["0","0","1"]]]', expectedOutput: '2', isHidden: false },
        { input: '[[["0","0"],["0","0"]]]', expectedOutput: '0', isHidden: false },
        { input: '[[["1"]]]', expectedOutput: '1', isHidden: true },
      ],
    },
    {
      section: 'Graphs',
      order: 2,
      title: 'Shortest Distances in Unweighted Graph',
      difficulty: 'Medium',
      params: ['n', 'edges', 'src'],
      description:
        'You have `n` nodes labeled `0..n-1` and an undirected unweighted graph given by `edges` where each edge is `[u,v]`. Return an array `dist` where `dist[i]` is the shortest number of edges from `src` to `i`. Use `-1` if unreachable.',
      constraints: ['1 ≤ n ≤ 2e5', '0 ≤ edges.length ≤ 2e5'],
      hints: ['BFS from src.'],
      examples: [
        { input: 'n=5, edges=[[0,1],[1,2],[0,3]], src=0', output: '[0,1,2,1,-1]', explanation: 'Node 4 unreachable.' },
      ],
      testCases: [
        { input: '[5, [[0,1],[1,2],[0,3]], 0]', expectedOutput: '[0,1,2,1,-1]', isHidden: false },
        { input: '[3, [[0,1],[1,2]], 2]', expectedOutput: '[2,1,0]', isHidden: false },
        { input: '[4, [], 1]', expectedOutput: '[-1,0,-1,-1]', isHidden: true },
      ],
    },
    {
      section: 'Graphs',
      order: 3,
      title: 'Detect Cycle in Undirected Graph',
      difficulty: 'Medium',
      params: ['n', 'edges'],
      description:
        'Given an undirected graph with `n` nodes and edges list `edges`, return `true` if the graph contains a cycle, otherwise return `false`.',
      constraints: ['1 ≤ n ≤ 2e5', '0 ≤ edges.length ≤ 2e5'],
      hints: ['Union-Find or DFS with parent tracking.'],
      examples: [
        { input: 'n=3, edges=[[0,1],[1,2],[2,0]]', output: 'true', explanation: 'Triangle is a cycle.' },
      ],
      testCases: [
        { input: '[3, [[0,1],[1,2],[2,0]]]', expectedOutput: 'true', isHidden: false },
        { input: '[4, [[0,1],[1,2],[2,3]]]', expectedOutput: 'false', isHidden: false },
        { input: '[1, []]', expectedOutput: 'false', isHidden: true },
      ],
    },
    {
      section: 'Graphs',
      order: 4,
      title: 'Topological Sort (Kahn)',
      difficulty: 'Medium',
      params: ['n', 'edges'],
      description:
        'You have a directed graph with `n` nodes (0..n-1) and edges `[u,v]` meaning `u -> v`. Return a topological ordering of all nodes if possible; otherwise return an empty array.\n\nFor stable evaluation, when multiple nodes have indegree 0, pick the smallest label first.',
      constraints: ['1 ≤ n ≤ 2e5', '0 ≤ edges.length ≤ 2e5'],
      hints: ['Use Kahn’s algorithm with a min-heap or sorted queue of zero-indegree nodes.'],
      examples: [
        { input: 'n=4, edges=[[1,0],[2,0],[3,1],[3,2]]', output: '[3,1,2,0]', explanation: '3 must come before 1 and 2.' },
      ],
      testCases: [
        { input: '[4, [[1,0],[2,0],[3,1],[3,2]]]', expectedOutput: '[3,1,2,0]', isHidden: false },
        { input: '[2, [[0,1]]]', expectedOutput: '[0,1]', isHidden: false },
        { input: '[2, [[0,1],[1,0]]]', expectedOutput: '[]', isHidden: true },
      ],
    },
    {
      section: 'Graphs',
      order: 5,
      title: 'Course Schedule Feasibility',
      difficulty: 'Medium',
      params: ['n', 'prereq'],
      description:
        'You must complete `n` courses labeled `0..n-1`. Each prerequisite pair `[a,b]` means you must finish `b` before `a`. Return `true` if it is possible to finish all courses.',
      constraints: ['1 ≤ n ≤ 2e5', '0 ≤ prereq.length ≤ 2e5'],
      hints: ['Detect cycle in directed graph via topo sort or DFS states.'],
      examples: [
        { input: 'n=2, prereq=[[1,0]]', output: 'true', explanation: 'Take 0 then 1.' },
      ],
      testCases: [
        { input: '[2, [[1,0]]]', expectedOutput: 'true', isHidden: false },
        { input: '[2, [[1,0],[0,1]]]', expectedOutput: 'false', isHidden: false },
        { input: '[3, []]', expectedOutput: 'true', isHidden: true },
      ],
    },
    {
      section: 'Graphs',
      order: 6,
      title: 'Dijkstra Shortest Paths',
      difficulty: 'Hard',
      params: ['n', 'edges', 'src'],
      description:
        'You have a directed weighted graph with `n` nodes (0..n-1). `edges` is a list of `[u,v,w]` meaning an edge `u -> v` with weight `w` (non-negative). Return an array `dist` of shortest distances from `src` to every node; use `-1` for unreachable nodes.',
      constraints: ['1 ≤ n ≤ 2e5', '0 ≤ edges.length ≤ 2e5', '0 ≤ w ≤ 1e9'],
      hints: ['Use a priority queue (min-heap) with (dist,node).'],
      examples: [
        { input: 'n=5, edges=[[0,1,2],[0,2,5],[1,2,1],[1,3,2],[2,3,1]], src=0', output: '[0,2,3,4,-1]', explanation: '0→1→2 costs 3; 0→1→3 costs 4.' },
      ],
      testCases: [
        { input: '[5, [[0,1,2],[0,2,5],[1,2,1],[1,3,2],[2,3,1]], 0]', expectedOutput: '[0,2,3,4,-1]', isHidden: false },
        { input: '[3, [[0,1,10],[0,2,1],[2,1,1]], 0]', expectedOutput: '[0,2,1]', isHidden: false },
        { input: '[2, [], 1]', expectedOutput: '[-1,0]', isHidden: true },
      ],
    },

    // Backtracking & Bitmask (4)
    {
      section: 'Backtracking & Bitmask',
      order: 1,
      title: 'Generate Balanced Parentheses',
      difficulty: 'Medium',
      params: ['n'],
      description:
        'Given `n`, generate all strings with `n` pairs of balanced parentheses. Return them in **lexicographic order**.',
      constraints: ['0 ≤ n ≤ 10'],
      hints: ['Backtrack with counts of open/close used; keep result sorted by exploring "(" before ")".'],
      examples: [
        { input: 'n=3', output: '["((()))","(()())","(())()","()(())","()()()"]', explanation: 'All valid combinations.' },
      ],
      testCases: [
        { input: '[3]', expectedOutput: '["((()))","(()())","(())()","()(())","()()()"]', isHidden: false },
        { input: '[1]', expectedOutput: '["()"]', isHidden: false },
        { input: '[0]', expectedOutput: '[""]', isHidden: true },
      ],
    },
    {
      section: 'Backtracking & Bitmask',
      order: 2,
      title: 'Subset Sum Equals Target',
      difficulty: 'Medium',
      params: ['arr', 'target'],
      description:
        'Given an array of integers `arr` and integer `target`, return `true` if there exists a subset whose sum equals `target` (each element can be used at most once).',
      constraints: ['1 ≤ arr.length ≤ 40', '-1e9 ≤ arr[i] ≤ 1e9', '-1e9 ≤ target ≤ 1e9'],
      hints: ['Meet-in-the-middle works well for n up to 40.', 'Or backtracking with pruning if values are small.'],
      examples: [
        { input: 'arr=[3,34,4,12,5,2], target=9', output: 'true', explanation: 'Subset 4+5=9.' },
      ],
      testCases: [
        { input: '[[3,34,4,12,5,2], 9]', expectedOutput: 'true', isHidden: false },
        { input: '[[1,2,3], 7]', expectedOutput: 'false', isHidden: false },
        { input: '[[5,-2,7], 3]', expectedOutput: 'true', isHidden: true },
      ],
    },
    {
      section: 'Backtracking & Bitmask',
      order: 3,
      title: 'N-Queens Count',
      difficulty: 'Hard',
      params: ['n'],
      description:
        'Return the number of distinct ways to place `n` queens on an `n x n` chessboard so that no two queens attack each other.',
      constraints: ['1 ≤ n ≤ 14'],
      hints: ['Use backtracking with columns and diagonals sets/bitmasks.'],
      examples: [
        { input: 'n=4', output: '2', explanation: 'There are 2 solutions for 4-queens.' },
      ],
      testCases: [
        { input: '[4]', expectedOutput: '2', isHidden: false },
        { input: '[1]', expectedOutput: '1', isHidden: false },
        { input: '[8]', expectedOutput: '92', isHidden: true },
      ],
    },
    {
      section: 'Backtracking & Bitmask',
      order: 4,
      title: 'Maximum Bitwise AND of Any Pair',
      difficulty: 'Medium',
      params: ['arr'],
      description:
        'Given an integer array `arr`, return the maximum value of `arr[i] & arr[j]` over all pairs `i < j`.\n\nTry to do better than $O(n^2)$.',
      constraints: ['2 ≤ arr.length ≤ 2e5', '0 ≤ arr[i] ≤ 1e9'],
      hints: ['Greedy bit-building: check if at least two numbers have candidate bits set.'],
      examples: [
        { input: 'arr=[4,8,12,16]', output: '8', explanation: '12 & 8 = 8.' },
      ],
      testCases: [
        { input: '[[4,8,12,16]]', expectedOutput: '8', isHidden: false },
        { input: '[[1,2,3]]', expectedOutput: '2', isHidden: false },
        { input: '[[0,0,0,7]]', expectedOutput: '0', isHidden: true },
      ],
    },

    // Math & Number Theory (2)
    {
      section: 'Math & Number Theory',
      order: 1,
      title: 'Count Divisors for Each Number',
      difficulty: 'Easy',
      params: ['nums'],
      description:
        'Given an array of positive integers `nums`, return an array where each element is the number of positive divisors of `nums[i]`.\n\nExample: 6 has divisors 1,2,3,6 → 4.',
      constraints: ['1 ≤ nums.length ≤ 2e5', '1 ≤ nums[i] ≤ 1e6'],
      hints: ['Precompute smallest prime factor (SPF) up to max(nums). Factor each number quickly.'],
      examples: [
        { input: 'nums=[1,6,10]', output: '[1,4,4]', explanation: '1→1 divisor; 6→4; 10→4.' },
      ],
      testCases: [
        { input: '[[1,6,10]]', expectedOutput: '[1,4,4]', isHidden: false },
        { input: '[[16,25]]', expectedOutput: '[5,3]', isHidden: false },
        { input: '[[999983]]', expectedOutput: '[2]', isHidden: true },
      ],
    },
    {
      section: 'Math & Number Theory',
      order: 2,
      title: 'Fast Modular Exponentiation',
      difficulty: 'Medium',
      params: ['a', 'b', 'mod'],
      description:
        'Compute `(a^b) mod mod` efficiently. `b` can be very large.\n\nReturn the result as an integer in [0, mod-1].',
      constraints: ['0 ≤ a ≤ 1e18', '0 ≤ b ≤ 1e18', '1 ≤ mod ≤ 1e9+7'],
      hints: ['Binary exponentiation (fast power). Use (a%mod) as base.'],
      examples: [
        { input: 'a=2, b=10, mod=1000', output: '24', explanation: '2^10=1024; 1024 mod 1000 = 24.' },
      ],
      testCases: [
        { input: '[2, 10, 1000]', expectedOutput: '24', isHidden: false },
        { input: '[3, 0, 7]', expectedOutput: '1', isHidden: false },
        { input: '[10, 9, 1]', expectedOutput: '0', isHidden: true },
      ],
    },
  ],
};
