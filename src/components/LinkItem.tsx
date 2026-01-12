import { List, ActionPanel, Action, Icon, open, showToast, Toast } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { Link } from "../types";
import { resolveIcon } from "../lib/icons";
import { getIconForUrl } from "../lib/domain-icons";

const execAsync = promisify(exec);

interface LinkItemProps {
  link: Link;
  groupTitle?: string;
  defaultBrowser?: string;
  defaultProfile?: string;
}

// Map of known browser bundle identifiers to their app names for open command
const BROWSER_APP_NAMES: Record<string, string> = {
  "com.google.Chrome": "Google Chrome",
  "com.brave.Browser": "Brave Browser",
  "org.mozilla.firefox": "Firefox",
  "com.apple.Safari": "Safari",
  "company.thebrowser.Browser": "Arc",
  "com.microsoft.edgemac": "Microsoft Edge",
};

// Chromium-based browsers use --profile-directory flag
const CHROMIUM_BROWSERS = [
  "com.google.Chrome",
  "com.brave.Browser",
  "com.microsoft.edgemac",
  "Google Chrome",
  "Brave Browser",
  "Microsoft Edge",
];

export function LinkItem({ link, groupTitle, defaultBrowser, defaultProfile }: LinkItemProps) {
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

  // Profile resolution priority:
  // 1. Link-level profile
  // 2. Global defaultProfile setting
  // 3. No profile (undefined)
  const targetProfile = link.profile || defaultProfile;

  const openWithProfile = async (app: string, profile: string, url: string): Promise<void> => {
    // Get the app name for the open command
    const appName = BROWSER_APP_NAMES[app] || app;
    const isChromium = CHROMIUM_BROWSERS.some(
      (b) => b.toLowerCase() === app.toLowerCase() || b.toLowerCase() === appName.toLowerCase()
    );

    let command: string;
    if (isChromium) {
      // Chromium-based browsers: --profile-directory="Profile Name"
      command = `open -a "${appName}" --args --profile-directory="${profile}" "${url}"`;
    } else if (app.includes("firefox") || appName.toLowerCase().includes("firefox")) {
      // Firefox: -P "profile_name"
      command = `open -a "${appName}" --args -P "${profile}" "${url}"`;
    } else {
      // For other browsers, just try the chromium style (might work, might not)
      command = `open -a "${appName}" --args --profile-directory="${profile}" "${url}"`;
    }

    await execAsync(command);
  };

  const handleOpenInBrowser = async () => {
    try {
      if (targetApplication && targetProfile) {
        // Use shell command to open with specific profile
        await openWithProfile(targetApplication, targetProfile, link.url);
      } else if (targetApplication) {
        // Use Raycast's open with just the application
        await open(link.url, targetApplication);
      } else {
        // Use system default
        await open(link.url);
      }
    } catch (error) {
      // Fallback to system default browser if specified app/profile fails
      await showToast({
        style: Toast.Style.Animated,
        title: targetProfile
          ? `Could not open in ${targetApplication} (${targetProfile})`
          : `Could not open in ${targetApplication}`,
        message: "Falling back to default browser...",
      });
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
            title={
              targetApplication && targetProfile
                ? `Open in ${targetApplication} (${targetProfile})`
                : targetApplication
                  ? `Open in ${targetApplication}`
                  : "Open in Browser"
            }
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
