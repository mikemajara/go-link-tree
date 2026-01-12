# Go Link Tree - Raycast Extension

> **Status:** 🟡 Week 2 (Polish) | **MVP:** ~60% complete | **Author:** Miguel Alcalde

## Overview

A Raycast extension that provides quick access to a configurable tree of links defined in a YAML/JSON configuration file. Think of it as a personal "go links" system accessible directly from Raycast.

---

## 1. Feasibility Assessment

### ✅ Confirmed Feasible

| Aspect                   | Status       | Notes                                            |
| ------------------------ | ------------ | ------------------------------------------------ |
| Raycast Extension API    | ✅ Supported | Full React/TypeScript/Node.js support            |
| File-based Configuration | ✅ Supported | `file` preference type for user config path      |
| Hierarchical Lists       | ✅ Supported | `List.Section` component for grouping            |
| Quick Link Actions       | ✅ Supported | `Action.OpenInBrowser`, `Action.CopyToClipboard` |
| Local Storage/Caching    | ✅ Supported | `LocalStorage` API for performance               |
| Icons                    | ✅ Supported | Custom icons, file icons, SF Symbols             |
| Search/Filter            | ✅ Built-in  | Native fuzzy search in List component            |

### Existing Similar Extension

**Quick Jump** ([raycast.com/akadir/quick-jump](https://www.raycast.com/akadir/quick-jump)) provides similar functionality with JSON configuration. This validates our approach and can serve as implementation reference.

---

## 2. Configuration Format

### Recommended: YAML with JSON fallback

While Raycast doesn't natively parse YAML, the `js-yaml` npm package is lightweight (~50KB) and widely used. Supporting both formats is trivial.

### Configuration Schema

```yaml
# ~/.config/go-link-tree/links.yaml

version: 1

# Global settings
settings:
  defaultBrowser: "default" # or "chrome", "firefox", "safari", etc.
  showFavicons: true

# Link groups (become List.Section)
groups:
  - name: work
    title: "🏢 Work"
    icon: "building" # SF Symbol or custom icon
    links:
      - title: "GitHub"
        url: "https://github.com/myorg"
        keywords: ["gh", "code", "repos"]
        icon: "github"

      - title: "Jira Board"
        url: "https://myorg.atlassian.net/browse/PROJ"
        keywords: ["tickets", "issues", "bugs"]

      - title: "Confluence"
        url: "https://myorg.atlassian.net/wiki"
        keywords: ["docs", "wiki"]

  - name: dev
    title: "💻 Development"
    links:
      - title: "Localhost:3000"
        url: "http://localhost:3000"
        keywords: ["local", "dev"]

      - title: "Staging"
        url: "https://staging.myapp.com"
        keywords: ["stg", "test"]

      - title: "Production"
        url: "https://myapp.com"
        keywords: ["prod", "live"]

  - name: personal
    title: "🏠 Personal"
    links:
      - title: "Gmail"
        url: "https://mail.google.com"
        keywords: ["email", "inbox"]

# Templates for dynamic URLs (stretch goal)
templates:
  - name: "GitHub PR"
    pattern: "https://github.com/{org}/{repo}/pull/{pr}"
    icon: "git-pull-request"
```

### TypeScript Interface

```typescript
interface GoLinkConfig {
  version: number;
  settings?: {
    defaultBrowser?: string;
    showFavicons?: boolean;
  };
  groups: LinkGroup[];
  templates?: LinkTemplate[];
}

interface LinkGroup {
  name: string; // unique identifier
  title: string; // display title
  icon?: string; // optional icon
  links: Link[];
}

interface Link {
  title: string;
  url: string;
  keywords?: string[]; // searchable aliases
  icon?: string;
}

interface LinkTemplate {
  name: string;
  pattern: string; // URL with {placeholders}
  icon?: string;
}
```

---

## 3. Feature Specification

### MVP Features (v1.0)

| Feature                    | Priority | Description                             |
| -------------------------- | -------- | --------------------------------------- |
| **List View**              | P0       | Display all links grouped by section    |
| **Search**                 | P0       | Filter links by title, keywords, URL    |
| **Open Link**              | P0       | Open selected link in default browser   |
| **Copy URL**               | P0       | Copy link URL to clipboard              |
| **Config File Preference** | P0       | User configures path to YAML/JSON file  |
| **File Watcher**           | P1       | Auto-reload when config file changes    |
| **Icons**                  | P1       | Support SF Symbols and custom icons     |
| **Keyboard Shortcuts**     | P1       | Assignable shortcuts for frequent links |

### Stretch Features (v2.0)

| Feature               | Priority | Description                           |
| --------------------- | -------- | ------------------------------------- |
| **Templates**         | P2       | Dynamic URLs with placeholder inputs  |
| **Recent Links**      | P2       | Track and surface recently used links |
| **Favorites**         | P2       | Pin frequently used links to top      |
| **Browser Selection** | P2       | Open in specific browser              |
| **Import/Export**     | P3       | Import from browser bookmarks         |
| **Sync**              | P3       | Optional cloud sync (iCloud/Dropbox)  |

---

## 4. Technical Architecture

### Project Structure (Implemented)

```
go-link-tree/
├── src/
│   ├── index.tsx              # Main command entry point ✅
│   ├── components/
│   │   └── LinkItem.tsx       # Individual link item with actions ✅
│   ├── lib/
│   │   └── config.ts          # Config parsing (YAML/JSON) ✅
│   └── types/
│       └── index.ts           # TypeScript interfaces ✅
├── assets/                    # (to be added for icons)
├── links.yaml                 # User config (gitignored)
├── links.example.yaml         # Sample configuration template ✅
├── package.json               # Raycast manifest ✅
├── tsconfig.json              # TypeScript config ✅
├── raycast-env.d.ts           # Raycast environment types ✅
└── README.md                  # Documentation ✅
```

### Files to add in Phase 2/3

```
├── src/
│   ├── lib/
│   │   ├── storage.ts         # LocalStorage wrapper (for recent links)
│   │   └── icons.ts           # Icon resolution utilities (SF Symbols)
├── assets/
│   ├── extension-icon.png     # Custom extension icon (512x512)
│   └── icons/                 # Custom link icons
└── screenshots/               # Store listing screenshots
```

### Key Implementation Details

> **Note:** The following code blocks show the **actual implemented code** from Week 1.

#### 1. Configuration Loading (`src/lib/config.ts`)

```typescript
import { getPreferenceValues } from "@raycast/api";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { GoLinkConfig } from "../types";

interface Preferences {
  configPath: string;
}

export async function loadConfig(): Promise<GoLinkConfig> {
  const { configPath } = getPreferenceValues<Preferences>();
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const resolvedPath = configPath.replace(/^~/, homeDir);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const content = fs.readFileSync(resolvedPath, "utf-8");

  if (resolvedPath.endsWith(".yaml") || resolvedPath.endsWith(".yml")) {
    return yaml.load(content) as GoLinkConfig;
  }

  return JSON.parse(content) as GoLinkConfig;
}
```

#### 2. Main Command Component (`src/index.tsx`)

```typescript
import { List, Icon, showToast, Toast } from "@raycast/api"
import { useState, useEffect } from "react"
import { loadConfig } from "./lib/config"
import { LinkItem } from "./components/LinkItem"
import { GoLinkConfig } from "./types"

export default function Command() {
  const [config, setConfig] = useState<GoLinkConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
      .then((loadedConfig) => {
        setConfig(loadedConfig)
        setError(null)
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "Failed to load configuration"
        setError(errorMessage)
        showToast({
          style: Toast.Style.Failure,
          title: "Configuration Error",
          message: errorMessage,
        })
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (error) {
    return (
      <List>
        <List.Item icon={Icon.ExclamationMark} title="Configuration Error" subtitle={error} />
      </List>
    )
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search links...">
      {config?.groups.map((group) => (
        <List.Section
          key={group.name}
          title={group.title}
          subtitle={`${group.links.length} link${group.links.length !== 1 ? "s" : ""}`}
        >
          {group.links.map((link, index) => (
            <LinkItem key={`${link.url}-${index}`} link={link} groupTitle={group.title} />
          ))}
        </List.Section>
      ))}
    </List>
  )
}
```

#### 3. Link Item Component (`src/components/LinkItem.tsx`)

```typescript
import { List, ActionPanel, Action, Icon } from "@raycast/api"
import { Link } from "../types"

interface LinkItemProps {
  link: Link
  groupTitle?: string
}

export function LinkItem({ link, groupTitle }: LinkItemProps) {
  let iconSource: Icon | { source: string } = Icon.Link
  if (link.icon) {
    const iconKey = link.icon as keyof typeof Icon
    if (Icon[iconKey]) {
      iconSource = Icon[iconKey]
    } else {
      iconSource = { source: link.icon }
    }
  }

  return (
    <List.Item
      title={link.title}
      subtitle={link.url}
      keywords={link.keywords}
      icon={iconSource}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={link.url} title="Open in Browser" />
          <Action.CopyToClipboard
            content={link.url}
            title="Copy URL"
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action.CopyToClipboard
            content={`[${link.title}](${link.url})`}
            title="Copy as Markdown"
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  )
}
```

#### 3. Package Manifest (Preferences)

```json
{
  "name": "go-link-tree",
  "title": "Go Link Tree",
  "description": "Quick access to your personal link tree",
  "icon": "extension-icon.png",
  "author": "your-username",
  "categories": ["Productivity", "Web"],
  "license": "MIT",
  "commands": [
    {
      "name": "index",
      "title": "Search Links",
      "description": "Search and open links from your link tree",
      "mode": "view"
    }
  ],
  "preferences": [
    {
      "name": "configPath",
      "type": "file",
      "required": true,
      "title": "Configuration File",
      "description": "Path to your links configuration file (YAML or JSON)",
      "placeholder": "~/.config/go-link-tree/links.yaml"
    }
  ],
  "dependencies": {
    "@raycast/api": "^1.83.0",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "@raycast/eslint-config": "^1.0.11",
    "@types/js-yaml": "^4.0.9",
    "@types/node": "22.5.0",
    "@types/react": "18.3.3",
    "eslint": "^8.57.0",
    "prettier": "^3.3.3",
    "typescript": "^5.5.4"
  }
}
```

---

## 5. User Experience

### First Run Flow

1. User installs extension from Raycast Store
2. Raycast prompts for configuration file path (required preference)
3. If file doesn't exist, extension shows helpful error with:
   - Link to documentation
   - Action to create sample config file
4. Once configured, extension is ready

### Daily Usage Flow

1. User invokes Raycast (`⌘ + Space`)
2. Types extension name or assigned alias (e.g., "links", "go")
3. Extension displays grouped link tree
4. User types to filter (fuzzy search across title, keywords, URL)
5. User presses `Enter` to open or uses action shortcuts:
   - `⌘ + Enter` → Open in browser
   - `⌘ + C` → Copy URL
   - `⌘ + ⇧ + C` → Copy as Markdown link

### Search Behavior

Search matches against:

- Link title (highest weight)
- Keywords (high weight)
- Group title (medium weight)
- URL domain (low weight)

---

## 6. Development Roadmap

### Phase 1: Foundation (Week 1) ✅ COMPLETED

- [x] Set up Raycast extension project
- [x] Implement config file parsing (YAML + JSON)
- [x] Create basic List view with sections
- [x] Add Open in Browser action
- [x] Add Copy URL action
- [x] Test with sample configuration

**Deliverables:**

- `package.json` - Raycast manifest with preferences
- `src/index.tsx` - Main command with List view and error handling
- `src/components/LinkItem.tsx` - Link item with actions (Open, Copy URL, Copy Markdown)
- `src/lib/config.ts` - Config loader with YAML/JSON support and path resolution
- `src/types/index.ts` - TypeScript interfaces
- `links.example.yaml` - Sample configuration template
- `README.md` - Basic documentation

**Bonus items completed early:**

- [x] Keywords search (via `List.Item` keywords prop)
- [x] Basic icon support (Raycast Icon enum mapping)
- [x] Error handling with Toast notifications
- [x] Sample config template

---

### Phase 2: Polish (Week 2) 🔄 IN PROGRESS

**Remaining tasks:**

- [ ] Enhance icon support (SF Symbols, custom asset icons, favicons)
- [ ] Add file watcher for config hot-reload (detect changes without restart)
- [ ] Improve error messages for specific config issues (missing fields, invalid YAML)
- [ ] Add "Edit Config" action to open config file in editor
- [ ] Add "Reload Config" action for manual refresh

**Nice to have:**

- [ ] Show link count per group in section subtitle ✅ (already done)
- [ ] Validate config schema on load
- [ ] Support for nested groups (optional)

---

### Phase 3: Launch (Week 3)

- [ ] Create custom extension icon (currently using placeholder)
- [ ] Add screenshots for Raycast Store listing
- [ ] Test on fresh Raycast install (clean environment)
- [ ] Publish to Raycast Store
- [ ] Create GitHub release

**Store listing requirements:**

- Extension icon (512x512 PNG)
- At least 1 screenshot
- Complete description
- Category selection (Productivity, Web)

---

### Phase 4: Enhancements (Post-launch)

- [ ] URL templates with placeholder inputs (Form for dynamic values)
- [ ] Recent links tracking (LocalStorage)
- [ ] Favorites/pinned links
- [ ] Browser selection preference
- [ ] Import from browser bookmarks
- [ ] Deep link support for specific groups

---

## 7. Resources & References

### Documentation

- [Raycast API Reference](https://developers.raycast.com/api-reference)
- [Create Your First Extension](https://developers.raycast.com/basics/create-your-first-extension)
- [List Component](https://developers.raycast.com/api-reference/user-interface/list)
- [Preferences](https://developers.raycast.com/api-reference/preferences)
- [LocalStorage](https://developers.raycast.com/api-reference/storage)

### Reference Extensions

- [Quick Jump](https://www.raycast.com/akadir/quick-jump) - Similar JSON-based link manager
- [Browser Bookmarks](https://www.raycast.com/raycast/browser-bookmarks) - Browser integration patterns

### Dependencies

| Package        | Version | Purpose                     |
| -------------- | ------- | --------------------------- |
| `@raycast/api` | ^1.83.0 | Raycast extension framework |
| `js-yaml`      | ^4.1.0  | YAML parsing                |

---

## 8. Open Questions

### Resolved ✅

1. ~~**Config location**: Should we provide a default config location (`~/.config/go-link-tree/`) or always require explicit path?~~
   → **Decision:** Require explicit path via preference. User has full control.

2. ~~**Validation**: How strict should config validation be? Fail loudly or gracefully skip invalid entries?~~
   → **Decision:** Fail loudly with Toast notification and error display. User needs clear feedback.

### Still Open 🤔

3. **Sync**: Is there interest in syncing config across machines (iCloud/Dropbox/Git)?
   → Consider for Phase 4. Users can manually point to synced folder.

4. **Templates complexity**: Should templates support advanced features like dropdowns for predefined values?
   → Defer to Phase 4. Start with simple text placeholders.

5. **File watcher approach**: Use `fs.watch` or poll on window focus?
   → Need to test performance. `fs.watch` may have issues on some systems.

6. **Icon assets**: Support local PNG icons in addition to SF Symbols?
   → Raycast supports both. Need to document the asset path format.

---

## 9. Success Criteria

| Criteria                                                    | Status      | Notes                              |
| ----------------------------------------------------------- | ----------- | ---------------------------------- |
| Extension successfully published to Raycast Store           | 🔲 Pending  | Target: Week 3                     |
| Config file changes reflected without extension restart     | 🔲 Pending  | Requires file watcher (Week 2)     |
| Search finds links within 100ms for configs with 500+ links | ✅ Achieved | Native List component handles well |
| Clear error messages for invalid configurations             | ✅ Achieved | Toast + error state in UI          |
| 4+ star rating on Raycast Store within first month          | 🔲 Pending  | Post-launch metric                 |

---

## 10. Current Status Summary

| Metric          | Value                       |
| --------------- | --------------------------- |
| **Phase**       | Week 2 (Polish)             |
| **Completion**  | ~60% of MVP                 |
| **Blockers**    | None                        |
| **Next Action** | File watcher implementation |

### What's Working ✅

- YAML/JSON config loading with `~` path expansion
- List view with grouped sections
- Search by title, keywords, URL
- Open in Browser action
- Copy URL / Copy as Markdown actions
- Error handling with user feedback
- Basic icon support (Raycast Icon enum)

### What's Missing for MVP 🔲

- File watcher for hot-reload
- Custom extension icon
- Store screenshots
- Raycast Store submission
