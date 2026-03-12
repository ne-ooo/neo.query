/**
 * URI decoding utilities
 */

/**
 * Default URI decoder using decodeURIComponent
 *
 * @param str - String to decode
 * @returns Decoded string
 */
export function defaultDecoder(str: string): string {
  try {
    return decodeURIComponent(str)
  } catch {
    // If decoding fails, return original string
    return str
  }
}

/**
 * Decode a query string value
 *
 * @param value - Value to decode
 * @param decoder - Custom decoder function
 * @returns Decoded value
 */
export function decodeValue(
  value: string,
  decoder?: (value: string, defaultDecoder: (str: string) => string) => string
): string {
  if (decoder) {
    return decoder(value, defaultDecoder)
  }
  return defaultDecoder(value)
}
