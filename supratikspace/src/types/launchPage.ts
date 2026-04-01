export interface LaunchMetric {
  label: string;
  value: string;
}

export interface LaunchLanguage {
  name: string;
  share: number;
}

export interface LaunchHighlight {
  title: string;
  description: string;
}

export interface LaunchSection {
  title: string;
  body: string;
  bullets: string[];
}

export interface LaunchPageData {
  slug: string;
  generatedAt: string;
  source: {
    owner: string;
    repo: string;
    repoUrl: string;
    branch: string;
    subPath: string;
    homepage: string;
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
  };
  hero: {
    title: string;
    tagline: string;
    description: string;
    topics: string[];
  };
  metrics: LaunchMetric[];
  languageBreakdown: LaunchLanguage[];
  highlights: LaunchHighlight[];
  features: string[];
  quickstart: string[];
  readmeSections: LaunchSection[];
  readmeLead: string[];
  urls?: {
    previewUrl: string;
    subdomainUrl: string;
  };
}
