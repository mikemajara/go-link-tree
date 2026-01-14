---
version: 1.0
supported_languages:
  - typescript
  - react

agents:
  - name: CodeAssistant
    description: General-purpose assistant for feature development and bug fixes
    instructions: |
      Focus on maintaining consistency with existing patterns. Always use Raycast's
      component library. Preserve TypeScript strict mode compliance.
    tools:
      - eslint
      - prettier
      - typescript-compiler
    constraints:
      - Never modify raycast-env.d.ts (auto-generated)
      - Follow existing icon resolution patterns
      - Maintain hot-reload compatibility

  - name: ConfigExpert
    description: Specialist for YAML/JSON config schema changes
    instructions: |
      When modifying config structure, update types/index.ts, config.ts validation,
      and links.example.yaml in sync. Ensure backwards compatibility.
    constraints:
      - Always update example config with new fields
      - Validate all config changes against existing user configs
      - Document breaking changes clearly

  - name: UIEnhancer
    description: Focused on Raycast UI improvements and UX refinements
    instructions: |
      Use Raycast's List, ActionPanel, and Action components. Follow Raycast's
      design guidelines. Leverage built-in icons and keyboard shortcuts.
    constraints:
      - Keep UI responsive with proper loading states
      - Maintain keyboard-first navigation
      - Follow Raycast's accessibility patterns
---

# AGENTS.md

This file provides context and guidelines for AI agents (GitHub Copilot, Cursor, Claude, etc.) to interact with this repository effectively.

## Project Overview

**Go Link Tree** is a [Raycast](https://raycast.com) extension that provides quick access to a configurable tree of links. Think of it as a personal "go links" system—organize frequently visited URLs, search them instantly, and open them in specific browsers or profiles.

### Tech Stack

| Technology | Purpose |
|------------|---------|
| TypeScript | Primary language (strict mode) |
| React | UI components via Raycast API |
| Raycast API | Extension framework and components |
| js-yaml | YAML config file parsing |
| Node.js fs | File system operations and hot-reload |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Raycast Shell                        │
├─────────────────────────────────────────────────────────┤
│  go.tsx (Main Command)                                  │
│    ├── Config hot-reload via fs.watch                   │
│    ├── Search/filter logic                              │
│    └── Renders LinkItem components                      │
├─────────────────────────────────────────────────────────┤
│  Components                    │  Libraries             │
│    ├── LinkItem.tsx            │    ├── config.ts       │
│    └── EditLinkForm.tsx        │    ├── icons.ts        │
│                                │    └── domain-icons.ts │
├─────────────────────────────────────────────────────────┤
│  User Config (YAML/JSON)       │  Types (index.ts)      │
└─────────────────────────────────────────────────────────┘
```

## Repository Structure

```
go-link-tree/
├── src/
│   ├── go.tsx              # Main command entry point
│   ├── components/
│   │   ├── LinkItem.tsx    # Link list item with actions
│   │   └── EditLinkForm.tsx # Form for creating/editing links
│   ├── lib/
│   │   ├── config.ts       # Config loading, validation, CRUD
│   │   ├── icons.ts        # Icon resolution (Iconify, SF Symbols)
│   │   └── domain-icons.ts # URL → icon auto-detection (100+ services)
│   └── types/
│       └── index.ts        # TypeScript interfaces
├── assets/
│   └── link.png            # Extension icon
├── links.example.yaml      # Example configuration
├── package.json            # Dependencies and Raycast manifest
├── raycast-env.d.ts        # Auto-generated types (DO NOT EDIT)
└── tsconfig.json           # TypeScript configuration
```

### Key Files

| File | Purpose | Notes |
|------|---------|-------|
| `go.tsx` | Main command | Handles state, hot-reload, filtering |
| `LinkItem.tsx` | Link rendering | Actions, browser/profile handling |
| `config.ts` | Config operations | Load, validate, CRUD operations |
| `domain-icons.ts` | Icon mappings | 100+ domain → icon mappings |
| `types/index.ts` | Type definitions | `GoLinkConfig`, `Link`, `LinkGroup` |

## Coding Standards

### TypeScript Guidelines

- **Strict mode** is enabled—respect all type checks
- Use explicit return types for public functions
- Prefer `interface` over `type` for object shapes
- Use `unknown` over `any`; cast explicitly when needed

```typescript
// ✅ Good
export function resolveIcon(iconString?: string): Icon | Image.ImageLike {
  // ...
}

// ❌ Avoid
export function resolveIcon(iconString: any): any {
  // ...
}
```

### React Patterns

- Use functional components with hooks
- Prefer `useCallback` for handler functions passed to child components
- Use `useRef` for mutable values that shouldn't trigger re-renders

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | PascalCase (components), camelCase (utilities) | `LinkItem.tsx`, `config.ts` |
| Components | PascalCase | `EditLinkForm` |
| Functions | camelCase | `loadConfig`, `resolveIcon` |
| Interfaces | PascalCase | `GoLinkConfig`, `Link` |
| Constants | SCREAMING_SNAKE_CASE | `BROWSER_APP_NAMES` |

### Linting & Formatting

```bash
npm run lint      # Check for issues
npm run fix-lint  # Auto-fix issues
```

Uses Raycast's ESLint config with Prettier integration.

## Agent Instructions

### General Rules

1. **Read before writing**: Always understand existing patterns before implementing
2. **Preserve hot-reload**: Don't break the file watcher in `go.tsx`
3. **Validate configs**: All config changes must pass `validateConfig()`
4. **Test with real data**: Use `links.example.yaml` as reference

### Adding New Features

1. **New link properties**: Update in this order:
   - `types/index.ts` → Add to `Link` interface
   - `config.ts` → Update validation if required
   - `LinkItem.tsx` → Implement UI behavior
   - `links.example.yaml` → Add example usage
   - `README.md` → Document the feature

2. **New icon sources**: Extend `icons.ts` following the pattern:
   ```typescript
   // Check prefix first, then resolve
   if (iconString.startsWith("new-source:")) {
     return { source: resolveNewSource(iconString) };
   }
   ```

3. **New domain icons**: Add to `DOMAIN_ICON_MAP` in `domain-icons.ts`:
   ```typescript
   "newservice.com": "iconify:simple-icons:servicename",
   ```

### Working with Browser Profiles

The extension supports opening links in specific browser profiles. Key maps:

- `BROWSER_APP_NAMES`: Bundle ID → App name
- `BROWSER_BINARY_PATHS`: Bundle ID → Binary path
- `CHROMIUM_BROWSERS`: List of Chromium-based browsers
- `BROWSER_LOCAL_STATE_PATHS`: Path to profile metadata

When adding browser support, update all four maps.

### Error Handling

- Use `showToast()` for user-facing errors
- Throw descriptive `Error` objects with context
- Always provide fallback behavior (e.g., default browser)

```typescript
// ✅ Good pattern
try {
  await openWithProfile(app, profile, url);
} catch (error) {
  await showToast({
    style: Toast.Style.Animated,
    title: "Could not open in specific profile",
    message: "Falling back to default browser...",
  });
  await open(url);
}
```

### DO NOT

- ❌ Modify `raycast-env.d.ts` (auto-generated by Raycast)
- ❌ Use synchronous file operations in render paths
- ❌ Add new dependencies without justification
- ❌ Break backwards compatibility with existing configs
- ❌ Use shell commands directly (use `execFile` with array args)

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (hot-reload in Raycast)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Auto-fix lint issues
npm run fix-lint

# Publish to Raycast Store
npm run publish
```

## Testing Guidelines

Currently no automated tests. When contributing:

1. Test with various config structures
2. Verify hot-reload works after changes
3. Test edge cases:
   - Empty groups
   - Missing optional fields
   - Invalid URLs (should show validation error)
   - Missing config file

## Config Schema Reference

```typescript
interface GoLinkConfig {
  version: number;              // Required: Schema version (currently 1)
  settings?: {
    defaultBrowser?: string;    // Bundle ID or "default"
    defaultProfile?: string;    // Browser profile name
    showFavicons?: boolean;     // Show domain favicons
  };
  groups: LinkGroup[];          // Required: At least one group
}

interface LinkGroup {
  name: string;                 // Unique identifier
  title: string;                // Display title (can include emoji)
  icon?: string;                // Group icon
  links: Link[];                // Array of links
}

interface Link {
  title: string;                // Required: Display name
  url: string;                  // Required: Valid URL
  keywords?: string[];          // Searchable aliases
  icon?: string;                // Override auto-detected icon
  application?: string;         // Browser bundle ID
  profile?: string;             // Browser profile name
}
```

## References

- [Raycast API Documentation](https://developers.raycast.com/)
- [Raycast Extension Guidelines](https://developers.raycast.com/basics/create-your-first-extension)
- [Iconify API](https://iconify.design/)
- [SimpleIcons](https://simpleicons.org/)

---

*Last updated: January 2026*
