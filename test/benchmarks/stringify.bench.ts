/**
 * Stringify performance benchmarks
 *
 * Compare @lpm.dev/neo.query stringify performance against:
 * - qs (most popular, 78M downloads/week)
 * - query-string (lightweight, 30M downloads/week)
 * - URLSearchParams (native browser API)
 */

import { bench, describe } from 'vitest'
import { stringify as neoStringify } from '../../src/stringify/stringify.js'

// Import competitors
// @ts-ignore
let qsStringify: any
// @ts-ignore
let queryStringStringify: any

try {
  qsStringify = require('qs').stringify
} catch {
  console.warn('qs not installed - skipping qs benchmarks')
}

try {
  queryStringStringify = require('query-string').stringify
} catch {
  console.warn('query-string not installed - skipping query-string benchmarks')
}

describe('Stringify: Simple objects', () => {
  const simple = { foo: 'bar', baz: 'qux', hello: 'world' }

  bench('@lpm.dev/neo.query', () => {
    neoStringify(simple)
  })

  if (qsStringify) {
    bench('qs', () => {
      qsStringify(simple)
    })
  }

  if (queryStringStringify) {
    bench('query-string', () => {
      queryStringStringify(simple)
    })
  }

  bench('URLSearchParams (native)', () => {
    const params = new URLSearchParams(simple)
    params.toString()
  })
})

describe('Stringify: Nested objects (bracket notation)', () => {
  const nested = {
    user: {
      name: 'John',
      age: 30,
      address: {
        city: 'NYC',
        zip: '10001',
      },
    },
  }

  bench('@lpm.dev/neo.query', () => {
    neoStringify(nested)
  })

  if (qsStringify) {
    bench('qs', () => {
      qsStringify(nested)
    })
  }

  if (queryStringStringify) {
    bench('query-string', () => {
      queryStringStringify(nested)
    })
  }
})

describe('Stringify: Arrays', () => {
  const arrays = {
    items: ['a', 'b', 'c', 'd', 'e'],
  }

  bench('@lpm.dev/neo.query (bracket format)', () => {
    neoStringify(arrays)
  })

  bench('@lpm.dev/neo.query (index format)', () => {
    neoStringify(arrays, { arrayFormat: 'index' })
  })

  bench('@lpm.dev/neo.query (comma format)', () => {
    neoStringify(arrays, { arrayFormat: 'comma' })
  })

  if (qsStringify) {
    bench('qs', () => {
      qsStringify(arrays)
    })
  }

  if (queryStringStringify) {
    bench('query-string', () => {
      queryStringStringify(arrays)
    })
  }
})

describe('Stringify: Complex real-world objects', () => {
  const complex = {
    search: 'laptop',
    category: 'electronics',
    price: { min: 100, max: 500 },
    tags: ['new', 'sale'],
    page: 2,
    limit: 20,
    sort: 'price',
    order: 'asc',
  }

  bench('@lpm.dev/neo.query', () => {
    neoStringify(complex)
  })

  if (qsStringify) {
    bench('qs', () => {
      qsStringify(complex)
    })
  }

  if (queryStringStringify) {
    bench('query-string', () => {
      queryStringStringify(complex)
    })
  }
})

describe('Stringify: Objects in arrays', () => {
  const objectsInArrays = {
    users: [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 35 },
    ],
  }

  bench('@lpm.dev/neo.query', () => {
    neoStringify(objectsInArrays)
  })

  if (qsStringify) {
    bench('qs', () => {
      qsStringify(objectsInArrays)
    })
  }

  if (queryStringStringify) {
    bench('query-string', () => {
      queryStringStringify(objectsInArrays)
    })
  }
})

describe('Stringify: Large objects', () => {
  // Generate a large object with 100 properties
  const large = Object.fromEntries(
    Array.from({ length: 100 }, (_, i) => [`param${i}`, `value${i}`])
  )

  bench('@lpm.dev/neo.query', () => {
    neoStringify(large)
  })

  if (qsStringify) {
    bench('qs', () => {
      qsStringify(large)
    })
  }

  if (queryStringStringify) {
    bench('query-string', () => {
      queryStringStringify(large)
    })
  }
})

describe('Stringify: Key sorting', () => {
  const unsorted = {
    z: '26',
    a: '1',
    m: '13',
    b: '2',
    y: '25',
  }

  bench('@lpm.dev/neo.query (with sorting)', () => {
    neoStringify(unsorted, { sort: true })
  })

  bench('@lpm.dev/neo.query (without sorting)', () => {
    neoStringify(unsorted, { sort: false })
  })

  if (qsStringify) {
    bench('qs (with sorting)', () => {
      qsStringify(unsorted, { sort: (a: string, b: string) => a.localeCompare(b) })
    })
  }
})

describe('Stringify: Null/undefined filtering', () => {
  const withNulls = {
    foo: 'bar',
    baz: null,
    qux: undefined,
    hello: 'world',
  }

  bench('@lpm.dev/neo.query (skip null/undefined)', () => {
    neoStringify(withNulls)
  })

  bench('@lpm.dev/neo.query (include null)', () => {
    neoStringify(withNulls, { skipNull: false, skipUndefined: false })
  })

  if (qsStringify) {
    bench('qs (skip null)', () => {
      qsStringify(withNulls, { skipNulls: true })
    })
  }
})
