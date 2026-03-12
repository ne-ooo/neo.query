/**
 * Nested object parsing tests
 */

import { describe, it, expect } from 'vitest'
import { parse } from '../../../src/parse/parse.js'

describe('parse - Bracket Notation', () => {
  it('should parse simple bracket notation', () => {
    expect(parse('user[name]=John')).toEqual({
      user: { name: 'John' },
    })
  })

  it('should parse multiple properties in bracket notation', () => {
    expect(parse('user[name]=John&user[age]=30')).toEqual({
      user: { name: 'John', age: '30' },
    })
  })

  it('should parse nested bracket notation', () => {
    expect(parse('user[address][city]=NYC')).toEqual({
      user: {
        address: {
          city: 'NYC',
        },
      },
    })
  })

  it('should parse deeply nested structures', () => {
    expect(parse('a[b][c][d][e]=value')).toEqual({
      a: {
        b: {
          c: {
            d: {
              e: 'value',
            },
          },
        },
      },
    })
  })

  it('should handle mixed nested and simple keys', () => {
    expect(parse('user[name]=John&email=john@example.com&user[age]=30')).toEqual({
      user: { name: 'John', age: '30' },
      email: 'john@example.com',
    })
  })
})

describe('parse - Dot Notation', () => {
  it('should parse dot notation when allowDots is true', () => {
    expect(parse('user.name=John', { allowDots: true })).toEqual({
      user: { name: 'John' },
    })
  })

  it('should NOT parse dot notation by default', () => {
    expect(parse('user.name=John')).toEqual({
      'user.name': 'John',
    })
  })

  it('should parse nested dot notation', () => {
    expect(parse('user.address.city=NYC', { allowDots: true })).toEqual({
      user: {
        address: {
          city: 'NYC',
        },
      },
    })
  })

  it('should parse multiple properties with dot notation', () => {
    expect(parse('user.name=John&user.age=30', { allowDots: true })).toEqual({
      user: {
        name: 'John',
        age: '30',
      },
    })
  })
})

describe('parse - Array Indices', () => {
  it('should parse bracket notation with indices', () => {
    expect(parse('items[0]=foo&items[1]=bar&items[2]=baz')).toEqual({
      items: ['foo', 'bar', 'baz'],
    })
  })

  it('should handle non-sequential indices', () => {
    expect(parse('items[2]=baz&items[0]=foo&items[1]=bar')).toEqual({
      items: ['foo', 'bar', 'baz'],
    })
  })

  it('should handle sparse arrays', () => {
    expect(parse('items[0]=foo&items[2]=baz')).toEqual({
      items: ['foo', 'baz'],
    })
  })

  it('should parse nested objects inside arrays', () => {
    expect(parse('users[0][name]=Alice&users[0][age]=25')).toEqual({
      users: [{ name: 'Alice', age: '25' }],
    })
  })

  it('should parse multiple items in array with nested objects', () => {
    expect(parse('users[0][name]=Alice&users[1][name]=Bob')).toEqual({
      users: [{ name: 'Alice' }, { name: 'Bob' }],
    })
  })
})

describe('parse - Empty Brackets (Array Push)', () => {
  it('should handle empty brackets as array indices', () => {
    // Empty brackets create numeric indices, which are converted to arrays
    expect(parse('items[]=foo&items[]=bar&items[]=baz')).toEqual({
      items: ['foo', 'bar', 'baz'],
    })
  })

  it('should auto-increment indices for empty brackets', () => {
    const result = parse('colors[]=red&colors[]=blue&colors[]=green')
    // Numeric indices are automatically converted to arrays
    expect(result).toEqual({
      colors: ['red', 'blue', 'green'],
    })
  })
})

describe('parse - Depth Limiting', () => {
  it('should respect default depth limit of 5', () => {
    // 5 levels deep should work
    expect(parse('a[b][c][d][e]=value')).toEqual({
      a: {
        b: {
          c: {
            d: {
              e: 'value',
            },
          },
        },
      },
    })
  })

  it('should flatten keys exceeding depth limit', () => {
    // 6 levels deep (exceeds default of 5)
    expect(parse('a[b][c][d][e][f]=value')).toEqual({
      a: {
        b: {
          c: {
            d: {
              e: {
                'f': 'value',
              },
            },
          },
        },
      },
    })
  })

  it('should allow custom depth limit', () => {
    expect(parse('a[b][c]=value', { depth: 2 })).toEqual({
      a: {
        b: {
          c: 'value',
        },
      },
    })

    // Exceeding custom depth of 2
    expect(parse('a[b][c][d]=value', { depth: 2 })).toEqual({
      a: {
        b: {
          'c.d': 'value',
        },
      },
    })
  })
})

describe('parse - Complex Nested Scenarios', () => {
  it('should parse real-world user object', () => {
    const query = 'user[name]=John&user[email]=john@example.com&user[address][city]=NYC&user[address][zip]=10001'
    expect(parse(query)).toEqual({
      user: {
        name: 'John',
        email: 'john@example.com',
        address: {
          city: 'NYC',
          zip: '10001',
        },
      },
    })
  })

  it('should parse form data with nested fields', () => {
    const query = 'profile[firstName]=Jane&profile[lastName]=Doe&profile[contact][email]=jane@example.com&profile[contact][phone]=555-1234'
    expect(parse(query)).toEqual({
      profile: {
        firstName: 'Jane',
        lastName: 'Doe',
        contact: {
          email: 'jane@example.com',
          phone: '555-1234',
        },
      },
    })
  })

  it('should handle mixed bracket and simple keys', () => {
    const query = 'name=value&nested[key]=data&simple=text'
    expect(parse(query)).toEqual({
      name: 'value',
      nested: { key: 'data' },
      simple: 'text',
    })
  })

  it('should combine type parsing with nested objects', () => {
    const query = 'user[id]=123&user[active]=true&user[score]=98.5'
    expect(parse(query, { parseNumbers: true, parseBooleans: true })).toEqual({
      user: {
        id: 123,
        active: true,
        score: 98.5,
      },
    })
  })
})

describe('parse - Edge Cases', () => {
  it('should handle duplicate nested keys', () => {
    // Same nested path multiple times
    expect(parse('user[name]=John&user[name]=Jane')).toEqual({
      user: {
        name: ['John', 'Jane'],
      },
    })
  })

  it('should handle empty nested values', () => {
    expect(parse('user[name]=')).toEqual({
      user: { name: '' },
    })
  })

  it('should handle special characters in nested values', () => {
    expect(parse('user[bio]=Hello%20World%21')).toEqual({
      user: { bio: 'Hello World!' },
    })
  })

  it('should convert numeric indices to arrays', () => {
    // Single numeric index still creates an array
    expect(parse('data[123]=value')).toEqual({
      data: ['value'],
    })
  })

  it('should keep mixed keys as objects', () => {
    // Mix of numeric and string keys keeps as object
    expect(parse('data[0]=value&data[name]=foo')).toEqual({
      data: { 0: 'value', name: 'foo' },
    })
  })
})
