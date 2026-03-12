/**
 * URL utility tests
 */

import { describe, it, expect } from 'vitest'
import { extract, parseUrl, stringifyUrl } from '../../../src/url/index.js'

describe('extract', () => {
  it('should extract query string from URL', () => {
    expect(extract('https://example.com/path?foo=bar&baz=qux')).toBe('foo=bar&baz=qux')
  })

  it('should handle URL with hash fragment', () => {
    expect(extract('https://example.com/path?foo=bar#hash')).toBe('foo=bar')
  })

  it('should handle URL without query string', () => {
    expect(extract('https://example.com/path')).toBe('')
  })

  it('should handle URL with only hash', () => {
    expect(extract('https://example.com/path#hash')).toBe('')
  })

  it('should handle query string only', () => {
    expect(extract('?foo=bar&baz=qux')).toBe('foo=bar&baz=qux')
  })

  it('should handle complex query with hash', () => {
    expect(extract('https://example.com/path?user[name]=John&user[age]=30#section')).toBe(
      'user[name]=John&user[age]=30'
    )
  })

  it('should handle empty string', () => {
    expect(extract('')).toBe('')
  })

  it('should handle URL with empty query string', () => {
    expect(extract('https://example.com/path?')).toBe('')
  })

  it('should handle multiple hash symbols', () => {
    expect(extract('https://example.com/path?foo=bar#hash#nested')).toBe('foo=bar')
  })
})

describe('parseUrl', () => {
  it('should parse URL with query string', () => {
    const result = parseUrl('https://example.com/path?foo=bar&baz=qux')

    expect(result).toEqual({
      url: 'https://example.com/path',
      query: { foo: 'bar', baz: 'qux' },
      queryString: 'foo=bar&baz=qux',
      hash: '',
    })
  })

  it('should parse URL with query string and hash', () => {
    const result = parseUrl('https://example.com/path?foo=bar#section')

    expect(result).toEqual({
      url: 'https://example.com/path',
      query: { foo: 'bar' },
      queryString: 'foo=bar',
      hash: '#section',
    })
  })

  it('should parse URL without query string', () => {
    const result = parseUrl('https://example.com/path')

    expect(result).toEqual({
      url: 'https://example.com/path',
      query: {},
      queryString: '',
      hash: '',
    })
  })

  it('should parse URL with only hash', () => {
    const result = parseUrl('https://example.com/path#section')

    expect(result).toEqual({
      url: 'https://example.com/path',
      query: {},
      queryString: '',
      hash: '#section',
    })
  })

  it('should parse nested objects in query string', () => {
    const result = parseUrl('https://example.com/path?user[name]=John&user[age]=30')

    expect(result).toEqual({
      url: 'https://example.com/path',
      query: { user: { name: 'John', age: '30' } },
      queryString: 'user[name]=John&user[age]=30',
      hash: '',
    })
  })

  it('should parse with type parsing options', () => {
    const result = parseUrl('https://example.com/path?count=5&active=true', {
      parseNumbers: true,
      parseBooleans: true,
    })

    expect(result).toEqual({
      url: 'https://example.com/path',
      query: { count: 5, active: true },
      queryString: 'count=5&active=true',
      hash: '',
    })
  })

  it('should parse dot notation with allowDots', () => {
    const result = parseUrl('https://example.com/path?user.name=John', {
      allowDots: true,
    })

    expect(result).toEqual({
      url: 'https://example.com/path',
      query: { user: { name: 'John' } },
      queryString: 'user.name=John',
      hash: '',
    })
  })

  it('should handle empty string', () => {
    const result = parseUrl('')

    expect(result).toEqual({
      url: '',
      query: {},
      queryString: '',
      hash: '',
    })
  })

  it('should handle relative URLs', () => {
    const result = parseUrl('/path?foo=bar')

    expect(result).toEqual({
      url: '/path',
      query: { foo: 'bar' },
      queryString: 'foo=bar',
      hash: '',
    })
  })

  it('should handle arrays in query string', () => {
    const result = parseUrl('https://example.com/path?items[]=a&items[]=b&items[]=c')

    expect(result).toEqual({
      url: 'https://example.com/path',
      query: { items: ['a', 'b', 'c'] },
      queryString: 'items[]=a&items[]=b&items[]=c',
      hash: '',
    })
  })
})

describe('stringifyUrl', () => {
  it('should build URL with query string', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
      query: { foo: 'bar', baz: 'qux' },
    })

    expect(result).toBe('https://example.com/path?baz=qux&foo=bar')
  })

  it('should build URL with query string and hash', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
      query: { foo: 'bar' },
      hash: 'section',
    })

    expect(result).toBe('https://example.com/path?foo=bar#section')
  })

  it('should handle hash with # prefix', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
      query: { foo: 'bar' },
      hash: '#section',
    })

    expect(result).toBe('https://example.com/path?foo=bar#section')
  })

  it('should merge with existing query string', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path?existing=value',
      query: { foo: 'bar' },
    })

    expect(result).toBe('https://example.com/path?existing=value&foo=bar')
  })

  it('should handle URL without query object', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
    })

    expect(result).toBe('https://example.com/path')
  })

  it('should handle empty query object', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
      query: {},
    })

    expect(result).toBe('https://example.com/path')
  })

  it('should stringify nested objects', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
      query: { user: { name: 'John', age: 30 } },
    })

    expect(result).toBe('https://example.com/path?user[age]=30&user[name]=John')
  })

  it('should stringify with dot notation', () => {
    const result = stringifyUrl(
      {
        url: 'https://example.com/path',
        query: { user: { name: 'John' } },
      },
      { allowDots: true }
    )

    expect(result).toBe('https://example.com/path?user.name=John')
  })

  it('should stringify arrays with bracket format', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
      query: { items: ['a', 'b', 'c'] },
    })

    expect(result).toBe('https://example.com/path?items[]=a&items[]=b&items[]=c')
  })

  it('should stringify arrays with index format', () => {
    const result = stringifyUrl(
      {
        url: 'https://example.com/path',
        query: { items: ['a', 'b', 'c'] },
      },
      { arrayFormat: 'index' }
    )

    expect(result).toBe('https://example.com/path?items[0]=a&items[1]=b&items[2]=c')
  })

  it('should handle relative URLs', () => {
    const result = stringifyUrl({
      url: '/path',
      query: { foo: 'bar' },
    })

    expect(result).toBe('/path?foo=bar')
  })

  it('should preserve existing hash when adding query', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path#section',
      query: { foo: 'bar' },
    })

    expect(result).toBe('https://example.com/path?foo=bar')
  })

  it('should handle URI encoding', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
      query: { email: 'user@example.com' },
    })

    expect(result).toBe('https://example.com/path?email=user%40example.com')
  })

  it('should handle objects in arrays', () => {
    const result = stringifyUrl({
      url: 'https://example.com/path',
      query: { users: [{ name: 'Alice' }, { name: 'Bob' }] },
    })

    expect(result).toBe('https://example.com/path?users[0][name]=Alice&users[1][name]=Bob')
  })
})

describe('parseUrl + stringifyUrl round-trip', () => {
  it('should round-trip simple URL', () => {
    const original = 'https://example.com/path?foo=bar&baz=qux'
    const parsed = parseUrl(original)
    const stringified = stringifyUrl({
      url: parsed.url,
      query: parsed.query,
      hash: parsed.hash,
    })

    expect(stringified).toBe('https://example.com/path?baz=qux&foo=bar')
  })

  it('should round-trip URL with hash', () => {
    const original = 'https://example.com/path?foo=bar#section'
    const parsed = parseUrl(original)
    const stringified = stringifyUrl({
      url: parsed.url,
      query: parsed.query,
      hash: parsed.hash,
    })

    expect(stringified).toBe('https://example.com/path?foo=bar#section')
  })

  it('should round-trip nested objects', () => {
    const original = 'https://example.com/path?user[name]=John&user[age]=30'
    const parsed = parseUrl(original)
    const stringified = stringifyUrl({
      url: parsed.url,
      query: parsed.query,
    })

    expect(stringified).toBe('https://example.com/path?user[age]=30&user[name]=John')
  })
})
