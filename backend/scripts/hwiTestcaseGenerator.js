const hashStringToSeed = (value) => {
  const str = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInt = (rng, min, max) => {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(rng() * (hi - lo + 1)) + lo;
};

const randomChoice = (rng, items) => {
  if (!items.length) return undefined;
  return items[randomInt(rng, 0, items.length - 1)];
};

const shuffleInPlace = (rng, arr) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(rng, 0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const formatExpectedOutput = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const normalizeInputKey = (input) => String(input ?? '').trim().replace(/\s+/g, '');

const buildMinHeap = () => {
  const data = [];
  const less = (a, b) => {
    if (a[0] !== b[0]) return a[0] < b[0];
    return a[1] < b[1];
  };
  const siftUp = (index) => {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (less(data[parent], data[index])) break;
      [data[parent], data[index]] = [data[index], data[parent]];
      index = parent;
    }
  };
  const siftDown = (index) => {
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;
      if (left < data.length && less(data[left], data[smallest])) smallest = left;
      if (right < data.length && less(data[right], data[smallest])) smallest = right;
      if (smallest === index) break;
      [data[smallest], data[index]] = [data[index], data[smallest]];
      index = smallest;
    }
  };

  return {
    push(item) {
      data.push(item);
      siftUp(data.length - 1);
    },
    pop() {
      if (!data.length) return null;
      const top = data[0];
      const last = data.pop();
      if (data.length && last !== undefined) {
        data[0] = last;
        siftDown(0);
      }
      return top;
    },
    get size() {
      return data.length;
    },
  };
};

const solvePairWithGivenDifference = (arr, k) => {
  const seen = new Set();
  const diff = Math.abs(k);
  for (const x of arr) {
    if (seen.has(x - diff) || seen.has(x + diff)) return true;
    seen.add(x);
  }
  return false;
};

const solveLongestSubarrayWithSumK = (arr, k) => {
  const firstIndex = new Map();
  let prefix = 0;
  let best = 0;
  firstIndex.set(0, -1);
  for (let i = 0; i < arr.length; i += 1) {
    prefix += arr[i];
    if (!firstIndex.has(prefix)) firstIndex.set(prefix, i);
    const want = prefix - k;
    if (firstIndex.has(want)) {
      best = Math.max(best, i - firstIndex.get(want));
    }
  }
  return best;
};

const solveCountSubarraysProductLessThanK = (arr, k) => {
  if (k <= 1) return 0;
  let prod = 1;
  let left = 0;
  let ans = 0;
  for (let right = 0; right < arr.length; right += 1) {
    prod *= arr[right];
    while (left <= right && prod >= k) {
      prod /= arr[left];
      left += 1;
    }
    ans += right - left + 1;
  }
  return ans;
};

const solveMinSwapsGroupOnes = (arr) => {
  const ones = arr.reduce((s, x) => s + (x === 1 ? 1 : 0), 0);
  if (ones <= 1) return 0;
  let windowOnes = 0;
  for (let i = 0; i < ones; i += 1) windowOnes += arr[i] === 1 ? 1 : 0;
  let best = windowOnes;
  for (let i = ones; i < arr.length; i += 1) {
    windowOnes += arr[i] === 1 ? 1 : 0;
    windowOnes -= arr[i - ones] === 1 ? 1 : 0;
    best = Math.max(best, windowOnes);
  }
  return ones - best;
};

const solveMergeOverlappingIntervals = (intervals) => {
  if (!intervals.length) return [];
  const sorted = intervals
    .map((x) => [Number(x[0]), Number(x[1])])
    .sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const [s, e] = sorted[i];
    const last = merged[merged.length - 1];
    if (s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      merged.push([s, e]);
    }
  }
  return merged;
};

const solveKthMissingPositive = (arr, k) => {
  let lo = 0;
  let hi = arr.length - 1;
  const missingAt = (i) => arr[i] - (i + 1);
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (missingAt(mid) < k) lo = mid + 1;
    else hi = mid - 1;
  }
  return lo + k;
};

const solveTrappingRainwater = (heights) => {
  let left = 0;
  let right = heights.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (heights[left] <= heights[right]) {
      leftMax = Math.max(leftMax, heights[left]);
      water += leftMax - heights[left];
      left += 1;
    } else {
      rightMax = Math.max(rightMax, heights[right]);
      water += rightMax - heights[right];
      right -= 1;
    }
  }
  return water;
};

const solveLongestCommonPrefix = (words) => {
  if (!words.length) return '';
  let prefix = words[0] ?? '';
  for (let i = 1; i < words.length; i += 1) {
    const w = words[i] ?? '';
    while (prefix.length && !w.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
    if (!prefix.length) return '';
  }
  return prefix;
};

const solveIsomorphicStrings = (s, t) => {
  if (s.length !== t.length) return false;
  const st = new Map();
  const ts = new Map();
  for (let i = 0; i < s.length; i += 1) {
    const a = s[i];
    const b = t[i];
    if (st.has(a) && st.get(a) !== b) return false;
    if (ts.has(b) && ts.get(b) !== a) return false;
    st.set(a, b);
    ts.set(b, a);
  }
  return true;
};

const solveMinDeletionsUniqueFreq = (s) => {
  const freq = new Array(26).fill(0);
  for (const ch of s) {
    const idx = ch.charCodeAt(0) - 97;
    if (idx >= 0 && idx < 26) freq[idx] += 1;
  }
  const used = new Set();
  let deletions = 0;
  for (let f of freq) {
    while (f > 0 && used.has(f)) {
      f -= 1;
      deletions += 1;
    }
    if (f > 0) used.add(f);
  }
  return deletions;
};

const solveFindAllAnagramStartIndices = (s, p) => {
  const n = s.length;
  const m = p.length;
  if (m > n) return [];
  const need = new Array(26).fill(0);
  const have = new Array(26).fill(0);
  for (const ch of p) need[ch.charCodeAt(0) - 97] += 1;
  for (let i = 0; i < m; i += 1) have[s.charCodeAt(i) - 97] += 1;
  const out = [];
  const same = () => {
    for (let i = 0; i < 26; i += 1) if (need[i] !== have[i]) return false;
    return true;
  };
  if (same()) out.push(0);
  for (let i = m; i < n; i += 1) {
    have[s.charCodeAt(i) - 97] += 1;
    have[s.charCodeAt(i - m) - 97] -= 1;
    if (same()) out.push(i - m + 1);
  }
  return out;
};

const solveLongestPalindromeLengthFromLetters = (s) => {
  const map = new Map();
  for (const ch of s) map.set(ch, (map.get(ch) || 0) + 1);
  let length = 0;
  let hasOdd = false;
  for (const count of map.values()) {
    length += Math.floor(count / 2) * 2;
    if (count % 2 === 1) hasOdd = true;
  }
  return length + (hasOdd ? 1 : 0);
};

const solveSmallestWindowContainingPattern = (s, t) => {
  if (!t.length) return '';
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
  const have = new Map();
  let needCount = need.size;
  let haveCount = 0;
  let left = 0;
  let best = [0, Infinity];
  for (let right = 0; right < s.length; right += 1) {
    const ch = s[right];
    if (need.has(ch)) {
      have.set(ch, (have.get(ch) || 0) + 1);
      if (have.get(ch) === need.get(ch)) haveCount += 1;
    }
    while (haveCount === needCount && left <= right) {
      if (right - left + 1 < best[1] - best[0] + 1) best = [left, right];
      const lch = s[left];
      if (need.has(lch)) {
        have.set(lch, have.get(lch) - 1);
        if (have.get(lch) < need.get(lch)) haveCount -= 1;
      }
      left += 1;
    }
  }
  if (best[1] === Infinity) return '';
  return s.slice(best[0], best[1] + 1);
};

const solveNextGreaterElementCircular = (arr) => {
  const n = arr.length;
  const res = new Array(n).fill(-1);
  const stack = [];
  for (let i = 0; i < 2 * n; i += 1) {
    const idx = i % n;
    while (stack.length && arr[stack[stack.length - 1]] < arr[idx]) {
      res[stack.pop()] = arr[idx];
    }
    if (i < n) stack.push(idx);
  }
  return res;
};

const solveStockSpan = (prices) => {
  const span = new Array(prices.length).fill(1);
  const stack = [];
  for (let i = 0; i < prices.length; i += 1) {
    while (stack.length && prices[stack[stack.length - 1]] <= prices[i]) stack.pop();
    span[i] = stack.length ? i - stack[stack.length - 1] : i + 1;
    stack.push(i);
  }
  return span;
};

const solveSlidingWindowMaximum = (arr, k) => {
  const deque = [];
  const out = [];
  for (let i = 0; i < arr.length; i += 1) {
    while (deque.length && deque[0] <= i - k) deque.shift();
    while (deque.length && arr[deque[deque.length - 1]] <= arr[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) out.push(arr[deque[0]]);
  }
  return out;
};

const solveKMostFrequentElements = (arr, k) => {
  const freq = new Map();
  for (const x of arr) freq.set(x, (freq.get(x) || 0) + 1);
  const entries = [...freq.entries()];
  entries.sort((a, b) => (b[1] - a[1]) || (a[0] - b[0]));
  const picked = entries.slice(0, k).map((e) => e[0]);
  picked.sort((a, b) => a - b);
  return picked;
};

const solveMergeKSortedArrays = (arrays) => {
  const out = [];
  for (const arr of arrays) for (const x of arr) out.push(x);
  out.sort((a, b) => a - b);
  return out;
};

const solveFirstNonRepeatingStream = (stream) => {
  const freq = new Array(26).fill(0);
  const q = [];
  let head = 0;
  let out = '';
  for (const ch of stream) {
    const idx = ch.charCodeAt(0) - 97;
    freq[idx] += 1;
    q.push(ch);
    while (head < q.length && freq[q[head].charCodeAt(0) - 97] > 1) head += 1;
    out += head < q.length ? q[head] : '#';
  }
  return out;
};

const solveMinimumPlatformsNeeded = (arrivals, departures) => {
  const a = [...arrivals].sort((x, y) => x - y);
  const d = [...departures].sort((x, y) => x - y);
  let i = 0;
  let j = 0;
  let platforms = 0;
  let best = 0;
  while (i < a.length) {
    if (j < d.length && a[i] >= d[j]) {
      platforms -= 1;
      j += 1;
    } else {
      platforms += 1;
      best = Math.max(best, platforms);
      i += 1;
    }
  }
  return best;
};

const solveJumpGameReachEnd = (arr) => {
  let far = 0;
  for (let i = 0; i < arr.length; i += 1) {
    if (i > far) return false;
    far = Math.max(far, i + arr[i]);
  }
  return true;
};

const solveMaximizeSumAfterKNegations = (arr, k) => {
  const nums = [...arr].sort((a, b) => a - b);
  let i = 0;
  let flips = k;
  while (i < nums.length && flips > 0 && nums[i] < 0) {
    nums[i] = -nums[i];
    flips -= 1;
    i += 1;
  }
  nums.sort((a, b) => a - b);
  if (flips % 2 === 1 && nums.length) nums[0] = -nums[0];
  return nums.reduce((s, x) => s + x, 0);
};

const solveAssignCookies = (greed, cookies) => {
  const g = [...greed].sort((a, b) => a - b);
  const c = [...cookies].sort((a, b) => a - b);
  let i = 0;
  let j = 0;
  let count = 0;
  while (i < g.length && j < c.length) {
    if (c[j] >= g[i]) {
      count += 1;
      i += 1;
      j += 1;
    } else {
      j += 1;
    }
  }
  return count;
};

const solveMaxNonOverlappingIntervals = (intervals) => {
  const sorted = intervals
    .map((x) => [Number(x[0]), Number(x[1])])
    .sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
  let count = 0;
  let end = -Infinity;
  for (const [s, e] of sorted) {
    if (s >= end) {
      count += 1;
      end = e;
    }
  }
  return count;
};

const solveMinArrowsBurstBalloons = (intervals) => {
  const sorted = intervals
    .map((x) => [Number(x[0]), Number(x[1])])
    .sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
  let arrows = 0;
  let pos = -Infinity;
  for (const [s, e] of sorted) {
    if (arrows === 0 || s > pos) {
      arrows += 1;
      pos = e;
    }
  }
  return arrows;
};

const solveClimbStairs123 = (n) => {
  if (n === 0) return 1;
  let a = 1;
  let b = 1;
  let c = 2;
  if (n === 1) return 1;
  if (n === 2) return 2;
  for (let i = 3; i <= n; i += 1) {
    const next = a + b + c;
    a = b;
    b = c;
    c = next;
  }
  return c;
};

const solveHouseRobberLinear = (arr) => {
  let take = 0;
  let skip = 0;
  for (const x of arr) {
    const nextTake = skip + x;
    const nextSkip = Math.max(skip, take);
    take = nextTake;
    skip = nextSkip;
  }
  return Math.max(take, skip);
};

const solveLISLength = (arr) => {
  const tails = [];
  for (const x of arr) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
};

const solveMinPathSumGrid = (grid) => {
  if (!grid.length || !grid[0].length) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const dp = new Array(cols).fill(0);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const val = grid[r][c];
      if (r === 0 && c === 0) dp[c] = val;
      else if (r === 0) dp[c] = dp[c - 1] + val;
      else if (c === 0) dp[c] = dp[c] + val;
      else dp[c] = Math.min(dp[c], dp[c - 1]) + val;
    }
  }
  return dp[cols - 1];
};

const solvePartitionEqualSubsetSum = (arr) => {
  const sum = arr.reduce((s, x) => s + x, 0);
  if (sum % 2 !== 0) return false;
  const target = sum / 2;
  const dp = new Uint8Array(target + 1);
  dp[0] = 1;
  for (const num of arr) {
    for (let s = target; s >= num; s -= 1) {
      if (dp[s - num]) dp[s] = 1;
    }
  }
  return dp[target] === 1;
};

const solveCoinChangeWays = (coins, amount) => {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let x = coin; x <= amount; x += 1) {
      dp[x] += dp[x - coin];
    }
  }
  return dp[amount];
};

const solveEditDistance = (a, b) => {
  const n = a.length;
  const m = b.length;
  let prev = new Array(m + 1).fill(0);
  let cur = new Array(m + 1).fill(0);
  for (let j = 0; j <= m; j += 1) prev[j] = j;
  for (let i = 1; i <= n; i += 1) {
    cur[0] = i;
    for (let j = 1; j <= m; j += 1) {
      if (a[i - 1] === b[j - 1]) cur[j] = prev[j - 1];
      else cur[j] = 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[m];
};

const solveMaxDepthBinaryTreeArray = (tree) => {
  if (!tree.length || tree[0] === null || tree[0] === undefined) return 0;
  let depth = 0;
  const q = [0];
  let head = 0;
  while (head < q.length) {
    const levelSize = q.length - head;
    depth += 1;
    for (let i = 0; i < levelSize; i += 1) {
      const idx = q[head++];
      const left = idx * 2 + 1;
      const right = idx * 2 + 2;
      if (left < tree.length && tree[left] !== null && tree[left] !== undefined) q.push(left);
      if (right < tree.length && tree[right] !== null && tree[right] !== undefined) q.push(right);
    }
  }
  return depth;
};

const solveValidateBSTArray = (tree) => {
  if (!tree.length || tree[0] === null || tree[0] === undefined) return true;
  const stack = [[0, -Infinity, Infinity]];
  while (stack.length) {
    const [idx, lo, hi] = stack.pop();
    if (idx >= tree.length) continue;
    const val = tree[idx];
    if (val === null || val === undefined) continue;
    if (!(val > lo && val < hi)) return false;
    const left = idx * 2 + 1;
    const right = idx * 2 + 2;
    stack.push([right, val, hi]);
    stack.push([left, lo, val]);
  }
  return true;
};

const buildTreeAdjacency = (tree) => {
  const nodes = [];
  for (let i = 0; i < tree.length; i += 1) {
    if (tree[i] !== null && tree[i] !== undefined) nodes.push(i);
  }
  const adj = new Map();
  for (const i of nodes) adj.set(i, []);
  for (const i of nodes) {
    const left = i * 2 + 1;
    const right = i * 2 + 2;
    if (left < tree.length && tree[left] !== null && tree[left] !== undefined) {
      adj.get(i).push(left);
      adj.get(left).push(i);
    }
    if (right < tree.length && tree[right] !== null && tree[right] !== undefined) {
      adj.get(i).push(right);
      adj.get(right).push(i);
    }
  }
  return { nodes, adj };
};

const bfsFarthest = (start, adj) => {
  const q = [start];
  const dist = new Map();
  dist.set(start, 0);
  let head = 0;
  let far = start;
  while (head < q.length) {
    const u = q[head++];
    const du = dist.get(u);
    if (du > dist.get(far)) far = u;
    for (const v of adj.get(u) || []) {
      if (!dist.has(v)) {
        dist.set(v, du + 1);
        q.push(v);
      }
    }
  }
  return { node: far, dist: dist.get(far) || 0 };
};

const solveDiameterBinaryTreeArray = (tree) => {
  const { nodes, adj } = buildTreeAdjacency(tree);
  if (!nodes.length) return 0;
  const first = bfsFarthest(nodes[0], adj);
  const second = bfsFarthest(first.node, adj);
  return second.dist;
};

const solveZigzagLevelOrderArray = (tree) => {
  if (!tree.length || tree[0] === null || tree[0] === undefined) return [];
  const result = [];
  const q = [0];
  let head = 0;
  let leftToRight = true;
  while (head < q.length) {
    const levelSize = q.length - head;
    const level = [];
    for (let i = 0; i < levelSize; i += 1) {
      const idx = q[head++];
      const val = tree[idx];
      if (val === null || val === undefined) continue;
      level.push(val);
      const left = idx * 2 + 1;
      const right = idx * 2 + 2;
      if (left < tree.length && tree[left] !== null && tree[left] !== undefined) q.push(left);
      if (right < tree.length && tree[right] !== null && tree[right] !== undefined) q.push(right);
    }
    if (!leftToRight) level.reverse();
    result.push(level);
    leftToRight = !leftToRight;
  }
  return result;
};

const solveKthSmallestBSTArray = (tree, k) => {
  const stack = [];
  let idx = 0;
  const pushLeft = (start) => {
    let i = start;
    while (i < tree.length && tree[i] !== null && tree[i] !== undefined) {
      stack.push(i);
      i = i * 2 + 1;
    }
  };
  pushLeft(idx);
  let count = 0;
  while (stack.length) {
    const node = stack.pop();
    count += 1;
    if (count === k) return tree[node];
    const right = node * 2 + 2;
    pushLeft(right);
  }
  return null;
};

const solveLCABSTArray = (tree, p, q) => {
  if (!tree.length || tree[0] === null || tree[0] === undefined) return null;
  let idx = 0;
  const a = Math.min(p, q);
  const b = Math.max(p, q);
  while (idx < tree.length && tree[idx] !== null && tree[idx] !== undefined) {
    const val = tree[idx];
    if (b < val) idx = idx * 2 + 1;
    else if (a > val) idx = idx * 2 + 2;
    else return val;
  }
  return null;
};

const solveNumberOfIslands = (grid) => {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const seen = Array.from({ length: rows }, () => new Uint8Array(cols));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let islands = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (seen[r][c] || grid[r][c] !== '1') continue;
      islands += 1;
      const q = [[r, c]];
      seen[r][c] = 1;
      for (let i = 0; i < q.length; i += 1) {
        const [cr, cc] = q[i];
        for (const [dr, dc] of dirs) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (seen[nr][nc] || grid[nr][nc] !== '1') continue;
          seen[nr][nc] = 1;
          q.push([nr, nc]);
        }
      }
    }
  }
  return islands;
};

const solveShortestDistancesUnweighted = (n, edges, src) => {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    if (u >= 0 && u < n && v >= 0 && v < n) {
      adj[u].push(v);
      adj[v].push(u);
    }
  }
  const dist = new Array(n).fill(-1);
  dist[src] = 0;
  const q = [src];
  let head = 0;
  while (head < q.length) {
    const u = q[head++];
    for (const v of adj[u]) {
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1;
        q.push(v);
      }
    }
  }
  return dist;
};

const solveDetectCycleUndirected = (n, edges) => {
  const parent = new Array(n).fill(0).map((_, i) => i);
  const rank = new Array(n).fill(0);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const unite = (a, b) => {
    let ra = find(a);
    let rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra] += 1;
    return true;
  };
  for (const [u, v] of edges) {
    if (u < 0 || u >= n || v < 0 || v >= n) continue;
    if (!unite(u, v)) return true;
  }
  return false;
};

const solveTopologicalSortKahn = (n, edges) => {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) {
    if (u >= 0 && u < n && v >= 0 && v < n) {
      adj[u].push(v);
      indeg[v] += 1;
    }
  }
  const heap = buildMinHeap();
  for (let i = 0; i < n; i += 1) if (indeg[i] === 0) heap.push([i, i]);
  const out = [];
  while (heap.size) {
    const [node] = heap.pop();
    out.push(node);
    for (const v of adj[node]) {
      indeg[v] -= 1;
      if (indeg[v] === 0) heap.push([v, v]);
    }
  }
  return out.length === n ? out : [];
};

const solveCourseScheduleFeasibility = (n, prereq) => {
  const edges = prereq.map(([a, b]) => [b, a]);
  const order = solveTopologicalSortKahn(n, edges);
  return order.length === n;
};

const solveDijkstraShortestPaths = (n, edges, src) => {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    if (u >= 0 && u < n && v >= 0 && v < n) adj[u].push([v, w]);
  }
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const heap = buildMinHeap();
  heap.push([0, src]);
  while (heap.size) {
    const [d, u] = heap.pop();
    if (d !== dist[u]) continue;
    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        heap.push([nd, v]);
      }
    }
  }
  return dist.map((d) => (Number.isFinite(d) ? d : -1));
};

const solveGenerateBalancedParentheses = (n) => {
  const out = [];
  const backtrack = (open, close, cur) => {
    if (cur.length === 2 * n) {
      out.push(cur);
      return;
    }
    if (open < n) backtrack(open + 1, close, cur + '(');
    if (close < open) backtrack(open, close + 1, cur + ')');
  };
  backtrack(0, 0, '');
  return out;
};

const solveSubsetSumEqualsTarget = (arr, target) => {
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  const sums = (part) => {
    const out = [0];
    for (const x of part) {
      const size = out.length;
      for (let i = 0; i < size; i += 1) out.push(out[i] + x);
    }
    return out;
  };
  const a = sums(left);
  const b = sums(right);
  b.sort((x, y) => x - y);
  const has = (value) => {
    let lo = 0;
    let hi = b.length - 1;
    while (lo <= hi) {
      const m = Math.floor((lo + hi) / 2);
      if (b[m] === value) return true;
      if (b[m] < value) lo = m + 1;
      else hi = m - 1;
    }
    return false;
  };
  for (const x of a) {
    if (has(target - x)) return true;
  }
  return false;
};

const solveNQueensCount = (n) => {
  let count = 0;
  const dfs = (row, cols, diag1, diag2) => {
    if (row === n) {
      count += 1;
      return;
    }
    let available = ((1 << n) - 1) & ~(cols | diag1 | diag2);
    while (available) {
      const bit = available & -available;
      available -= bit;
      dfs(row + 1, cols | bit, (diag1 | bit) << 1, (diag2 | bit) >> 1);
    }
  };
  if (n >= 1 && n <= 14) dfs(0, 0, 0, 0);
  return count;
};

const solveMaximumBitwiseAndAnyPair = (arr) => {
  let candidate = 0;
  for (let bit = 30; bit >= 0; bit -= 1) {
    const trial = candidate | (1 << bit);
    let count = 0;
    for (const x of arr) {
      if ((x & trial) === trial) {
        count += 1;
        if (count >= 2) break;
      }
    }
    if (count >= 2) candidate = trial;
  }
  return candidate >>> 0;
};

const solveCountDivisorsForEachNumber = (nums) => {
  const max = nums.reduce((m, x) => Math.max(m, x), 0);
  const spf = new Array(max + 1).fill(0);
  for (let i = 2; i <= max; i += 1) {
    if (spf[i] === 0) {
      spf[i] = i;
      if (i * i <= max) {
        for (let j = i * i; j <= max; j += i) {
          if (spf[j] === 0) spf[j] = i;
        }
      }
    }
  }
  const countDiv = (n) => {
    if (n === 1) return 1;
    let x = n;
    let res = 1;
    while (x > 1) {
      const p = spf[x] || x;
      let exp = 0;
      while (x % p === 0) {
        x = Math.floor(x / p);
        exp += 1;
      }
      res *= (exp + 1);
    }
    return res;
  };
  return nums.map(countDiv);
};

const solveFastModularExponentiation = (a, b, mod) => {
  const m = BigInt(mod);
  if (m === 1n) return 0n;
  let base = ((BigInt(a) % m) + m) % m;
  let exp = BigInt(b);
  let res = 1n;
  while (exp > 0n) {
    if (exp & 1n) res = (res * base) % m;
    base = (base * base) % m;
    exp >>= 1n;
  }
  return res;
};

const SOLVERS = {
  'Pair With Given Difference': solvePairWithGivenDifference,
  'Longest Subarray With Sum K': solveLongestSubarrayWithSumK,
  'Count Subarrays With Product < K': solveCountSubarraysProductLessThanK,
  'Minimum Swaps to Group Ones': solveMinSwapsGroupOnes,
  'Merge Overlapping Intervals': solveMergeOverlappingIntervals,
  'K-th Missing Positive': solveKthMissingPositive,
  'Trapping Rainwater': solveTrappingRainwater,
  'Longest Common Prefix': solveLongestCommonPrefix,
  'Isomorphic Strings': solveIsomorphicStrings,
  'Minimum Deletions for Unique Frequencies': solveMinDeletionsUniqueFreq,
  'Find All Anagram Start Indices': solveFindAllAnagramStartIndices,
  'Longest Palindrome Length (From Letters)': solveLongestPalindromeLengthFromLetters,
  'Smallest Window Containing Pattern': solveSmallestWindowContainingPattern,
  'Next Greater Element (Circular)': solveNextGreaterElementCircular,
  'Stock Span': solveStockSpan,
  'Sliding Window Maximum': solveSlidingWindowMaximum,
  'K Most Frequent Elements': solveKMostFrequentElements,
  'Merge K Sorted Arrays': solveMergeKSortedArrays,
  'First Non-Repeating Character in Stream': solveFirstNonRepeatingStream,
  'Minimum Platforms Needed': solveMinimumPlatformsNeeded,
  'Jump Game (Reach the End)': solveJumpGameReachEnd,
  'Maximize Sum After K Negations': solveMaximizeSumAfterKNegations,
  'Assign Cookies': solveAssignCookies,
  'Max Non-Overlapping Intervals': solveMaxNonOverlappingIntervals,
  'Minimum Number of Arrows to Burst Balloons': solveMinArrowsBurstBalloons,
  'Climb Stairs (1/2/3 Steps)': solveClimbStairs123,
  'House Robber (Linear)': solveHouseRobberLinear,
  'Longest Increasing Subsequence Length': solveLISLength,
  'Minimum Path Sum in Grid': solveMinPathSumGrid,
  'Partition Equal Subset Sum': solvePartitionEqualSubsetSum,
  'Coin Change — Number of Ways': solveCoinChangeWays,
  'Edit Distance': solveEditDistance,
  'Max Depth of Binary Tree (Level-Order Array)': solveMaxDepthBinaryTreeArray,
  'Validate BST (Level-Order Array)': solveValidateBSTArray,
  'Diameter of Binary Tree': solveDiameterBinaryTreeArray,
  'Zigzag Level Order Traversal': solveZigzagLevelOrderArray,
  'K-th Smallest in BST': solveKthSmallestBSTArray,
  'Lowest Common Ancestor in BST': solveLCABSTArray,
  'Number of Islands': solveNumberOfIslands,
  'Shortest Distances in Unweighted Graph': solveShortestDistancesUnweighted,
  'Detect Cycle in Undirected Graph': solveDetectCycleUndirected,
  'Topological Sort (Kahn)': solveTopologicalSortKahn,
  'Course Schedule Feasibility': solveCourseScheduleFeasibility,
  'Dijkstra Shortest Paths': solveDijkstraShortestPaths,
  'Generate Balanced Parentheses': solveGenerateBalancedParentheses,
  'Subset Sum Equals Target': solveSubsetSumEqualsTarget,
  'N-Queens Count': solveNQueensCount,
  'Maximum Bitwise AND of Any Pair': solveMaximumBitwiseAndAnyPair,
  'Count Divisors for Each Number': solveCountDivisorsForEachNumber,
  'Fast Modular Exponentiation': solveFastModularExponentiation,
};

const randomLowerString = (rng, len) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let out = '';
  for (let i = 0; i < len; i += 1) out += alphabet[randomInt(rng, 0, 25)];
  return out;
};

const buildArgsGenerator = (title) => {
  switch (title) {
    case 'Pair With Given Difference':
      return (rng) => {
        const n = randomInt(rng, 0, 40);
        const arr = Array.from({ length: n }, () => randomInt(rng, -20, 20));
        const k = randomInt(rng, 0, 10);
        return [arr, k];
      };
    case 'Longest Subarray With Sum K':
      return (rng) => {
        const n = randomInt(rng, 0, 60);
        const arr = Array.from({ length: n }, () => randomInt(rng, -10, 10));
        const k = randomInt(rng, -20, 20);
        return [arr, k];
      };
    case 'Count Subarrays With Product < K':
      return (rng) => {
        const n = randomInt(rng, 0, 40);
        const arr = Array.from({ length: n }, () => randomInt(rng, 1, 10));
        const k = randomInt(rng, 0, 200);
        return [arr, k];
      };
    case 'Minimum Swaps to Group Ones':
      return (rng) => {
        const n = randomInt(rng, 0, 80);
        const arr = Array.from({ length: n }, () => (rng() < 0.4 ? 1 : 0));
        return [arr];
      };
    case 'Merge Overlapping Intervals':
    case 'Max Non-Overlapping Intervals':
    case 'Minimum Number of Arrows to Burst Balloons':
      return (rng) => {
        const n = randomInt(rng, 0, 40);
        const intervals = [];
        for (let i = 0; i < n; i += 1) {
          const a = randomInt(rng, -20, 20);
          const b = randomInt(rng, -20, 20);
          intervals.push([Math.min(a, b), Math.max(a, b)]);
        }
        return [intervals];
      };
    case 'K-th Missing Positive':
      return (rng) => {
        const n = randomInt(rng, 0, 30);
        const arr = [];
        let cur = 1;
        for (let i = 0; i < n; i += 1) {
          cur += randomInt(rng, 1, 3);
          arr.push(cur);
        }
        const k = randomInt(rng, 1, 30);
        return [arr, k];
      };
    case 'Trapping Rainwater':
      return (rng) => {
        const n = randomInt(rng, 0, 60);
        const heights = Array.from({ length: n }, () => randomInt(rng, 0, 10));
        return [heights];
      };
    case 'Longest Common Prefix':
      return (rng) => {
        const count = randomInt(rng, 1, 8);
        const prefix = randomLowerString(rng, randomInt(rng, 0, 5));
        const words = Array.from({ length: count }, () => prefix + randomLowerString(rng, randomInt(rng, 0, 8)));
        return [words];
      };
    case 'Isomorphic Strings':
      return (rng) => {
        const len = randomInt(rng, 0, 15);
        const s = randomLowerString(rng, len);
        const t = randomLowerString(rng, len);
        return [s, t];
      };
    case 'Minimum Deletions for Unique Frequencies':
    case 'Longest Palindrome Length (From Letters)':
      return (rng) => {
        const len = randomInt(rng, 0, 40);
        return [randomLowerString(rng, len)];
      };
    case 'Find All Anagram Start Indices':
      return (rng) => {
        const pLen = randomInt(rng, 1, 6);
        const sLen = randomInt(rng, pLen, 40);
        const p = randomLowerString(rng, pLen);
        const s = randomLowerString(rng, sLen);
        return [s, p];
      };
    case 'Smallest Window Containing Pattern':
      return (rng) => {
        const tLen = randomInt(rng, 1, 6);
        const sLen = randomInt(rng, 0, 40);
        const t = randomLowerString(rng, tLen);
        const s = randomLowerString(rng, sLen);
        return [s, t];
      };
    case 'Next Greater Element (Circular)':
    case 'Stock Span':
      return (rng) => {
        const n = randomInt(rng, 0, 60);
        const arr = Array.from({ length: n }, () => randomInt(rng, 0, 20));
        return [arr];
      };
    case 'Sliding Window Maximum':
      return (rng) => {
        const n = randomInt(rng, 1, 60);
        const arr = Array.from({ length: n }, () => randomInt(rng, -20, 20));
        const k = randomInt(rng, 1, n);
        return [arr, k];
      };
    case 'K Most Frequent Elements':
      return (rng) => {
        const n = randomInt(rng, 1, 60);
        const arr = Array.from({ length: n }, () => randomInt(rng, 0, 10));
        const distinct = new Set(arr).size;
        const k = randomInt(rng, 1, Math.max(1, distinct));
        return [arr, k];
      };
    case 'Merge K Sorted Arrays':
      return (rng) => {
        const k = randomInt(rng, 1, 6);
        const arrays = [];
        for (let i = 0; i < k; i += 1) {
          const len = randomInt(rng, 0, 12);
          const arr = Array.from({ length: len }, () => randomInt(rng, -20, 20)).sort((a, b) => a - b);
          arrays.push(arr);
        }
        return [arrays];
      };
    case 'First Non-Repeating Character in Stream':
      return (rng) => {
        const len = randomInt(rng, 0, 40);
        return [randomLowerString(rng, len)];
      };
    case 'Minimum Platforms Needed':
      return (rng) => {
        const n = randomInt(rng, 0, 25);
        const arrivals = [];
        const departures = [];
        for (let i = 0; i < n; i += 1) {
          const start = randomInt(rng, 0, 50);
          const end = start + randomInt(rng, 0, 10);
          arrivals.push(start);
          departures.push(end);
        }
        return [arrivals, departures];
      };
    case 'Jump Game (Reach the End)':
      return (rng) => {
        const n = randomInt(rng, 1, 60);
        const arr = Array.from({ length: n }, () => randomInt(rng, 0, 8));
        return [arr];
      };
    case 'Maximize Sum After K Negations':
      return (rng) => {
        const n = randomInt(rng, 0, 60);
        const arr = Array.from({ length: n }, () => randomInt(rng, -10, 10));
        const k = randomInt(rng, 0, 20);
        return [arr, k];
      };
    case 'Assign Cookies':
      return (rng) => {
        const ng = randomInt(rng, 0, 30);
        const nc = randomInt(rng, 0, 30);
        const greed = Array.from({ length: ng }, () => randomInt(rng, 0, 10));
        const cookies = Array.from({ length: nc }, () => randomInt(rng, 0, 10));
        return [greed, cookies];
      };
    case 'Climb Stairs (1/2/3 Steps)':
      return (rng) => [randomInt(rng, 0, 25)];
    case 'House Robber (Linear)':
      return (rng) => {
        const n = randomInt(rng, 0, 50);
        const arr = Array.from({ length: n }, () => randomInt(rng, 0, 30));
        return [arr];
      };
    case 'Longest Increasing Subsequence Length':
      return (rng) => {
        const n = randomInt(rng, 0, 60);
        const arr = Array.from({ length: n }, () => randomInt(rng, -20, 20));
        return [arr];
      };
    case 'Minimum Path Sum in Grid':
      return (rng) => {
        const rows = randomInt(rng, 1, 8);
        const cols = randomInt(rng, 1, 8);
        const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => randomInt(rng, 0, 9)));
        return [grid];
      };
    case 'Partition Equal Subset Sum':
      return (rng) => {
        const n = randomInt(rng, 1, 25);
        const arr = Array.from({ length: n }, () => randomInt(rng, 1, 20));
        return [arr];
      };
    case 'Coin Change — Number of Ways':
      return (rng) => {
        const coinCount = randomInt(rng, 1, 6);
        const coins = [];
        while (coins.length < coinCount) {
          const x = randomInt(rng, 1, 10);
          if (!coins.includes(x)) coins.push(x);
        }
        coins.sort((a, b) => a - b);
        const amount = randomInt(rng, 0, 30);
        return [coins, amount];
      };
    case 'Edit Distance':
      return (rng) => {
        const a = randomLowerString(rng, randomInt(rng, 0, 20));
        const b = randomLowerString(rng, randomInt(rng, 0, 20));
        return [a, b];
      };
    case 'Max Depth of Binary Tree (Level-Order Array)':
    case 'Validate BST (Level-Order Array)':
    case 'Diameter of Binary Tree':
    case 'Zigzag Level Order Traversal':
      return (rng) => {
        const n = randomInt(rng, 0, 31);
        const tree = Array.from({ length: n }, (_, i) => {
          if (i === 0) return randomInt(rng, 0, 20);
          return rng() < 0.25 ? null : randomInt(rng, 0, 20);
        });
        return [tree];
      };
    case 'K-th Smallest in BST':
      return (rng) => {
        // Build a small BST as a complete-tree array by inserting values.
        const values = Array.from({ length: randomInt(rng, 1, 15) }, () => randomInt(rng, 0, 50));
        const unique = [...new Set(values)].sort((a, b) => a - b);
        const tree = new Array(63).fill(null);
        const insert = (val) => {
          let idx = 0;
          while (idx < tree.length) {
            if (tree[idx] === null) {
              tree[idx] = val;
              return;
            }
            idx = val < tree[idx] ? idx * 2 + 1 : idx * 2 + 2;
          }
        };
        unique.forEach(insert);
        // Trim trailing nulls
        while (tree.length && tree[tree.length - 1] === null) tree.pop();
        const k = randomInt(rng, 1, unique.length);
        return [tree, k];
      };
    case 'Lowest Common Ancestor in BST':
      return (rng) => {
        const values = Array.from({ length: randomInt(rng, 2, 15) }, () => randomInt(rng, 0, 50));
        const unique = [...new Set(values)].sort((a, b) => a - b);
        const tree = new Array(63).fill(null);
        const insert = (val) => {
          let idx = 0;
          while (idx < tree.length) {
            if (tree[idx] === null) {
              tree[idx] = val;
              return;
            }
            idx = val < tree[idx] ? idx * 2 + 1 : idx * 2 + 2;
          }
        };
        unique.forEach(insert);
        while (tree.length && tree[tree.length - 1] === null) tree.pop();
        const p = randomChoice(rng, unique);
        let q = randomChoice(rng, unique);
        if (q === p) q = unique[0];
        return [tree, p, q];
      };
    case 'Number of Islands':
      return (rng) => {
        const rows = randomInt(rng, 1, 8);
        const cols = randomInt(rng, 1, 8);
        const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rng() < 0.35 ? '1' : '0')));
        return [grid];
      };
    case 'Shortest Distances in Unweighted Graph':
    case 'Detect Cycle in Undirected Graph':
      return (rng) => {
        const n = randomInt(rng, 1, 20);
        const edges = [];
        const edgeSet = new Set();
        const m = randomInt(rng, 0, Math.min(40, (n * (n - 1)) / 2));
        while (edges.length < m) {
          let u = randomInt(rng, 0, n - 1);
          let v = randomInt(rng, 0, n - 1);
          if (u === v) continue;
          if (u > v) [u, v] = [v, u];
          const key = `${u},${v}`;
          if (edgeSet.has(key)) continue;
          edgeSet.add(key);
          edges.push([u, v]);
        }
        if (title === 'Shortest Distances in Unweighted Graph') {
          const src = randomInt(rng, 0, n - 1);
          return [n, edges, src];
        }
        return [n, edges];
      };
    case 'Topological Sort (Kahn)':
      return (rng) => {
        const n = randomInt(rng, 1, 15);
        const edges = [];
        for (let u = 0; u < n; u += 1) {
          for (let v = u + 1; v < n; v += 1) {
            if (rng() < 0.15) edges.push([u, v]);
          }
        }
        // Occasionally introduce a cycle
        if (n >= 2 && rng() < 0.1) edges.push([1, 0]);
        return [n, edges];
      };
    case 'Course Schedule Feasibility':
      return (rng) => {
        const n = randomInt(rng, 1, 15);
        const prereq = [];
        for (let a = 0; a < n; a += 1) {
          for (let b = 0; b < n; b += 1) {
            if (a !== b && rng() < 0.08) prereq.push([a, b]);
          }
        }
        return [n, prereq];
      };
    case 'Dijkstra Shortest Paths':
      return (rng) => {
        const n = randomInt(rng, 1, 20);
        const edges = [];
        for (let u = 0; u < n; u += 1) {
          for (let v = 0; v < n; v += 1) {
            if (u !== v && rng() < 0.08) edges.push([u, v, randomInt(rng, 0, 9)]);
          }
        }
        const src = randomInt(rng, 0, n - 1);
        return [n, edges, src];
      };
    case 'Generate Balanced Parentheses':
      return (rng) => [randomInt(rng, 0, 6)];
    case 'Subset Sum Equals Target':
      return (rng) => {
        const n = randomInt(rng, 0, 20);
        const arr = Array.from({ length: n }, () => randomInt(rng, -10, 10));
        const target = randomInt(rng, -20, 20);
        return [arr, target];
      };
    case 'N-Queens Count':
      return (rng) => [randomInt(rng, 1, 10)];
    case 'Maximum Bitwise AND of Any Pair':
      return (rng) => {
        const n = randomInt(rng, 2, 60);
        const arr = Array.from({ length: n }, () => randomInt(rng, 0, 1023));
        return [arr];
      };
    case 'Count Divisors for Each Number':
      return (rng) => {
        const n = randomInt(rng, 1, 40);
        const nums = Array.from({ length: n }, () => randomInt(rng, 1, 500));
        return [nums];
      };
    case 'Fast Modular Exponentiation':
      return (rng) => {
        const mod = randomChoice(rng, [1, 2, 7, 97, 1000, 1000000007]);
        const a = randomInt(rng, 0, 100000);
        const b = randomInt(rng, 0, 100000);
        return [a, b, mod];
      };
    default:
      return null;
  }
};

const edgeArgsByTitle = {
  'Pair With Given Difference': [
    [[5, 5, 5], 0],
    [[1], 0],
    [[1, 2, 3], 5],
    [[-3, -1, -4], 1],
  ],
  'Longest Subarray With Sum K': [
    [[1, -1, 5, -2, 3], 3],
    [[1, 2, 3], 7],
    [[0, 0, 0], 0],
    [[], 0],
  ],
  'Count Subarrays With Product < K': [
    [[1, 1, 1], 2],
    [[3, 4], 1],
    [[10], 0],
    [[], 100],
  ],
  'Minimum Swaps to Group Ones': [
    [[1, 0, 1, 0, 1]],
    [[1, 1, 1, 1]],
    [[0, 0, 0]],
    [[1]],
    [[]],
  ],
  'Merge Overlapping Intervals': [
    [[[1, 4], [4, 5]]],
    [[[5, 7], [1, 2], [3, 4]]],
    [[]],
  ],
  'K-th Missing Positive': [
    [[2, 3, 4, 7, 11], 5],
    [[1, 2, 3, 4], 2],
    [[5, 6, 7], 1],
  ],
  'Trapping Rainwater': [
    [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
    [[1, 2, 3]],
    [[3, 2, 1]],
    [[]],
  ],
  'Longest Common Prefix': [
    [['flower', 'flow', 'flight']],
    [['dog', 'racecar', 'car']],
    [['']],
  ],
  'Smallest Window Containing Pattern': [
    ['ADOBECODEBANC', 'ABC'],
    ['a', 'aa'],
    ['aa', 'aa'],
    ['', 'a'],
  ],
  'Generate Balanced Parentheses': [[0], [1], [3]],
  'N-Queens Count': [[1], [4], [8]],
  'Fast Modular Exponentiation': [[2, 10, 1000], [3, 0, 7], [10, 9, 1]],
};

export const expandHackWithInfyTestCases = (problemSeed, options = {}) => {
  const targetHidden = Number.isFinite(options.targetHidden) ? options.targetHidden : 50;
  const testCases = Array.isArray(problemSeed?.testCases) ? problemSeed.testCases : [];
  const title = String(problemSeed?.title || '').trim();
  const solver = SOLVERS[title];
  if (!solver) {
    return testCases;
  }

  const existing = testCases
    .filter((tc) => tc && tc.input !== undefined)
    .map((tc) => ({
      input: String(tc.input).trim(),
      expectedOutput: tc.expectedOutput,
      isHidden: Boolean(tc.isHidden),
    }));

  const publicTests = existing.filter((tc) => !tc.isHidden);
  const hiddenTests = existing.filter((tc) => tc.isHidden);

  const keySet = new Set(existing.map((tc) => normalizeInputKey(tc.input)));

  const rng = mulberry32(hashStringToSeed(`HWI:${title}`));

  const addHiddenArgs = (args) => {
    const input = JSON.stringify(args);
    const key = normalizeInputKey(input);
    if (keySet.has(key)) return false;

    let expected;
    try {
      expected = solver(...args);
    } catch (error) {
      return false;
    }

    hiddenTests.push({
      input,
      expectedOutput: formatExpectedOutput(expected),
      isHidden: true,
    });
    keySet.add(key);
    return true;
  };

  const edges = edgeArgsByTitle[title] || [];
  for (const args of edges) {
    addHiddenArgs(args);
  }

  const gen = buildArgsGenerator(title);
  let guard = 0;
  while (hiddenTests.length < targetHidden && guard < 20000) {
    guard += 1;
    if (!gen) break;
    const args = gen(rng);
    if (!Array.isArray(args)) continue;
    addHiddenArgs(args);
  }

  // If we still couldn't reach targetHidden, pad by shuffling existing hidden tests (not ideal, but avoids breaking seeding).
  if (hiddenTests.length < targetHidden) {
    const padded = [...hiddenTests];
    shuffleInPlace(rng, padded);
    let i = 0;
    while (hiddenTests.length < targetHidden && padded.length) {
      const tc = padded[i % padded.length];
      hiddenTests.push({ ...tc });
      i += 1;
    }
  }

  return [...publicTests, ...hiddenTests];
};
