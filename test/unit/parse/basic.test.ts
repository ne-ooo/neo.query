/**
 * Basic parse tests
 */

import { describe, it, expect } from 'vitest'
import { parse } from '../../../src/parse/parse.js'

describe('parse - Basic Functionality', () => {
  it('should parse simple key-value pairs', () => {
    expect(parse('foo=bar')).toEqual({ foo: 'bar' })
    expect(parse('foo=bar&baz=qux')).toEqual({ foo: 'bar', baz: 'qux' })
  })

  it('should handle empty query string', () => {
    expect(parse('')).toEqual({})
    expect(parse('?')).toEqual({})
    expect(parse('#')).toEqual({})
  })

  it('should strip leading ? or #', () => {
    expect(parse('?foo=bar')).toEqual({ foo: 'bar' })
    expect(parse('#foo=bar')).toEqual({ foo: 'bar' })
  })

  it('should handle keys without values', () => {
    expect(parse('foo')).toEqual({ foo: '' })
    expect(parse('foo&bar=baz')).toEqual({ foo: '', bar: 'baz' })
  })

  it('should handle values with = signs', () => {
    expect(parse('foo=bar=baz')).toEqual({ foo: 'bar=baz' })
    expect(parse('foo=bar=baz=qux')).toEqual({ foo: 'bar=baz=qux' })
  })

  it('should handle both & and ; separators', () => {
    expect(parse('foo=bar&baz=qux')).toEqual({ foo: 'bar', baz: 'qux' })
    expect(parse('foo=bar;baz=qux')).toEqual({ foo: 'bar', baz: 'qux' })
    expect(parse('foo=bar&baz=qux;quux=corge')).toEqual({
      foo: 'bar',
      baz: 'qux',
      quux: 'corge',
    })
  })

  it('should skip empty pairs', () => {
    expect(parse('foo=bar&&baz=qux')).toEqual({ foo: 'bar', baz: 'qux' })
    expect(parse('&&foo=bar&&')).toEqual({ foo: 'bar' })
  })

  it('should skip pairs with empty keys', () => {
    expect(parse('=value')).toEqual({})
    expect(parse('foo=bar&=value&baz=qux')).toEqual({ foo: 'bar', baz: 'qux' })
  })
})

describe('parse - URI Decoding', () => {
  it('should decode URI components by default', () => {
    expect(parse('foo=hello%20world')).toEqual({ foo: 'hello world' })
    expect(parse('foo=a%2Bb')).toEqual({ foo: 'a+b' })
    expect(parse('foo=%E2%9C%93')).toEqual({ foo: '✓' })
  })

  it('should decode keys', () => {
    expect(parse('hello%20world=foo')).toEqual({ 'hello world': 'foo' })
  })

  it('should handle malformed URI encoding gracefully', () => {
    // Invalid percent encoding should return original string
    expect(parse('foo=%E2%28%A1')).toEqual({ foo: '%E2%28%A1' })
  })

  it('should allow disabling decoding', () => {
    expect(parse('foo=hello%20world', { decode: false })).toEqual({
      foo: 'hello%20world',
    })
  })
})

describe('parse - Duplicate Keys (Arrays)', () => {
  it('should convert duplicate keys to arrays', () => {
    expect(parse('foo=bar&foo=baz')).toEqual({ foo: ['bar', 'baz'] })
    expect(parse('foo=1&foo=2&foo=3')).toEqual({ foo: ['1', '2', '3'] })
  })

  it('should handle mixed single and duplicate keys', () => {
    expect(parse('foo=bar&baz=qux&foo=quux')).toEqual({
      foo: ['bar', 'quux'],
      baz: 'qux',
    })
  })

  it('should maintain order for duplicate keys', () => {
    const result = parse('foo=first&bar=1&foo=second&foo=third')
    expect(result.foo).toEqual(['first', 'second', 'third'])
  })
})
