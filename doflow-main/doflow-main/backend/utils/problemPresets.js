const addTwoNumbersJavascriptVisible = `// Definition for singly-linked list.
// class ListNode {
//   constructor(val = 0, next = null) {
//     this.val = val;
//     this.next = next;
//   }
// }

function addTwoNumbers(l1, l2) {
  // Return the head of the resulting list
  return null;
}`;

const addTwoNumbersJavascriptAdapter = `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

const buildList = (values = []) => {
  const dummy = new ListNode();
  let tail = dummy;
  (values || []).forEach((value) => {
    tail.next = new ListNode(Number(value) || 0);
    tail = tail.next;
  });
  return dummy.next;
};

const listToArray = (head) => {
  const result = [];
  let node = head;
  while (node) {
    result.push(node.val);
    node = node.next;
  }
  return result;
};

function __doflow_entry(rawL1, rawL2) {
  const l1 = buildList(Array.isArray(rawL1) ? rawL1 : []);
  const l2 = buildList(Array.isArray(rawL2) ? rawL2 : []);
  const answer = addTwoNumbers(l1, l2);
  return JSON.stringify(listToArray(answer));
}`;

const addTwoNumbersPythonVisible = `from typing import Optional

# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def addTwoNumbers(self, l1: Optional['ListNode'], l2: Optional['ListNode']) -> Optional['ListNode']:
        # Return the head of the resulting list
        return None
`;

const addTwoNumbersPythonAdapter = `from typing import Optional


class ListNode:
    def __init__(self, val: int = 0, next: Optional['ListNode'] = None):
        self.val = val
        self.next = next


def build_list(values):
    dummy = ListNode()
    tail = dummy
    for value in values or []:
        tail.next = ListNode(int(value))
        tail = tail.next
    return dummy.next


def list_to_array(head):
    out = []
    node = head
    while node:
        out.append(node.val)
        node = node.next
    return out


def __format_result(values):
    if not values:
        return '[]'
    return '[' + ','.join(str(v) for v in values) + ']'


def __doflow_entry(l1_raw, l2_raw):
    solver = Solution()
    l1 = build_list(l1_raw if isinstance(l1_raw, list) else [])
    l2 = build_list(l2_raw if isinstance(l2_raw, list) else [])
    result = solver.addTwoNumbers(l1, l2)
    return __format_result(list_to_array(result) if result else [])
`;

const addTwoNumbersJavaVisible = `// java.util.* is available for use.
// Definition for singly-linked list.
// class ListNode {
//     int val;
//     ListNode next;
//     ListNode() {}
//     ListNode(int val) { this.val = val; }
//     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
// }

class Solution {
  public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    // Return the head of the resulting list
    return null;
  }
}`;

const addTwoNumbersJavaAdapter = `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

final class __ListUtils {
    private __ListUtils() {}

    static ListNode build(String raw) {
        if (raw == null || raw.isEmpty()) return null;
        String trimmed = raw.trim();
        if (trimmed.length() <= 2) return null;
        String body = trimmed.substring(1, trimmed.length() - 1);
        String[] tokens = body.split(",");
        ListNode dummy = new ListNode();
        ListNode tail = dummy;
        for (String token : tokens) {
            String piece = token.trim();
            if (!piece.isEmpty()) {
                tail.next = new ListNode(Integer.parseInt(piece));
                tail = tail.next;
            }
        }
        return dummy.next;
    }

    static String toString(ListNode head) {
        if (head == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        ListNode node = head;
        while (node != null) {
            if (node != head) sb.append(',');
            sb.append(node.val);
            node = node.next;
        }
        sb.append(']');
        return sb.toString();
    }
}

final class DoFlowAdapter {
    private DoFlowAdapter() {}

    static Object __doflow_entry(String[] args) {
        String rawL1 = args.length > 0 ? args[0] : "[]";
        String rawL2 = args.length > 1 ? args[1] : "[]";
        ListNode l1 = __ListUtils.build(rawL1);
        ListNode l2 = __ListUtils.build(rawL2);
        ListNode answer = new Solution().addTwoNumbers(l1, l2);
        return __ListUtils.toString(answer);
    }
}`;

const addTwoNumbersCppVisible = `#include <bits/stdc++.h>
using namespace std;

// Definition for singly-linked list.
struct ListNode {
  int val;
  ListNode* next;
  ListNode() : val(0), next(nullptr) {}
  ListNode(int x) : val(x), next(nullptr) {}
  ListNode(int x, ListNode* next) : val(x), next(next) {}
};

ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
  // Return the head of the resulting list
  return nullptr;
}`;

const addTwoNumbersCppAdapter = `#include <bits/stdc++.h>
using namespace std;

static string trim(const string& value) {
  const string ws = " \t\\n\\r";
  const auto start = value.find_first_not_of(ws);
    if (start == string::npos) return "";
    const auto end = value.find_last_not_of(ws);
    return value.substr(start, end - start + 1);
}

static vector<int> parseIntArray(const string& raw) {
    vector<int> result;
    string trimmed = trim(raw);
    if (trimmed.size() <= 2) return result;
    string body = trimmed.substr(1, trimmed.size() - 2);
    string token;
    stringstream ss(body);
    while (getline(ss, token, ',')) {
        token = trim(token);
        if (!token.empty()) result.push_back(stoi(token));
    }
    return result;
}

static ListNode* buildList(const vector<int>& values) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    for (int value : values) {
        tail->next = new ListNode(value);
        tail = tail->next;
    }
    return dummy.next;
}

static string listToString(ListNode* head) {
    vector<int> out;
    for (auto* node = head; node != nullptr; node = node->next) {
        out.push_back(node->val);
    }
    stringstream ss;
    ss << '[';
    for (size_t i = 0; i < out.size(); ++i) {
        if (i) ss << ',';
        ss << out[i];
    }
    ss << ']';
    return ss.str();
}

string __doflow_entry(const vector<string>& args) {
    string rawL1 = args.size() > 0 ? args[0] : "[]";
    string rawL2 = args.size() > 1 ? args[1] : "[]";
    ListNode* l1 = buildList(parseIntArray(rawL1));
    ListNode* l2 = buildList(parseIntArray(rawL2));
    ListNode* ans = addTwoNumbers(l1, l2);
    return listToString(ans);
}`;

const addTwoNumbersCVisible = `// Definition for singly-linked list.
// struct ListNode {
//     int val;
//     struct ListNode *next;
// };

#ifndef DOFLOW_LISTNODE_DEFINED
#define DOFLOW_LISTNODE_DEFINED
struct ListNode {
  int val;
  struct ListNode *next;
};
#endif

struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {
  // Return the head of the resulting list
  return NULL;
}`;

const addTwoNumbersCAdapter = `#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#ifndef DOFLOW_LISTNODE_DEFINED
#define DOFLOW_LISTNODE_DEFINED
struct ListNode {
  int val;
  struct ListNode* next;
};
#endif

static int* parseIntArray(const char* raw, int* outCount) {
  if (!raw) {
    *outCount = 0;
    return NULL;
  }
  int capacity = 8;
  int size = 0;
  int* values = (int*)malloc(sizeof(int) * capacity);
  if (!values) {
    *outCount = 0;
    return NULL;
  }
  const char* cursor = raw;
  while (*cursor) {
    if (*cursor == '-' || (*cursor >= '0' && *cursor <= '9')) {
      char* endPtr = NULL;
      long parsed = strtol(cursor, &endPtr, 10);
      if (size >= capacity) {
        capacity *= 2;
        int* grown = (int*)realloc(values, sizeof(int) * capacity);
        if (!grown) {
          free(values);
          *outCount = 0;
          return NULL;
        }
        values = grown;
      }
      values[size++] = (int)parsed;
      cursor = endPtr;
    } else {
      cursor++;
    }
  }
  *outCount = size;
  return values;
}

static struct ListNode* buildListFromArray(const int* values, int count) {
  struct ListNode dummy;
  dummy.val = 0;
  dummy.next = NULL;
  struct ListNode* tail = &dummy;
  for (int i = 0; i < count; ++i) {
    struct ListNode* node = (struct ListNode*)malloc(sizeof(struct ListNode));
    if (!node) {
      break;
    }
    node->val = values[i];
    node->next = NULL;
    tail->next = node;
    tail = node;
  }
  return dummy.next;
}

static const char* listToString(struct ListNode* head) {
  static char buffer[2048];
  size_t offset = 0;
  buffer[offset++] = '[';
  struct ListNode* node = head;
  while (node && offset < sizeof(buffer) - 2) {
    if (node != head) {
      buffer[offset++] = ',';
    }
    int written = snprintf(buffer + offset, sizeof(buffer) - offset, "%d", node->val);
    if (written < 0) {
      break;
    }
    offset += (size_t)written;
    node = node->next;
  }
  buffer[offset++] = ']';
  buffer[offset] = '\0';
  return buffer;
}

const char* __doflow_entry(int argc, const char* argv[]) {
  const char* rawL1 = argc > 0 ? argv[0] : "[]";
  const char* rawL2 = argc > 1 ? argv[1] : "[]";

  int len1 = 0;
  int len2 = 0;
  int* arr1 = parseIntArray(rawL1, &len1);
  int* arr2 = parseIntArray(rawL2, &len2);

  struct ListNode* l1 = buildListFromArray(arr1, len1);
  struct ListNode* l2 = buildListFromArray(arr2, len2);
  struct ListNode* ans = addTwoNumbers(l1, l2);

  if (arr1) free(arr1);
  if (arr2) free(arr2);

  return listToString(ans);
}`;

export const problemPresets = {
  'Two Sum': {
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
    starterCode: [
      {
        language: 'javascript',
        visibleCode: `function twoSum(nums, target) {
  // Return indices of two numbers adding up to target
  return [];
}`,
        adapterCode: `function __doflow_entry(...args) {
  const [rawNums, rawTarget] = args;
  const nums = Array.isArray(rawNums) ? rawNums : [];
  const target = typeof rawTarget === 'number' ? rawTarget : Number(rawTarget || 0);
  const result = twoSum(nums, Number.isFinite(target) ? target : 0);
  return JSON.stringify(Array.isArray(result) ? result : []);
}`,
        code: `function twoSum(nums, target) {
  // Return indices of two numbers adding up to target
  return [];
}`,
      },
      {
        language: 'python',
        visibleCode: `from typing import List


class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Return indices of two numbers adding up to target
        return []
`,
        adapterCode: `from typing import List


def __doflow_entry(nums, target):
    safe_nums = nums if isinstance(nums, list) else []
    safe_target = target if isinstance(target, int) else int(target or 0)
    solver = Solution()
    result = solver.twoSum(safe_nums, safe_target)
    return str(result if isinstance(result, list) else [])
`,
        code: `from typing import List


class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Return indices of two numbers adding up to target
        return []
`,
      },
    ],
    testCases: [
      { input: '[[2,7,11,15], 9]', expectedOutput: '[0,1]', isHidden: false },
      { input: '[[3,2,4], 6]', expectedOutput: '[1,2]', isHidden: true },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
    hints: ['Use a hash map to record indices.', 'Stop when you find the complementary value.'],
    examples: [
      {
        input: '[[2,7,11,15], 9]',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] == 9',
      },
    ],
  },
  'Add Two Numbers': {
    description:
      'You are given two non-empty linked lists representing two non-negative integers in reverse order. Add the two numbers and return the sum as a linked list.',
    starterCode: [
      {
        language: 'javascript',
        visibleCode: addTwoNumbersJavascriptVisible,
        adapterCode: addTwoNumbersJavascriptAdapter,
        code: addTwoNumbersJavascriptVisible,
      },
      {
        language: 'python',
        visibleCode: addTwoNumbersPythonVisible,
        adapterCode: addTwoNumbersPythonAdapter,
        code: addTwoNumbersPythonVisible,
      },
      {
        language: 'java',
        visibleCode: addTwoNumbersJavaVisible,
        adapterCode: addTwoNumbersJavaAdapter,
        code: addTwoNumbersJavaVisible,
      },
      {
        language: 'cpp',
        visibleCode: addTwoNumbersCppVisible,
        adapterCode: addTwoNumbersCppAdapter,
        code: addTwoNumbersCppVisible,
      },
      {
        language: 'c',
        visibleCode: addTwoNumbersCVisible,
        adapterCode: addTwoNumbersCAdapter,
        code: addTwoNumbersCVisible,
      },
    ],
    testCases: [
      { input: '[[2,4,3],[5,6,4]]', expectedOutput: '[7,0,8]', isHidden: false },
      { input: '[[0],[0]]', expectedOutput: '[0]', isHidden: false },
      { input: '[[9,9,9,9,9,9,9],[9,9,9,9]]', expectedOutput: '[8,9,9,9,0,0,0,1]', isHidden: true },
      { input: '[[5],[5]]', expectedOutput: '[0,1]', isHidden: true },
    ],
    constraints: [
      'Each linked list has between 1 and 100 nodes.',
      '0 <= Node.val <= 9',
      'Lists store digits in reverse order and represent numbers without leading zeros.',
    ],
    hints: [
      'Traverse both lists simultaneously with a running carry.',
      'Use a dummy head node to simplify result construction.',
      'Append an extra node when a carry remains after both lists end.',
    ],
    examples: [
      {
        input: '[[2,4,3],[5,6,4]]',
        output: '[7,0,8]',
        explanation: '342 + 465 = 807',
      },
      {
        input: '[[9,9,9,9,9,9,9],[9,9,9,9]]',
        output: '[8,9,9,9,0,0,0,1]',
        explanation: '9999999 + 9999 = 10009998',
      },
    ],
  },
  'Reverse String': {
    description: 'Write a function that reverses a string.',
    starterCode: [
      {
        language: 'javascript',
        visibleCode: `function reverseString(value) {
  // Return the reversed string
  return value;
}`,
        adapterCode: `function __doflow_entry(...args) {
  const [value] = args;
  return reverseString(String(value ?? ''));
}`,
        code: `function reverseString(value) {
  // Return the reversed string
  return value;
}`,
      },
      {
        language: 'python',
        visibleCode: `def reverseString(value: str) -> str:
    """Return the reversed string"""
    return value
`,
        adapterCode: `def __doflow_entry(*args):
    (value,) = args
    return reverseString(str(value))
`,
        code: `def reverseString(value: str) -> str:
    """Return the reversed string"""
    return value
`,
      },
    ],
    testCases: [
      { input: '"hello"', expectedOutput: 'olleh', isHidden: false },
      { input: '"doflow"', expectedOutput: 'wolfod', isHidden: true },
    ],
    constraints: ['1 <= s.length <= 10^5'],
    hints: ['Use two pointers moving toward the center.', 'Mind immutable strings in some languages.'],
    examples: [
      {
        input: '"hello"',
        output: 'olleh',
        explanation: 'Reverse the characters.',
      },
    ],
  },
  'Valid Palindrome': {
    description:
      'Given a string s, return true if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    starterCode: [
      {
        language: 'javascript',
        visibleCode: `function isPalindrome(value) {
  // Return whether value is a valid palindrome
  return true;
}`,
        adapterCode: `function __doflow_entry(...args) {
  const [value] = args;
  return isPalindrome(String(value ?? '')) ? 'true' : 'false';
}`,
        code: `function isPalindrome(value) {
  // Return whether value is a valid palindrome
  return true;
}`,
      },
      {
        language: 'python',
        visibleCode: `def isPalindrome(value: str) -> bool:
    """Return whether value is a valid palindrome"""
    return True
`,
        adapterCode: `def __doflow_entry(*args):
    (value,) = args
    return 'true' if isPalindrome(str(value)) else 'false'
`,
        code: `def isPalindrome(value: str) -> bool:
    """Return whether value is a valid palindrome"""
    return True
`,
      },
    ],
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
      { input: '"race a car"', expectedOutput: 'false', isHidden: true },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5'],
    hints: ['Normalize characters to lowercase alphanumerics.', 'Use two pointers toward the center.'],
    examples: [
      {
        input: '"A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: 'After filtering, the string reads the same forward and backward.',
      },
    ],
  },
};

export const defaultStarterCode = [
  {
    language: 'javascript',
    visibleCode: `function solve() {
  // Your code here
}
`,
    adapterCode: `function __doflow_entry(...args) {
  return solve(...args);
}
`,
    code: `function solve() {
  // Your code here
}
`,
  },
  {
    language: 'python',
    visibleCode: `def solve(*args):
    """Your code here"""
    pass
`,
    adapterCode: `def __doflow_entry(*args):
    return solve(*args)
`,
    code: `def solve(*args):
    """Your code here"""
    pass
`,
  },
];

export const defaultTestCases = [{ input: '[]', expectedOutput: '[]', isHidden: false }];
export const defaultConstraints = ['1 <= n <= 10^3'];
export const defaultHints = ['Think through the example manually first.'];

export const cloneArray = (value = []) => value.map((item) => (typeof item === 'object' && item !== null ? { ...item } : item));

export const getPresetForProblem = (title) => problemPresets[title] || null;
