---
name: getting-started
description: How to use neo.query — parse() for query string to object, stringify() for object to query string, parseUrl/stringifyUrl for full URLs, 6 array formats (bracket, index, comma, separator, repeat, bracket-separator), nested object support with dot/bracket notation, type parsing (numbers, booleans, nulls), pick/exclude utilities, URLSearchParams compat, custom encoders/decoders, subpath imports
version: "1.0.0"
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Getting Started with @lpm.dev/neo.query

## Overview

neo.query is a zero-dependency URL query string parser/stringifier. 62% smaller than `qs` (16.5 KB vs 43 KB), 20-40% faster, tree-shakeable, TypeScript-first. Supports nested objects, 6 array formats, type parsing, and URL manipulation.

## Quick Start

```typescript
import { parse, stringify } from '@lpm.dev/neo.query'

// Parse query string to object
parse('foo=bar&colors=red&colors=blue')
// { foo: 'bar', colors: ['red', 'blue'] }

// Stringify object to query string
stringify({ foo: 'bar', colors: ['red', 'blue'] })
// 'colors[]=red&colors[]=blue&foo=bar'
```

## parse()

```typescript
import { parse } from '@lpm.dev/neo.query'

// Basic parsing
parse('name=John&age=30')
// { name: 'John', age: '30' }

// Leading ? or # stripped automatically
parse('?name=John&age=30')
// { name: 'John', age: '30' }

// Duplicate keys become arrays
parse('color=red&color=blue')
// { color: ['red', 'blue'] }

// Keys without values get empty string
parse('foo&bar=baz')
// { foo: '', bar: 'baz' }
```

### Parse Options

```typescript
parse(query, {
  parseNumbers: false,     // '42' → 42 when true
  parseBooleans: false,    // 'true' → true when true
  parseNulls: false,       // 'null' → null when true
  allowDots: false,        // 'user.name=John' → { user: { name: 'John' } }
  arrayFormat: 'bracket',  // How arrays are encoded
  arraySeparator: ',',     // Separator for 'separator' format
  depth: 5,                // Max nesting depth
  decode: true,            // URI decode values
  decoder: undefined,      // Custom decoder function
})
```

### Type Parsing

```typescript
// Numbers
parse('count=42&price=9.99', { parseNumbers: true })
// { count: 42, price: 9.99 }

// Booleans (case-sensitive: only 'true'/'false')
parse('active=true&debug=false', { parseBooleans: true })
// { active: true, debug: false }

// Nulls
parse('value=null', { parseNulls: true })
// { value: null }

// All together
parse('count=42&active=true&empty=null', {
  parseNumbers: true,
  parseBooleans: true,
  parseNulls: true,
})
// { count: 42, active: true, empty: null }
```

### Nested Objects

```typescript
// Bracket notation (default)
parse('user[name]=John&user[age]=30')
// { user: { name: 'John', age: '30' } }

// Dot notation
parse('user.name=John&user.age=30', { allowDots: true })
// { user: { name: 'John', age: '30' } }

// Arrays with brackets
parse('items[]=a&items[]=b&items[]=c')
// { items: ['a', 'b', 'c'] }

// Indexed arrays
parse('items[0]=a&items[1]=b&items[2]=c')
// { items: ['a', 'b', 'c'] }
```

### Array Formats

```typescript
// bracket (default): items[]=a&items[]=b
parse('items[]=a&items[]=b')
// { items: ['a', 'b'] }

// index: items[0]=a&items[1]=b
parse('items[0]=a&items[1]=b')
// { items: ['a', 'b'] }

// comma: items=a,b,c
parse('items=a,b,c', { arrayFormat: 'comma' })
// { items: ['a', 'b', 'c'] }

// separator: items=a|b|c
parse('items=a|b|c', { arrayFormat: 'separator', arraySeparator: '|' })
// { items: ['a', 'b', 'c'] }

// repeat: items=a&items=b (duplicate keys)
parse('items=a&items=b', { arrayFormat: 'repeat' })
// { items: ['a', 'b'] }
```

## stringify()

```typescript
import { stringify } from '@lpm.dev/neo.query'

// Basic stringification
stringify({ name: 'John', age: 30 })
// 'age=30&name=John' (sorted alphabetically by default)

// Arrays
stringify({ colors: ['red', 'blue'] })
// 'colors[]=red&colors[]=blue' (bracket format by default)

// Nested objects
stringify({ user: { name: 'John', age: 30 } })
// 'user[age]=30&user[name]=John'
```

### Stringify Options

```typescript
stringify(obj, {
  arrayFormat: 'bracket',  // 'bracket' | 'index' | 'comma' | 'separator' | 'repeat' | 'bracket-separator'
  arraySeparator: ',',     // For 'separator' format
  allowDots: false,        // user.name=John instead of user[name]=John
  skipNull: true,          // Skip null values (default)
  skipUndefined: true,     // Skip undefined values (default)
  skipEmptyString: false,  // Skip empty strings
  encode: true,            // URI encode values
  sort: true,              // Sort keys alphabetically (default)
  strict: true,            // RFC 3986 encoding (default)
  encoder: undefined,      // Custom encoder function
})
```

### Array Format Examples

```typescript
const obj = { items: ['a', 'b', 'c'] }

stringify(obj, { arrayFormat: 'bracket' })
// 'items[]=a&items[]=b&items[]=c'

stringify(obj, { arrayFormat: 'index' })
// 'items[0]=a&items[1]=b&items[2]=c'

stringify(obj, { arrayFormat: 'comma' })
// 'items=a,b,c'

stringify(obj, { arrayFormat: 'separator', arraySeparator: '|' })
// 'items=a|b|c'

stringify(obj, { arrayFormat: 'repeat' })
// 'items=a&items=b&items=c'

stringify(obj, { arrayFormat: 'bracket-separator', arraySeparator: '|' })
// 'items[]=a|b|c'
```

### Sorting

```typescript
// Default: alphabetical
stringify({ z: 1, a: 2 })  // 'a=2&z=1'

// Disable sorting (insertion order)
stringify({ z: 1, a: 2 }, { sort: false })  // 'z=1&a=2'

// Custom sort
stringify({ z: 1, a: 2 }, { sort: (a, b) => b.localeCompare(a) })
// 'z=1&a=2' (reverse alphabetical)
```

### Dot Notation

```typescript
stringify({ user: { name: 'John' } }, { allowDots: true })
// 'user.name=John'

stringify({ user: { name: 'John' } })
// 'user[name]=John' (default bracket)
```

## URL Utilities

### parseUrl

```typescript
import { parseUrl } from '@lpm.dev/neo.query'

parseUrl('https://example.com/path?foo=bar&baz=qux#section')
// {
//   url: 'https://example.com/path',
//   query: { foo: 'bar', baz: 'qux' },
//   queryString: 'foo=bar&baz=qux',
//   hash: '#section'
// }
```

### stringifyUrl

```typescript
import { stringifyUrl } from '@lpm.dev/neo.query'

stringifyUrl({
  url: 'https://example.com/search',
  query: { q: 'hello world', page: 1 },
  hash: 'results',
})
// 'https://example.com/search?page=1&q=hello%20world#results'

// Merges with existing query params
stringifyUrl({
  url: 'https://example.com/search?existing=true',
  query: { q: 'hello' },
})
// 'https://example.com/search?existing=true&q=hello'
```

### extract

```typescript
import { extract } from '@lpm.dev/neo.query'

extract('https://example.com/path?foo=bar&baz=qux#section')
// 'foo=bar&baz=qux'
```

## Utilities

### pick / exclude

```typescript
import { pick, exclude } from '@lpm.dev/neo.query'

const query = { user: { name: 'John', age: 30, password: 'secret' }, page: 1 }

// Keep only specific keys (supports dot notation)
pick(query, ['user.name', 'page'])
// { user: { name: 'John' }, page: 1 }

// Remove specific keys
exclude(query, ['user.password'])
// { user: { name: 'John', age: 30 }, page: 1 }
```

## URLSearchParams Compatibility

```typescript
import { toSearchParams, fromSearchParams } from '@lpm.dev/neo.query'

// Object → URLSearchParams
const params = toSearchParams({ name: 'John', tags: ['a', 'b'] })
// URLSearchParams with proper encoding

// URLSearchParams → Object
const query = fromSearchParams(new URLSearchParams('name=John&age=30'), {
  parseNumbers: true,
})
// { name: 'John', age: 30 }
```

## Custom Encoders/Decoders

```typescript
// Custom encoder
stringify({ key: 'hello world' }, {
  encoder: (value, defaultEncoder) => {
    return value === 'special' ? 'SPECIAL' : defaultEncoder(value)
  }
})

// Custom decoder
parse('key=custom%20value', {
  decoder: (value, defaultDecoder) => {
    return defaultDecoder(value).toUpperCase()
  }
})
```

## Subpath Imports

```typescript
// Parse only (~5.7 KB)
import { parse } from '@lpm.dev/neo.query/parse'

// Stringify only (~6 KB)
import { stringify } from '@lpm.dev/neo.query/stringify'

// URL utilities (includes parse + stringify)
import { parseUrl, stringifyUrl, extract } from '@lpm.dev/neo.query/url'

// URLSearchParams compat
import { toSearchParams, fromSearchParams } from '@lpm.dev/neo.query/compat'

// Utilities
import { pick, exclude } from '@lpm.dev/neo.query/utils'
```

## TypeScript Types

```typescript
import type {
  ParseOptions,
  StringifyOptions,
  ParsedQuery,
  StringifiableQuery,
  ParsedUrl,
  ArrayFormat,
  QueryValue,
} from '@lpm.dev/neo.query'
```
