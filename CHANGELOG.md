# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.0.1

[compare changes](https://github.com/mikemajara/go-link-tree/compare/__raycast_latest_publish_ext/go-link-tree__...v1.0.1)

### 🚀 Enhancements

- Implement EditLinkForm component for creating and editing links; enhance LinkItem component with actions for link configuration and creation; update configuration management functions to support link updates and additions ([665c1d2](https://github.com/mikemajara/go-link-tree/commit/665c1d2))
- Enhance link management by adding delete functionality for links and groups in LinkItem component; update filtering logic to group links by their respective groups in Command component; introduce icon field in EditLinkForm for better link representation ([d1877e6](https://github.com/mikemajara/go-link-tree/commit/d1877e6))
- Enhance search functionality in Command component by normalizing search strings and implementing multi-word fuzzy matching across link attributes ([1a9fd32](https://github.com/mikemajara/go-link-tree/commit/1a9fd32))
- Add comprehensive feature backlog for Go Link Tree, detailing priorities, implementation notes, and acceptance criteria for upcoming enhancements ([b29e8e3](https://github.com/mikemajara/go-link-tree/commit/b29e8e3))
- Introduce AGENTS.md to outline AI agent guidelines, project overview, architecture, coding standards, and development commands for the Go Link Tree extension ([d9d7159](https://github.com/mikemajara/go-link-tree/commit/d9d7159))

### 💅 Refactors

- Update config file imports and remove unused Preferences interface ([637a9ac](https://github.com/mikemajara/go-link-tree/commit/637a9ac))
- Update Command component to use new Arguments type for improved type safety ([f200893](https://github.com/mikemajara/go-link-tree/commit/f200893))
- Replace exec with execFile for improved security and command handling in LinkItem component ([17165c9](https://github.com/mikemajara/go-link-tree/commit/17165c9))
- Improve README.md formatting for better readability and consistency; update Go command arguments type for stricter type checks; adjust config file preferences type for enhanced type safety ([c4c70f5](https://github.com/mikemajara/go-link-tree/commit/c4c70f5))

### 🏡 Chore

- Update @types/react to version 19.0.10 in package.json and package-lock.json ([869762a](https://github.com/mikemajara/go-link-tree/commit/869762a))

### ❤️ Contributors

- Miguel Alcalde <fmiguel05@gmail.com>

## [1.0.0] - 2026-01-14

### Added

- Initial release of Go Link Tree Raycast extension
- Configuration file support (YAML/JSON) with hot-reload via file watcher
- Multi-word fuzzy search across all link attributes (title, URL, group, keywords)
- Link management: create, edit, and delete links and groups
- Browser profile support for opening links in specific browser profiles
- Domain-based icon auto-detection for 100+ services
- Icon resolution with support for Iconify, SF Symbols, and custom icons
- EditLinkForm component for creating and editing links
- LinkItem component with actions for link configuration
- Configuration management functions for CRUD operations
- Short display names for browsers in LinkItem component
- Enhanced accessory display for browser and profile information
- AGENTS.md documentation for AI agent guidelines and project overview
- Comprehensive feature backlog with priorities and implementation notes

### Security

- Use `execFile` instead of `exec` to prevent shell injection vulnerabilities

---

**Note:** Future releases will be automatically generated from conventional commits using `changelogen`. Run `npm run changelog` to preview changes or `npm run release:patch|minor|major` to create a new release.
