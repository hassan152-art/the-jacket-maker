import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=======================================================');
console.log('🧥 THE JACKET MAKER - Full Stack Dev Environment');
console.log('=======================================================');

// Use PowerShell to free a port on Windows
function freePort(port) {
  try {
    execSync(
      `powershell -NoProfile -NonInteractive -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"`,
      { stdio: 'ignore', timeout: 5000 }
    );
  } catch (_) {
    // Port already free
  }
}

console.log('🧹 Releasing ports 5000 and 5173...');
freePort(5000);
freePort(5173);

// Wait briefly for ports to be released
await new Promise(r => setTimeout(r, 600));

console.log('🚀 Starting server and client...\n');

// Use cmd /d /c to avoid shell quoting issues on Windows
function spawnNpm(label, cwd, args = ['run', 'dev']) {
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'cmd.exe' : 'sh';
  const cmdArgs = isWin
    ? ['/d', '/s', '/c', `npm ${args.join(' ')}`]
    : ['-c', `npm ${args.join(' ')}`];

  const child = spawn(cmd, cmdArgs, { cwd, stdio: 'inherit' });

  child.on('error', (err) => console.error(`[${label}] Process error: ${err.message}`));

  return child;
}

const serverDir = path.join(__dirname, 'server');
const clientDir = path.join(__dirname, 'client');

// Start server, then client after a short delay
const serverProcess = spawnNpm('SERVER', serverDir);

await new Promise(r => setTimeout(r, 1200));

const clientProcess = spawnNpm('CLIENT', clientDir);

// Graceful shutdown on Ctrl+C
let exiting = false;
function shutdown() {
  if (exiting) return;
  exiting = true;
  console.log('\n👋 Shutting down...');
  const isWin = process.platform === 'win32';
  if (isWin) {
    if (serverProcess.pid) try { execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' }); } catch (_) {}
    if (clientProcess.pid) try { execSync(`taskkill /pid ${clientProcess.pid} /T /F`, { stdio: 'ignore' }); } catch (_) {}
  } else {
    try { serverProcess.kill('SIGTERM'); } catch (_) {}
    try { clientProcess.kill('SIGTERM'); } catch (_) {}
  }
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
