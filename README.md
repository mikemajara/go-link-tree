# Go Link Tree

A Raycast extension for quick access to a configurable tree of links. Think of it as your personal "go links" system—organize frequently visited URLs, search them instantly, and open them in specific browsers or profiles.

![Go Link Tree](assets/link.png)

## Features

- 🔗 **Organized Links** — Group links into sections (Work, Dev, Personal, etc.)
- 🔍 **Instant Search** — Filter by title, URL, or keywords
- 🎨 **Auto Icons** — 100+ services auto-detected (GitHub, Slack, Notion, etc.)
- 🌐 **Browser Control** — Open links in specific browsers (Chrome, Brave, Firefox, etc.)
- 👤 **Profile Support** — Open links in specific browser profiles (Work, Personal)
- ⚡ **Hot Reload** — Config changes apply instantly, no restart needed
- 📋 **Quick Actions** — Copy URL or Markdown link with shortcuts

## Installation

1. Install the extension from the Raycast Store
2. Create your configuration file at `~/.config/go-link-tree/links.yaml`
3. Open Raycast and search for "Go Links"

## Configuration

The extension reads from `~/.config/go-link-tree/links.yaml` (or `.json`). Here's a complete guide to all configuration options.

### Basic Structure

```yaml
version: 1

settings:
  defaultBrowser: "default"
  # defaultProfile: "Work"
  showFavicons: true

groups:
  - name: work
    title: "🏢 Work"
    links:
      - title: "GitHub"
        url: "https://github.com/myorg"
        keywords: ["gh", "code"]
```

---

## Settings

Global settings that apply to all links (can be overridden per-link).

| Setting          | Type    | Default     | Description              |
| ---------------- | ------- | ----------- | ------------------------ |
| `defaultBrowser` | string  | `"default"` | Browser to open links in |
| `defaultProfile` | string  | —           | Browser profile to use   |
| `showFavicons`   | boolean | `true`      | Show favicons for links  |

### Browser Identifiers

Use these bundle identifiers for `defaultBrowser` or per-link `application`:

| Browser | Bundle Identifier            |
| ------- | ---------------------------- |
| Chrome  | `com.google.Chrome`          |
| Brave   | `com.brave.Browser`          |
| Firefox | `org.mozilla.firefox`        |
| Safari  | `com.apple.Safari`           |
| Arc     | `company.thebrowser.Browser` |
| Edge    | `com.microsoft.edgemac`      |

---

## Link Groups

Organize links into logical groups. Each group creates a section in the list.

```yaml
groups:
  - name: work # Unique identifier (required)
    title: "🏢 Work" # Display title (required)
    icon: "building" # Optional group icon
    links: [...] # Array of links
```

---

## Link Properties

Each link supports the following properties:

| Property      | Type     | Required | Description                     |
| ------------- | -------- | -------- | ------------------------------- |
| `title`       | string   | ✅       | Display name                    |
| `url`         | string   | ✅       | URL to open                     |
| `keywords`    | string[] | —        | Search aliases                  |
| `icon`        | string   | —        | Custom icon (see Icons section) |
| `application` | string   | —        | Browser to open this link in    |
| `profile`     | string   | —        | Browser profile to use          |

### Example

```yaml
- title: "Work Gmail"
  url: "https://mail.google.com"
  keywords: ["email", "inbox", "work"]
  application: "com.google.Chrome"
  profile: "Work"
```

---

## Browser Profiles

Open links in specific browser profiles—perfect for separating work and personal accounts.

### How It Works

1. **Link-level `profile`** takes priority
2. Falls back to **global `defaultProfile`**
3. Falls back to **browser's default profile**

### Profile Names

Use the **display name** you see in your browser's profile switcher:

```yaml
# Works with display names
profile: "Work"
profile: "Personal"

# Also works with directory names
profile: "Profile 1"
profile: "Default"
```

### Finding Profile Names

| Browser           | How to Find                                           |
| ----------------- | ----------------------------------------------------- |
| Chrome/Brave/Edge | Open browser → Click profile icon → See profile names |
| Firefox           | Open `about:profiles` in Firefox                      |

### Example: Separate Work/Personal

```yaml
groups:
  - name: work
    title: "🏢 Work"
    links:
      - title: "Work Gmail"
        url: "https://mail.google.com"
        application: "com.google.Chrome"
        profile: "Work"

      - title: "Work Slack"
        url: "https://app.slack.com"
        application: "com.google.Chrome"
        profile: "Work"

  - name: personal
    title: "🏠 Personal"
    links:
      - title: "Personal Gmail"
        url: "https://mail.google.com"
        application: "com.google.Chrome"
        profile: "Personal"
```

---

## Icons

Links can have custom icons, or icons are auto-detected from the URL.

### Auto-Detection (Default)

100+ services are automatically detected:

- **Dev**: GitHub, GitLab, Bitbucket, Vercel, Netlify, AWS, etc.
- **Communication**: Slack, Discord, Teams, Zoom, etc.
- **Productivity**: Notion, Confluence, Jira, Asana, Linear, etc.
- **Google**: Gmail, Drive, Calendar, Docs, etc.
- **Social**: Twitter/X, LinkedIn, YouTube, etc.

Just set the URL—the icon appears automatically!

### Custom Icons

Override auto-detection with explicit icons:

#### Iconify (Recommended)

Browse 150,000+ icons at [icon-sets.iconify.design](https://icon-sets.iconify.design/)

```yaml
icon: "iconify:devicon:react-original"
icon: "iconify:mdi:home-circle"
icon: "iconify:simple-icons:raycast"
```

#### SF Symbols

Use Apple's SF Symbols:

```yaml
icon: "sf-symbol:star.fill"
icon: "sf-symbol:folder.badge.gear"
```

#### Raycast Built-in

Use Raycast's Icon enum names:

```yaml
icon: "Globe"
icon: "Terminal"
icon: "Code"
```

---

## Usage

### Opening Links

1. Open Raycast (`⌘ Space`)
2. Type "Go Links" or your custom alias
3. Search by title, URL, or keywords
4. Press `Enter` to open

### Keyboard Shortcuts

| Shortcut | Action                  |
| -------- | ----------------------- |
| `Enter`  | Open in browser         |
| `⌘ C`    | Copy URL                |
| `⌘ ⇧ C`  | Copy as Markdown        |
| `⌘ R`    | Reload configuration    |
| `⌘ E`    | Edit configuration file |

---

## Complete Example

```yaml
version: 1

settings:
  defaultBrowser: "com.brave.Browser"
  defaultProfile: "Work"
  showFavicons: true

groups:
  - name: work
    title: "🏢 Work"
    links:
      - title: "GitHub"
        url: "https://github.com/mycompany"
        keywords: ["gh", "code", "repos"]

      - title: "Jira"
        url: "https://mycompany.atlassian.net"
        keywords: ["tickets", "issues"]

      - title: "Slack"
        url: "https://mycompany.slack.com"
        keywords: ["chat", "messages"]

  - name: dev
    title: "💻 Development"
    links:
      - title: "Localhost"
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
      - title: "Personal Gmail"
        url: "https://mail.google.com"
        keywords: ["email"]
        application: "com.google.Chrome"
        profile: "Personal" # Different profile for personal stuff

      - title: "YouTube"
        url: "https://youtube.com"
        keywords: ["video", "watch"]
```

---

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Project Structure

```
go-link-tree/
├── src/
│   ├── go.tsx              # Main command
│   ├── components/
│   │   └── LinkItem.tsx    # Link list item component
│   ├── lib/
│   │   ├── config.ts       # Config loading
│   │   ├── icons.ts        # Icon resolution
│   │   └── domain-icons.ts # Auto-detection mappings
│   └── types/
│       └── index.ts        # TypeScript interfaces
├── links.yaml              # Your config (gitignored)
├── links.example.yaml      # Example config
└── package.json
```

---

## Troubleshooting

### Links not opening in the right profile?

Make sure you're using the **display name** of your profile, not the directory name. Check your browser's profile switcher to see the exact name.

### Icons not showing?

- Ensure the Iconify format is correct: `iconify:{set}:{icon}`
- Check that the service URL is recognized for auto-detection
- Try a Raycast built-in icon as fallback

### Config changes not reflecting?

The extension hot-reloads config changes. If not working:

1. Press `⌘ R` to manually reload
2. Check for YAML syntax errors
3. Ensure the file is saved

---

## License

MIT
