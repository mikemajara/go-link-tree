import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { Link } from "../types";
import { resolveIcon } from "../lib/icons";
import { getIconForUrl } from "../lib/domain-icons";

interface LinkItemProps {
  link: Link;
  groupTitle?: string;
}

export function LinkItem({ link, groupTitle }: LinkItemProps) {
  // Icon resolution priority:
  // 1. Explicit icon in config
  // 2. Domain-based auto-detection
  // 3. Default Link icon
  let icon = resolveIcon(link.icon);
  if (!link.icon) {
    const domainIcon = getIconForUrl(link.url);
    if (domainIcon) {
      icon = domainIcon;
    } else {
      icon = Icon.Link;
    }
  }

  return (
    <List.Item
      title={link.title}
      subtitle={link.url}
      keywords={link.keywords}
      icon={icon}
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
