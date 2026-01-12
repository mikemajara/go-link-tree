import { List, Icon, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { loadConfig } from "./lib/config";
import { LinkItem } from "./components/LinkItem";
import { GoLinkConfig } from "./types";

export default function Command() {
  const [config, setConfig] = useState<GoLinkConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig()
      .then((loadedConfig) => {
        setConfig(loadedConfig);
        setError(null);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "Failed to load configuration";
        setError(errorMessage);
        showToast({
          style: Toast.Style.Failure,
          title: "Configuration Error",
          message: errorMessage,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return (
      <List>
        <List.Item
          icon={Icon.ExclamationMark}
          title="Configuration Error"
          subtitle={error}
        />
      </List>
    );
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
  );
}
