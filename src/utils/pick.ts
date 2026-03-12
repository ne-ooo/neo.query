/**
 * Pick specific keys from query object
 */

import type { ParsedQuery } from '../types.js'

/**
 * Pick specific keys from a query object
 *
 * Creates a new object with only the specified keys.
 * Supports dot notation for nested keys.
 *
 * @param query - Query object to pick from
 * @param keys - Array of keys to pick (supports dot notation)
 * @returns New object with only picked keys
 *
 * @example
 * ```ts
 * pick({ foo: 'bar', baz: 'qux', extra: 'value' }, ['foo', 'baz'])
 * // => { foo: 'bar', baz: 'qux' }
 *
 * pick({ user: { name: 'John', age: 30, email: 'john@example.com' } }, ['user.name', 'user.age'])
 * // => { user: { name: 'John', age: 30 } }
 *
 * pick({ a: 1, b: 2, c: 3 }, ['a'])
 * // => { a: 1 }
 * ```
 */
export function pick(query: ParsedQuery, keys: string[]): ParsedQuery {
  // Handle empty or invalid input
  if (!query || typeof query !== 'object' || !Array.isArray(keys)) {
    return {}
  }

  const result: ParsedQuery = {}

  // Process each key
  for (const key of keys) {
    // Check if key uses dot notation for nested access
    if (key.includes('.')) {
      pickNested(query, key, result)
    } else {
      // Simple key - copy if exists
      if (key in query) {
        result[key] = query[key]
      }
    }
  }

  return result
}

/**
 * Pick a nested key using dot notation
 *
 * @param source - Source object
 * @param path - Dot-separated path (e.g., 'user.name')
 * @param target - Target object to write to
 */
function pickNested(source: ParsedQuery, path: string, target: ParsedQuery): void {
  const parts = path.split('.')
  const firstKey = parts[0]!

  if (!firstKey || !(firstKey in source)) {
    return // Key doesn't exist
  }

  if (parts.length === 1) {
    // Leaf node - copy value
    target[firstKey] = source[firstKey]
  } else {
    // Nested path - recurse
    const sourceValue = source[firstKey]

    // Only process if source value is an object
    if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
      // Ensure target has nested object
      if (!(firstKey in target)) {
        target[firstKey] = {}
      }

      const targetNested = target[firstKey] as ParsedQuery

      // Recurse with remaining path
      const remainingPath = parts.slice(1).join('.')
      pickNested(sourceValue as ParsedQuery, remainingPath, targetNested)
    }
  }
}
