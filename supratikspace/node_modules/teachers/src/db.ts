import type {
  FolderRecord,
  SheetRecord,
  WorkspaceSnapshot,
  WorkspaceSettings,
} from './types'

const DB_NAME = 'paper-marking-desk'
const DB_VERSION = 2
const LEGACY_SHEETS_STORE = 'sheets'
const WORKSPACE_STORE = 'workspace'
const WORKSPACE_KEY = 'workspace'

let databasePromise: Promise<IDBDatabase> | null = null

function createDefaultSettings(): WorkspaceSettings {
  return {
    aiModel: 'gpt-5',
  }
}

export function createEmptyWorkspace(now = Date.now()): WorkspaceSnapshot {
  return {
    id: WORKSPACE_KEY,
    folders: [],
    sheets: [],
    settings: createDefaultSettings(),
    createdAt: now,
    updatedAt: now,
  }
}

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) {
    return databasePromise
  }

  databasePromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open the local database.'))
    }

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(LEGACY_SHEETS_STORE)) {
        database.createObjectStore(LEGACY_SHEETS_STORE, { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(WORKSPACE_STORE)) {
        database.createObjectStore(WORKSPACE_STORE, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }
  })

  return databasePromise
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Transaction failed.'))
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Transaction was aborted.'))
  })
}

function waitForRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('Database request failed.'))
  })
}

async function readLegacySheets(database: IDBDatabase): Promise<SheetRecord[]> {
  if (!database.objectStoreNames.contains(LEGACY_SHEETS_STORE)) {
    return []
  }

  const transaction = database.transaction(LEGACY_SHEETS_STORE, 'readonly')
  const request = transaction.objectStore(LEGACY_SHEETS_STORE).getAll()
  const result = (await waitForRequest(request)) as SheetRecord[]
  await waitForTransaction(transaction)
  return Array.isArray(result) ? result : []
}

function buildLegacyImportWorkspace(legacySheets: SheetRecord[]): WorkspaceSnapshot {
  const now = Date.now()

  if (legacySheets.length === 0) {
    return createEmptyWorkspace(now)
  }

  const importedFolder: FolderRecord = {
    id: crypto.randomUUID(),
    name: 'Imported papers',
    parentId: null,
    kind: 'test',
    accent: '#0f5fff',
    scoreEntries: [],
    aiSummary: [],
    aiLastRunAt: null,
    lastSharedAt: null,
    createdAt: now,
    updatedAt: now,
  }

  return {
    id: WORKSPACE_KEY,
    folders: [importedFolder],
    sheets: legacySheets
      .map((sheet, index) => ({
        ...sheet,
        folderId: importedFolder.id,
        pageLabel: `Page ${index + 1}`,
        sortOrder: index,
        markedAt: sheet.strokes.length > 0 ? sheet.updatedAt : null,
        selectedForAi: sheet.strokes.length > 0,
      }))
      .sort((left, right) => left.sortOrder - right.sortOrder),
    settings: createDefaultSettings(),
    createdAt: now,
    updatedAt: now,
  }
}

export async function loadWorkspace(): Promise<WorkspaceSnapshot> {
  const database = await openDatabase()
  const transaction = database.transaction(WORKSPACE_STORE, 'readonly')
  const request = transaction.objectStore(WORKSPACE_STORE).get(WORKSPACE_KEY)
  const workspace = (await waitForRequest(request)) as WorkspaceSnapshot | undefined
  await waitForTransaction(transaction)

  if (workspace) {
    return {
      ...workspace,
      settings: {
        ...createDefaultSettings(),
        ...(workspace.settings ?? {}),
      },
    }
  }

  const legacySheets = await readLegacySheets(database)
  const migrated = buildLegacyImportWorkspace(legacySheets)
  await saveWorkspace(migrated)
  return migrated
}

export async function saveWorkspace(workspace: WorkspaceSnapshot): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(WORKSPACE_STORE, 'readwrite')
  transaction.objectStore(WORKSPACE_STORE).put({
    ...workspace,
    id: WORKSPACE_KEY,
    updatedAt: Date.now(),
  })
  await waitForTransaction(transaction)
}

export async function clearWorkspaceData(): Promise<void> {
  const database = await openDatabase()
  const storeNames = [WORKSPACE_STORE, LEGACY_SHEETS_STORE].filter((storeName) =>
    database.objectStoreNames.contains(storeName),
  )

  if (storeNames.length === 0) {
    return
  }

  const transaction = database.transaction(storeNames, 'readwrite')

  for (const storeName of storeNames) {
    transaction.objectStore(storeName).clear()
  }

  await waitForTransaction(transaction)
}
