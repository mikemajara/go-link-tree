import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { Link } from "../types";

interface LinkItemProps {
  link: Link;
  groupTitle?: string;
}

export function LinkItem({ link, groupTitle }: LinkItemProps) {
  // Resolve icon - support SF Symbols (string) or Icon enum
  let iconSource: Icon | { source: string } = Icon.Link;
  if (link.icon) {
    // Check if it's an SF Symbol name (string) or try to match Icon enum
    const iconKey = link.icon as keyof typeof Icon;
    if (Icon[iconKey]) {
      iconSource = Icon[iconKey];
    } else {
      iconSource = { source: link.icon };
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
  );
}
