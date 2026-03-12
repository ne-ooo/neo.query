/**
 * Nested object stringify tests
 */

import { describe, it, expect } from 'vitest'
import { stringify } from '../../../src/stringify/stringify.js'
import { parse } from '../../../src/parse/parse.js'

describe('stringify - Bracket Notation', () => {
  it('should stringify simple nested object with brackets', () => {
    expect(stringify({ user: { name: 'John' } })).toBe('user[name]=John')
  })

  it('should stringify multiple nested properties', () => {
    expect(stringify({ user: { name: 'John', age: '30' } })).toBe(
      'user[age]=30&user[name]=John'
    )
  })

  it('should stringify deeply nested objects', () => {
    expect(stringify({ user: { address: { city: 'NYC' } } })).toBe(
      'user[address][city]=NYC'
    )
  })

  it('should handle mixed nested and simple keys', () => {
    expect(stringify({ email: 'john@example.com', user: { name: 'John' } })).toBe(
      'email=john%40example.com&user[name]=John'
    )
  })
})

describe('stringify - Dot Notation', () => {
  it('should stringify with dot notation when allowDots is true', () => {
    expect(stringify({ user: { name: 'John' } }, { allowDots: true })).toBe(
      'user.name=John'
    )
  })

  it('should stringify deeply nested with dots', () => {
    expect(
      stringify({ user: { address: { city: 'NYC' } } }, { allowDots: true })
    ).toBe('user.address.city=NYC')
  })

  it('should use bracket notation by default', () => {
    expect(stringify({ user: { name: 'John' } })).toBe('user[name]=John')
  })
})

describe('stringify - Nested Arrays', () => {
  it('should stringify arrays inside objects', () => {
    expect(stringify({ user: { tags: ['a', 'b', 'c'] } })).toBe(
      'user[tags][]=a&user[tags][]=b&user[tags][]=c'
    )
  })

  it('should stringify arrays with index format', () => {
    expect(
      stringify({ user: { tags: ['a', 'b'] } }, { arrayFormat: 'index' })
    ).toBe('user[tags][0]=a&user[tags][1]=b')
  })

  it('should stringify arrays with dot notation', () => {
    expect(
      stringify({ user: { tags: ['a', 'b'] } }, { allowDots: true })
    ).toBe('user.tags[]=a&user.tags[]=b')
  })
})

describe('stringify - Objects in Arrays', () => {
  it('should stringify array of objects', () => {
    const data = {
      users: [
        { name: 'Alice', age: '25' },
        { name: 'Bob', age: '30' },
      ],
    }

    const result = stringify(data)
    expect(result).toBe(
      'users[0][age]=25&users[0][name]=Alice&users[1][age]=30&users[1][name]=Bob'
    )
  })

  it('should stringify nested objects in arrays', () => {
    const data = {
      items: [
        { id: '1', meta: { type: 'a' } },
        { id: '2', meta: { type: 'b' } },
      ],
    }

    const result = stringify(data, { arrayFormat: 'index' })
    expect(result).toBe(
      'items[0][id]=1&items[0][meta][type]=a&items[1][id]=2&items[1][meta][type]=b'
    )
  })
})

describe('stringify - Complex Nested Scenarios', () => {
  it('should stringify real-world user object', () => {
    const data = {
      user: {
        name: 'John',
        email: 'john@example.com',
        address: {
          city: 'NYC',
          zip: '10001',
        },
      },
    }

    expect(stringify(data)).toBe(
      'user[address][city]=NYC&user[address][zip]=10001&user[email]=john%40example.com&user[name]=John'
    )
  })

  it('should stringify form data with nested fields', () => {
    const data = {
      profile: {
        firstName: 'Jane',
        lastName: 'Doe',
        contact: {
          email: 'jane@example.com',
          phone: '555-1234',
        },
      },
    }

    expect(stringify(data)).toBe(
      'profile[contact][email]=jane%40example.com&profile[contact][phone]=555-1234&profile[firstName]=Jane&profile[lastName]=Doe'
    )
  })

  it('should handle deeply nested with arrays', () => {
    const data = {
      a: {
        b: {
          c: ['x', 'y', 'z'],
        },
      },
    }

    expect(stringify(data)).toBe('a[b][c][]=x&a[b][c][]=y&a[b][c][]=z')
  })
})

describe('stringify - Nested with null/undefined', () => {
  it('should skip null nested values', () => {
    expect(stringify({ user: { name: 'John', age: null } })).toBe(
      'user[name]=John'
    )
  })

  it('should include null when skipNull is false', () => {
    expect(stringify({ user: { name: 'John', age: null } }, { skipNull: false })).toBe(
      'user[age]=null&user[name]=John'
    )
  })

  it('should skip objects with all null values', () => {
    expect(stringify({ user: { a: null, b: null } })).toBe('')
  })
})

describe('stringify - Sorting with Nested Objects', () => {
  it('should sort nested keys alphabetically', () => {
    expect(stringify({ user: { z: '3', a: '1', m: '2' } })).toBe(
      'user[a]=1&user[m]=2&user[z]=3'
    )
  })

  it('should sort top-level and nested keys', () => {
    const data = {
      z: {
        b: '2',
        a: '1',
      },
      a: {
        z: '4',
        m: '3',
      },
    }

    expect(stringify(data)).toBe('a[m]=3&a[z]=4&z[a]=1&z[b]=2')
  })

  it('should disable sorting for nested objects', () => {
    const result = stringify({ user: { z: '3', a: '1' } }, { sort: false })
    expect(result).toContain('user[z]=3')
    expect(result).toContain('user[a]=1')
  })
})

describe('stringify - Round-trip with parse', () => {
  it('should round-trip simple nested objects', () => {
    const original = { user: { name: 'John', age: '30' } }
    const stringified = stringify(original)
    const parsed = parse(stringified)

    expect(parsed).toEqual(original)
  })

  it('should round-trip arrays', () => {
    const original = { items: ['foo', 'bar', 'baz'] }
    const stringified = stringify(original)
    const parsed = parse(stringified)

    expect(parsed).toEqual(original)
  })

  it('should round-trip nested arrays', () => {
    const original = {
      users: [
        { name: 'Alice' },
        { name: 'Bob' },
      ],
    }
    const stringified = stringify(original, { arrayFormat: 'index' })
    const parsed = parse(stringified)

    expect(parsed).toEqual(original)
  })
})
