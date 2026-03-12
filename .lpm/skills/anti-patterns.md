---
name: anti-patterns
description: Common mistakes when using neo.query — type parsing disabled by default (parseNumbers/parseBooleans/parseNulls), boolean/null parsing is case-sensitive, depth limit of 5 flattens deeper paths, duplicate keys auto-convert to arrays, empty arrays disappear in stringify, sort is enabled by default, comma format loses structure for nested arrays, strict encoding adds extra escaping, allowDots must match between parse and stringify
version: "1.0.0"
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Anti-Patterns for @lpm.dev/neo.query

### [CRITICAL] Type parsing is disabled by default — all values are strings

Wrong:

```typescript
// AI expects automatic type conversion
const result = parse('count=42&active=true&empty=null')
// Expected: { count: 42, active: true, empty: null }
// Actual: { count: '42', active: 'true', empty: 'null' }

if (result.count > 10) { ... }  // String comparison, not numeric!
```

Correct:

```typescript
// Enable type parsing explicitly
const result = parse('count=42&active=true&empty=null', {
  parseNumbers: true,
  parseBooleans: true,
  parseNulls: true,
})
// { count: 42, active: true, empty: null }

// Or parse specific types only
parse('count=42', { parseNumbers: true })
// { count: 42 }
```

By default, `parse()` returns all values as strings. This is intentional — automatic type conversion can cause subtle bugs (e.g., ZIP codes `'07001'` losing the leading zero). Enable type parsing only when you know the data types.

Source: `src/parse/type-parser.ts` — parseType only runs when enabled

### [HIGH] Boolean and null parsing is case-sensitive — `'TRUE'` stays a string

Wrong:

```typescript
// AI expects case-insensitive boolean parsing
parse('active=TRUE&debug=False', { parseBooleans: true })
// Expected: { active: true, debug: false }
// Actual: { active: 'TRUE', debug: 'False' }

parse('value=NULL', { parseNulls: true })
// Expected: { value: null }
// Actual: { value: 'NULL' }
```

Correct:

```typescript
// Only exact lowercase matches are converted
parse('active=true', { parseBooleans: true })   // { active: true }
parse('active=false', { parseBooleans: true })  // { active: false }
parse('active=TRUE', { parseBooleans: true })   // { active: 'TRUE' } — string!

parse('value=null', { parseNulls: true })       // { value: null }
parse('value=NULL', { parseNulls: true })       // { value: 'NULL' } — string!

// If you need case-insensitive, use a custom decoder:
parse('active=TRUE', {
  decoder: (value, defaultDecoder) => {
    const decoded = defaultDecoder(value)
    if (decoded.toLowerCase() === 'true') return 'true'
    if (decoded.toLowerCase() === 'false') return 'false'
    return decoded
  },
  parseBooleans: true,
})
```

Only exact lowercase `'true'`, `'false'`, and `'null'` are converted. This matches JavaScript's literal values and prevents accidental conversion of strings that happen to contain these words.

Source: `src/parse/type-parser.ts` — strict string comparison

### [HIGH] Depth limit of 5 flattens deeper paths

Wrong:

```typescript
// AI creates deeply nested structures without increasing depth
parse('a[b][c][d][e][f][g]=value')
// Expected: { a: { b: { c: { d: { e: { f: { g: 'value' } } } } } } }
// Actual: { a: { b: { c: { d: { 'e.f.g': 'value' } } } } }
// Beyond depth 5, remaining path is flattened to a dot-separated key!
```

Correct:

```typescript
// Default depth is 5 — increase if needed
parse('a[b][c][d][e][f][g]=value', { depth: 10 })
// { a: { b: { c: { d: { e: { f: { g: 'value' } } } } } } }

// Keep depth low for untrusted input (prevents DoS via deeply nested objects)
parse(userInput, { depth: 3 })
```

The depth limit prevents stack overflow from maliciously crafted query strings. The default of 5 covers most use cases. Increase it for known-deep structures, but keep it low for user input.

Source: `src/parse/nested-parser.ts` — setNestedValue respects depth limit

### [HIGH] Duplicate keys automatically become arrays — even with just 2 values

Wrong:

```typescript
// AI doesn't expect auto-array conversion
parse('sort=name&sort=age')
// Expected: { sort: 'age' } (last value wins)
// Actual: { sort: ['name', 'age'] } — converted to array!

// This can break code expecting a single value:
const sortBy: string = result.sort  // Type error: string | string[]
```

Correct:

```typescript
// Duplicate keys always become arrays
parse('sort=name&sort=age')
// { sort: ['name', 'age'] }

// Handle both cases:
const sortBy = Array.isArray(result.sort) ? result.sort[0] : result.sort

// Or use Array.isArray check:
const sortFields = Array.isArray(result.sort) ? result.sort : [result.sort]
```

This follows the standard behavior (same as `qs` and `query-string`). Any key appearing more than once becomes an array. Always check `Array.isArray()` when parsing untrusted query strings.

Source: `src/parse/parse.ts` — keyCount tracking converts duplicates to arrays

### [MEDIUM] Empty arrays disappear in `stringify()`

Wrong:

```typescript
// AI expects empty arrays to be preserved
stringify({ items: [], name: 'John' })
// Expected: 'items=&name=John' or 'items[]=&name=John'
// Actual: 'name=John' — items completely omitted!
```

Correct:

```typescript
// Empty arrays are always omitted from output
stringify({ items: [], name: 'John' })
// 'name=John'

// Arrays with only null/undefined also disappear (with default skipNull/skipUndefined)
stringify({ items: [null, undefined], name: 'John' })
// 'name=John'

// If you need to represent "empty", use a different convention:
stringify({ items: '', name: 'John' })
// 'items=&name=John'
```

There's no standard way to represent an empty array in a query string. Most libraries (including `qs`) omit empty arrays entirely.

Source: `src/stringify/stringify.ts` — empty arrays produce no output

### [MEDIUM] `sort: true` is the default — keys are alphabetically ordered

Wrong:

```typescript
// AI expects insertion order
stringify({ z: 1, a: 2, m: 3 })
// Expected: 'z=1&a=2&m=3'
// Actual: 'a=2&m=3&z=1' — alphabetically sorted!
```

Correct:

```typescript
// Default: alphabetical sort
stringify({ z: 1, a: 2 })  // 'a=2&z=1'

// Preserve insertion order
stringify({ z: 1, a: 2 }, { sort: false })  // 'z=1&a=2'

// Custom sort
stringify({ z: 1, a: 2 }, {
  sort: (a, b) => b.localeCompare(a)  // reverse alphabetical
})
// 'z=1&a=2'
```

Alphabetical sorting produces deterministic output (same query regardless of object key insertion order), which is useful for caching and comparison. Disable with `sort: false` if order matters.

Source: `src/stringify/stringify.ts` — getSortedKeys defaults to alphabetical

### [MEDIUM] `allowDots` must match between `parse()` and `stringify()`

Wrong:

```typescript
// AI uses dots for stringify but not parse (or vice versa)
const qs = stringify({ user: { name: 'John' } }, { allowDots: true })
// 'user.name=John'

const result = parse(qs)  // allowDots defaults to false!
// { 'user.name': 'John' } — flat key, NOT nested!
```

Correct:

```typescript
// Use the same allowDots setting for both
const qs = stringify({ user: { name: 'John' } }, { allowDots: true })
// 'user.name=John'

const result = parse(qs, { allowDots: true })
// { user: { name: 'John' } } — correctly nested

// Or use bracket notation (default, no extra options needed)
const qs = stringify({ user: { name: 'John' } })
// 'user[name]=John'

const result = parse(qs)
// { user: { name: 'John' } }
```

Bracket notation (`user[name]`) works by default in both `parse()` and `stringify()`. Dot notation requires `allowDots: true` in both directions. Mismatched settings produce flat keys instead of nested objects.

Source: `src/parse/nested-parser.ts` — dot parsing only when allowDots is true

### [MEDIUM] Comma/separator array formats lose structure for nested data

Wrong:

```typescript
// AI uses comma format with objects in arrays
stringify({
  users: [{ name: 'Alice' }, { name: 'Bob' }]
}, { arrayFormat: 'comma' })
// Unexpected output — comma format only works with primitive arrays
```

Correct:

```typescript
// Comma and separator formats work best with primitive arrays
stringify({ tags: ['react', 'vue', 'angular'] }, { arrayFormat: 'comma' })
// 'tags=react,vue,angular'

// For arrays of objects, use bracket or index format
stringify({
  users: [{ name: 'Alice' }, { name: 'Bob' }]
}, { arrayFormat: 'bracket' })
// 'users[0][name]=Alice&users[1][name]=Bob'

stringify({
  users: [{ name: 'Alice' }, { name: 'Bob' }]
}, { arrayFormat: 'index' })
// 'users[0][name]=Alice&users[1][name]=Bob'
```

Comma and separator formats flatten arrays into a single value (`a,b,c`), which only works for primitive values (strings, numbers). For arrays containing objects, use `bracket` or `index` format.

Source: `src/stringify/stringify.ts` — comma/separator formats return early after first item

### [MEDIUM] Strict encoding encodes more characters than `encodeURIComponent`

Wrong:

```typescript
// AI doesn't expect extra encoding with strict mode
stringify({ callback: "fn('hello')" })
// Expected: 'callback=fn(%27hello%27)'  — basic encodeURIComponent
// Actual: 'callback=fn%28%27hello%27%29' — parentheses also encoded!
```

Correct:

```typescript
// strict: true (default) — RFC 3986 encoding
// Encodes: ! ' ( ) * in addition to standard encodeURIComponent
stringify({ value: "hello! it's (great)" })
// 'value=hello%21%20it%27s%20%28great%29'

// strict: false — basic encodeURIComponent only
stringify({ value: "hello! it's (great)" }, { strict: false })
// 'value=hello!%20it\'s%20(great)'

// Use strict: false for compatibility with older servers that don't expect RFC 3986
```

Strict mode (default) follows RFC 3986 and encodes `!'()*` in addition to standard characters. This is safer but may cause issues with servers expecting basic encoding. Set `strict: false` for standard `encodeURIComponent` behavior.

Source: `src/stringify/encoder.ts` — strictEncoder adds extra character encoding
