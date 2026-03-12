/**
 * Convert URLSearchParams to query object
 */

import type { ParsedQuery, ParseOptions } from '../types.js'
import { parse } from '../parse/parse.js'

/**
 * Convert URLSearchParams to a query object
 *
 * Extracts the query string from URLSearchParams and uses parse
 * to handle nested objects, arrays, and type parsing.
 *
 * @param params - URLSearchParams instance to convert
 * @param options - Parse options
 * @returns Parsed query object
 *
 * @example
 * ```ts
 * const params = new URLSearchParams('foo=bar&baz=qux')
 * fromSearchParams(params)
 * // => { foo: 'bar', baz: 'qux' }
 *
 * const params = new URLSearchParams('user[name]=John&user[age]=30')
 * fromSearchParams(params)
 * // => { user: { name: 'John', age: '30' } }
 *
 * const params = new URLSearchParams('count=5&active=true')
 * fromSearchParams(params, { parseNumbers: true, parseBooleans: true })
 * // => { count: 5, active: true }
 *
 * const params = new URLSearchParams('items[]=a&items[]=b&items[]=c')
 * fromSearchParams(params)
 * // => { items: ['a', 'b', 'c'] }
 * ```
 */
export function fromSearchParams(
  params: URLSearchParams,
  options?: ParseOptions
): ParsedQuery {
  // Handle empty or invalid input
  if (!params || !(params instanceof URLSearchParams)) {
    return {}
  }

  // Convert URLSearchParams to query string
  const queryString = params.toString()

  // Parse the query string
  return parse(queryString, options)
}
