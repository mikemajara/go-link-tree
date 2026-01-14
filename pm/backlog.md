# Go Link Tree - Feature Backlog

> **Target User:** Tech-savvy power user  
> **Link Volume:** Tens of links  
> **Distribution:** Raycast Store

---

## Priority 0: Fuzzy Search ✅

**Multi-word search across all link attributes**

| Attribute | Value            |
| --------- | ---------------- |
| Effort    | 🟢 Low           |
| Impact    | 🔥🔥🔥 Very High |
| Status    | ✅ Complete      |

### Description

Improve search to match multiple words across all link attributes. Currently, search checks each field separately with simple substring matching. Users should be able to type `github work api` and find a link with "GitHub API" in the title that's in the "Work" group.

### Current Behavior (Problem)

```
Search: "github work"
Link: { title: "GitHub", group: "Work", url: "https://github.com/myorg" }
Result: ❌ No match (searches each field separately)
```

### Desired Behavior

```
Search: "github work"
Link: { title: "GitHub", group: "Work", url: "https://github.com/myorg" }
Result: ✅ Match ("github" in title, "work" in group)

Search: "gh myorg"
Link: { title: "GitHub", url: "https://github.com/myorg" }
Result: ✅ Match ("gh" in url domain, "myorg" in url path)
```

### Implementation Notes

1. **Create a searchable string** for each link by concatenating all attributes:

   ```typescript
   function buildSearchString(link: Link, groupTitle: string): string {
     return [
       link.title,
       link.url,
       groupTitle,
       ...(link.keywords || []),
       ...(link.aliases || []),
     ]
       .join(" ")
       .toLowerCase();
   }
   ```

2. **Normalize the string** by removing special characters:

   ```typescript
   function normalizeForSearch(str: string): string {
     return str
       .toLowerCase()
       .replace(/[^a-z0-9\s]/g, " ") // Replace special chars with spaces
       .replace(/\s+/g, " ") // Collapse multiple spaces
       .trim();
   }
   ```

3. **Multi-word matching** - every word in query must match somewhere:

   ```typescript
   function matchesSearch(searchString: string, query: string): boolean {
     const normalizedHaystack = normalizeForSearch(searchString);
     const queryWords = normalizeForSearch(query).split(" ").filter(Boolean);

     return queryWords.every((word) => normalizedHaystack.includes(word));
   }
   ```

### Example Transformations

| Link                | Raw Searchable String                                   | Normalized                                            |
| ------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| GitHub (Work group) | `"GitHub https://github.com/myorg Work code repos"`     | `"github https github com myorg work code repos"`     |
| Jira (Work group)   | `"Jira Board https://myorg.atlassian.net Work tickets"` | `"jira board https myorg atlassian net work tickets"` |

### Search Examples

| Query            | Normalized Query | Matches                           |
| ---------------- | ---------------- | --------------------------------- |
| `github work`    | `github work`    | ✅ GitHub link (both words found) |
| `jira tickets`   | `jira tickets`   | ✅ Jira link                      |
| `myorg`          | `myorg`          | ✅ Both links (in URL)            |
| `work atlassian` | `work atlassian` | ✅ Jira link only                 |
| `github jira`    | `github jira`    | ❌ No single link has both        |

### Acceptance Criteria

- [ ] All link attributes combined into searchable string
- [ ] Group title/name included in searchable string
- [ ] Special characters normalized (URLs become searchable words)
- [ ] Multi-word queries require ALL words to match
- [ ] Search remains fast (<50ms for 100 links)
- [ ] Backward compatible (single-word search still works)

### Code Location

Update `getFilteredGroups` in `src/go.tsx`:

```typescript
const getFilteredGroups = useCallback(() => {
  if (!config) return [];
  if (!searchText) return config.groups;

  const normalizeForSearch = (str: string): string =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const queryWords = normalizeForSearch(searchText).split(" ").filter(Boolean);

  return config.groups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => {
        const searchString = normalizeForSearch(
          [link.title, link.url, group.title, ...(link.keywords || [])].join(
            " "
          )
        );
        return queryWords.every((word) => searchString.includes(word));
      }),
    }))
    .filter((group) => group.links.length > 0);
}, [config, searchText]);
```

---

## Priority 1: Link Aliases

**True "go/link" style short names**

| Attribute | Value      |
| --------- | ---------- |
| Effort    | 🟢 Low     |
| Impact    | 🔥🔥 High  |
| Status    | 📋 Backlog |

### Description

Allow users to define short, memorable aliases that work as primary search terms. Type `gh` → instant match for GitHub link. This is the core "go links" experience.

### Implementation Notes

- Add `aliases: string[]` field to `Link` interface (similar to existing `keywords` but higher search weight)
- Aliases should match exactly or as prefix (not fuzzy)
- Show alias as accessory badge: `[gh]`
- Consider: first alias could be the "canonical" short name

### Config Example

```yaml
- title: "GitHub Organization"
  url: "https://github.com/myorg"
  aliases: ["gh", "github"] # Type "gh" → instant match
  keywords: ["code", "repos"] # Lower priority search terms
```

### Acceptance Criteria

- [ ] Aliases field supported in config schema
- [ ] Aliases have higher search priority than keywords
- [ ] Exact alias match jumps to top of results
- [ ] Alias shown as visual badge on link item

---

## Priority 2: Deep Links to Groups

**Jump directly into a specific group**

| Attribute | Value      |
| --------- | ---------- |
| Effort    | 🟢 Low     |
| Impact    | 🔥🔥 High  |
| Status    | 📋 Backlog |

### Description

Launch the extension directly into a specific group via command argument. Power users can create Raycast aliases like `go work` or `go dev` to filter immediately.

### Implementation Notes

- Add optional `group` argument to the command in `package.json`
- If `group` argument provided, pre-filter to that group
- Match against `group.name` (exact) or `group.title` (fuzzy)
- Show "Showing: [Group Name]" indicator when filtered

### Usage Example

```
Raycast: "go work"     → Opens extension filtered to Work group
Raycast: "go dev api"  → Opens Dev group, searches for "api"
```

### Acceptance Criteria

- [ ] `group` argument added to command definition
- [ ] Pre-filtering works on extension launch
- [ ] Can still search within the filtered group
- [ ] Clear indicator showing active group filter
- [ ] Action to "Show All Groups" to clear filter

---

## Priority 3: Recent Links

**Track and surface recently opened links**

| Attribute | Value            |
| --------- | ---------------- |
| Effort    | 🟢 Low           |
| Impact    | 🔥🔥🔥 Very High |
| Status    | 📋 Backlog       |

### Description

Track the last 5-10 links opened and surface them in a "Recent" section at the top. Users often revisit the same links repeatedly.

### Implementation Notes

- Use Raycast `LocalStorage` to persist recent links
- Store: `{ url, title, groupName, timestamp }`
- Show as collapsible "⏱️ Recent" section at top of list
- Limit to 5-10 items (configurable?)
- Update timestamp on each open (most recent first)

### Data Structure

```typescript
interface RecentLink {
  url: string;
  title: string;
  groupName: string;
  lastOpened: number; // timestamp
}
// Store in LocalStorage as JSON array
```

### Acceptance Criteria

- [ ] Recent links tracked on every open action
- [ ] Recent section appears at top of list
- [ ] Recent section respects current search filter
- [ ] Recent links show original group as subtitle
- [ ] Option to clear recent history
- [ ] Recent section can be collapsed/hidden

---

## Priority 4: Quick Add from Clipboard

**Create links instantly from copied URLs**

| Attribute | Value            |
| --------- | ---------------- |
| Effort    | 🟢 Low           |
| Impact    | 🔥🔥🔥 Very High |
| Status    | 📋 Backlog       |

### Description

When the clipboard contains a URL, show a prominent "Add from Clipboard" action or empty state prompt. Reduces friction of adding new links dramatically.

### Implementation Notes

- Check clipboard on extension load using `Clipboard.readText()`
- Validate if content looks like a URL (starts with `http://` or `https://`)
- Show in empty view: "URL detected in clipboard - Create link?"
- Pre-fill URL in create form
- Bonus: Fetch page title automatically (requires network)

### UX Flow

1. User copies URL from browser
2. Opens Go Links extension
3. Sees prompt: "📋 Create link from clipboard?"
4. One click → Opens create form with URL pre-filled
5. User just adds title and picks group

### Acceptance Criteria

- [ ] Clipboard checked on extension mount
- [ ] URL validation (basic pattern match)
- [ ] Action appears in ActionPanel when URL detected
- [ ] Empty view shows clipboard prompt
- [ ] URL pre-filled in EditLinkForm

---

## Priority 5: URL Templates

**Dynamic URLs with placeholder inputs**

| Attribute | Value            |
| --------- | ---------------- |
| Effort    | 🟡 Medium        |
| Impact    | 🔥🔥🔥 Very High |
| Status    | 📋 Backlog       |

### Description

Define URL patterns with `{placeholders}` that prompt for values before opening. Perfect for PR links, JIRA tickets, documentation pages with dynamic paths.

### Implementation Notes

- Add `templates` array to config (already in types!)
- Detect `{placeholder}` patterns in URL
- Show Raycast Form with text fields for each placeholder
- Replace placeholders and open URL
- Consider: save recent placeholder values for quick re-use

### Config Example

```yaml
templates:
  - name: "GitHub PR"
    pattern: "https://github.com/{org}/{repo}/pull/{pr}"
    icon: "iconify:octicon:git-pull-request-16"
    defaults:
      org: "mycompany" # Pre-fill common values

  - name: "JIRA Ticket"
    pattern: "https://myorg.atlassian.net/browse/{ticket}"
    icon: "iconify:simple-icons:jira"
```

### UX Flow

1. User selects "GitHub PR" template
2. Form appears: Org [mycompany], Repo [____], PR [____]
3. User fills in values
4. Enter → Opens `https://github.com/mycompany/repo/pull/123`

### Acceptance Criteria

- [ ] Templates section in config schema
- [ ] Templates shown in separate List.Section
- [ ] Form generated dynamically from placeholders
- [ ] Default values supported
- [ ] Recent values remembered (LocalStorage)
- [ ] Template icon support

---

## Priority 6: Create from Current Tab

**Save the active browser tab as a link**

| Attribute | Value            |
| --------- | ---------------- |
| Effort    | 🟡 Medium        |
| Impact    | 🔥🔥🔥 Very High |
| Status    | 📋 Backlog       |

### Description

New command or action to grab the URL and title from the frontmost browser tab and create a link. Zero manual copying required.

### Implementation Notes

- Use AppleScript/JXA to get frontmost browser tab info
- Support multiple browsers: Chrome, Safari, Arc, Brave, Firefox
- New command: "Save Current Tab" or action within main view
- Pre-fill EditLinkForm with URL and title
- Auto-detect icon based on domain

### AppleScript Approach

```applescript
-- Chrome
tell application "Google Chrome"
  set tabUrl to URL of active tab of front window
  set tabTitle to title of active tab of front window
end tell
```

### Acceptance Criteria

- [ ] Works with Chrome, Safari, Arc, Brave, Firefox
- [ ] Extracts both URL and page title
- [ ] Falls back gracefully if no browser open
- [ ] Pre-fills create form with extracted data
- [ ] Auto-selects appropriate icon

---

## Priority 7: Import Browser Bookmarks

**One-click import from browser bookmark folders**

| Attribute | Value            |
| --------- | ---------------- |
| Effort    | 🔴 High          |
| Impact    | 🔥🔥🔥 Very High |
| Status    | 📋 Backlog       |

### Description

Import bookmarks from Chrome, Safari, or Firefox. Map bookmark folders to groups. Great for onboarding new users who already have organized bookmarks.

### Implementation Notes

- Chrome: Parse `~/Library/Application Support/Google/Chrome/Default/Bookmarks` (JSON)
- Safari: Parse `~/Library/Safari/Bookmarks.plist` (binary plist)
- Firefox: Parse `places.sqlite` database
- Show folder picker → create groups from selected folders
- Handle duplicates (warn or skip)

### Bookmark Locations

```
Chrome:  ~/Library/Application Support/Google/Chrome/Default/Bookmarks
Safari:  ~/Library/Safari/Bookmarks.plist
Firefox: ~/Library/Application Support/Firefox/Profiles/*/places.sqlite
Brave:   ~/Library/Application Support/BraveSoftware/Brave-Browser/Default/Bookmarks
```

### UX Flow

1. User triggers "Import Bookmarks" command
2. Select browser (Chrome, Safari, Firefox)
3. See list of bookmark folders
4. Select folders to import
5. Preview: "Will create 3 groups with 47 links"
6. Confirm → Groups added to config

### Acceptance Criteria

- [ ] Chrome bookmark parsing
- [ ] Safari bookmark parsing
- [ ] Firefox bookmark parsing
- [ ] Folder → Group mapping UI
- [ ] Duplicate detection
- [ ] Preview before import
- [ ] Merge or replace option

---

## Priority 8: Tags System

**Cross-group organization with tags**

| Attribute | Value      |
| --------- | ---------- |
| Effort    | 🟡 Medium  |
| Impact    | 🔥🔥 High  |
| Status    | 📋 Backlog |

### Description

Tag links across groups with labels like `#deploy`, `#docs`, `#api`. Search/filter by tag. Useful when links belong to multiple contexts.

### Implementation Notes

- Add `tags: string[]` field to `Link` interface
- Tags shown as colored badges/accessories
- Search supports `#tag` syntax to filter
- Optional: dedicated "Browse by Tag" view
- Consider: auto-suggest existing tags when editing

### Config Example

```yaml
- title: "Staging Deploy"
  url: "https://staging.myapp.com/deploy"
  tags: ["deploy", "staging"]

- title: "Production Deploy"
  url: "https://myapp.com/deploy"
  tags: ["deploy", "production"]
```

### UX Behaviors

- Type `#deploy` → Shows all links tagged "deploy"
- Tags shown as badges: `[deploy] [staging]`
- Autocomplete tags in edit form
- Tag colors based on hash of tag name (consistent)

### Acceptance Criteria

- [ ] Tags field in config schema
- [ ] Tags displayed as accessories
- [ ] `#tag` search syntax works
- [ ] Tag autocomplete in edit form
- [ ] Consistent tag colors
- [ ] Optional: "Browse Tags" view

---

## Backlog Summary

| #   | Feature                  | Effort  | Impact | Dependencies          |
| --- | ------------------------ | ------- | ------ | --------------------- |
| 0   | ~~Fuzzy Search~~         | 🟢 Low  | 🔥🔥🔥 | ✅ Done               |
| 1   | Link Aliases             | 🟢 Low  | 🔥🔥   | None                  |
| 2   | Deep Links to Groups     | 🟢 Low  | 🔥🔥   | None                  |
| 3   | Recent Links             | 🟢 Low  | 🔥🔥🔥 | None                  |
| 4   | Quick Add from Clipboard | 🟢 Low  | 🔥🔥🔥 | None                  |
| 5   | URL Templates            | 🟡 Med  | 🔥🔥🔥 | Types already defined |
| 6   | Create from Current Tab  | 🟡 Med  | 🔥🔥🔥 | None                  |
| 7   | Import Browser Bookmarks | 🔴 High | 🔥🔥🔥 | None                  |
| 8   | Tags System              | 🟡 Med  | 🔥🔥   | None                  |

---

## Notes

- **Feature 0** is foundational—improves all subsequent search-related features
- Features 1-4 are quick wins (1-2 days each)
- Features 5-6 require Forms and async workflows
- Feature 7 is a larger project (browser-specific parsing)
- Feature 8 affects search logic and UI

_Last updated: January 2026_
