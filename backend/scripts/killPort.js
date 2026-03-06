import { execSync } from 'node:child_process';

function run(command) {
  return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function killPortWindows(port) {
  const output = run(`netstat -ano | findstr ":${port}" | findstr LISTENING`);
  const pids = unique(
    output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+/).at(-1))
  );

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      process.stdout.write(`Killed PID ${pid} on port ${port}\n`);
    } catch {
      // ignore
    }
  }
}

function killPortPosix(port) {
  // Prefer lsof; if it's not available, just no-op.
  let pids = [];
  try {
    const output = run(`lsof -ti tcp:${port}`);
    pids = unique(output.split(/\r?\n/).map((s) => s.trim()));
  } catch {
    return;
  }

  for (const pid of pids) {
    try {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      process.stdout.write(`Killed PID ${pid} on port ${port}\n`);
    } catch {
      // ignore
    }
  }
}

const portArg = process.argv[2];
const port = Number(portArg);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  process.stderr.write(`Usage: node scripts/killPort.js <port>\n`);
  process.exit(1);
}

try {
  if (process.platform === 'win32') {
    killPortWindows(port);
  } else {
    killPortPosix(port);
  }
} catch {
  // no-op: best-effort
}
