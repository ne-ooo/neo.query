/**
 * Basic stringify tests
 */

import { describe, it, expect } from 'vitest'
import { stringify } from '../../../src/stringify/stringify.js'

describe('stringify - Basic Functionality', () => {
  it('should stringify simple object', () => {
    expect(stringify({ foo: 'bar' })).toBe('foo=bar')
    expect(stringify({ foo: 'bar', baz: 'qux' })).toBe('baz=qux&foo=bar') // sorted
  })

  it('should handle empty object', () => {
    expect(stringify({})).toBe('')
  })

  it('should sort keys alphabetically by default', () => {
    expect(stringify({ z: '3', a: '1', m: '2' })).toBe('a=1&m=2&z=3')
  })

  it('should disable sorting when sort is false', () => {
    const result = stringify({ z: '3', a: '1', m: '2' }, { sort: false })
    // Order depends on JavaScript engine, but should not be alphabetical
    expect(result).toContain('z=3')
    expect(result).toContain('a=1')
    expect(result).toContain('m=2')
  })

  it('should allow custom sort function', () => {
    const result = stringify(
      { a: '1', b: '2', c: '3' },
      { sort: (a, b) => b.localeCompare(a) } // reverse alphabetical
    )
    expect(result).toBe('c=3&b=2&a=1')
  })

  it('should handle different value types', () => {
    expect(stringify({ str: 'hello', num: 42, bool: true, nullVal: null })).toBe(
      'bool=true&num=42&str=hello'
    ) // null skipped by default
  })

  it('should convert numbers to strings', () => {
    expect(stringify({ int: 42, float: 3.14, neg: -5 })).toBe(
      'float=3.14&int=42&neg=-5'
    )
  })

  it('should convert booleans to strings', () => {
    expect(stringify({ yes: true, no: false })).toBe('no=false&yes=true')
  })
})

describe('stringify - Null/Undefined Handling', () => {
  it('should skip null values by default', () => {
    expect(stringify({ foo: 'bar', baz: null })).toBe('foo=bar')
  })

  it('should include null when skipNull is false', () => {
    expect(stringify({ foo: 'bar', baz: null }, { skipNull: false })).toBe(
      'baz=null&foo=bar'
    )
  })

  it('should skip undefined values by default', () => {
    expect(stringify({ foo: 'bar', baz: undefined })).toBe('foo=bar')
  })

  it('should include undefined when skipUndefined is false', () => {
    expect(stringify({ foo: 'bar', baz: undefined }, { skipUndefined: false })).toBe(
      'baz=&foo=bar'
    )
  })

  it('should keep empty strings by default', () => {
    expect(stringify({ foo: 'bar', baz: '' })).toBe('baz=&foo=bar')
  })

  it('should skip empty strings when skipEmptyString is true', () => {
    expect(stringify({ foo: 'bar', baz: '' }, { skipEmptyString: true })).toBe(
      'foo=bar'
    )
  })

  it('should handle multiple null/undefined/empty values', () => {
    expect(
      stringify({
        a: 'value',
        b: null,
        c: undefined,
        d: '',
        e: 'another',
      })
    ).toBe('a=value&d=&e=another')
  })
})

describe('stringify - URI Encoding', () => {
  it('should encode URI components by default', () => {
    expect(stringify({ foo: 'hello world' })).toBe('foo=hello%20world')
    expect(stringify({ foo: 'a+b' })).toBe('foo=a%2Bb')
    expect(stringify({ foo: 'a/b' })).toBe('foo=a%2Fb')
  })

  it('should encode special characters', () => {
    expect(stringify({ foo: 'a&b' })).toBe('foo=a%26b')
    expect(stringify({ foo: 'a=b' })).toBe('foo=a%3Db')
    expect(stringify({ foo: 'a?b' })).toBe('foo=a%3Fb')
  })

  it('should encode keys', () => {
    expect(stringify({ 'hello world': 'value' })).toBe('hello%20world=value')
  })

  it('should disable encoding when encode is false', () => {
    expect(stringify({ foo: 'hello world' }, { encode: false })).toBe(
      'foo=hello world'
    )
  })

  it('should use strict encoding by default', () => {
    // Strict mode encodes additional characters like !'()*
    const result = stringify({ foo: "hello!" })
    expect(result).toBe('foo=hello%21')
  })

  it('should allow non-strict encoding', () => {
    const result = stringify({ foo: "hello!" }, { strict: false })
    expect(result).toBe('foo=hello!')
  })
})
