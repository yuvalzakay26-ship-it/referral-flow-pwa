/**
 * Pure decision logic for the one-time localStorage → Supabase settings
 * migration. Framework-free so it can run under `node --test`.
 */

/** True when a and b are equal across the given keys. */
export function sameByKeys<T>(a: T, b: T, keys: (keyof T)[]): boolean {
  return keys.every((k) => a[k] === b[k]);
}

/**
 * Decide whether saved browser settings should be imported into the server.
 * Import only when the server row is still pristine (equals defaults) AND the
 * browser held genuinely edited values — never overwrite non-default server
 * settings.
 */
export function shouldImportLocalSettings<T>(
  server: T,
  local: T,
  defaults: T,
  keys: (keyof T)[],
  hadSavedLocal: boolean,
): boolean {
  const serverIsPristine = sameByKeys(server, defaults, keys);
  const localHasEdits = hadSavedLocal && !sameByKeys(local, defaults, keys);
  return serverIsPristine && localHasEdits;
}
