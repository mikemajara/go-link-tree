import { List, ActionPanel, Action, Icon, open, showToast, Toast } from "@raycast/api";
import { Link } from "../types";
import { resolveIcon } from "../lib/icons";
import { getIconForUrl } from "../lib/domain-icons";

interface LinkItemProps {
  link: Link;
  groupTitle?: string;
  defaultBrowser?: string;
}

export function LinkItem({ link, groupTitle, defaultBrowser }: LinkItemProps) {
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

  // Application resolution priority:
  // 1. Link-level application
  // 2. Global defaultBrowser setting
  // 3. System default (undefined)
  const targetApplication = link.application || (defaultBrowser !== "default" ? defaultBrowser : undefined);

  const handleOpenInBrowser = async () => {
    if (targetApplication) {
      try {
        await open(link.url, targetApplication);
      } catch (error) {
        // Fallback to system default browser if specified app fails
        await showToast({
          style: Toast.Style.Animated,
          title: `Could not open in ${targetApplication}`,
          message: "Falling back to default browser...",
        });
        await open(link.url);
      }
    } else {
      await open(link.url);
    }
  };

  return (
    <List.Item
      title={link.title}
      subtitle={link.url}
      keywords={link.keywords}
      icon={icon}
      actions={
        <ActionPanel>
          <Action
            icon={Icon.Globe}
            title={targetApplication ? `Open in ${targetApplication}` : "Open in Browser"}
            onAction={handleOpenInBrowser}
          />
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
