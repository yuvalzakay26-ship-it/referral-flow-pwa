// Copies the pdf.js worker (must match the installed pdfjs-dist version) into
// public/ so it is served from a stable same-origin URL for the in-app CV
// viewer. Runs on `prebuild` so production always ships a matching worker; the
// file is also committed so local dev works without an install step.
import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(
  root,
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs",
);
const destDir = join(root, "public");
const dest = join(destDir, "pdf.worker.min.mjs");

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);
console.log("copied pdf.js worker -> public/pdf.worker.min.mjs");
