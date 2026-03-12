/**
 * Parse performance benchmarks
 *
 * Compare @lpm.dev/neo.query parse performance against:
 * - qs (most popular, 78M downloads/week)
 * - query-string (lightweight, 30M downloads/week)
 * - URLSearchParams (native browser API)
 */

import { bench, describe } from 'vitest'
import { parse as neoParse } from '../../src/parse/parse.js'

// Import competitors (install with: npm install -D qs query-string)
// @ts-ignore - optional dependencies for benchmarking
let qsParse: any
// @ts-ignore
let queryStringParse: any

try {
  qsParse = require('qs').parse
} catch {
  console.warn('qs not installed - skipping qs benchmarks')
}

try {
  queryStringParse = require('query-string').parse
} catch {
  console.warn('query-string not installed - skipping query-string benchmarks')
}

describe('Parse: Simple query strings', () => {
  const simple = 'foo=bar&baz=qux&hello=world'

  bench('@lpm.dev/neo.query', () => {
    neoParse(simple)
  })

  if (qsParse) {
    bench('qs', () => {
      qsParse(simple)
    })
  }

  if (queryStringParse) {
    bench('query-string', () => {
      queryStringParse(simple)
    })
  }

  bench('URLSearchParams (native)', () => {
    const params = new URLSearchParams(simple)
    const result: Record<string, string> = {}
    params.forEach((value, key) => {
      result[key] = value
    })
  })
})

describe('Parse: Nested objects (bracket notation)', () => {
  const nested = 'user[name]=John&user[age]=30&user[address][city]=NYC&user[address][zip]=10001'

  bench('@lpm.dev/neo.query', () => {
    neoParse(nested)
  })

  if (qsParse) {
    bench('qs', () => {
      qsParse(nested)
    })
  }

  if (queryStringParse) {
    bench('query-string', () => {
      queryStringParse(nested)
    })
  }
})

describe('Parse: Arrays', () => {
  const arrays = 'items[]=a&items[]=b&items[]=c&items[]=d&items[]=e'

  bench('@lpm.dev/neo.query', () => {
    neoParse(arrays)
  })

  if (qsParse) {
    bench('qs', () => {
      qsParse(arrays)
    })
  }

  if (queryStringParse) {
    bench('query-string', () => {
      queryStringParse(arrays)
    })
  }
})

describe('Parse: Complex real-world query', () => {
  const complex =
    'search=laptop&category=electronics&price[min]=100&price[max]=500&tags[]=new&tags[]=sale&page=2&limit=20&sort=price&order=asc'

  bench('@lpm.dev/neo.query', () => {
    neoParse(complex)
  })

  if (qsParse) {
    bench('qs', () => {
      qsParse(complex)
    })
  }

  if (queryStringParse) {
    bench('query-string', () => {
      queryStringParse(complex)
    })
  }
})

describe('Parse: Type parsing (numbers, booleans)', () => {
  const typed = 'page=1&limit=20&active=true&deleted=false&score=98.5'

  bench('@lpm.dev/neo.query (with type parsing)', () => {
    neoParse(typed, { parseNumbers: true, parseBooleans: true })
  })

  bench('@lpm.dev/neo.query (without type parsing)', () => {
    neoParse(typed)
  })

  if (qsParse) {
    bench('qs', () => {
      qsParse(typed)
    })
  }

  if (queryStringParse) {
    bench('query-string (with parseNumbers)', () => {
      queryStringParse(typed, { parseNumbers: true, parseBooleans: true })
    })
  }
})

describe('Parse: Large query strings', () => {
  // Generate a large query string with 100 parameters
  const large = Array.from({ length: 100 }, (_, i) => `param${i}=value${i}`).join('&')

  bench('@lpm.dev/neo.query', () => {
    neoParse(large)
  })

  if (qsParse) {
    bench('qs', () => {
      qsParse(large)
    })
  }

  if (queryStringParse) {
    bench('query-string', () => {
      queryStringParse(large)
    })
  }
})

describe('Parse: Empty and edge cases', () => {
  bench('@lpm.dev/neo.query (empty string)', () => {
    neoParse('')
  })

  bench('@lpm.dev/neo.query (single param)', () => {
    neoParse('foo=bar')
  })

  bench('@lpm.dev/neo.query (no values)', () => {
    neoParse('foo&bar&baz')
  })
})
