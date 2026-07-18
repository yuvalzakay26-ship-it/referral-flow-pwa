// Starts `next dev` and, once the server is ready, opens the app in Google
// Chrome specifically (never the default browser). Chrome is opened exactly
// once per run, regardless of restarts/HMR output.
import { spawn } from "node:child_process";
import process from "node:process";

const args = process.argv.slice(2); // extra flags forwarded to `next dev`
const nextBin = process.platform === "win32" ? "next.cmd" : "next";

const dev = spawn(nextBin, ["dev", ...args], {
  stdio: ["inherit", "pipe", "inherit"],
  shell: process.platform === "win32",
});

let opened = false;

function openChrome(url) {
  if (opened) return;
  opened = true;

  if (process.platform === "win32") {
    // `start "" chrome <url>` launches Chrome by its registered app name.
    spawn("cmd", ["/c", "start", "", "chrome", url], { stdio: "ignore" });
  } else if (process.platform === "darwin") {
    spawn("open", ["-a", "Google Chrome", url], { stdio: "ignore" });
  } else {
    spawn("google-chrome", [url], { stdio: "ignore" });
  }
}

dev.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text); // keep next's normal output visible

  if (opened) return;
  // Prefer the exact "Local:" URL next prints; fall back on "Ready".
  const local = text.match(/Local:\s+(http:\/\/\S+)/i);
  if (local) {
    openChrome(local[1]);
  } else if (/\bReady\b/i.test(text)) {
    openChrome("http://localhost:3000");
  }
});

// Kill the whole child process tree. On Windows, `dev` is a `cmd.exe` shell
// wrapping `next.cmd` wrapping `node`; killing only the shell orphans the real
// dev server, which then blocks the next run ("Another next dev server is
// already running"). `taskkill /T` walks the tree and kills every descendant.
let cleanedUp = false;
function shutdown() {
  if (cleanedUp) return;
  cleanedUp = true;
  if (dev.pid == null) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(dev.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    dev.kill("SIGTERM");
  }
}

dev.on("exit", (code) => {
  cleanedUp = true; // child already gone; nothing left to kill
  process.exit(code ?? 0);
});
process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});
process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});
process.on("exit", shutdown);
