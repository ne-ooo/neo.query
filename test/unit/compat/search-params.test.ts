/**
 * URLSearchParams compatibility tests
 */

import { describe, it, expect } from 'vitest'
import { toSearchParams, fromSearchParams } from '../../../src/compat/index.js'

describe('toSearchParams', () => {
  it('should convert simple object to URLSearchParams', () => {
    const params = toSearchParams({ foo: 'bar', baz: 'qux' })

    expect(params).toBeInstanceOf(URLSearchParams)
    expect(params.get('foo')).toBe('bar')
    expect(params.get('baz')).toBe('qux')
  })

  it('should handle nested objects with bracket notation', () => {
    const params = toSearchParams({ user: { name: 'John', age: 30 } })

    expect(params.get('user[name]')).toBe('John')
    expect(params.get('user[age]')).toBe('30')
  })

  it('should handle arrays with bracket format', () => {
    const params = toSearchParams({ items: ['a', 'b', 'c'] })

    // URLSearchParams allows duplicate keys
    expect(params.getAll('items[]')).toEqual(['a', 'b', 'c'])
  })

  it('should handle arrays with index format', () => {
    const params = toSearchParams({ items: ['a', 'b', 'c'] }, { arrayFormat: 'index' })

    expect(params.get('items[0]')).toBe('a')
    expect(params.get('items[1]')).toBe('b')
    expect(params.get('items[2]')).toBe('c')
  })

  it('should handle arrays with comma format', () => {
    const params = toSearchParams({ items: ['a', 'b', 'c'] }, { arrayFormat: 'comma' })

    expect(params.get('items')).toBe('a,b,c')
  })

  it('should handle arrays with separator format', () => {
    const params = toSearchParams(
      { items: ['a', 'b', 'c'] },
      { arrayFormat: 'separator', arraySeparator: '|' }
    )

    expect(params.get('items')).toBe('a|b|c')
  })

  it('should handle dot notation when enabled', () => {
    const params = toSearchParams({ user: { name: 'John' } }, { allowDots: true })

    expect(params.get('user.name')).toBe('John')
  })

  it('should handle empty object', () => {
    const params = toSearchParams({})

    expect(params.toString()).toBe('')
  })

  it('should skip null values by default', () => {
    const params = toSearchParams({ foo: 'bar', baz: null })

    expect(params.get('foo')).toBe('bar')
    expect(params.has('baz')).toBe(false)
  })

  it('should include null when skipNull is false', () => {
    const params = toSearchParams({ foo: 'bar', baz: null }, { skipNull: false })

    expect(params.get('foo')).toBe('bar')
    expect(params.get('baz')).toBe('null')
  })

  it('should handle objects in arrays', () => {
    const params = toSearchParams({ users: [{ name: 'Alice' }, { name: 'Bob' }] })

    expect(params.get('users[0][name]')).toBe('Alice')
    expect(params.get('users[1][name]')).toBe('Bob')
  })

  it('should handle deeply nested objects', () => {
    const params = toSearchParams({
      user: {
        address: {
          city: 'NYC',
          zip: '10001',
        },
      },
    })

    expect(params.get('user[address][city]')).toBe('NYC')
    expect(params.get('user[address][zip]')).toBe('10001')
  })

  it('should handle URLSearchParams encoding', () => {
    const params = toSearchParams({ email: 'user@example.com' })

    // URLSearchParams handles encoding automatically
    expect(params.toString()).toContain('email=user%40example.com')
  })

  it('should handle key sorting', () => {
    const params = toSearchParams({ z: '3', a: '1', m: '2' })

    // Default alphabetical sorting
    expect(params.toString()).toBe('a=1&m=2&z=3')
  })

  it('should handle invalid input', () => {
    const params1 = toSearchParams(null as any)
    const params2 = toSearchParams(undefined as any)

    expect(params1.toString()).toBe('')
    expect(params2.toString()).toBe('')
  })
})

describe('fromSearchParams', () => {
  it('should convert URLSearchParams to object', () => {
    const params = new URLSearchParams('foo=bar&baz=qux')
    const result = fromSearchParams(params)

    expect(result).toEqual({ foo: 'bar', baz: 'qux' })
  })

  it('should parse nested objects from bracket notation', () => {
    const params = new URLSearchParams('user[name]=John&user[age]=30')
    const result = fromSearchParams(params)

    expect(result).toEqual({
      user: {
        name: 'John',
        age: '30',
      },
    })
  })

  it('should parse arrays with bracket format', () => {
    const params = new URLSearchParams('items[]=a&items[]=b&items[]=c')
    const result = fromSearchParams(params)

    expect(result).toEqual({ items: ['a', 'b', 'c'] })
  })

  it('should parse arrays with index format', () => {
    const params = new URLSearchParams('items[0]=a&items[1]=b&items[2]=c')
    const result = fromSearchParams(params)

    expect(result).toEqual({ items: ['a', 'b', 'c'] })
  })

  it('should parse with type parsing', () => {
    const params = new URLSearchParams('count=5&price=19.99&active=true')
    const result = fromSearchParams(params, {
      parseNumbers: true,
      parseBooleans: true,
    })

    expect(result).toEqual({
      count: 5,
      price: 19.99,
      active: true,
    })
  })

  it('should parse dot notation when enabled', () => {
    const params = new URLSearchParams('user.name=John&user.age=30')
    const result = fromSearchParams(params, { allowDots: true })

    expect(result).toEqual({
      user: {
        name: 'John',
        age: '30',
      },
    })
  })

  it('should handle empty URLSearchParams', () => {
    const params = new URLSearchParams()
    const result = fromSearchParams(params)

    expect(result).toEqual({})
  })

  it('should handle URLSearchParams decoding', () => {
    const params = new URLSearchParams('email=user%40example.com')
    const result = fromSearchParams(params)

    // URLSearchParams automatically decodes
    expect(result).toEqual({ email: 'user@example.com' })
  })

  it('should parse objects in arrays', () => {
    const params = new URLSearchParams('users[0][name]=Alice&users[1][name]=Bob')
    const result = fromSearchParams(params)

    expect(result).toEqual({
      users: [{ name: 'Alice' }, { name: 'Bob' }],
    })
  })

  it('should parse deeply nested objects', () => {
    const params = new URLSearchParams('user[address][city]=NYC&user[address][zip]=10001')
    const result = fromSearchParams(params)

    expect(result).toEqual({
      user: {
        address: {
          city: 'NYC',
          zip: '10001',
        },
      },
    })
  })

  it('should handle duplicate keys as arrays', () => {
    const params = new URLSearchParams('tag=javascript&tag=typescript&tag=node')
    const result = fromSearchParams(params)

    expect(result).toEqual({
      tag: ['javascript', 'typescript', 'node'],
    })
  })

  it('should handle invalid input', () => {
    const result1 = fromSearchParams(null as any)
    const result2 = fromSearchParams(undefined as any)
    const result3 = fromSearchParams({} as any)

    expect(result1).toEqual({})
    expect(result2).toEqual({})
    expect(result3).toEqual({})
  })
})

describe('toSearchParams + fromSearchParams round-trip', () => {
  it('should round-trip simple object', () => {
    const original = { foo: 'bar', baz: 'qux' }
    const params = toSearchParams(original)
    const result = fromSearchParams(params)

    expect(result).toEqual(original)
  })

  it('should round-trip nested object', () => {
    const original = { user: { name: 'John', age: '30' } }
    const params = toSearchParams(original)
    const result = fromSearchParams(params)

    expect(result).toEqual(original)
  })

  it('should round-trip arrays', () => {
    const original = { items: ['a', 'b', 'c'] }
    const params = toSearchParams(original)
    const result = fromSearchParams(params)

    expect(result).toEqual(original)
  })

  it('should round-trip with type parsing', () => {
    const original = { count: 5, active: true }
    const params = toSearchParams(original)
    const result = fromSearchParams(params, {
      parseNumbers: true,
      parseBooleans: true,
    })

    expect(result).toEqual(original)
  })

  it('should round-trip objects in arrays', () => {
    const original = { users: [{ name: 'Alice' }, { name: 'Bob' }] }
    const params = toSearchParams(original)
    const result = fromSearchParams(params)

    expect(result).toEqual(original)
  })

  it('should round-trip with dot notation', () => {
    const original = { user: { name: 'John', age: '30' } }
    const params = toSearchParams(original, { allowDots: true })
    const result = fromSearchParams(params, { allowDots: true })

    expect(result).toEqual(original)
  })
})

describe('URLSearchParams integration with URL API', () => {
  it('should work with URL constructor', () => {
    const query = { foo: 'bar', baz: 'qux' }
    const params = toSearchParams(query)
    const url = new URL('https://example.com/path')
    url.search = params.toString()

    expect(url.toString()).toBe('https://example.com/path?baz=qux&foo=bar')
  })

  it('should work with URL.searchParams', () => {
    const url = new URL('https://example.com/path?user[name]=John&user[age]=30')
    const result = fromSearchParams(url.searchParams)

    expect(result).toEqual({
      user: {
        name: 'John',
        age: '30',
      },
    })
  })

  it('should modify existing URL search params', () => {
    const url = new URL('https://example.com/path?existing=value')
    const newParams = toSearchParams({ foo: 'bar' })

    // Merge params
    newParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })

    expect(url.searchParams.get('existing')).toBe('value')
    expect(url.searchParams.get('foo')).toBe('bar')
  })
})
