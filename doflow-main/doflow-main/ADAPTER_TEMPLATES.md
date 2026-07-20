# Adapter Templates

Use these snippets when you want to expose a LeetCode-style signature to learners while the backend still calls a canonical `solve` function. Each template expects you to keep the learner-facing stub in `visibleCode` (e.g., `class Solution { public int[] twoSum(...) { ... } }`) and paste the matching adapter into `adapterCode`.

Every template below implements the required `__doflow_entry` entrypoint for its language and shows how to call the learner stub, format the return value, and handle parsing.

> **Tip:** Replace the parsing logic with whatever your problem actually needs. The important parts are the entrypoint name and returning output that exactly matches `expectedOutput`.

---

## JavaScript

```javascript
function __doflow_entry(...args) {
  const [nums, target] = args;
  const result = twoSum(nums, target); // call the learner stub
  return Array.isArray(result) ? JSON.stringify(result) : String(result);
}
```

Learner stub example:

```javascript
function twoSum(nums, target) {
  // TODO: learner implementation
  return [];
}
```

---

## Python

```python
import json

def __doflow_entry(*args):
  nums, target = args
  solver = Solution()
  result = solver.twoSum(nums, target)
  return json.dumps(result)
```

Learner stub example:

```python
class Solution:
    def twoSum(self, nums, target):
        return []
```

---

## Java

```java
import java.util.*;

public final class DoFlowAdapter {
    private DoFlowAdapter() {}

    private static int[] parseIntArray(String raw) {
        if (raw == null || raw.isEmpty()) return new int[0];
        String trimmed = raw.trim();
        if (trimmed.length() <= 2) return new int[0];
        String body = trimmed.substring(1, trimmed.length() - 1);
        return body.isEmpty()
            ? new int[0]
            : Arrays.stream(body.split(","))
                .map(String::trim)
                .filter(token -> !token.isEmpty())
                .mapToInt(Integer::parseInt)
                .toArray();
    }

    public static Object __doflow_entry(String[] args) {
        int[] nums = parseIntArray(args[0]);
        int target = Integer.parseInt(args[1]);
        Solution solver = new Solution();
        int[] result = solver.twoSum(nums, target);
        return Arrays.toString(result).replace(" ", "");
    }
}
```

Learner stub example:

```java
import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[0];
    }
}
```

---

## C++

```cpp
#include <bits/stdc++.h>
using namespace std;

static vector<int> parseIntArray(const string& raw) {
    vector<int> result;
    string trimmed = raw;
    if (trimmed.size() < 2) return result;
    trimmed = trimmed.substr(1, trimmed.size() - 2);
    stringstream ss(trimmed);
    string token;
    while (getline(ss, token, ',')) {
        if (!token.empty()) {
            result.push_back(stoi(token));
        }
    }
    return result;
}

string __doflow_entry(const vector<string>& args) {
    vector<int> nums = parseIntArray(args[0]);
    int target = stoi(args[1]);
    vector<int> result = Solution().twoSum(nums, target);
    string out = "[";
    for (size_t i = 0; i < result.size(); ++i) {
        if (i) out += ",";
        out += to_string(result[i]);
    }
    out += "]";
    return out;
}
```

Learner stub example:

```cpp
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {};
    }
};
```

---

## C

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int parsed_values[2048];
static char output_buffer[256];

static int parse_array(const char* raw) {
    int count = 0;
    const char* cursor = raw;
    while (*cursor) {
        if (*cursor == '-' || isdigit(*cursor)) {
            parsed_values[count++] = strtol(cursor, (char**)&cursor, 10);
            continue;
        }
        cursor++;
    }
    return count;
}

const char* __doflow_entry(int argc, const char* argv[]) {
    (void)argc;
    int nums_len = parse_array(argv[0]);
    int target = atoi(argv[1]);
    int* result = twoSum(parsed_values, nums_len, target); // learner stub returns heap/static memory
    snprintf(output_buffer, sizeof(output_buffer), "[%d,%d]", result[0], result[1]);
    return output_buffer;
}
```

Learner stub example:

```c
#include <stddef.h>

int* twoSum(const int* nums, int numsSize, int target) {
    // Implement algorithm and return pointer to static/heap memory containing two indices.
    return NULL;
}
```

---

Feel free to duplicate these templates and adjust the parsing/formatting to match your problem's true signature. The only hard requirement is that the adapter exports the `__doflow_entry` entrypoint for its language and returns the exact string expected by Judge0.
