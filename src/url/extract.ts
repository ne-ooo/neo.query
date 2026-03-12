/**
 * Extract query string from a URL
 */

/**
 * Extract the query string portion from a URL
 *
 * @param url - URL to extract query string from
 * @returns Query string without leading '?' or empty string if no query
 *
 * @example
 * ```ts
 * extract('https://example.com/path?foo=bar&baz=qux')
 * // => 'foo=bar&baz=qux'
 *
 * extract('https://example.com/path?foo=bar#hash')
 * // => 'foo=bar' (hash removed)
 *
 * extract('https://example.com/path')
 * // => ''
 *
 * extract('?foo=bar')
 * // => 'foo=bar'
 * ```
 */
export function extract(url: string): string {
  // Handle empty or invalid input
  if (!url || typeof url !== 'string') {
    return ''
  }

  // Find the query string start (?)
  const queryStart = url.indexOf('?')

  // No query string found
  if (queryStart === -1) {
    return ''
  }

  // Find hash fragment (#)
  const hashStart = url.indexOf('#', queryStart)

  // Extract query string between ? and # (or end of string)
  if (hashStart === -1) {
    // No hash, extract from ? to end
    return url.slice(queryStart + 1)
  } else {
    // Hash exists, extract from ? to #
    return url.slice(queryStart + 1, hashStart)
  }
}
