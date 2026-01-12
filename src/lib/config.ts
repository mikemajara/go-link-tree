import { getPreferenceValues } from "@raycast/api";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";
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
