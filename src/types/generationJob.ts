export type GenerationPhaseStatus = 'pending' | 'running' | 'completed' | 'failed';
export type GenerationJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface GenerationPhase {
  key: string;
  label: string;
  status: GenerationPhaseStatus;
  message: string;
  startedAt?: string;
  completedAt?: string;
}

export interface GenerationJob {
  id: string;
  repoUrl: string;
  templateId?: string;
  status: GenerationJobStatus;
  createdAt: string;
  updatedAt: string;
  currentPhaseKey: string;
  phases: GenerationPhase[];
  slug?: string;
  previewUrl?: string;
  subdomainUrl?: string;
  generationMode?: string;
  error?: string;
}
