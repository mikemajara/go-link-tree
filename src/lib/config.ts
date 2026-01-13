import { getPreferenceValues } from "@raycast/api";
import * as yaml from "js-yaml";
import * as fs from "fs";
import type { GoLinkConfig, Link } from "../types";

// Preferences type defined locally to satisfy strict build checks
// (mirrors auto-generated ExtensionPreferences from raycast-env.d.ts)
interface ExtensionPreferences {
  configPath: string;
}

/**
 * Gets the resolved config file path (with ~ expansion)
 */
export function getConfigPath(): string {
  const { configPath } = getPreferenceValues<ExtensionPreferences>();
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  return configPath.replace(/^~/, homeDir);
}

/**
 * Validates the loaded config structure
 */
function validateConfig(config: unknown): GoLinkConfig {
  if (!config || typeof config !== "object") {
    throw new Error("Configuration file is empty or invalid");
  }

  const cfg = config as Record<string, unknown>;

  // Check for required fields
  if (!cfg.version || typeof cfg.version !== "number") {
    throw new Error(
      "Configuration missing required 'version' field (must be a number)"
    );
  }

  if (!cfg.groups || !Array.isArray(cfg.groups)) {
    throw new Error(
      "Configuration missing required 'groups' field (must be an array)"
    );
  }

  if (cfg.groups.length === 0) {
    throw new Error("Configuration must contain at least one group");
  }

  // Validate groups structure
  for (let i = 0; i < cfg.groups.length; i++) {
    const group = cfg.groups[i] as Record<string, unknown>;
    if (!group.name || typeof group.name !== "string") {
      throw new Error(`Group ${i + 1} is missing required 'name' field`);
    }
    if (!group.title || typeof group.title !== "string") {
      throw new Error(
        `Group '${group.name}' is missing required 'title' field`
      );
    }
    if (!group.links || !Array.isArray(group.links)) {
      throw new Error(
        `Group '${group.name}' is missing required 'links' field (must be an array)`
      );
    }

    // Validate links structure
    for (let j = 0; j < group.links.length; j++) {
      const link = group.links[j] as Record<string, unknown>;
      if (!link.title || typeof link.title !== "string") {
        throw new Error(
          `Link ${j + 1} in group '${group.name}' is missing required 'title' field`
        );
      }
      if (!link.url || typeof link.url !== "string") {
        throw new Error(
          `Link '${link.title}' in group '${group.name}' is missing required 'url' field`
        );
      }
      // Basic URL validation
      try {
        new URL(link.url);
      } catch {
        throw new Error(
          `Link '${link.title}' in group '${group.name}' has invalid URL: ${link.url}`
        );
      }
    }
  }

  return config as GoLinkConfig;
}

export async function loadConfig(): Promise<GoLinkConfig> {
  const resolvedPath = getConfigPath();

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `Configuration file not found: ${resolvedPath}\n\nPlease check the path in Raycast preferences or create the file.`
    );
  }

  let content: string;
  try {
    content = fs.readFileSync(resolvedPath, "utf-8");
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to read configuration file: ${error}`);
  }

  if (content.trim().length === 0) {
    throw new Error("Configuration file is empty");
  }

  let parsed: unknown;
  try {
    if (resolvedPath.endsWith(".yaml") || resolvedPath.endsWith(".yml")) {
      parsed = yaml.load(content);
      if (!parsed) {
        throw new Error("YAML file appears to be empty or invalid");
      }
    } else {
      parsed = JSON.parse(content);
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    const fileType =
      resolvedPath.endsWith(".yaml") || resolvedPath.endsWith(".yml")
        ? "YAML"
        : "JSON";
    throw new Error(`Failed to parse ${fileType} configuration: ${error}`);
  }

  return validateConfig(parsed);
}

/**
 * Updates a link in the configuration file.
 * Finds the link by groupName and originalUrl, then replaces it with the updated link.
 */
export async function updateLinkInConfig(
  groupName: string,
  originalUrl: string,
  updatedLink: Link
): Promise<void> {
  const resolvedPath = getConfigPath();

  // Load current config
  const config = await loadConfig();

  // Find the group
  const group = config.groups.find((g) => g.name === groupName);
  if (!group) {
    throw new Error(`Group "${groupName}" not found in configuration`);
  }

  // Find the link by original URL
  const linkIndex = group.links.findIndex((l) => l.url === originalUrl);
  if (linkIndex === -1) {
    throw new Error(
      `Link with URL "${originalUrl}" not found in group "${groupName}"`
    );
  }

  // Update the link
  group.links[linkIndex] = updatedLink;

  // Write back to file
  try {
    const isYaml =
      resolvedPath.endsWith(".yaml") || resolvedPath.endsWith(".yml");
    let content: string;

    if (isYaml) {
      content = yaml.dump(config, {
        indent: 2,
        lineWidth: -1, // Don't wrap long lines
        quotingType: '"',
        forceQuotes: false,
      });
    } else {
      content = JSON.stringify(config, null, 2);
    }

    fs.writeFileSync(resolvedPath, content, "utf-8");
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to write configuration file: ${error}`);
  }
}

/**
 * Adds a new link to the configuration file.
 * If groupName exists, appends to that group. If newGroupTitle is provided, creates a new group.
 */
export async function addLinkToConfig(
  groupName: string,
  newLink: Link,
  newGroupTitle?: string
): Promise<void> {
  const resolvedPath = getConfigPath();

  // Load current config
  const config = await loadConfig();

  // Find or create the group
  let group = config.groups.find((g) => g.name === groupName);

  if (!group) {
    if (!newGroupTitle) {
      throw new Error(
        `Group "${groupName}" not found. Provide a title to create a new group.`
      );
    }
    // Create new group
    group = {
      name: groupName,
      title: newGroupTitle,
      links: [],
    };
    config.groups.push(group);
  }

  // Add the new link
  group.links.push(newLink);

  // Write back to file
  try {
    const isYaml =
      resolvedPath.endsWith(".yaml") || resolvedPath.endsWith(".yml");
    let content: string;

    if (isYaml) {
      content = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        quotingType: '"',
        forceQuotes: false,
      });
    } else {
      content = JSON.stringify(config, null, 2);
    }

    fs.writeFileSync(resolvedPath, content, "utf-8");
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to write configuration file: ${error}`);
  }
}
