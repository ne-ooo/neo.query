/**
 * Type parsing utilities for converting strings to their appropriate types
 */

import type { ParseOptions, QueryValue } from '../types.js'

/**
 * Parse a string value to its appropriate type based on options
 *
 * @param value - String value to parse
 * @param options - Parse options
 * @returns Parsed value (string, number, boolean, or null)
 *
 * @example
 * ```ts
 * parseType('123', { parseNumbers: true }) // => 123
 * parseType('true', { parseBooleans: true }) // => true
 * parseType('null', { parseNulls: true }) // => null
 * parseType('hello', {}) // => 'hello'
 * ```
 */
export function parseType(value: string, options: ParseOptions): QueryValue {
  // Parse null
  if (options.parseNulls && value === 'null') {
    return null
  }

  // Parse booleans
  if (options.parseBooleans) {
    if (value === 'true') return true
    if (value === 'false') return false
  }

  // Parse numbers
  if (options.parseNumbers) {
    // Check if value is a valid number (including negative, decimal, scientific notation)
    const num = Number(value)

    // Only parse if:
    // - Not NaN
    // - Not empty string (which becomes 0)
    // - Value matches the parsed number when converted back to string
    //   OR value is in scientific notation (e.g., '1e3', '1.5e2')
    if (!Number.isNaN(num) && value.trim() !== '') {
      // Check if it's a valid number either by:
      // 1. String representation matches (exact match)
      // 2. Or it's in scientific notation format
      const isExactMatch = String(num) === value
      const isScientificNotation = /^-?\d+\.?\d*e[+-]?\d+$/i.test(value)

      if (isExactMatch || isScientificNotation) {
        return num
      }
    }
  }

  // Return as string if no type conversion applied
  return value
}
