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

export interface LaunchAudienceProfile {
  title: string;
  beneficiaries: string;
  impact: string;
}

export interface LaunchSocialLink {
  label: string;
  url: string;
}

export interface LaunchOwnerProfile {
  handle: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string;
  company: string;
  location: string;
  website: string;
  followers: number;
  following: number;
  publicRepos: number;
  socialLinks: LaunchSocialLink[];
}

export interface LaunchRelatedRepo {
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
}

export interface LaunchStrategySummary {
  idealCustomerProfile: string;
  userProblem: string;
  desiredOutcome: string;
  adoptionTrigger: string;
  positioning: string;
}

export interface LaunchVisualParity {
  visualBlocks: number;
  textBlocks: number;
  ratio: number;
  targetRatio: number;
  status: string;
  visualMoments: string[];
}

export interface LaunchTemplateSummary {
  id: string;
  label: string;
  version: number;
  contextVersion: number;
  description: string;
  status: string;
  supportedContextRange?: {
    min: number;
    max: number;
  };
  updatePolicy?: {
    additiveData: string;
    templateBodyUpgrades: string;
    breakingChanges: string;
    notification: string;
    ethics?: string;
  };
}

export interface LaunchPlatformShellItem {
  label: string;
  value?: string;
  url?: string;
  notes?: string;
}

export interface LaunchPlatformShellModule {
  id: string;
  kind: 'stats' | 'links';
  title: string;
  description: string;
  items: LaunchPlatformShellItem[];
}

export interface LaunchPlatformCompatibility {
  status: 'supported' | 'legacy-compatible';
  requestedContextVersion: number;
  supportedContextRange: {
    min: number;
    max: number;
  };
  message: string;
}

export interface LaunchPlatformShell {
  version: number;
  compatibility: LaunchPlatformCompatibility;
  updatePolicy: {
    additiveData: string;
    templateBodyUpgrades: string;
    breakingChanges: string;
    notification: string;
    ethics?: string;
  };
  universalModules: LaunchPlatformShellModule[];
  attribution: {
    title: string;
    description: string;
    links: LaunchPlatformShellItem[];
  };
}

export interface LaunchNarrative {
  repositoryMeaning: string;
  importantBecause: string;
  problem: string;
  solution: string;
  audienceProfiles: LaunchAudienceProfile[];
  lifeImprovements: string[];
  futureImplications: string[];
}

export interface LaunchDesignSummary {
  provider: string;
  status: string;
  note?: string;
  themeKey: string;
  themeName: string;
  visualDirection: string;
  stitchPrompt: string;
}

export interface LaunchAiSummary {
  enabled: boolean;
  provider: string;
  model: string;
  fallback: boolean;
}

export interface LaunchPageData {
  slug: string;
  generatedAt: string;
  generationMode?: string;
  legacy?: boolean;
  template?: LaunchTemplateSummary;
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
  owner?: LaunchOwnerProfile;
  relatedRepos?: LaunchRelatedRepo[];
  narrative?: LaunchNarrative;
  strategy?: LaunchStrategySummary;
  visualParity?: LaunchVisualParity;
  design?: LaunchDesignSummary;
  ai?: LaunchAiSummary;
  renderedHtml?: string;
  platformShell?: LaunchPlatformShell;
  urls?: {
    previewUrl: string;
    subdomainUrl: string;
  };
}
