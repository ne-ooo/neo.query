/**
 * Exclude specific keys from query object
 */

import type { ParsedQuery } from '../types.js'

/**
 * Exclude specific keys from a query object
 *
 * Creates a new object without the specified keys.
 * Supports dot notation for nested keys.
 *
 * @param query - Query object to exclude from
 * @param keys - Array of keys to exclude (supports dot notation)
 * @returns New object without excluded keys
 *
 * @example
 * ```ts
 * exclude({ foo: 'bar', baz: 'qux', extra: 'value' }, ['extra'])
 * // => { foo: 'bar', baz: 'qux' }
 *
 * exclude({ user: { name: 'John', age: 30, password: 'secret' } }, ['user.password'])
 * // => { user: { name: 'John', age: 30 } }
 *
 * exclude({ a: 1, b: 2, c: 3 }, ['b', 'c'])
 * // => { a: 1 }
 * ```
 */
export function exclude(query: ParsedQuery, keys: string[]): ParsedQuery {
  // Handle empty or invalid input
  if (!query || typeof query !== 'object' || !Array.isArray(keys)) {
    return query
  }

  // Deep clone the query object
  const result = deepClone(query)

  // Process each key to exclude
  for (const key of keys) {
    // Check if key uses dot notation for nested access
    if (key.includes('.')) {
      excludeNested(result, key)
    } else {
      // Simple key - delete if exists
      delete result[key]
    }
  }

  return result
}

/**
 * Exclude a nested key using dot notation
 *
 * @param obj - Object to modify
 * @param path - Dot-separated path (e.g., 'user.password')
 */
function excludeNested(obj: ParsedQuery, path: string): void {
  const parts = path.split('.')
  const lastKey = parts[parts.length - 1]!

  // Navigate to parent object
  let current: any = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    if (!part || !(part in current)) {
      return // Path doesn't exist
    }

    current = current[part]

    // Stop if we hit a non-object value
    if (typeof current !== 'object' || current === null) {
      return
    }
  }

  // Delete the final key
  if (typeof current === 'object' && current !== null && lastKey in current) {
    delete current[lastKey]
  }
}

/**
 * Deep clone a query object
 *
 * @param obj - Object to clone
 * @returns Cloned object
 */
function deepClone(obj: ParsedQuery): ParsedQuery {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return deepClone(item as ParsedQuery)
      }
      return item
    }) as any
  }

  // Handle objects
  const cloned: ParsedQuery = {}
  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      cloned[key] = deepClone(value as ParsedQuery)
    } else {
      cloned[key] = value
    }
  }

  return cloned
}
