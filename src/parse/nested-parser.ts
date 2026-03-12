/**
 * Nested object parsing utilities
 */

import type { ParsedQuery, ParseOptions, QueryValue } from '../types.js'

/**
 * Check if a key represents a nested path
 *
 * @param key - Key to check
 * @param options - Parse options
 * @returns true if key is nested
 *
 * @example
 * ```ts
 * isNestedKey('user[name]')      // => true
 * isNestedKey('user.name', true) // => true (if allowDots)
 * isNestedKey('simple')          // => false
 * ```
 */
export function isNestedKey(key: string, options: ParseOptions): boolean {
  // Check for bracket notation: user[name] or user[0]
  if (key.includes('[') && key.includes(']')) {
    return true
  }

  // Check for dot notation (if allowed)
  if (options.allowDots && key.includes('.')) {
    return true
  }

  return false
}

/**
 * Parse a bracket notation key into path segments
 *
 * @param key - Key with bracket notation
 * @returns Array of path segments
 *
 * @example
 * ```ts
 * parseBracketKey('user[name]')
 * // => ['user', 'name']
 *
 * parseBracketKey('user[address][city]')
 * // => ['user', 'address', 'city']
 *
 * parseBracketKey('items[0]')
 * // => ['items', '0']
 *
 * parseBracketKey('items[]')
 * // => ['items', '']  (empty bracket for array push)
 * ```
 */
export function parseBracketKey(key: string): string[] {
  const segments: string[] = []
  let current = ''
  let inBracket = false

  for (let i = 0; i < key.length; i++) {
    const char = key[i]

    if (char === '[') {
      // Start of bracket
      if (current) {
        segments.push(current)
        current = ''
      }
      inBracket = true
    } else if (char === ']') {
      // End of bracket
      if (inBracket) {
        segments.push(current)
        current = ''
        inBracket = false
      }
    } else {
      // Regular character
      current += char
    }
  }

  // Add remaining segment if any
  if (current) {
    segments.push(current)
  }

  return segments
}

/**
 * Parse a dot notation key into path segments
 *
 * @param key - Key with dot notation
 * @returns Array of path segments
 *
 * @example
 * ```ts
 * parseDotKey('user.name')
 * // => ['user', 'name']
 *
 * parseDotKey('user.address.city')
 * // => ['user', 'address', 'city']
 * ```
 */
export function parseDotKey(key: string): string[] {
  return key.split('.')
}

/**
 * Parse a key into path segments based on notation type
 *
 * @param key - Key to parse
 * @param options - Parse options
 * @returns Array of path segments
 *
 * @example
 * ```ts
 * parseKeySegments('user[name]', {})
 * // => ['user', 'name']
 *
 * parseKeySegments('user.name', { allowDots: true })
 * // => ['user', 'name']
 *
 * parseKeySegments('simple', {})
 * // => ['simple']
 * ```
 */
export function parseKeySegments(key: string, options: ParseOptions): string[] {
  // Check for bracket notation first (takes precedence)
  if (key.includes('[') && key.includes(']')) {
    return parseBracketKey(key)
  }

  // Check for dot notation (if allowed)
  if (options.allowDots && key.includes('.')) {
    return parseDotKey(key)
  }

  // Simple key (no nesting)
  return [key]
}

/**
 * Set a value in a nested object using path segments
 *
 * @param obj - Target object
 * @param segments - Path segments
 * @param value - Value to set
 * @param depth - Current depth (for limiting)
 * @param maxDepth - Maximum allowed depth
 *
 * @example
 * ```ts
 * const obj = {}
 * setNestedValue(obj, ['user', 'name'], 'John', 0, 5)
 * // obj => { user: { name: 'John' } }
 *
 * setNestedValue(obj, ['user', 'age'], 30, 0, 5)
 * // obj => { user: { name: 'John', age: 30 } }
 * ```
 */
export function setNestedValue(
  obj: ParsedQuery,
  segments: string[],
  value: QueryValue,
  depth: number,
  maxDepth: number
): void {
  // Depth limit check
  if (depth >= maxDepth) {
    // Exceeded max depth, set as flat key
    const flatKey = segments.join('.')
    obj[flatKey] = value
    return
  }

  // Base case: single segment
  if (segments.length === 1) {
    const key = segments[0]!

    // Handle array push (empty bracket)
    if (key === '') {
      // Find next available array index
      const keys = Object.keys(obj)
      const indices = keys
        .map((k) => parseInt(k, 10))
        .filter((n) => !Number.isNaN(n))

      const nextIndex = indices.length > 0 ? Math.max(...indices) + 1 : 0
      obj[String(nextIndex)] = value
    } else {
      // Check if value already exists
      if (key in obj) {
        const existing = obj[key]

        // Convert to array if not already
        if (Array.isArray(existing)) {
          existing.push(value)
        } else {
          obj[key] = [existing as QueryValue, value] as QueryValue[]
        }
      } else {
        obj[key] = value
      }
    }
    return
  }

  // Recursive case: multiple segments
  const [currentSegment, ...restSegments] = segments
  const key = currentSegment!

  // Check if current segment exists
  if (!(key in obj)) {
    // Create new nested object
    obj[key] = {}
  }

  // Get current value
  let current = obj[key]

  // Ensure current is an object (not array or primitive)
  if (typeof current !== 'object' || current === null || Array.isArray(current)) {
    // Replace with new object
    current = {}
    obj[key] = current
  }

  // Recursively set nested value
  setNestedValue(current as ParsedQuery, restSegments, value, depth + 1, maxDepth)
}

/**
 * Check if a key represents an array index
 *
 * @param key - Key to check
 * @returns true if key is a numeric index
 *
 * @example
 * ```ts
 * isArrayIndex('0')    // => true
 * isArrayIndex('10')   // => true
 * isArrayIndex('name') // => false
 * isArrayIndex('')     // => false
 * ```
 */
export function isArrayIndex(key: string): boolean {
  if (!key) return false

  const num = parseInt(key, 10)
  return !Number.isNaN(num) && String(num) === key && num >= 0
}

/**
 * Check if an object should be converted to an array
 *
 * @param obj - Object to check
 * @returns true if object has only numeric indices
 *
 * @example
 * ```ts
 * shouldConvertToArray({ 0: 'a', 1: 'b', 2: 'c' })  // => true
 * shouldConvertToArray({ 0: 'a', name: 'b' })       // => false
 * shouldConvertToArray({})                          // => false
 * ```
 */
export function shouldConvertToArray(obj: ParsedQuery): boolean {
  const keys = Object.keys(obj)

  if (keys.length === 0) return false

  // All keys must be numeric indices
  return keys.every((key) => isArrayIndex(key))
}

/**
 * Convert an object with numeric indices to an array
 *
 * @param obj - Object to convert
 * @returns Array with values in index order
 *
 * @example
 * ```ts
 * convertToArray({ 0: 'a', 1: 'b', 2: 'c' })
 * // => ['a', 'b', 'c']
 *
 * convertToArray({ 2: 'c', 0: 'a', 1: 'b' })
 * // => ['a', 'b', 'c']  (sorted by index)
 * ```
 */
export function convertToArray(obj: ParsedQuery): QueryValue[] {
  const keys = Object.keys(obj).map(Number).sort((a, b) => a - b)
  return keys.map((key) => obj[String(key)] as QueryValue)
}

/**
 * Post-process parsed object to convert numeric-indexed objects to arrays
 *
 * @param obj - Parsed object
 * @returns Processed object with arrays where appropriate
 */
export function postProcessArrays(obj: ParsedQuery): ParsedQuery {
  const result: ParsedQuery = {}

  for (const key in obj) {
    const value = obj[key]

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Check if this object should be an array
      if (shouldConvertToArray(value as ParsedQuery)) {
        result[key] = convertToArray(value as ParsedQuery)
      } else {
        // Recursively process nested objects
        result[key] = postProcessArrays(value as ParsedQuery)
      }
    } else {
      result[key] = value
    }
  }

  return result
}
