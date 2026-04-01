export type FolderKind = 'classroom' | 'student' | 'test'

export interface InkPoint {
  x: number
  y: number
  pressure?: number
}

export interface InkStroke {
  id: string
  color: string
  width: number
  opacity: number
  points: InkPoint[]
}

export interface SheetRecord {
  id: string
  folderId: string
  name: string
  pageLabel: string
  image: Blob
  width: number
  height: number
  sortOrder: number
  strokes: InkStroke[]
  markedAt: number | null
  selectedForAi: boolean
  createdAt: number
  updatedAt: number
}

export interface ScoreEntry {
  id: string
  label: string
  awardedRaw: string
  awardedValue: number | null
  possibleRaw: string
  possibleValue: number | null
  note: string
  linkedSheetIds: string[]
  source: 'manual' | 'ai'
  confidence: number | null
  createdAt: number
  updatedAt: number
}

export interface FolderRecord {
  id: string
  name: string
  parentId: string | null
  kind: FolderKind
  accent: string
  scoreEntries: ScoreEntry[]
  aiSummary: string[]
  aiLastRunAt: number | null
  lastSharedAt: number | null
  createdAt: number
  updatedAt: number
}

export interface WorkspaceSettings {
  aiModel: string
}

export interface WorkspaceSnapshot {
  id: 'workspace'
  folders: FolderRecord[]
  sheets: SheetRecord[]
  settings: WorkspaceSettings
  createdAt: number
  updatedAt: number
}

export interface AiScoreSuggestionEntry {
  label: string
  awardedRaw: string
  possibleRaw: string
  note: string
  confidence: number
}

export interface AiScoreResult {
  entries: AiScoreSuggestionEntry[]
  summary: string[]
}

export interface ScoreTotals {
  awardedTotal: number
  possibleTotal: number | null
  percent: number | null
  resolvedEntries: number
  unresolvedEntries: number
}
