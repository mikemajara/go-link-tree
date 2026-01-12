export interface GoLinkConfig {
  version: number;
  settings?: {
    defaultBrowser?: string;
    showFavicons?: boolean;
  };
  groups: LinkGroup[];
  templates?: LinkTemplate[];
}

export interface LinkGroup {
  name: string; // unique identifier
  title: string; // display title
  icon?: string; // optional icon
  links: Link[];
}

export interface Link {
  title: string;
  url: string;
  keywords?: string[]; // searchable aliases
  icon?: string;
}

export interface LinkTemplate {
  name: string;
  pattern: string; // URL with {placeholders}
  icon?: string;
}
