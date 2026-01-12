# Go Link Tree - Raycast Extension

A Raycast extension that provides quick access to a configurable tree of links defined in a YAML/JSON configuration file. Think of it as a personal "go links" system accessible directly from Raycast.

## Features

- 📋 **Hierarchical Link Organization** - Group your links into sections
- 🔍 **Fast Search** - Fuzzy search across titles, keywords, and URLs
- 🌐 **Quick Actions** - Open links in browser or copy to clipboard
- ⚙️ **Flexible Configuration** - Support for both YAML and JSON config files
- 🎨 **Customizable** - Add icons and keywords to make links easy to find

## Installation

1. Install the extension from the Raycast Store (coming soon)
2. Configure the path to your links configuration file in Raycast preferences
3. Create your configuration file (see example below)

## Configuration

Create a YAML or JSON file with your links. Here's an example:

```yaml
version: 1

groups:
  - name: work
    title: "🏢 Work"
    links:
      - title: "GitHub"
        url: "https://github.com/myorg"
        keywords: ["gh", "code", "repos"]
      
      - title: "Jira Board"
        url: "https://myorg.atlassian.net/browse/PROJ"
        keywords: ["tickets", "issues"]
```

See `links.example.yaml` for a complete example.

## Usage

1. Open Raycast (`⌘ + Space`)
2. Type "Search Links" or your assigned alias
3. Search for links by title, keywords, or URL
4. Press `Enter` to open in browser, or use shortcuts:
   - `⌘ + C` - Copy URL
   - `⌘ + ⇧ + C` - Copy as Markdown link

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

## License

MIT
