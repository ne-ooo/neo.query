# @lpm.dev/neo.query

**Modern, tree-shakeable URL query string parser/stringifier** with native TypeScript support.

---

## ✨ Features

- 🚀 **20-40% faster** than qs
- 📦 **62% smaller** than qs (16.48 KB vs 43 KB)
- 🌳 **Tree-shakeable** - import only what you need (5-12 KB typical)
- 🔷 **Native TypeScript** - full type safety with type guards
- 🎯 **Zero dependencies** - no transitive dependencies
- 🔧 **Comprehensive** - parse, stringify, URL utils, filtering
- ⚡ **Modern** - ESM + CJS, built for 2024+
- ✅ **230 tests** - 100% passing with full coverage

---

## 📦 Installation

```bash
lpm install @lpm.dev/neo.query
```

---

## 🚀 Quick Start

```typescript
import { parse, stringify, parseUrl, stringifyUrl } from "@lpm.dev/neo.query";

// Parse query strings
parse("foo=bar&baz=qux");
// => { foo: 'bar', baz: 'qux' }

// Stringify objects
stringify({ foo: "bar", baz: "qux" });
// => 'baz=qux&foo=bar'

// Parse URLs
parseUrl("https://example.com/path?foo=bar#section");
// => { url: 'https://example.com/path', query: { foo: 'bar' }, hash: '#section', ... }

// Build URLs
stringifyUrl({ url: "/api/users", query: { page: 2, limit: 20 } });
// => '/api/users?limit=20&page=2'
```

---

## 📖 API Reference

### parse()

Parse a query string into an object.

```typescript
import { parse } from "@lpm.dev/neo.query";

// Basic parsing
parse("foo=bar&baz=qux");
// => { foo: 'bar', baz: 'qux' }

// Nested objects (bracket notation)
parse("user[name]=John&user[age]=30");
// => { user: { name: 'John', age: '30' } }

// Nested objects (dot notation)
parse("user.name=John&user.age=30", { allowDots: true });
// => { user: { name: 'John', age: '30' } }

// Arrays
parse("items[]=a&items[]=b&items[]=c");
// => { items: ['a', 'b', 'c'] }

// Type parsing
parse("page=1&limit=20&active=true", {
  parseNumbers: true,
  parseBooleans: true,
});
// => { page: 1, limit: 20, active: true }

// Duplicate keys → arrays
parse("tag=js&tag=ts&tag=node");
// => { tag: ['js', 'ts', 'node'] }
```

**Options:**

```typescript
interface ParseOptions {
  // Decode URI components (default: true)
  decode?: boolean;

  // Custom decoder function
  decoder?: (value: string, defaultDecoder: (str: string) => string) => string;

  // Parse numeric strings to numbers (default: false)
  parseNumbers?: boolean;

  // Parse 'true'/'false' to booleans (default: false)
  parseBooleans?: boolean;

  // Parse 'null' to null (default: false)
  parseNulls?: boolean;

  // Allow dot notation (default: false)
  allowDots?: boolean;

  // Maximum nesting depth (default: 5)
  depth?: number;
}
```

### stringify()

Convert an object to a query string.

```typescript
import { stringify } from "@lpm.dev/neo.query";

// Basic stringify
stringify({ foo: "bar", baz: "qux" });
// => 'baz=qux&foo=bar' (alphabetically sorted)

// Nested objects
stringify({ user: { name: "John", age: 30 } });
// => 'user[age]=30&user[name]=John'

// Dot notation
stringify({ user: { name: "John" } }, { allowDots: true });
// => 'user.name=John'

// Arrays (6 formats)
stringify({ items: ["a", "b", "c"] });
// => 'items[]=a&items[]=b&items[]=c' (bracket format)

stringify({ items: ["a", "b", "c"] }, { arrayFormat: "index" });
// => 'items[0]=a&items[1]=b&items[2]=c'

stringify({ items: ["a", "b", "c"] }, { arrayFormat: "comma" });
// => 'items=a,b,c'

stringify({ items: ["a", "b", "c"] }, { arrayFormat: "repeat" });
// => 'items=a&items=b&items=c'

// Objects in arrays
stringify({ users: [{ name: "Alice" }, { name: "Bob" }] });
// => 'users[0][name]=Alice&users[1][name]=Bob'

// Disable sorting
stringify({ z: "3", a: "1" }, { sort: false });
// => 'z=3&a=1' (insertion order)
```

**Options:**

```typescript
interface StringifyOptions {
  // Array format (default: 'bracket')
  arrayFormat?:
    | "bracket"
    | "index"
    | "comma"
    | "separator"
    | "repeat"
    | "bracket-separator";

  // Array separator for 'separator' and 'bracket-separator' formats (default: ',')
  arraySeparator?: string;

  // Allow dot notation (default: false)
  allowDots?: boolean;

  // Skip null values (default: true)
  skipNull?: boolean;

  // Skip undefined values (default: true)
  skipUndefined?: boolean;

  // Skip empty strings (default: false)
  skipEmptyString?: boolean;

  // Encode URI components (default: true)
  encode?: boolean;

  // Use strict RFC 3986 encoding (default: true)
  strict?: boolean;

  // Custom encoder function
  encoder?: (value: string, defaultEncoder: (str: string) => string) => string;

  // Sort keys alphabetically (default: true)
  sort?: boolean | ((a: string, b: string) => number);
}
```

### parseUrl()

Parse a full URL with query string into components.

```typescript
import { parseUrl } from "@lpm.dev/neo.query";

parseUrl("https://example.com/path?foo=bar&baz=qux#section");
// => {
//   url: 'https://example.com/path',
//   query: { foo: 'bar', baz: 'qux' },
//   queryString: 'foo=bar&baz=qux',
//   hash: '#section'
// }

// With type parsing
parseUrl("https://api.example.com/users?page=2&limit=20", {
  parseNumbers: true,
});
// => {
//   url: 'https://api.example.com/users',
//   query: { page: 2, limit: 20 },
//   ...
// }
```

**Returns:**

```typescript
interface ParsedUrl {
  url: string; // Base URL without query/hash
  query: ParsedQuery; // Parsed query object
  queryString: string; // Original query string
  hash: string; // Hash fragment (with #)
}
```

### stringifyUrl()

Build a URL from components with query string.

```typescript
import { stringifyUrl } from "@lpm.dev/neo.query";

stringifyUrl({
  url: "https://example.com/path",
  query: { foo: "bar", baz: "qux" },
});
// => 'https://example.com/path?baz=qux&foo=bar'

stringifyUrl({
  url: "/api/users",
  query: { page: 2, limit: 20 },
  hash: "results",
});
// => '/api/users?limit=20&page=2#results'

// Merge with existing query string
stringifyUrl({
  url: "/search?q=test",
  query: { page: 2 },
});
// => '/search?q=test&page=2'
```

**Parameters:**

```typescript
interface UrlComponents {
  url: string; // Base URL (can include existing query string)
  query?: StringifiableQuery; // Query object to append
  hash?: string; // Hash fragment (with or without #)
}
```

### toSearchParams()

Convert a query object to URLSearchParams.

```typescript
import { toSearchParams } from "@lpm.dev/neo.query";

const params = toSearchParams({ foo: "bar", baz: "qux" });
// => URLSearchParams { 'foo' => 'bar', 'baz' => 'qux' }

// Use with fetch
fetch(`/api/users?${params}`);

// Nested objects
toSearchParams({ user: { name: "John", age: 30 } });
// => URLSearchParams { 'user[name]' => 'John', 'user[age]' => '30' }
```

### fromSearchParams()

Convert URLSearchParams to a query object.

```typescript
import { fromSearchParams } from "@lpm.dev/neo.query";

const params = new URLSearchParams("foo=bar&baz=qux");
fromSearchParams(params);
// => { foo: 'bar', baz: 'qux' }

// With type parsing
const params = new URLSearchParams("page=2&active=true");
fromSearchParams(params, { parseNumbers: true, parseBooleans: true });
// => { page: 2, active: true }

// From URL
const url = new URL("https://example.com/path?foo=bar");
fromSearchParams(url.searchParams);
// => { foo: 'bar' }
```

### pick()

Pick specific keys from a query object.

```typescript
import { pick } from "@lpm.dev/neo.query";

// Simple keys
pick({ foo: "bar", baz: "qux", extra: "value" }, ["foo", "baz"]);
// => { foo: 'bar', baz: 'qux' }

// Nested keys (dot notation)
pick(
  {
    user: { name: "John", age: 30, password: "secret" },
  },
  ["user.name", "user.age"],
);
// => { user: { name: 'John', age: 30 } }

// Whitelist allowed params (security)
const safeParams = pick(userInput, ["search", "page", "limit"]);
```

### exclude()

Exclude specific keys from a query object.

```typescript
import { exclude } from "@lpm.dev/neo.query";

// Simple keys
exclude({ foo: "bar", baz: "qux", extra: "value" }, ["extra"]);
// => { foo: 'bar', baz: 'qux' }

// Nested keys (dot notation)
exclude(
  {
    user: { name: "John", age: 30, password: "secret" },
  },
  ["user.password"],
);
// => { user: { name: 'John', age: 30 } }

// Remove sensitive data before logging
const safe = exclude(data, ["password", "apiKey", "user.token"]);
```

### extract()

Extract query string from a URL.

```typescript
import { extract } from "@lpm.dev/neo.query";

extract("https://example.com/path?foo=bar&baz=qux");
// => 'foo=bar&baz=qux'

extract("https://example.com/path?foo=bar#section");
// => 'foo=bar' (hash removed)

extract("?foo=bar");
// => 'foo=bar'
```

---

## 🔧 Advanced Usage

### Type Parsing

Parse strings to their appropriate types:

```typescript
import { parse } from "@lpm.dev/neo.query";

parse("page=1&limit=20&score=98.5&active=true&deleted=false&data=null", {
  parseNumbers: true, // '1' → 1, '98.5' → 98.5
  parseBooleans: true, // 'true' → true, 'false' → false
  parseNulls: true, // 'null' → null
});
// => {
//   page: 1,
//   limit: 20,
//   score: 98.5,
//   active: true,
//   deleted: false,
//   data: null
// }
```

### Nested Objects

Handle complex nested structures:

```typescript
import { parse, stringify } from "@lpm.dev/neo.query";

// Bracket notation (default)
parse(
  "user[profile][name]=John&user[profile][contact][email]=john@example.com",
);
// => {
//   user: {
//     profile: {
//       name: 'John',
//       contact: { email: 'john@example.com' }
//     }
//   }
// }

// Dot notation (opt-in)
parse("user.profile.name=John", { allowDots: true });
// => { user: { profile: { name: 'John' } } }

// Stringify nested
stringify({
  user: {
    profile: {
      name: "John",
      contact: { email: "john@example.com" },
    },
  },
});
// => 'user[profile][contact][email]=john%40example.com&user[profile][name]=John'
```

### Array Formats

Choose from 6 different array formats:

```typescript
import { stringify } from "@lpm.dev/neo.query";

const data = { items: ["a", "b", "c"] };

// 1. Bracket (default)
stringify(data);
// => 'items[]=a&items[]=b&items[]=c'

// 2. Index
stringify(data, { arrayFormat: "index" });
// => 'items[0]=a&items[1]=b&items[2]=c'

// 3. Comma
stringify(data, { arrayFormat: "comma" });
// => 'items=a,b,c'

// 4. Separator (custom)
stringify(data, { arrayFormat: "separator", arraySeparator: "|" });
// => 'items=a|b|c'

// 5. Repeat
stringify(data, { arrayFormat: "repeat" });
// => 'items=a&items=b&items=c'

// 6. Bracket-separator
stringify(data, { arrayFormat: "bracket-separator", arraySeparator: "|" });
// => 'items[]=a|b|c'
```

### URL Manipulation

Parse, modify, and rebuild URLs:

```typescript
import { parseUrl, stringifyUrl } from "@lpm.dev/neo.query";

// Parse URL
const parsed = parseUrl("https://api.example.com/users?page=1&limit=10");

// Modify query
parsed.query.page = 2;
parsed.query.sort = "name";

// Rebuild URL
const newUrl = stringifyUrl(parsed);
// => 'https://api.example.com/users?limit=10&page=2&sort=name'
```

### Security Filtering

Filter sensitive data from query parameters:

```typescript
import { pick, exclude } from "@lpm.dev/neo.query";

// Whitelist approach (more secure)
const allowedParams = ["search", "page", "limit", "sort"];
const safe = pick(userInput, allowedParams);

// Blacklist approach
const sensitive = ["password", "apiKey", "token", "user.password"];
const safe = exclude(data, sensitive);

// Before logging
console.log(exclude(query, ["password", "apiKey", "session.token"]));
```

### URLSearchParams Integration

Seamless integration with native URLSearchParams:

```typescript
import { toSearchParams, fromSearchParams } from "@lpm.dev/neo.query";

// To URLSearchParams
const params = toSearchParams({
  user: { name: "John", age: 30 },
  tags: ["javascript", "typescript"],
});

// Use with fetch
fetch(`/api/users?${params}`);

// From URLSearchParams
const url = new URL("https://example.com/path?user[name]=John&user[age]=30");
const query = fromSearchParams(url.searchParams);
// => { user: { name: 'John', age: '30' } }
```

---

## 🌳 Tree-Shaking

Import only what you need for optimal bundle size:

```typescript
// Parse only (~5.66 KB)
import { parse } from "@lpm.dev/neo.query/parse";

// Stringify only (~5.95 KB)
import { stringify } from "@lpm.dev/neo.query/stringify";

// URL utils (~13.57 KB, includes parse + stringify)
import { parseUrl, stringifyUrl } from "@lpm.dev/neo.query/url";

// URLSearchParams compat (~12.01 KB, includes parse + stringify)
import { toSearchParams, fromSearchParams } from "@lpm.dev/neo.query/compat";

// Utilities (~2.72 KB)
import { pick, exclude } from "@lpm.dev/neo.query/utils";

// Everything (~16.48 KB)
import * as query from "@lpm.dev/neo.query";
```

**Typical usage** (parse + stringify): **~11-12 KB** (74% smaller than qs)

---

## ⚡ Performance

Performance comparison vs popular alternatives:

| Metric               | neo.query    | qs            | query-string  |
| -------------------- | ------------ | ------------- | ------------- |
| **Parse Speed**      | **Fastest**  | 20-40% slower | 10-25% slower |
| **Stringify Speed**  | **Fastest**  | 20-38% slower | 12-30% slower |
| **Bundle (Full)**    | 16.48 KB     | 43 KB         | 7 KB          |
| **Bundle (Typical)** | **11-12 KB** | 43 KB         | 7 KB          |
| **Memory Usage**     | **Lowest**   | 40% more      | 15% more      |
| **Features**         | **Most**     | Many          | Basic         |

See [BENCHMARKS.md](./BENCHMARKS.md) for detailed performance analysis.

**Key Highlights**:

- ✅ **20-40% faster** than qs
- ✅ **62% smaller** than qs (16.48 KB vs 43 KB)
- ✅ **74% smaller** when tree-shaken (11-12 KB vs 43 KB)
- ✅ **40% less memory** usage than qs

---

## 🔄 Migration

### From qs

neo.query is designed to be a drop-in replacement for most qs use cases:

```typescript
// Before (qs)
import qs from "qs";
const parsed = qs.parse(queryString);
const stringified = qs.stringify(object);

// After (neo.query)
import { parse, stringify } from "@lpm.dev/neo.query";
const parsed = parse(queryString);
const stringified = stringify(object);
```

**Benefits**:

- ✅ 20-40% faster
- ✅ 62% smaller bundle (16.48 KB vs 43 KB)
- ✅ Native TypeScript
- ✅ More features (URL utils, filtering)

**API Differences**:

- `skipNulls` → `skipNull`
- `allowDots` → same
- `arrayFormat` → same (6 formats)

### From query-string

```typescript
// Before (query-string)
import queryString from "query-string";
const parsed = queryString.parse(url);
const stringified = queryString.stringify(object);

// After (neo.query)
import { parse, stringify } from "@lpm.dev/neo.query";
const parsed = parse(url);
const stringified = stringify(object);
```

**Benefits**:

- ✅ 10-30% faster
- ✅ More features (nested objects, URL utils, filtering)
- ✅ Native TypeScript

**Bundle Impact**:

- Similar when tree-shaken (11-12 KB vs 7 KB)
- Worth it for comprehensive features

---

## 🔷 TypeScript

Full TypeScript support with type guards:

```typescript
import { parse, stringify } from "@lpm.dev/neo.query";
import type { ParsedQuery, StringifyOptions } from "@lpm.dev/neo.query";

// Type-safe parsing
const query: ParsedQuery = parse("foo=bar&baz=qux");

// Type guards
const value: unknown = query.foo;
if (typeof value === "string") {
  console.log(value.toUpperCase()); // TypeScript knows it's a string
}

// Type-safe stringify options
const options: StringifyOptions = {
  arrayFormat: "comma",
  skipNull: true,
  sort: (a, b) => a.localeCompare(b),
};
stringify(query, options);
```

**All types are exported**:

- `ParsedQuery` - Parsed query object type
- `StringifiableQuery` - Input for stringify
- `QueryValue` - Value types (string | number | boolean | null | undefined)
- `ParseOptions` - Parse configuration
- `StringifyOptions` - Stringify configuration
- `ParsedUrl` - parseUrl return type
- `UrlComponents` - stringifyUrl input type
- `ArrayFormat` - Array format options

---

## 🎯 Real-World Examples

### API Client

```typescript
import { stringify, parseUrl } from "@lpm.dev/neo.query";

class ApiClient {
  async fetchUsers(filters: any) {
    const queryString = stringify({
      ...filters,
      limit: 50,
      offset: 0,
    });

    const response = await fetch(`/api/users?${queryString}`);
    return response.json();
  }

  async updateUrl(newFilters: any) {
    const current = parseUrl(window.location.href);
    const merged = { ...current.query, ...newFilters };

    const newUrl = `${current.url}?${stringify(merged)}`;
    window.history.pushState({}, "", newUrl);
  }
}
```

### React Router Integration

```typescript
import { useSearchParams } from 'react-router-dom'
import { fromSearchParams, toSearchParams } from '@lpm.dev/neo.query'

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse with type conversion
  const filters = fromSearchParams(searchParams, {
    parseNumbers: true,
    parseBooleans: true,
  })

  // Update filters
  const updateFilters = (newFilters: any) => {
    setSearchParams(toSearchParams({ ...filters, ...newFilters }))
  }

  return (
    <div>
      <pre>{JSON.stringify(filters, null, 2)}</pre>
      <button onClick={() => updateFilters({ page: (filters.page || 0) + 1 })}>
        Next Page
      </button>
    </div>
  )
}
```

### Form Submission

```typescript
import { stringify, exclude } from "@lpm.dev/neo.query";

async function submitForm(formData: any) {
  // Remove sensitive fields
  const safe = exclude(formData, ["password", "confirmPassword"]);

  // Stringify for submission
  const params = stringify(safe);

  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  return response.json();
}
```

### Logging Without Sensitive Data

```typescript
import { exclude } from "@lpm.dev/neo.query";

function logApiRequest(url: string, params: any) {
  // Remove sensitive data before logging
  const safe = exclude(params, [
    "password",
    "apiKey",
    "token",
    "user.password",
    "session.token",
  ]);

  console.log("API Request:", url, safe);
}
```

---

## 📄 License

MIT
