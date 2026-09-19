/**
 * Compatibility barrel.
 *
 * New code can keep importing from `@/lib/api` — this file re-exports the
 * directory index (`./api`) so both the axios client and every typed API
 * module are available from a single import.
 */
export * from "./api/index";