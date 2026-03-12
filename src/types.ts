/**
 * Type definitions for @lpm.dev/neo.query
 */

/**
 * Query value types that can be parsed or stringified
 */
export type QueryValue = string | number | boolean | null | undefined

/**
 * Parsed query object
 * Supports nested objects and arrays
 */
export type ParsedQuery = {
  [key: string]: QueryValue | QueryValue[] | ParsedQuery | ParsedQuery[]
}

/**
 * Object that can be stringified to a query string
 */
export type StringifiableQuery = {
  [key: string]: QueryValue | QueryValue[] | StringifiableQuery | StringifiableQuery[]
}

/**
 * Array format options for parsing and stringifying
 */
export type ArrayFormat =
  | 'bracket'           // ids[]=1&ids[]=2&ids[]=3
  | 'index'             // ids[0]=1&ids[1]=2&ids[2]=3
  | 'comma'             // ids=1,2,3
  | 'separator'         // ids=1|2|3 (custom separator)
  | 'repeat'            // ids=1&ids=2&ids=3
  | 'bracket-separator' // ids[]=1|2|3

/**
 * Options for parsing query strings
 */
export interface ParseOptions {
  /**
   * Parse number strings as number type
   * @default false
   */
  parseNumbers?: boolean

  /**
   * Parse 'true'/'false' strings as boolean type
   * @default false
   */
  parseBooleans?: boolean

  /**
   * Parse 'null' string as null
   * @default false
   */
  parseNulls?: boolean

  /**
   * Allow dot notation for nested objects (user.name=John)
   * @default false
   */
  allowDots?: boolean

  /**
   * Array format to use for parsing
   * @default 'bracket'
   */
  arrayFormat?: ArrayFormat

  /**
   * Custom array separator (for 'separator' and 'bracket-separator' formats)
   * @default ','
   */
  arraySeparator?: string

  /**
   * Maximum nesting depth for objects
   * @default 5
   */
  depth?: number

  /**
   * Decode URI components
   * @default true
   */
  decode?: boolean

  /**
   * Custom decoder function
   */
  decoder?: (value: string, defaultDecoder: (str: string) => string) => string
}

/**
 * Options for stringifying objects to query strings
 */
export interface StringifyOptions {
  /**
   * Array format to use
   * @default 'bracket'
   */
  arrayFormat?: ArrayFormat

  /**
   * Custom array separator (for 'separator' and 'bracket-separator' formats)
   * @default ','
   */
  arraySeparator?: string

  /**
   * Allow dot notation for nested objects
   * @default false
   */
  allowDots?: boolean

  /**
   * Skip null values
   * @default true
   */
  skipNull?: boolean

  /**
   * Skip undefined values
   * @default true
   */
  skipUndefined?: boolean

  /**
   * Skip empty strings
   * @default false
   */
  skipEmptyString?: boolean

  /**
   * Encode URI components
   * @default true
   */
  encode?: boolean

  /**
   * Custom encoder function
   */
  encoder?: (value: string, defaultEncoder: (str: string) => string) => string

  /**
   * Sort keys (true for alphabetical, false for no sorting, or custom sort function)
   * @default true
   */
  sort?: boolean | ((a: string, b: string) => number)

  /**
   * Use strict URI encoding (RFC 3986)
   * @default true
   */
  strict?: boolean
}

/**
 * Result from parseUrl function
 */
export interface ParsedUrl {
  /**
   * Base URL without query string
   */
  url: string

  /**
   * Parsed query object
   */
  query: ParsedQuery

  /**
   * Fragment identifier (hash without #)
   */
  fragmentIdentifier?: string

  /**
   * Parsed fragment query (if parseFragmentIdentifier: true)
   */
  fragmentQuery?: ParsedQuery
}

/**
 * Input for stringifyUrl function
 */
export interface UrlObject {
  /**
   * Base URL
   */
  url: string

  /**
   * Query object to stringify
   */
  query?: StringifiableQuery

  /**
   * Fragment identifier (without #)
   */
  fragmentIdentifier?: string
}

/**
 * Options for parseUrl function
 */
export interface ParseUrlOptions extends ParseOptions {
  /**
   * Parse fragment identifier as query string
   * @default false
   */
  parseFragmentIdentifier?: boolean
}
