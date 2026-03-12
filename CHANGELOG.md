# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] - 2026-03-09

### Added

- **`parse(query, options?)`** — Parse query strings into objects with nested key support, array formats, type coercion
- **`stringify(query, options?)`** — Stringify objects to query strings with array format control, null/undefined handling
- **`extract(url)`** — Extract query string portion from a full URL
- **`parseUrl(url, options?)`** — Parse a full URL into `{ url, query }` components
- **`stringifyUrl({ url, query }, options?)`** — Reconstruct a URL from components
- **`toSearchParams(query)`** — Convert parsed query to native `URLSearchParams`
- **`fromSearchParams(params)`** — Convert `URLSearchParams` to parsed query object
- **`pick(query, keys)`** — Pick specific keys from a parsed query
- **`exclude(query, keys)`** — Exclude specific keys from a parsed query
- **Array formats** — `none`, `bracket` (`key[]`), `index` (`key[0]`), `comma`, `separator`, `colon-list-separator`
- **Type coercion** — parse booleans, numbers, null automatically (opt-in)
- **Nested objects** — dot notation and bracket notation support
- Sub-path exports: `/parse`, `/stringify`, `/url`, `/compat`, `/utils`
- Full TypeScript types: `QueryValue`, `ParsedQuery`, `StringifiableQuery`, `ArrayFormat`, `ParseOptions`, `StringifyOptions`, `ParsedUrl`, `UrlComponents`
- Zero runtime dependencies
- ESM + CJS dual output with TypeScript declaration files
- Source maps for debugging
- 230 tests across parse, stringify, URL, compat, and utilities
