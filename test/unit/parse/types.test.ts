/**
 * Type parsing tests
 */

import { describe, it, expect } from 'vitest'
import { parse } from '../../../src/parse/parse.js'

describe('parse - Number Parsing', () => {
  it('should parse numbers when parseNumbers is true', () => {
    expect(parse('foo=123', { parseNumbers: true })).toEqual({ foo: 123 })
    expect(parse('foo=-456', { parseNumbers: true })).toEqual({ foo: -456 })
    expect(parse('foo=3.14', { parseNumbers: true })).toEqual({ foo: 3.14 })
    expect(parse('foo=0', { parseNumbers: true })).toEqual({ foo: 0 })
  })

  it('should handle scientific notation', () => {
    expect(parse('foo=1e3', { parseNumbers: true })).toEqual({ foo: 1000 })
    expect(parse('foo=1.5e2', { parseNumbers: true })).toEqual({ foo: 150 })
  })

  it('should not parse invalid numbers', () => {
    expect(parse('foo=123abc', { parseNumbers: true })).toEqual({ foo: '123abc' })
    expect(parse('foo=abc123', { parseNumbers: true })).toEqual({ foo: 'abc123' })
    expect(parse('foo=12.34.56', { parseNumbers: true })).toEqual({ foo: '12.34.56' })
  })

  it('should not parse numbers with whitespace', () => {
    expect(parse('foo=  123  ', { parseNumbers: true })).toEqual({ foo: '  123  ' })
    expect(parse('foo= 123', { parseNumbers: true })).toEqual({ foo: ' 123' })
  })

  it('should not parse empty strings as 0', () => {
    expect(parse('foo=', { parseNumbers: true })).toEqual({ foo: '' })
  })

  it('should keep numbers as strings by default', () => {
    expect(parse('foo=123')).toEqual({ foo: '123' })
    expect(parse('foo=3.14')).toEqual({ foo: '3.14' })
  })
})

describe('parse - Boolean Parsing', () => {
  it('should parse booleans when parseBooleans is true', () => {
    expect(parse('foo=true', { parseBooleans: true })).toEqual({ foo: true })
    expect(parse('foo=false', { parseBooleans: true })).toEqual({ foo: false })
  })

  it('should parse mixed true/false values', () => {
    expect(parse('a=true&b=false&c=true', { parseBooleans: true })).toEqual({
      a: true,
      b: false,
      c: true,
    })
  })

  it('should not parse other strings as booleans', () => {
    expect(parse('foo=yes', { parseBooleans: true })).toEqual({ foo: 'yes' })
    expect(parse('foo=1', { parseBooleans: true })).toEqual({ foo: '1' })
    expect(parse('foo=True', { parseBooleans: true })).toEqual({ foo: 'True' })
    expect(parse('foo=FALSE', { parseBooleans: true })).toEqual({ foo: 'FALSE' })
  })

  it('should keep booleans as strings by default', () => {
    expect(parse('foo=true')).toEqual({ foo: 'true' })
    expect(parse('foo=false')).toEqual({ foo: 'false' })
  })
})

describe('parse - Null Parsing', () => {
  it('should parse null when parseNulls is true', () => {
    expect(parse('foo=null', { parseNulls: true })).toEqual({ foo: null })
  })

  it('should not parse other values as null', () => {
    expect(parse('foo=NULL', { parseNulls: true })).toEqual({ foo: 'NULL' })
    expect(parse('foo=nil', { parseNulls: true })).toEqual({ foo: 'nil' })
    expect(parse('foo=', { parseNulls: true })).toEqual({ foo: '' })
  })

  it('should keep null as string by default', () => {
    expect(parse('foo=null')).toEqual({ foo: 'null' })
  })
})

describe('parse - Combined Type Parsing', () => {
  it('should parse multiple types together', () => {
    const result = parse('num=42&bool=true&null=null&str=hello', {
      parseNumbers: true,
      parseBooleans: true,
      parseNulls: true,
    })

    expect(result).toEqual({
      num: 42,
      bool: true,
      null: null,
      str: 'hello',
    })
  })

  it('should prioritize null over boolean', () => {
    // When both parseNulls and parseBooleans are enabled,
    // null should be parsed as null (not as string 'null')
    expect(parse('foo=null', { parseNulls: true, parseBooleans: true })).toEqual({
      foo: null,
    })
  })

  it('should handle arrays with mixed types', () => {
    const result = parse('foo=1&foo=true&foo=null&foo=hello', {
      parseNumbers: true,
      parseBooleans: true,
      parseNulls: true,
    })

    expect(result).toEqual({
      foo: [1, true, null, 'hello'],
    })
  })
})
