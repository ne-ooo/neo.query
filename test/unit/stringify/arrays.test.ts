/**
 * Array formatting tests
 */

import { describe, it, expect } from 'vitest'
import { stringify } from '../../../src/stringify/stringify.js'

describe('stringify - Array Format: bracket', () => {
  it('should use bracket format by default', () => {
    expect(stringify({ items: ['foo', 'bar', 'baz'] })).toBe(
      'items[]=foo&items[]=bar&items[]=baz'
    )
  })

  it('should handle single item array', () => {
    expect(stringify({ items: ['foo'] })).toBe('items[]=foo')
  })

  it('should handle empty array', () => {
    expect(stringify({ items: [] })).toBe('')
  })

  it('should handle arrays with different types', () => {
    expect(stringify({ items: ['foo', 42, true] })).toBe(
      'items[]=foo&items[]=42&items[]=true'
    )
  })
})

describe('stringify - Array Format: index', () => {
  it('should use index format when specified', () => {
    expect(stringify({ items: ['foo', 'bar', 'baz'] }, { arrayFormat: 'index' })).toBe(
      'items[0]=foo&items[1]=bar&items[2]=baz'
    )
  })

  it('should handle single item with index', () => {
    expect(stringify({ items: ['foo'] }, { arrayFormat: 'index' })).toBe(
      'items[0]=foo'
    )
  })
})

describe('stringify - Array Format: comma', () => {
  it('should use comma format when specified', () => {
    expect(stringify({ items: ['foo', 'bar', 'baz'] }, { arrayFormat: 'comma' })).toBe(
      'items=foo,bar,baz'
    )
  })

  it('should handle single item with comma format', () => {
    expect(stringify({ items: ['foo'] }, { arrayFormat: 'comma' })).toBe('items=foo')
  })

  it('should encode commas in values', () => {
    expect(stringify({ items: ['a,b', 'c,d'] }, { arrayFormat: 'comma' })).toBe(
      'items=a%2Cb,c%2Cd'
    )
  })
})

describe('stringify - Array Format: separator', () => {
  it('should use custom separator when specified', () => {
    expect(
      stringify(
        { items: ['foo', 'bar', 'baz'] },
        { arrayFormat: 'separator', arraySeparator: '|' }
      )
    ).toBe('items=foo|bar|baz')
  })

  it('should use default comma separator if not specified', () => {
    expect(
      stringify({ items: ['foo', 'bar', 'baz'] }, { arrayFormat: 'separator' })
    ).toBe('items=foo,bar,baz')
  })

  it('should handle different separators', () => {
    expect(
      stringify(
        { items: ['foo', 'bar'] },
        { arrayFormat: 'separator', arraySeparator: ';' }
      )
    ).toBe('items=foo;bar')
  })
})

describe('stringify - Array Format: repeat', () => {
  it('should use repeat format when specified', () => {
    expect(stringify({ items: ['foo', 'bar', 'baz'] }, { arrayFormat: 'repeat' })).toBe(
      'items=foo&items=bar&items=baz'
    )
  })

  it('should handle single item with repeat format', () => {
    expect(stringify({ items: ['foo'] }, { arrayFormat: 'repeat' })).toBe('items=foo')
  })
})

describe('stringify - Array Format: bracket-separator', () => {
  it('should use bracket-separator format', () => {
    expect(
      stringify(
        { items: ['foo', 'bar', 'baz'] },
        { arrayFormat: 'bracket-separator', arraySeparator: '|' }
      )
    ).toBe('items[]=foo|bar|baz')
  })

  it('should use default comma with bracket-separator', () => {
    expect(
      stringify({ items: ['foo', 'bar'] }, { arrayFormat: 'bracket-separator' })
    ).toBe('items[]=foo,bar')
  })
})

describe('stringify - Arrays with null/undefined', () => {
  it('should skip null values in arrays by default', () => {
    expect(stringify({ items: ['foo', null, 'bar'] })).toBe(
      'items[]=foo&items[]=bar'
    )
  })

  it('should skip undefined values in arrays by default', () => {
    expect(stringify({ items: ['foo', undefined, 'bar'] })).toBe(
      'items[]=foo&items[]=bar'
    )
  })

  it('should include null when skipNull is false', () => {
    expect(stringify({ items: ['foo', null, 'bar'] }, { skipNull: false })).toBe(
      'items[]=foo&items[]=null&items[]=bar'
    )
  })

  it('should handle arrays with all null/undefined values', () => {
    expect(stringify({ items: [null, undefined, null] })).toBe('')
  })
})

describe('stringify - Multiple Arrays', () => {
  it('should handle multiple arrays in same object', () => {
    expect(
      stringify({
        colors: ['red', 'blue'],
        sizes: ['S', 'M', 'L'],
      })
    ).toBe('colors[]=red&colors[]=blue&sizes[]=S&sizes[]=M&sizes[]=L')
  })

  it('should handle mixed arrays and primitives', () => {
    expect(
      stringify({
        name: 'test',
        items: ['a', 'b'],
        count: 5,
      })
    ).toBe('count=5&items[]=a&items[]=b&name=test')
  })
})
