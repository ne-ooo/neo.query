/**
 * Split query string into key-value pairs
 */

/**
 * Split query string by & or ; separators
 *
 * @param query - Query string to split
 * @returns Array of key-value pair strings
 *
 * @example
 * ```ts
 * splitQuery('foo=bar&baz=qux') // => ['foo=bar', 'baz=qux']
 * splitQuery('foo=bar;baz=qux') // => ['foo=bar', 'baz=qux']
 * ```
 */
export function splitQuery(query: string): string[] {
  if (!query) return []

  // Split by & or ; (both are valid separators)
  return query.split(/[&;]/)
}

/**
 * Split key-value pair string
 *
 * @param pair - Key-value pair string
 * @returns [key, value] tuple
 *
 * @example
 * ```ts
 * splitPair('foo=bar') // => ['foo', 'bar']
 * splitPair('foo') // => ['foo', '']
 * splitPair('foo=bar=baz') // => ['foo', 'bar=baz']
 * ```
 */
export function splitPair(pair: string): [string, string] {
  const index = pair.indexOf('=')

  if (index === -1) {
    // No = sign, treat entire string as key with empty value
    return [pair, '']
  }

  // Split at first = sign
  const key = pair.slice(0, index)
  const value = pair.slice(index + 1)

  return [key, value]
}
