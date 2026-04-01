import { calculateScoreTotals } from './marks'
import type {
  FolderKind,
  FolderRecord,
  ScoreEntry,
  ScoreTotals,
  SheetRecord,
  WorkspaceSnapshot,
} from './types'

export interface FolderHistoryItem {
  folder: FolderRecord
  totals: ScoreTotals
}

export function getFolderById(
  workspace: WorkspaceSnapshot,
  folderId: string | null,
): FolderRecord | null {
  if (!folderId) {
    return null
  }

  return workspace.folders.find((folder) => folder.id === folderId) ?? null
}

export function getChildFolders(
  workspace: WorkspaceSnapshot,
  parentId: string | null,
): FolderRecord[] {
  return workspace.folders
    .filter((folder) => folder.parentId === parentId)
    .sort((left, right) => {
      if (left.kind !== right.kind) {
        const rank = folderKindRank(left.kind) - folderKindRank(right.kind)

        if (rank !== 0) {
          return rank
        }
      }

      return left.name.localeCompare(right.name, undefined, { numeric: true })
    })
}

export function getSheetsInFolder(
  workspace: WorkspaceSnapshot,
  folderId: string | null,
): SheetRecord[] {
  if (!folderId) {
    return []
  }

  return workspace.sheets
    .filter((sheet) => sheet.folderId === folderId)
    .sort((left, right) => left.sortOrder - right.sortOrder)
}

export function getBreadcrumbs(
  workspace: WorkspaceSnapshot,
  folderId: string | null,
): FolderRecord[] {
  const breadcrumbs: FolderRecord[] = []
  let current = getFolderById(workspace, folderId)

  while (current) {
    breadcrumbs.unshift(current)
    current = getFolderById(workspace, current.parentId)
  }

  return breadcrumbs
}

export function getDescendantFolderIds(
  workspace: WorkspaceSnapshot,
  rootFolderId: string,
): string[] {
  const ids: string[] = []
  const queue = [rootFolderId]

  while (queue.length > 0) {
    const currentId = queue.shift()

    if (!currentId) {
      continue
    }

    ids.push(currentId)

    for (const child of getChildFolders(workspace, currentId)) {
      queue.push(child.id)
    }
  }

  return ids
}

export function getDescendantTests(
  workspace: WorkspaceSnapshot,
  folderId: string,
): FolderRecord[] {
  const ids = new Set(getDescendantFolderIds(workspace, folderId))

  return workspace.folders
    .filter((folder) => folder.kind === 'test' && ids.has(folder.id))
    .sort((left, right) => right.createdAt - left.createdAt)
}

export function findStudentAncestor(
  workspace: WorkspaceSnapshot,
  folderId: string | null,
): FolderRecord | null {
  let current = getFolderById(workspace, folderId)

  while (current) {
    if (current.kind === 'student') {
      return current
    }

    current = getFolderById(workspace, current.parentId)
  }

  return null
}

export function findClassAncestor(
  workspace: WorkspaceSnapshot,
  folderId: string | null,
): FolderRecord | null {
  let current = getFolderById(workspace, folderId)

  while (current) {
    if (current.kind === 'classroom') {
      return current
    }

    current = getFolderById(workspace, current.parentId)
  }

  return null
}

export function getFolderHistory(
  workspace: WorkspaceSnapshot,
  folderId: string,
): FolderHistoryItem[] {
  return getDescendantTests(workspace, folderId).map((folder) => ({
    folder,
    totals: calculateScoreTotals(folder.scoreEntries),
  }))
}

export function countMarkedSheets(
  workspace: WorkspaceSnapshot,
  folderId: string | null,
): number {
  return getSheetsInFolder(workspace, folderId).filter((sheet) => sheet.strokes.length > 0)
    .length
}

export function createFolderRecord(
  name: string,
  kind: FolderKind,
  parentId: string | null,
  accent: string,
  now = Date.now(),
): FolderRecord {
  return {
    id: crypto.randomUUID(),
    name,
    parentId,
    kind,
    accent,
    scoreEntries: [],
    aiSummary: [],
    aiLastRunAt: null,
    lastSharedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

export function createScoreEntry(now = Date.now()): ScoreEntry {
  return {
    id: crypto.randomUUID(),
    label: '',
    awardedRaw: '',
    awardedValue: null,
    possibleRaw: '',
    possibleValue: null,
    note: '',
    linkedSheetIds: [],
    source: 'manual',
    confidence: null,
    createdAt: now,
    updatedAt: now,
  }
}

export function ensureValidSelection(
  workspace: WorkspaceSnapshot,
  selectedFolderId: string | null,
  selectedSheetId: string | null,
): {
  selectedFolderId: string | null
  selectedSheetId: string | null
} {
  const folder =
    getFolderById(workspace, selectedFolderId) ??
    workspace.folders
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }))[0] ??
    null

  const sheets = getSheetsInFolder(workspace, folder?.id ?? null)
  const selectedSheet =
    sheets.find((sheet) => sheet.id === selectedSheetId) ??
    sheets[0] ??
    null

  return {
    selectedFolderId: folder?.id ?? null,
    selectedSheetId: selectedSheet?.id ?? null,
  }
}

export function getFolderCreateParentId(
  workspace: WorkspaceSnapshot,
  selectedFolderId: string | null,
  kind: FolderKind,
): string | null {
  if (kind === 'classroom') {
    return null
  }

  const selectedFolder = getFolderById(workspace, selectedFolderId)

  if (!selectedFolder) {
    return null
  }

  if (kind === 'student') {
    if (selectedFolder.kind === 'classroom') {
      return selectedFolder.id
    }

    if (selectedFolder.kind === 'student') {
      return selectedFolder.parentId
    }

    return findClassAncestor(workspace, selectedFolder.id)?.id ?? null
  }

  if (selectedFolder.kind === 'student') {
    return selectedFolder.id
  }

  if (selectedFolder.kind === 'test') {
    return selectedFolder.parentId
  }

  return null
}

export function getFolderLabel(kind: FolderKind): string {
  if (kind === 'classroom') {
    return 'Class'
  }

  if (kind === 'student') {
    return 'Student'
  }

  return 'Test'
}

export function getFolderAnalyticsSummary(history: FolderHistoryItem[]): {
  averagePercent: number | null
  bestPercent: number | null
  testsWithScores: number
} {
  const percents = history
    .map((item) => item.totals.percent)
    .filter((value): value is number => value !== null)

  if (percents.length === 0) {
    return {
      averagePercent: null,
      bestPercent: null,
      testsWithScores: 0,
    }
  }

  const averagePercent =
    percents.reduce((sum, value) => sum + value, 0) / Math.max(1, percents.length)

  return {
    averagePercent: Number(averagePercent.toFixed(1)),
    bestPercent: Math.max(...percents),
    testsWithScores: percents.length,
  }
}

export function getFolderTreeLines(
  workspace: WorkspaceSnapshot,
  parentId: string | null,
  depth = 0,
): Array<{ folder: FolderRecord; depth: number }> {
  const lines: Array<{ folder: FolderRecord; depth: number }> = []

  for (const folder of getChildFolders(workspace, parentId)) {
    lines.push({ folder, depth })
    lines.push(...getFolderTreeLines(workspace, folder.id, depth + 1))
  }

  return lines
}

function folderKindRank(kind: FolderKind): number {
  if (kind === 'classroom') {
    return 0
  }

  if (kind === 'student') {
    return 1
  }

  return 2
}
