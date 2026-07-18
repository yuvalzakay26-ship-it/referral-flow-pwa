import test from "node:test";
import assert from "node:assert/strict";
import { validateCvFile, type CvLimits } from "./cvValidation.ts";

const LIMITS: CvLimits = {
  maxBytes: 8 * 1024 * 1024,
  acceptedExtensions: [".pdf", ".doc", ".docx"],
  acceptedMime: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

test("accepts a valid PDF", () => {
  assert.equal(
    validateCvFile(
      { name: "cv.pdf", size: 1000, type: "application/pdf" },
      LIMITS,
    ),
    null,
  );
});

test("accepts a valid docx", () => {
  assert.equal(
    validateCvFile(
      {
        name: "resume.docx",
        size: 2048,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      LIMITS,
    ),
    null,
  );
});

test("rejects an empty file", () => {
  assert.ok(validateCvFile({ name: "cv.pdf", size: 0, type: "application/pdf" }, LIMITS));
});

test("rejects a file over the size limit", () => {
  const err = validateCvFile(
    { name: "cv.pdf", size: LIMITS.maxBytes + 1, type: "application/pdf" },
    LIMITS,
  );
  assert.ok(err && err.includes("8MB"));
});

test("rejects a disallowed extension", () => {
  assert.ok(
    validateCvFile({ name: "cv.exe", size: 100, type: "application/pdf" }, LIMITS),
  );
});

test("rejects a disallowed mime type", () => {
  assert.ok(
    validateCvFile({ name: "cv.pdf", size: 100, type: "image/png" }, LIMITS),
  );
});
