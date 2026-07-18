import test from "node:test";
import assert from "node:assert/strict";
import {
  sameByKeys,
  shouldImportLocalSettings,
} from "./settingsMigration.ts";

const KEYS = ["app_name", "admin_display_name", "default_follow_up_days"] as const;
const DEFAULTS = {
  app_name: "ReferralFlow",
  admin_display_name: "",
  default_follow_up_days: 7,
};

test("sameByKeys detects equality and difference", () => {
  assert.equal(sameByKeys(DEFAULTS, { ...DEFAULTS }, [...KEYS]), true);
  assert.equal(
    sameByKeys(DEFAULTS, { ...DEFAULTS, admin_display_name: "יובל" }, [...KEYS]),
    false,
  );
});

test("imports local edits when the server is still pristine", () => {
  const server = { ...DEFAULTS };
  const local = { ...DEFAULTS, admin_display_name: "יובל" };
  assert.equal(
    shouldImportLocalSettings(server, local, DEFAULTS, [...KEYS], true),
    true,
  );
});

test("does not import when the server already has non-default values", () => {
  const server = { ...DEFAULTS, admin_display_name: "מנהל" };
  const local = { ...DEFAULTS, admin_display_name: "יובל" };
  assert.equal(
    shouldImportLocalSettings(server, local, DEFAULTS, [...KEYS], true),
    false,
  );
});

test("does not import when there was no saved local value", () => {
  const server = { ...DEFAULTS };
  const local = { ...DEFAULTS };
  assert.equal(
    shouldImportLocalSettings(server, local, DEFAULTS, [...KEYS], false),
    false,
  );
});

test("does not import when local equals defaults (no real edits)", () => {
  const server = { ...DEFAULTS };
  const local = { ...DEFAULTS };
  assert.equal(
    shouldImportLocalSettings(server, local, DEFAULTS, [...KEYS], true),
    false,
  );
});
