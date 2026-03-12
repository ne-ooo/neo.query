/**
 * Convert query object to URLSearchParams
 */

import type { StringifiableQuery, StringifyOptions } from '../types.js'
import { stringify } from '../stringify/stringify.js'

/**
 * Convert a query object to URLSearchParams
 *
 * Uses stringify to handle nested objects, arrays, and all formatting options,
 * then creates a URLSearchParams instance from the result.
 *
 * @param query - Query object to convert
 * @param options - Stringify options
 * @returns URLSearchParams instance
 *
 * @example
 * ```ts
 * toSearchParams({ foo: 'bar', baz: 'qux' })
 * // => URLSearchParams { 'foo' => 'bar', 'baz' => 'qux' }
 *
 * toSearchParams({ user: { name: 'John', age: 30 } })
 * // => URLSearchParams { 'user[name]' => 'John', 'user[age]' => '30' }
 *
 * toSearchParams({ items: ['a', 'b', 'c'] })
 * // => URLSearchParams { 'items[]' => 'a', 'items[]' => 'b', 'items[]' => 'c' }
 *
 * toSearchParams({ items: ['a', 'b'] }, { arrayFormat: 'comma' })
 * // => URLSearchParams { 'items' => 'a,b' }
 * ```
 */
export function toSearchParams(
  query: StringifiableQuery,
  options?: StringifyOptions
): URLSearchParams {
  // Handle empty or invalid input
  if (!query || typeof query !== 'object') {
    return new URLSearchParams()
  }

  // Stringify the query object
  // Note: We disable encoding since URLSearchParams handles encoding
  const queryString = stringify(query, {
    ...options,
    encode: false, // URLSearchParams handles encoding
  })

  // Create URLSearchParams from query string
  return new URLSearchParams(queryString)
}
