/**
 * Main parse function for query strings
 */

import type { ParsedQuery, ParseOptions, QueryValue } from '../types.js'
import { splitQuery, splitPair } from '../utils/split.js'
import { decodeValue } from './decoder.js'
import { parseType } from './type-parser.js'
import {
  isNestedKey,
  parseKeySegments,
  setNestedValue,
  postProcessArrays,
} from './nested-parser.js'

/**
 * Default parse options
 */
const DEFAULT_OPTIONS: Required<Omit<ParseOptions, 'decoder'>> = {
  parseNumbers: false,
  parseBooleans: false,
  parseNulls: false,
  allowDots: false,
  arrayFormat: 'bracket',
  arraySeparator: ',',
  depth: 5,
  decode: true,
}

/**
 * Parse a query string into an object
 *
 * @param query - Query string to parse (with or without leading ? or #)
 * @param options - Parse options
 * @returns Parsed query object
 *
 * @example
 * ```ts
 * parse('foo=bar&baz=qux')
 * // => { foo: 'bar', baz: 'qux' }
 *
 * parse('?page=1&limit=10', { parseNumbers: true })
 * // => { page: 1, limit: 10 }
 *
 * parse('active=true', { parseBooleans: true })
 * // => { active: true }
 * ```
 */
export function parse(query: string, options: ParseOptions = {}): ParsedQuery {
  // Merge with defaults
  const opts: Required<ParseOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    decoder: options.decoder,
  } as Required<ParseOptions>

  // Strip leading ? or #
  let queryStr = query
  if (queryStr.startsWith('?') || queryStr.startsWith('#')) {
    queryStr = queryStr.slice(1)
  }

  // Empty query string returns empty object
  if (!queryStr) {
    return {}
  }

  // Split query string into key-value pairs
  const pairs = splitQuery(queryStr)
  const result: ParsedQuery = {}

  // Track keys for array detection
  const keyCount: Record<string, number> = {}

  for (const pair of pairs) {
    if (!pair) continue // Skip empty pairs

    const [rawKey, rawValue] = splitPair(pair)

    // Decode key and value if decode option is enabled
    const key = opts.decode ? decodeValue(rawKey, opts.decoder) : rawKey
    const value = opts.decode ? decodeValue(rawValue, opts.decoder) : rawValue

    // Skip empty keys
    if (!key) continue

    // Track key occurrences for array detection
    keyCount[key] = (keyCount[key] || 0) + 1

    // Parse value type
    const parsedValue = parseType(value, opts)

    // Check if key is nested (bracket or dot notation)
    if (isNestedKey(key, opts)) {
      // Parse key into segments
      const segments = parseKeySegments(key, opts)

      // Set nested value
      setNestedValue(result, segments, parsedValue, 0, opts.depth)
    } else {
      // Handle simple key (duplicate keys become arrays)
      if (key in result) {
        const existing = result[key]

        // Convert to array if not already
        if (Array.isArray(existing)) {
          // TypeScript: existing is already an array, push the new value
          ;(existing as QueryValue[]).push(parsedValue)
        } else {
          // Create array with existing value and new value
          result[key] = [existing as QueryValue, parsedValue] as QueryValue[]
        }
      } else {
        result[key] = parsedValue
      }
    }
  }

  // Post-process to convert numeric-indexed objects to arrays
  const processed = postProcessArrays(result)

  return processed
}
