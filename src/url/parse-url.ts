/**
 * Parse a URL with query string into components
 */

import type { ParsedQuery, ParseOptions } from '../types.js'
import { parse } from '../parse/parse.js'
import { extract } from './extract.js'

/**
 * Parsed URL result
 */
export interface ParsedUrl {
  /**
   * The URL without query string and hash
   */
  url: string

  /**
   * Parsed query string object
   */
  query: ParsedQuery

  /**
   * Original query string (without ?)
   */
  queryString: string

  /**
   * Hash fragment (with #) or empty string
   */
  hash: string
}

/**
 * Parse a URL and its query string into components
 *
 * @param url - URL to parse
 * @param options - Parse options for query string
 * @returns Parsed URL object
 *
 * @example
 * ```ts
 * parseUrl('https://example.com/path?foo=bar&baz=qux')
 * // => {
 * //   url: 'https://example.com/path',
 * //   query: { foo: 'bar', baz: 'qux' },
 * //   queryString: 'foo=bar&baz=qux',
 * //   hash: ''
 * // }
 *
 * parseUrl('https://example.com/path?foo=bar#section')
 * // => {
 * //   url: 'https://example.com/path',
 * //   query: { foo: 'bar' },
 * //   queryString: 'foo=bar',
 * //   hash: '#section'
 * // }
 *
 * parseUrl('https://example.com/path?user[name]=John', { allowDots: false })
 * // => {
 * //   url: 'https://example.com/path',
 * //   query: { user: { name: 'John' } },
 * //   queryString: 'user[name]=John',
 * //   hash: ''
 * // }
 * ```
 */
export function parseUrl(url: string, options?: ParseOptions): ParsedUrl {
  // Handle empty or invalid input
  if (!url || typeof url !== 'string') {
    return {
      url: '',
      query: {},
      queryString: '',
      hash: '',
    }
  }

  // Extract query string
  const queryString = extract(url)

  // Parse query string into object
  const query = queryString ? parse(queryString, options) : {}

  // Find query string and hash positions
  const queryStart = url.indexOf('?')
  const hashStart = url.indexOf('#')

  // Extract base URL (without query and hash)
  let baseUrl = url
  if (queryStart !== -1) {
    baseUrl = url.slice(0, queryStart)
  } else if (hashStart !== -1) {
    baseUrl = url.slice(0, hashStart)
  }

  // Extract hash fragment
  let hash = ''
  if (hashStart !== -1) {
    // If there's a query string, hash comes after it
    if (queryStart !== -1 && queryStart < hashStart) {
      hash = url.slice(hashStart)
    } else if (queryStart === -1) {
      // No query string, hash comes directly after base URL
      hash = url.slice(hashStart)
    }
  }

  return {
    url: baseUrl,
    query,
    queryString,
    hash,
  }
}
