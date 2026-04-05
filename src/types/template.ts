export interface TemplateShowcasePage {
  slug: string;
  previewUrl: string;
  repoUrl: string;
  repoName: string;
  title: string;
}

export interface TemplateAttributionLink {
  label: string;
  url: string;
  required: boolean;
  configurable?: boolean;
  notes?: string;
}

export interface TemplateAttributionRequirements {
  linkedIn: TemplateAttributionLink;
  gitme: TemplateAttributionLink;
}

export interface TemplateSupportedContextRange {
  min: number;
  max: number;
}

export interface TemplateUpdatePolicy {
  additiveData: string;
  templateBodyUpgrades: string;
  breakingChanges: string;
  notification: string;
  ethics?: string;
}

export interface TemplateDefinition {
  id: string;
  label: string;
  version: number;
  contextVersion: number;
  description: string;
  status: string;
  default: boolean;
  repositoryUrl: string;
  contributionsUrl: string;
  designFreedom: string;
  designGuidance: string;
  supportedContextRange: TemplateSupportedContextRange;
  updatePolicy: TemplateUpdatePolicy;
  promptSuggestion: string;
  requiredAttribution: TemplateAttributionRequirements;
  featuredSample?: TemplateShowcasePage | null;
}
