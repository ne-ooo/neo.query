/**
 * @lpm.dev/neo.query
 *
 * Modern, tree-shakeable URL query string parser/stringifier
 */

// Export types
export type {
  QueryValue,
  ParsedQuery,
  StringifiableQuery,
  ArrayFormat,
  ParseOptions,
  StringifyOptions,
} from './types.js'

// Export URL types
export type { ParsedUrl, UrlComponents } from './url/index.js'

// Export parse functions
export { parse } from './parse/index.js'

// Export stringify functions
export { stringify } from './stringify/index.js'

// Export URL functions
export { extract, parseUrl, stringifyUrl } from './url/index.js'

// Export URLSearchParams compatibility functions
export { toSearchParams, fromSearchParams } from './compat/index.js'

// Export utility functions
export { pick, exclude } from './utils/index.js'
