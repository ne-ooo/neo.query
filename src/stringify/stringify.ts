/**
 * Main stringify function for objects to query strings
 */

import type { StringifiableQuery, StringifyOptions, QueryValue } from '../types.js'
import { encodeKey, encodeValue } from './encoder.js'

/**
 * Default stringify options
 */
const DEFAULT_OPTIONS: Required<Omit<StringifyOptions, 'encoder'>> = {
  arrayFormat: 'bracket',
  arraySeparator: ',',
  allowDots: false,
  skipNull: true,
  skipUndefined: true,
  skipEmptyString: false,
  encode: true,
  sort: true,
  strict: true,
}

/**
 * Check if a value should be skipped based on options
 *
 * @param value - Value to check
 * @param options - Stringify options
 * @returns true if value should be skipped
 */
function shouldSkipValue(value: QueryValue, options: Required<StringifyOptions>): boolean {
  if (value === null && options.skipNull) return true
  if (value === undefined && options.skipUndefined) return true
  if (value === '' && options.skipEmptyString) return true
  return false
}

/**
 * Convert a value to string for stringification
 *
 * @param value - Value to convert
 * @returns String representation
 */
function valueToString(value: QueryValue): string {
  if (value === null) return 'null'
  if (value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  return String(value)
}

/**
 * Sort object keys
 *
 * @param obj - Object to get sorted keys from
 * @param sort - Sort option (boolean or custom comparator)
 * @returns Sorted array of keys
 */
function getSortedKeys(
  obj: StringifiableQuery,
  sort: boolean | ((a: string, b: string) => number)
): string[] {
  const keys = Object.keys(obj)

  if (typeof sort === 'function') {
    return keys.sort(sort)
  }

  if (sort === true) {
    // Default alphabetical sort
    return keys.sort()
  }

  // No sorting
  return keys
}

/**
 * Stringify a simple (non-nested) object to query string
 *
 * @param obj - Object to stringify
 * @param options - Stringify options
 * @returns Query string
 *
 * @example
 * ```ts
 * stringify({ foo: 'bar', baz: 'qux' })
 * // => 'baz=qux&foo=bar' (sorted alphabetically)
 *
 * stringify({ foo: 'bar', baz: null })
 * // => 'foo=bar' (null skipped by default)
 *
 * stringify({ foo: 'hello world' })
 * // => 'foo=hello%20world' (URI encoded)
 * ```
 */
export function stringify(
  obj: StringifiableQuery,
  options: StringifyOptions = {}
): string {
  // Merge with defaults
  const opts: Required<StringifyOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    encoder: options.encoder,
  } as Required<StringifyOptions>

  // Get sorted keys
  const keys = getSortedKeys(obj, opts.sort)

  // Build query string parts
  const parts: string[] = []

  for (const key of keys) {
    const value = obj[key]

    // Skip undefined/null/empty based on options
    if (shouldSkipValue(value as QueryValue, opts)) {
      continue
    }

    // Encode key
    const encodedKey = opts.encode
      ? encodeKey(key, opts.strict, opts.encoder)
      : key

    // Handle arrays
    if (Array.isArray(value)) {
      // Stringify array based on format
      const arrayParts = stringifyArray(encodedKey, value, opts)
      parts.push(...arrayParts)
      continue
    }

    // Handle objects (nested)
    if (typeof value === 'object' && value !== null) {
      // Stringify nested object
      const nestedParts = stringifyNested(encodedKey, value as StringifiableQuery, opts)
      parts.push(...nestedParts)
      continue
    }

    // Handle primitive value
    const stringValue = valueToString(value as QueryValue)
    const encodedValue = opts.encode
      ? encodeValue(stringValue, opts.strict, opts.encoder)
      : stringValue

    parts.push(`${encodedKey}=${encodedValue}`)
  }

  return parts.join('&')
}

/**
 * Stringify an array based on array format option
 *
 * @param key - Array key
 * @param array - Array to stringify
 * @param options - Stringify options
 * @returns Array of query string parts
 */
function stringifyArray(
  key: string,
  array: unknown[],
  options: Required<StringifyOptions>
): string[] {
  const parts: string[] = []

  for (let i = 0; i < array.length; i++) {
    const item = array[i]

    // Skip null/undefined items based on options
    if (shouldSkipValue(item as QueryValue, options)) {
      continue
    }

    // Handle objects in arrays (recursively stringify)
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      // For objects in arrays, always use indexed notation
      const indexedKey = `${key}[${i}]`
      const nestedParts = stringifyNested(indexedKey, item as StringifiableQuery, options)
      parts.push(...nestedParts)
      continue
    }

    // Handle nested arrays
    if (Array.isArray(item)) {
      const indexedKey = `${key}[${i}]`
      const arrayParts = stringifyArray(indexedKey, item, options)
      parts.push(...arrayParts)
      continue
    }

    const stringValue = valueToString(item as QueryValue)
    const encodedValue = options.encode
      ? encodeValue(stringValue, options.strict, options.encoder)
      : stringValue

    switch (options.arrayFormat) {
      case 'bracket':
        // items[]=foo&items[]=bar
        parts.push(`${key}[]=${encodedValue}`)
        break

      case 'index':
        // items[0]=foo&items[1]=bar
        parts.push(`${key}[${i}]=${encodedValue}`)
        break

      case 'comma':
        // items=foo,bar (collected and joined later)
        // For comma format, we need to collect all values
        if (i === 0) {
          const allValues = array
            .filter((v) => !shouldSkipValue(v as QueryValue, options))
            .map((v) => {
              const str = valueToString(v as QueryValue)
              return options.encode
                ? encodeValue(str, options.strict, options.encoder)
                : str
            })
            .join(',')
          parts.push(`${key}=${allValues}`)
          return parts // Return early since we processed all items
        }
        break

      case 'separator':
        // items=foo|bar (custom separator)
        if (i === 0) {
          const allValues = array
            .filter((v) => !shouldSkipValue(v as QueryValue, options))
            .map((v) => {
              const str = valueToString(v as QueryValue)
              return options.encode
                ? encodeValue(str, options.strict, options.encoder)
                : str
            })
            .join(options.arraySeparator)
          parts.push(`${key}=${allValues}`)
          return parts // Return early
        }
        break

      case 'repeat':
        // items=foo&items=bar
        parts.push(`${key}=${encodedValue}`)
        break

      case 'bracket-separator':
        // items[]=foo|bar
        if (i === 0) {
          const allValues = array
            .filter((v) => !shouldSkipValue(v as QueryValue, options))
            .map((v) => {
              const str = valueToString(v as QueryValue)
              return options.encode
                ? encodeValue(str, options.strict, options.encoder)
                : str
            })
            .join(options.arraySeparator)
          parts.push(`${key}[]=${allValues}`)
          return parts // Return early
        }
        break

      default:
        // Default to bracket format
        parts.push(`${key}[]=${encodedValue}`)
    }
  }

  return parts
}

/**
 * Stringify a nested object
 *
 * @param prefix - Key prefix
 * @param obj - Nested object to stringify
 * @param options - Stringify options
 * @returns Array of query string parts
 */
function stringifyNested(
  prefix: string,
  obj: StringifiableQuery,
  options: Required<StringifyOptions>
): string[] {
  const parts: string[] = []
  const keys = getSortedKeys(obj, options.sort)

  for (const key of keys) {
    const value = obj[key]

    // Skip null/undefined based on options
    if (shouldSkipValue(value as QueryValue, options)) {
      continue
    }

    // Build nested key
    const nestedKey = options.allowDots
      ? `${prefix}.${key}`
      : `${prefix}[${key}]`

    // Encode the inner key part if needed
    const encodedNestedKey = options.encode && !options.allowDots
      ? `${prefix}[${encodeKey(key, options.strict, options.encoder)}]`
      : nestedKey

    // Handle nested arrays
    if (Array.isArray(value)) {
      const arrayParts = stringifyArray(encodedNestedKey, value, options)
      parts.push(...arrayParts)
      continue
    }

    // Handle nested objects (recursive)
    if (typeof value === 'object' && value !== null) {
      const nestedParts = stringifyNested(encodedNestedKey, value as StringifiableQuery, options)
      parts.push(...nestedParts)
      continue
    }

    // Handle primitive value
    const stringValue = valueToString(value as QueryValue)
    const encodedValue = options.encode
      ? encodeValue(stringValue, options.strict, options.encoder)
      : stringValue

    parts.push(`${encodedNestedKey}=${encodedValue}`)
  }

  return parts
}
