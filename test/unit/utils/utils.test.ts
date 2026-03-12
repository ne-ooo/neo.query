/**
 * Utility functions tests
 */

import { describe, it, expect } from 'vitest'
import { pick, exclude } from '../../../src/utils/index.js'

describe('pick', () => {
  it('should pick simple keys', () => {
    const query = { foo: 'bar', baz: 'qux', extra: 'value' }
    const result = pick(query, ['foo', 'baz'])

    expect(result).toEqual({ foo: 'bar', baz: 'qux' })
  })

  it('should pick single key', () => {
    const query = { a: 1, b: 2, c: 3 }
    const result = pick(query, ['a'])

    expect(result).toEqual({ a: 1 })
  })

  it('should pick nested keys with dot notation', () => {
    const query = {
      user: {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      },
    }

    const result = pick(query, ['user.name', 'user.age'])

    expect(result).toEqual({
      user: {
        name: 'John',
        age: 30,
      },
    })
  })

  it('should pick deeply nested keys', () => {
    const query = {
      user: {
        address: {
          city: 'NYC',
          zip: '10001',
          country: 'USA',
        },
      },
    }

    const result = pick(query, ['user.address.city'])

    expect(result).toEqual({
      user: {
        address: {
          city: 'NYC',
        },
      },
    })
  })

  it('should handle non-existent keys', () => {
    const query = { foo: 'bar' }
    const result = pick(query, ['foo', 'nonexistent'])

    expect(result).toEqual({ foo: 'bar' })
  })

  it('should handle non-existent nested keys', () => {
    const query = { user: { name: 'John' } }
    const result = pick(query, ['user.name', 'user.age'])

    expect(result).toEqual({ user: { name: 'John' } })
  })

  it('should handle empty keys array', () => {
    const query = { foo: 'bar', baz: 'qux' }
    const result = pick(query, [])

    expect(result).toEqual({})
  })

  it('should handle empty query object', () => {
    const query = {}
    const result = pick(query, ['foo', 'bar'])

    expect(result).toEqual({})
  })

  it('should pick multiple nested paths', () => {
    const query = {
      user: {
        name: 'John',
        age: 30,
      },
      settings: {
        theme: 'dark',
        language: 'en',
      },
    }

    const result = pick(query, ['user.name', 'settings.theme'])

    expect(result).toEqual({
      user: { name: 'John' },
      settings: { theme: 'dark' },
    })
  })

  it('should pick entire object if top-level key is specified', () => {
    const query = {
      user: {
        name: 'John',
        age: 30,
      },
      other: 'value',
    }

    const result = pick(query, ['user'])

    expect(result).toEqual({
      user: {
        name: 'John',
        age: 30,
      },
    })
  })

  it('should handle arrays in query', () => {
    const query = {
      items: ['a', 'b', 'c'],
      other: 'value',
    }

    const result = pick(query, ['items'])

    expect(result).toEqual({ items: ['a', 'b', 'c'] })
  })

  it('should not modify original object', () => {
    const query = { foo: 'bar', baz: 'qux' }
    const original = { ...query }

    pick(query, ['foo'])

    expect(query).toEqual(original)
  })

  it('should handle invalid input gracefully', () => {
    expect(pick(null as any, ['foo'])).toEqual({})
    expect(pick(undefined as any, ['foo'])).toEqual({})
    expect(pick({ foo: 'bar' }, null as any)).toEqual({})
  })
})

describe('exclude', () => {
  it('should exclude simple keys', () => {
    const query = { foo: 'bar', baz: 'qux', extra: 'value' }
    const result = exclude(query, ['extra'])

    expect(result).toEqual({ foo: 'bar', baz: 'qux' })
  })

  it('should exclude multiple keys', () => {
    const query = { a: 1, b: 2, c: 3, d: 4 }
    const result = exclude(query, ['b', 'c'])

    expect(result).toEqual({ a: 1, d: 4 })
  })

  it('should exclude nested keys with dot notation', () => {
    const query = {
      user: {
        name: 'John',
        age: 30,
        password: 'secret',
      },
    }

    const result = exclude(query, ['user.password'])

    expect(result).toEqual({
      user: {
        name: 'John',
        age: 30,
      },
    })
  })

  it('should exclude deeply nested keys', () => {
    const query = {
      user: {
        address: {
          city: 'NYC',
          zip: '10001',
          country: 'USA',
        },
      },
    }

    const result = exclude(query, ['user.address.country'])

    expect(result).toEqual({
      user: {
        address: {
          city: 'NYC',
          zip: '10001',
        },
      },
    })
  })

  it('should handle non-existent keys', () => {
    const query = { foo: 'bar', baz: 'qux' }
    const result = exclude(query, ['nonexistent'])

    expect(result).toEqual({ foo: 'bar', baz: 'qux' })
  })

  it('should handle non-existent nested keys', () => {
    const query = { user: { name: 'John' } }
    const result = exclude(query, ['user.age'])

    expect(result).toEqual({ user: { name: 'John' } })
  })

  it('should handle empty keys array', () => {
    const query = { foo: 'bar', baz: 'qux' }
    const result = exclude(query, [])

    expect(result).toEqual({ foo: 'bar', baz: 'qux' })
  })

  it('should handle empty query object', () => {
    const query = {}
    const result = exclude(query, ['foo'])

    expect(result).toEqual({})
  })

  it('should exclude multiple nested paths', () => {
    const query = {
      user: {
        name: 'John',
        age: 30,
        password: 'secret',
      },
      settings: {
        theme: 'dark',
        apiKey: 'secret-key',
      },
    }

    const result = exclude(query, ['user.password', 'settings.apiKey'])

    expect(result).toEqual({
      user: {
        name: 'John',
        age: 30,
      },
      settings: {
        theme: 'dark',
      },
    })
  })

  it('should exclude entire object if top-level key is specified', () => {
    const query = {
      user: {
        name: 'John',
        age: 30,
      },
      other: 'value',
    }

    const result = exclude(query, ['user'])

    expect(result).toEqual({ other: 'value' })
  })

  it('should handle arrays in query', () => {
    const query = {
      items: ['a', 'b', 'c'],
      other: 'value',
    }

    const result = exclude(query, ['other'])

    expect(result).toEqual({ items: ['a', 'b', 'c'] })
  })

  it('should deep clone arrays', () => {
    const query = {
      items: [{ id: 1 }, { id: 2 }],
      keep: 'value',
    }

    const result = exclude(query, ['keep'])

    expect(result).toEqual({ items: [{ id: 1 }, { id: 2 }] })

    // Modify result to ensure it's a clone
    result.items[0].id = 999

    expect(query.items[0].id).toBe(1) // Original unchanged
  })

  it('should not modify original object', () => {
    const query = { foo: 'bar', baz: 'qux' }
    const original = { ...query }

    exclude(query, ['baz'])

    expect(query).toEqual(original)
  })

  it('should handle invalid input gracefully', () => {
    expect(exclude(null as any, ['foo'])).toEqual(null)
    expect(exclude(undefined as any, ['foo'])).toEqual(undefined)
    expect(exclude({ foo: 'bar' }, null as any)).toEqual({ foo: 'bar' })
  })
})

describe('pick + exclude together', () => {
  it('should work together for complex filtering', () => {
    const query = {
      user: {
        name: 'John',
        age: 30,
        email: 'john@example.com',
        password: 'secret',
      },
      settings: {
        theme: 'dark',
        apiKey: 'secret-key',
        language: 'en',
      },
    }

    // Pick user and settings
    const picked = pick(query, ['user', 'settings'])

    // Exclude sensitive fields
    const result = exclude(picked, ['user.password', 'settings.apiKey'])

    expect(result).toEqual({
      user: {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      },
      settings: {
        theme: 'dark',
        language: 'en',
      },
    })
  })

  it('should be inverse operations for simple keys', () => {
    const query = { a: 1, b: 2, c: 3 }

    const picked = pick(query, ['a', 'b'])
    const excluded = exclude(query, ['c'])

    expect(picked).toEqual(excluded)
  })
})

describe('real-world scenarios', () => {
  it('should filter API request params', () => {
    const query = {
      search: 'laptop',
      category: 'electronics',
      page: 1,
      limit: 20,
      _internal: 'debug',
    }

    // Remove internal params
    const result = exclude(query, ['_internal'])

    expect(result).toEqual({
      search: 'laptop',
      category: 'electronics',
      page: 1,
      limit: 20,
    })
  })

  it('should pick only allowed query params', () => {
    const query = {
      search: 'test',
      page: 1,
      malicious: '<script>alert()</script>',
      _csrf: 'token',
    }

    // Whitelist safe params
    const result = pick(query, ['search', 'page'])

    expect(result).toEqual({
      search: 'test',
      page: 1,
    })
  })

  it('should remove sensitive data before logging', () => {
    const query = {
      user: {
        name: 'John',
        email: 'john@example.com',
        password: 'secret123',
      },
      session: {
        token: 'abc123',
        expiresAt: '2024-12-31',
      },
    }

    const safe = exclude(query, ['user.password', 'session.token'])

    expect(safe).toEqual({
      user: {
        name: 'John',
        email: 'john@example.com',
      },
      session: {
        expiresAt: '2024-12-31',
      },
    })
  })
})
