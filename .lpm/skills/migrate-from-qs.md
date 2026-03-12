---
name: migrate-from-qs
description: Migration guide from qs and query-string to neo.query — same parse/stringify API, 62% smaller than qs, 20-40% faster, 6 array formats, pick/exclude utilities, parseUrl/stringifyUrl, URLSearchParams compat, tree-shakeable subpath imports, TypeScript native, zero dependencies
version: "1.0.0"
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Migrating from qs / query-string to @lpm.dev/neo.query

## Why Migrate

| | qs | query-string | neo.query |
|---|-------|--------------|-----------|
| **Bundle** | ~43 KB | ~25 KB | ~16.5 KB |
| **Performance** | Baseline | Similar | 20-40% faster |
| **Tree-shaking** | No | No | Yes (subpath imports) |
| **TypeScript** | `@types/qs` | Built-in | Built-in |
| **ESM** | CommonJS | ESM | ESM + CJS |
| **Dependencies** | 2 | 3 | Zero |
| **URL utilities** | No | Yes | Yes |
| **Pick/exclude** | No | Yes | Yes |

## Migrating from qs

### parse()

```typescript
// Before — qs
import qs from 'qs'

qs.parse('name=John&age=30')
// { name: 'John', age: '30' }

qs.parse('user[name]=John&user[age]=30')
// { user: { name: 'John', age: '30' } }

// After — neo.query (same API)
import { parse } from '@lpm.dev/neo.query'

parse('name=John&age=30')
// { name: 'John', age: '30' }

parse('user[name]=John&user[age]=30')
// { user: { name: 'John', age: '30' } }
```

### stringify()

```typescript
// Before — qs
qs.stringify({ user: { name: 'John' } })
// 'user[name]=John'

qs.stringify({ items: ['a', 'b'] }, { arrayFormat: 'brackets' })
// 'items[]=a&items[]=b'

// After — neo.query
stringify({ user: { name: 'John' } })
// 'user[name]=John'

stringify({ items: ['a', 'b'] }, { arrayFormat: 'bracket' })
// 'items[]=a&items[]=b'
```

### Options Mapping

```typescript
// qs options → neo.query options

qs.parse(str, {
  allowDots: true,          // → allowDots: true (same)
  depth: 5,                 // → depth: 5 (same, same default)
  decoder: customFn,        // → decoder: customFn (same signature)
})

qs.stringify(obj, {
  allowDots: true,          // → allowDots: true (same)
  encode: true,             // → encode: true (same)
  encoder: customFn,        // → encoder: customFn (same signature)
  sort: sortFn,             // → sort: sortFn (same, but default is true not false)
  skipNulls: true,          // → skipNull: true (renamed!)
  arrayFormat: 'brackets',  // → arrayFormat: 'bracket' (singular!)
  indices: true,            // → arrayFormat: 'index'
})
```

### Key Differences from qs

**1. Array format naming:**
```typescript
// qs uses 'brackets' (plural)
qs.stringify(obj, { arrayFormat: 'brackets' })

// neo.query uses 'bracket' (singular)
stringify(obj, { arrayFormat: 'bracket' })

// Format mapping:
// qs 'brackets'  → neo.query 'bracket'
// qs 'indices'   → neo.query 'index'
// qs 'repeat'    → neo.query 'repeat'
// qs 'comma'     → neo.query 'comma'
```

**2. Sort default:**
```typescript
// qs: no sorting by default
qs.stringify({ z: 1, a: 2 })  // 'z=1&a=2'

// neo.query: alphabetical sort by default
stringify({ z: 1, a: 2 })      // 'a=2&z=1'
stringify({ z: 1, a: 2 }, { sort: false })  // 'z=1&a=2'
```

**3. skipNulls renamed:**
```typescript
// qs
qs.stringify(obj, { skipNulls: true })

// neo.query
stringify(obj, { skipNull: true })  // Already default
```

**4. Type parsing:**
```typescript
// qs: no built-in type parsing
qs.parse('count=42')  // { count: '42' }

// neo.query: built-in type parsing
parse('count=42', { parseNumbers: true })  // { count: 42 }
parse('active=true', { parseBooleans: true })  // { active: true }
```

## Migrating from query-string

### parse()

```typescript
// Before — query-string
import queryString from 'query-string'

queryString.parse('name=John&age=30')
// { name: 'John', age: '30' }

queryString.parse('count=42', { parseNumbers: true })
// { count: 42 }

// After — neo.query (same API)
import { parse } from '@lpm.dev/neo.query'

parse('name=John&age=30')
// { name: 'John', age: '30' }

parse('count=42', { parseNumbers: true })
// { count: 42 }
```

### stringify()

```typescript
// Before — query-string
queryString.stringify({ name: 'John', age: 30 })
queryString.stringify({ items: ['a', 'b'] }, { arrayFormat: 'bracket' })

// After — neo.query (same API)
stringify({ name: 'John', age: 30 })
stringify({ items: ['a', 'b'] }, { arrayFormat: 'bracket' })
```

### URL Utilities

```typescript
// Before — query-string
queryString.parseUrl('https://example.com?foo=bar#section')
// { url: 'https://example.com', query: { foo: 'bar' } }

queryString.stringifyUrl({ url: 'https://example.com', query: { foo: 'bar' } })
// 'https://example.com?foo=bar'

// After — neo.query (same API, more fields)
parseUrl('https://example.com?foo=bar#section')
// {
//   url: 'https://example.com',
//   query: { foo: 'bar' },
//   queryString: 'foo=bar',  // Bonus: raw query string
//   hash: '#section'         // Bonus: hash preserved
// }

stringifyUrl({ url: 'https://example.com', query: { foo: 'bar' }, hash: 'section' })
// 'https://example.com?foo=bar#section'
```

### pick / exclude

```typescript
// Before — query-string
queryString.pick('https://example.com?a=1&b=2&c=3', ['a', 'c'])
// 'https://example.com?a=1&c=3'

queryString.exclude('https://example.com?a=1&b=2', ['b'])
// 'https://example.com?a=1'

// After — neo.query (works on objects, not URLs)
import { pick, exclude } from '@lpm.dev/neo.query'

pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
// { a: 1, c: 3 }

exclude({ a: 1, b: 2 }, ['b'])
// { a: 1 }

// For URL-based pick/exclude, combine with parseUrl/stringifyUrl:
const { url, query, hash } = parseUrl('https://example.com?a=1&b=2&c=3')
stringifyUrl({ url, query: pick(query, ['a', 'c']), hash })
```

### Key Differences from query-string

**1. pick/exclude work on objects, not URLs:**
```typescript
// query-string: operates on URL strings
queryString.pick('https://example.com?a=1&b=2', ['a'])

// neo.query: operates on query objects + supports dot notation
pick({ user: { name: 'John', password: 'secret' } }, ['user.name'])
// { user: { name: 'John' } }
```

**2. Nested object support:**
```typescript
// query-string: limited nested support
// neo.query: full bracket and dot notation
parse('user[name]=John&user[profile][age]=30')
// { user: { name: 'John', profile: { age: '30' } } }
```

**3. Sort default:**
```typescript
// query-string: no sort by default
// neo.query: alphabetical sort by default
stringify(obj, { sort: false })  // Match query-string behavior
```

## New Features in neo.query

### URLSearchParams Compatibility

```typescript
import { toSearchParams, fromSearchParams } from '@lpm.dev/neo.query'

// Convert between neo.query objects and URLSearchParams
const params = toSearchParams({ name: 'John', tags: ['a', 'b'] })
const query = fromSearchParams(params, { parseNumbers: true })
```

### Additional Array Formats

```typescript
// 'separator' — custom separator character
stringify({ items: ['a', 'b'] }, { arrayFormat: 'separator', arraySeparator: '|' })
// 'items=a|b'

// 'bracket-separator' — brackets + custom separator
stringify({ items: ['a', 'b'] }, { arrayFormat: 'bracket-separator', arraySeparator: '|' })
// 'items[]=a|b'
```

### Subpath Imports

```typescript
// Import only what you need
import { parse } from '@lpm.dev/neo.query/parse'         // ~5.7 KB
import { stringify } from '@lpm.dev/neo.query/stringify'   // ~6 KB
import { parseUrl } from '@lpm.dev/neo.query/url'
import { pick, exclude } from '@lpm.dev/neo.query/utils'
import { toSearchParams } from '@lpm.dev/neo.query/compat'
```

## Migration Checklist

### From qs
- [ ] Replace `import qs from 'qs'` with `import { parse, stringify } from '@lpm.dev/neo.query'`
- [ ] Rename: `arrayFormat: 'brackets'` → `'bracket'` (singular)
- [ ] Rename: `arrayFormat: 'indices'` → `'index'` (singular)
- [ ] Rename: `skipNulls` → `skipNull`
- [ ] Note: sort defaults to `true` (add `sort: false` if you need insertion order)
- [ ] Remove `@types/qs` (types built-in)
- [ ] Remove `qs` from dependencies

### From query-string
- [ ] Replace `import queryString from 'query-string'` with `import { parse, stringify, parseUrl, stringifyUrl } from '@lpm.dev/neo.query'`
- [ ] Replace `queryString.parse/stringify` with `parse/stringify`
- [ ] Replace `queryString.parseUrl/stringifyUrl` with `parseUrl/stringifyUrl`
- [ ] Update `pick`/`exclude` usage (works on objects now, not URL strings)
- [ ] Note: sort defaults to `true` (add `sort: false` if you need insertion order)
- [ ] Remove `query-string` and its dependencies
