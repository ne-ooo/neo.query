/**
 * URI encoding utilities
 */

/**
 * Default strict URI encoder (RFC 3986 compliant)
 *
 * Encodes all characters except unreserved: A-Z a-z 0-9 - _ . ~
 *
 * @param str - String to encode
 * @returns Encoded string
 *
 * @example
 * ```ts
 * strictEncoder('hello world')  // => 'hello%20world'
 * strictEncoder('foo+bar')      // => 'foo%2Bbar'
 * strictEncoder('a/b')          // => 'a%2Fb'
 * ```
 */
export function strictEncoder(str: string): string {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, (char) => {
      // Encode additional characters for strict RFC 3986 compliance
      return `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    })
}

/**
 * Default URI encoder using encodeURIComponent
 *
 * @param str - String to encode
 * @returns Encoded string
 */
export function defaultEncoder(str: string): string {
  try {
    return encodeURIComponent(str)
  } catch {
    // If encoding fails, return original string
    return str
  }
}

/**
 * Encode a query string value
 *
 * @param value - Value to encode
 * @param strict - Use strict RFC 3986 encoding
 * @param encoder - Custom encoder function
 * @returns Encoded value
 */
export function encodeValue(
  value: string,
  strict: boolean,
  encoder?: (value: string, defaultEncoder: (str: string) => string) => string
): string {
  if (encoder) {
    return encoder(value, defaultEncoder)
  }

  if (strict) {
    return strictEncoder(value)
  }

  return defaultEncoder(value)
}

/**
 * Encode a query string key
 *
 * Same as encodeValue but for keys
 *
 * @param key - Key to encode
 * @param strict - Use strict RFC 3986 encoding
 * @param encoder - Custom encoder function
 * @returns Encoded key
 */
export function encodeKey(
  key: string,
  strict: boolean,
  encoder?: (value: string, defaultEncoder: (str: string) => string) => string
): string {
  return encodeValue(key, strict, encoder)
}
