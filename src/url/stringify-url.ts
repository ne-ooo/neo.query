/**
 * Build a URL from components with query string
 */

import type { StringifiableQuery, StringifyOptions } from '../types.js'
import { stringify } from '../stringify/stringify.js'
import { extract } from './extract.js'

/**
 * URL components for stringification
 */
export interface UrlComponents {
  /**
   * Base URL (can include existing query string)
   */
  url: string

  /**
   * Query object to stringify and append
   */
  query?: StringifiableQuery

  /**
   * Hash fragment (with or without #)
   */
  hash?: string
}

/**
 * Build a URL from components with query string
 *
 * @param components - URL components
 * @param options - Stringify options for query string
 * @returns Complete URL with query string and hash
 *
 * @example
 * ```ts
 * stringifyUrl({ url: 'https://example.com/path', query: { foo: 'bar', baz: 'qux' } })
 * // => 'https://example.com/path?baz=qux&foo=bar'
 *
 * stringifyUrl({
 *   url: 'https://example.com/path',
 *   query: { foo: 'bar' },
 *   hash: 'section'
 * })
 * // => 'https://example.com/path?foo=bar#section'
 *
 * // Merge with existing query string
 * stringifyUrl({
 *   url: 'https://example.com/path?existing=value',
 *   query: { foo: 'bar' }
 * })
 * // => 'https://example.com/path?existing=value&foo=bar'
 *
 * // Nested objects
 * stringifyUrl({
 *   url: 'https://example.com/path',
 *   query: { user: { name: 'John', age: 30 } }
 * })
 * // => 'https://example.com/path?user[age]=30&user[name]=John'
 * ```
 */
export function stringifyUrl(
  components: UrlComponents,
  options?: StringifyOptions
): string {
  // Handle empty or invalid input
  if (!components || typeof components !== 'object') {
    return ''
  }

  const { url = '', query = {}, hash = '' } = components

  // Start with base URL
  let result = url

  // Extract existing query string from URL
  const existingQuery = extract(url)

  // Remove query string and hash from base URL
  const queryStart = url.indexOf('?')
  const hashStart = url.indexOf('#')

  if (queryStart !== -1) {
    result = url.slice(0, queryStart)
  } else if (hashStart !== -1) {
    result = url.slice(0, hashStart)
  }

  // Build new query string from query object
  const newQuery = query && Object.keys(query).length > 0
    ? stringify(query, options)
    : ''

  // Combine existing and new query strings
  let combinedQuery = ''

  if (existingQuery && newQuery) {
    // Both exist, combine with &
    combinedQuery = `${existingQuery}&${newQuery}`
  } else if (existingQuery) {
    // Only existing query
    combinedQuery = existingQuery
  } else if (newQuery) {
    // Only new query
    combinedQuery = newQuery
  }

  // Append query string if present
  if (combinedQuery) {
    result += `?${combinedQuery}`
  }

  // Append hash fragment if present
  if (hash) {
    // Add # if not already present
    result += hash.startsWith('#') ? hash : `#${hash}`
  }

  return result
}
