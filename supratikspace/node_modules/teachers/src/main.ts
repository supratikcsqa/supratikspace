import './style.css'

import { calculateScoresWithOpenAI } from './ai'
import { clearWorkspaceData, createEmptyWorkspace, loadWorkspace, saveWorkspace } from './db'
import { blobToDataUrl, downloadBlob, renderMarkedSheetBlob } from './export'
import { drawLiveStrokeOnContext, drawStrokeOnContext, syncCanvasSize } from './ink'
import { buildScoreEntryPatch, calculateScoreTotals, formatScoreValue } from './marks'
import type {
  FolderKind,
  FolderRecord,
  InkPoint,
  InkStroke,
  ScoreEntry,
  SheetRecord,
  WorkspaceSnapshot,
} from './types'
import {
  countMarkedSheets,
  createFolderRecord,
  createScoreEntry,
  ensureValidSelection,
  findClassAncestor,
  findStudentAncestor,
  getBreadcrumbs,
  getChildFolders,
  getDescendantTests,
  getFolderAnalyticsSummary,
  getFolderById,
  getFolderCreateParentId,
  getFolderHistory,
  getFolderLabel,
  getSheetsInFolder,
} from './workspace'


type SaveTone = 'saved' | 'saving' | 'error'
type FlashTone = 'info' | 'error'

interface FlashMessage {
  tone: FlashTone
  text: string
}

interface AppState {
  workspace: WorkspaceSnapshot
  homeMode: boolean
  selectedFolderId: string | null
  selectedSheetId: string | null
  folderDraftName: string
  folderDraftKind: FolderKind
  homeSearch: string
  testSurface: 'organizer' | 'scoring' | 'result'
  scorePadEntryId: string | null
  scorePadBuffer: string
  penColor: string
  penWidth: number
  zoom: number
  isLoading: boolean
  saveTone: SaveTone
  saveLabel: string
  flash: FlashMessage | null
  aiApiKey: string
  aiBusy: boolean
  shareBusy: boolean
  editSession: {
    sheetId: string
    draftStrokes: InkStroke[]
  } | null
  editTool: 'pen' | 'hand'
}

const OPENAI_KEY_STORAGE = 'paper-marking-desk:openai-key'
const COLORS = ['#d14343', '#2453ff', '#12705a', '#7347d6', '#111827']
const FOLDER_ACCENTS = ['#6b8afd', '#ff8f66', '#56a77a', '#6b6fd3', '#d76464', '#2b7fff']

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('The app container is missing.')
}

const app: HTMLDivElement = appRoot

const state: AppState = {
  workspace: createEmptyWorkspace(),
  homeMode: true,
  selectedFolderId: null,
  selectedSheetId: null,
  folderDraftName: '',
  folderDraftKind: 'classroom',
  homeSearch: '',
  testSurface: 'organizer',
  scorePadEntryId: null,
  scorePadBuffer: '',
  penColor: COLORS[0],
  penWidth: 9,
  zoom: 1,
  isLoading: true,
  saveTone: 'saved',
  saveLabel: 'Everything on this device is up to date.',
  flash: null,
  aiApiKey: readStoredApiKey(),
  aiBusy: false,
  shareBusy: false,
  editSession: null,
  editTool: 'pen',
}

function applyDemoScreen(): void {
  const screen = getDemoMode() ?? 'home'
  const student = state.workspace.folders.find((folder) => folder.kind === 'student') ?? null
  const test = state.workspace.folders.find((folder) => folder.kind === 'test') ?? null
  const firstTestSheet = test ? getSheetsInFolder(state.workspace, test.id)[0] ?? null : null
  state.flash = null

  if (screen === 'student' && student) {
    state.homeMode = false
    state.selectedFolderId = student.id
    state.selectedSheetId = null
    return
  }

  if (screen === 'organizer' && test) {
    state.homeMode = false
    state.selectedFolderId = test.id
    state.selectedSheetId = firstTestSheet?.id ?? null
    state.testSurface = 'organizer'
    return
  }

  if (screen === 'scoring' && test) {
    state.homeMode = false
    state.selectedFolderId = test.id
    state.selectedSheetId = firstTestSheet?.id ?? null
    state.testSurface = 'scoring'
    state.scorePadEntryId = test.scoreEntries[0]?.id ?? null
    state.scorePadBuffer = test.scoreEntries[0]?.awardedRaw ?? ''
    return
  }

  if (screen === 'result' && test) {
    state.homeMode = false
    state.selectedFolderId = test.id
    state.selectedSheetId = firstTestSheet?.id ?? null
    state.testSurface = 'result'
    return
  }

  state.homeMode = true
}

function getDemoMode(): string | null {
  const params = new URL(window.location.href).searchParams
  const demoParam = params.get('demo')

  if (demoParam) {
    return demoParam === '1' ? 'home' : demoParam
  }

  const hash = window.location.hash.replace(/^#/, '')

  if (!hash) {
    return null
  }

  if (hash === 'demo') {
    return 'home'
  }

  if (hash.startsWith('demo-')) {
    return hash.slice('demo-'.length) || 'home'
  }

  return null
}

function createDemoWorkspace(): WorkspaceSnapshot {
  const now = Date.now()
  const classroom: FolderRecord = {
    ...createFolderRecord('Batch A', 'classroom', null, FOLDER_ACCENTS[0], now - 11_000),
    id: 'demo-class',
  }
  const student: FolderRecord = {
    ...createFolderRecord('Riya', 'student', classroom.id, FOLDER_ACCENTS[1], now - 10_000),
    id: 'demo-student',
  }
  const test: FolderRecord = {
    ...createFolderRecord('Monday Test - 21 Aug', 'test', student.id, FOLDER_ACCENTS[2], now - 9_000),
    id: 'demo-test',
  }
  test.scoreEntries = [
    buildScoreEntryPatch({
      ...createScoreEntry(now - 6_000),
      label: 'Q1',
      awardedRaw: '4',
      possibleRaw: '5',
      note: 'Method mark',
    }),
    buildScoreEntryPatch({
      ...createScoreEntry(now - 5_000),
      label: 'Q2',
      awardedRaw: '8',
      possibleRaw: '10',
      note: 'Neater working',
    }),
    buildScoreEntryPatch({
      ...createScoreEntry(now - 4_000),
      label: 'Q3',
      awardedRaw: '6.5',
      possibleRaw: '7',
      note: 'Half mark retained',
    }),
  ]
  test.lastSharedAt = now - 1_000

  const sheets = Array.from({ length: 6 }, (_, index) => createDemoSheet(test.id, index))
  sheets[0].selectedForAi = true
  sheets[0].markedAt = now - 3_000
  sheets[1].markedAt = now - 2_500
  sheets[2].markedAt = now - 2_000

  return {
    id: 'workspace',
    folders: [classroom, student, test],
    sheets,
    settings: {
      aiModel: 'gpt-5',
    },
    createdAt: now - 12_000,
    updatedAt: now,
  }
}

function createDemoSheet(folderId: string, index: number): SheetRecord {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1550" viewBox="0 0 1100 1550">
      <rect width="1100" height="1550" fill="white"/>
      <rect x="78" y="90" width="944" height="48" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
      <rect x="78" y="170" width="280" height="16" rx="8" fill="#cbd5e1"/>
      <rect x="780" y="170" width="180" height="16" rx="8" fill="#cbd5e1"/>
      <g font-family="Arial, sans-serif" fill="#0f172a" font-size="34">
        <text x="90" y="126">Paper Review Desk Demo</text>
        <text x="90" y="250">Question ${index + 1}. Solve the geometry expression shown below.</text>
      </g>
      ${Array.from({ length: 10 }, (_, row) => {
    const y = 320 + row * 98
    return `
          <rect x="92" y="${y}" width="900" height="2" fill="#e2e8f0"/>
          <circle cx="980" cy="${y - 12}" r="26" fill="none" stroke="#dc2626" stroke-width="4"/>
          <path d="M 710 ${y - 52} C 760 ${y - 10}, 815 ${y - 2}, 862 ${y - 40}" fill="none" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
        `
  }).join('')}
      <text x="792" y="250" font-family="Arial, sans-serif" fill="#dc2626" font-size="46">9${index}</text>
    </svg>
  `.trim()
  const file = new File([svg], `page-${index + 1}.svg`, { type: 'image/svg+xml' })
  const strokePoints = [
    { x: 740, y: 380, pressure: 0.7 },
    { x: 798, y: 410, pressure: 0.8 },
    { x: 856, y: 394, pressure: 0.75 },
  ]

  return {
    id: `demo-sheet-${index + 1}`,
    folderId,
    name: `Page ${index + 1}`,
    pageLabel: `Page ${index + 1}`,
    image: file,
    width: 1100,
    height: 1550,
    sortOrder: index,
    strokes:
      index < 3
        ? [
          {
            id: crypto.randomUUID(),
            color: '#d14343',
            width: 10,
            opacity: 1,
            points: strokePoints,
          },
        ]
        : [],
    markedAt: null,
    selectedForAi: false,
    createdAt: Date.now() - (10 - index) * 600,
    updatedAt: Date.now() - (10 - index) * 600,
  }
}

let resizeObserver: ResizeObserver | null = null
let currentStroke: InkStroke | null = null
let currentPointerId: number | null = null
let predictedPoints: InkPoint[] = []
let previewFrameHandle = 0
let stageMountId = 0

app.addEventListener('click', handleClick)
app.addEventListener('change', handleChange)
app.addEventListener('input', handleInput)
window.addEventListener('resize', () => {
  if (state.editSession) {
    render()
    return
  }

  window.requestAnimationFrame(refreshStageCanvases)
})

void boot()

async function boot(): Promise<void> {
  if (getDemoMode()) {
    state.workspace = createDemoWorkspace()
    applyDemoScreen()
    syncSelection()
    state.isLoading = false
    state.saveTone = 'saved'
    state.saveLabel = 'Demo workspace ready.'
    render()
    return
  }

  render()

  try {
    state.workspace = await loadWorkspace()
    syncSelection()
    state.isLoading = false
    state.saveTone = 'saved'
    state.saveLabel = 'Ready for local marking.'
  } catch (error) {
    state.isLoading = false
    state.saveTone = 'error'
    state.saveLabel = getErrorMessage(error, 'Unable to open the local workspace.')
    state.flash = { tone: 'error', text: state.saveLabel }
  }

  render()
}

function handleClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null
  const actionTarget = target?.closest<HTMLElement>('[data-action]')

  if (!actionTarget) {
    return
  }

  const action = actionTarget.dataset.action

  if (!action) {
    return
  }

  void routeAction(action, actionTarget)
}

function handleInput(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLElement)) {
    return
  }

  if (target instanceof HTMLInputElement && target.dataset.field === 'home-search') {
    state.homeSearch = target.value
    render()
    return
  }

  if (target instanceof HTMLInputElement && target.dataset.field === 'folder-name') {
    state.folderDraftName = target.value
    return
  }

  if (target instanceof HTMLInputElement && target.dataset.field === 'openai-key') {
    state.aiApiKey = target.value
    writeStoredApiKey(target.value)
    return
  }

  if (target instanceof HTMLInputElement && target.dataset.field === 'pen-width') {
    state.penWidth = Number(target.value)
    render()
    return
  }

  if (target instanceof HTMLInputElement && target.dataset.field === 'zoom') {
    state.zoom = Number(target.value)
    render()
  }
}

function handleChange(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLElement)) {
    return
  }

  if (target instanceof HTMLInputElement && target.type === 'file' && target.dataset.upload === 'test') {
    const files = target.files ? Array.from(target.files) : []
    target.value = ''

    if (files.length === 0) {
      return
    }

    void uploadSheets(files)
    return
  }

  if (target instanceof HTMLInputElement && target.dataset.action === 'toggle-ai-sheet') {
    const sheetId = target.dataset.sheetId

    if (sheetId) {
      toggleAiSelection(sheetId, target.checked)
    }

    return
  }

  if (target instanceof HTMLInputElement && target.dataset.field === 'ai-model') {
    state.workspace.settings.aiModel = target.value.trim() || 'gpt-5'
    void persistWorkspace('Saved AI settings.')
    return
  }

  if (
    target instanceof HTMLInputElement &&
    target.dataset.entryId &&
    target.dataset.scoreField
  ) {
    updateScoreField(target.dataset.entryId, target.dataset.scoreField, target.value)
  }
}

async function routeAction(action: string, target: HTMLElement): Promise<void> {
  switch (action) {
    case 'go-home':
      state.homeMode = true
      state.testSurface = 'organizer'
      state.scorePadEntryId = null
      state.scorePadBuffer = ''
      setFlash(null)
      render()
      return
    case 'quick-mark': {
      const accent = FOLDER_ACCENTS[Math.floor(Math.random() * FOLDER_ACCENTS.length)]
      const label = `Quick Check — ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
      const folder = createFolderRecord(label, 'test', null, accent)
      state.workspace.folders.unshift(folder) // Put it at the top
      state.selectedFolderId = folder.id
      state.homeMode = false
      state.testSurface = 'organizer'
      setFlash('Quick session started. Tap "Add Page" below to upload papers.', 'info')
      await persistWorkspace('Quick check session started.')
      render()
      return
    }
    case 'select-folder': {
      const folderId = target.dataset.folderId

      if (folderId) {
        selectFolder(folderId)
      }
      return
    }
    case 'open-latest-test': {
      const folderId = target.dataset.folderId

      if (folderId) {
        selectFolder(folderId)
      }
      return
    }
    case 'upload-latest-test': {
      const folderId = target.dataset.folderId

      if (folderId) {
        selectFolder(folderId)
        setFlash('Test opened. Tap Add Page to upload papers.', 'info')
        render()
      }
      return
    }
    case 'prepare-test-create':
      state.folderDraftKind = 'test'
      state.folderDraftName = state.folderDraftName || ''
      setFlash('Name the exam folder in Create, then tap Create.', 'info')
      render()
      return
    case 'prepare-student-create':
      state.folderDraftKind = 'student'
      state.folderDraftName = state.folderDraftName || ''
      setFlash('Name the student in Create, then tap Create.', 'info')
      render()
      return
    case 'back-to-student': {
      const folder = getSelectedFolder()
      const student = findStudentAncestor(state.workspace, folder?.id ?? null)

      if (student) {
        selectFolder(student.id)
      } else {
        state.homeMode = true
        render()
      }
      return
    }
    case 'open-organizer-surface': {
      const folderId = target.dataset.folderId

      if (folderId) {
        selectFolder(folderId)
      }

      state.homeMode = false
      state.testSurface = 'organizer'
      render()
      return
    }
    case 'open-scoring-surface': {
      const folderId = target.dataset.folderId

      if (folderId) {
        selectFolder(folderId)
      }

      state.homeMode = false
      state.testSurface = 'scoring'
      primeScorePadSelection()
      render()
      return
    }
    case 'open-result-surface': {
      const folderId = target.dataset.folderId

      if (folderId) {
        selectFolder(folderId)
      }

      state.homeMode = false
      state.testSurface = 'result'
      render()
      return
    }
    case 'back-to-organizer':
      state.testSurface = 'organizer'
      render()
      return
    case 'set-folder-kind': {
      const kind = target.dataset.kind as FolderKind | undefined

      if (kind) {
        state.folderDraftKind = kind
        render()
      }
      return
    }
    case 'create-folder':
      await createFolder()
      return
    case 'trigger-upload': {
      app.querySelector<HTMLInputElement>('[data-upload="test"]')?.click()
      return
    }
    case 'prev-sheet':
      stepSheet(-1)
      return
    case 'next-sheet':
      stepSheet(1)
      return
    case 'select-sheet': {
      const sheetId = target.dataset.sheetId

      if (sheetId) {
        state.selectedSheetId = sheetId
        setFlash(null)
        render()
      }
      return
    }
    case 'move-sheet-up': {
      const sheetId = target.dataset.sheetId

      if (sheetId) {
        reorderSheet(sheetId, -1)
      }
      return
    }
    case 'move-sheet-down': {
      const sheetId = target.dataset.sheetId

      if (sheetId) {
        reorderSheet(sheetId, 1)
      }
      return
    }
    case 'remove-sheet': {
      const sheetId = target.dataset.sheetId

      if (sheetId) {
        await removeSheet(sheetId)
      }
      return
    }
    case 'set-color': {
      const color = target.dataset.color

      if (color) {
        state.penColor = color
        state.editTool = 'pen'
        render()
      }
      return
    }
    case 'set-edit-tool': {
      const tool = target.dataset.tool as 'pen' | 'hand' | undefined
      if (tool) {
        state.editTool = tool
        render()
      }
      return
    }
    case 'set-zoom': {
      const zoomValue = target.dataset.zoomValue
      if (zoomValue) {
        state.zoom = Number(zoomValue)
        render()
      }
      return
    }
    case 'download-sheet':
      await downloadSelectedSheet()
      return
    case 'open-edit-mode':
      openEditMode()
      return
    case 'save-edit-mode':
      await saveEditMode()
      return
    case 'cancel-edit-mode':
      cancelEditMode()
      return
    case 'undo-edit-stroke':
      undoEditStroke()
      return
    case 'clear-edit-strokes':
      clearEditStrokes()
      return
    case 'share-marked':
      await shareMarkedSheets()
      return
    case 'share-current-sheet':
      await shareCurrentSheet()
      return
    case 'add-score-entry':
      await addScoreEntry()
      return
    case 'select-score-entry': {
      const entryId = target.dataset.entryId

      if (entryId) {
        selectScoreEntry(entryId)
      }
      return
    }
    case 'score-key': {
      const key = target.dataset.key ?? ''

      if (key) {
        applyScorePadKey(key)
      }
      return
    }
    case 'score-backspace':
      scorePadBackspace()
      return
    case 'score-clear':
      clearScorePad()
      return
    case 'score-enter':
      await commitScorePad()
      return
    case 'remove-score-entry': {
      const entryId = target.dataset.entryId

      if (entryId) {
        await removeScoreEntry(entryId)
      }
      return
    }
    case 'run-ai-scores':
      await runAiScores()
      return
    case 'reset-workspace':
      await resetWorkspace()
      return
    default:
      return
  }
}

function render(): void {
  const selectedFolder = getSelectedFolder()
  const selectedSheet = getSelectedSheet()
  const editingSheet = getEditingSheet()
  const testFolder = selectedFolder?.kind === 'test' ? selectedFolder : null
  const sheets = getSheetsInFolder(state.workspace, testFolder?.id ?? null)
  const scoreTotals = testFolder ? calculateScoreTotals(testFolder.scoreEntries) : null
  const studentAncestor = findStudentAncestor(state.workspace, selectedFolder?.id ?? null)
  const history = selectedFolder ? getFolderHistory(state.workspace, selectedFolder.id) : []
  const historySummary = getFolderAnalyticsSummary(history)
  const portrait = isPortraitViewport()

  document.body.style.overflow = ''
  let screen = ''

  if (state.homeMode || !selectedFolder) {
    screen = renderHomeDashboard(portrait)
  } else if (selectedFolder.kind === 'test') {
    if (state.testSurface === 'scoring') {
      screen = renderTestScoringScreen(selectedFolder, sheets, selectedSheet, scoreTotals, portrait)
    } else if (state.testSurface === 'result') {
      screen = renderTestResultScreen(selectedFolder, sheets, selectedSheet, scoreTotals, portrait)
    } else {
      screen = renderTestOrganizerScreen(selectedFolder, sheets, selectedSheet, scoreTotals, portrait)
    }
  } else {
    screen = renderStudentHistoryScreen(
      selectedFolder,
      history,
      historySummary,
      studentAncestor,
      portrait,
    )
  }

  app.innerHTML = `
    <div class="screen-root">
      ${state.flash
      ? `<div class="flash-banner flash-banner-global" data-tone="${state.flash.tone}">${escapeHtml(state.flash.text)}</div>`
      : ''
    }
      ${screen}
    </div>
    ${editingSheet ? renderEditOverlay(editingSheet) : ''}
  `

  attachStageLayers()
}

function renderWorkspaceShell(content: string, className = ''): string {
  return `
    <section class="workspace-shell ${className}">
      ${renderWorkspaceSidebar()}
      <div class="workspace-shell-main">
        ${content}
      </div>
    </section>
  `
}

function renderWorkspaceSidebar(): string {
  const classes = state.workspace.folders
    .filter((f) => f.kind === 'classroom')
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  const recentTests = state.workspace.folders
    .filter((f) => f.kind === 'test')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 4)

  const query = state.homeSearch.trim().toLowerCase()

  return `
    <aside class="workspace-sidebar" ${isPortraitViewport() && !state.homeMode && state.selectedFolderId ? 'style="display:none;"' : ''}>
      ${renderStitchCreatePanel()}
      <div style="padding:10px 0 2px;">
        <div class="stitch-sidebar-search-wrap">
          <svg style="color:var(--muted-soft); width:14px; height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            data-field="home-search"
            value="${escapeHtml(state.homeSearch)}"
            placeholder="Search students or tests"
          />
        </div>
      </div>

      <div style="padding:2px 0;">
        <p class="stitch-sidebar-section-label">Students</p>
        ${classes.length === 0
      ? '<p class="empty-copy" style="padding:4px 4px 8px;">Create a class first, then add students and exam folders.</p>'
      : classes
        .map((classroom) => {
          const students = getChildFolders(state.workspace, classroom.id)
            .filter((f) => f.kind === 'student')
          const filteredStudents = !query
            ? students
            : students.filter((s) => s.name.toLowerCase().includes(query))

          if (query && filteredStudents.length === 0) return ''

          const tests = getDescendantTests(state.workspace, classroom.id)
          const pending = tests.filter(
            (tf) => getTestStatusMeta(tf).tone !== 'success',
          ).length
          const classCountBadgeTone = pending > 0 ? 'warning' : 'success'

          return `
                    <div class="stitch-class-group">
                      <button
                        class="stitch-class-group-header"
                        data-action="select-folder"
                        data-folder-id="${classroom.id}"
                        style="border:none;background:transparent;width:100%;text-align:left;"
                      >
                        <span style="font-size:0.78rem;color:var(--muted-soft);margin-right:2px;">▾</span>
                        <strong>${escapeHtml(classroom.name)}</strong>
                        <span
                          class="stitch-class-badge"
                          style="${classCountBadgeTone === 'warning' ? 'background:#fff7ed;color:#b45309;' : ''}"
                        >${students.length}</span>
                      </button>
                      <div class="stitch-student-list">
                        ${filteredStudents
              .map((student) => {
                const studentTests = getDescendantTests(state.workspace, student.id)
                const studentPending = studentTests.filter(
                  (tf) => getTestStatusMeta(tf).tone !== 'success',
                ).length
                const dot =
                  studentPending === 0 && studentTests.length > 0
                    ? 'success'
                    : studentPending > 0
                      ? 'warning'
                      : 'idle'
                const subLabel =
                  studentPending === 0
                    ? `${studentTests.length} test${studentTests.length === 1 ? '' : 's'}`
                    : `${studentPending} to mark`

                return `
                              <button
                                class="stitch-student-item"
                                data-action="select-folder"
                                data-folder-id="${student.id}"
                              >
                                <span class="stitch-student-avatar">${escapeHtml(student.name.slice(0, 1).toUpperCase())}</span>
                                <span class="stitch-student-copy">
                                  <strong>${escapeHtml(student.name)}</strong>
                                  <span>${subLabel}</span>
                                </span>
                                <span class="stitch-status-dot" data-tone="${dot}"></span>
                              </button>
                            `
              })
              .join('')}
                      </div>
                    </div>
                  `
        })
        .join('')
    }
      </div>

      ${recentTests.length === 0
      ? ''
      : `
          <div style="padding:2px 0;">
            <p class="stitch-sidebar-section-label">Recent Tests</p>
            ${recentTests
        .map((tf) => {
          const student = findStudentAncestor(state.workspace, tf.id)
          const status = getTestStatusMeta(tf)
          const totals = calculateScoreTotals(tf.scoreEntries)
          return `
                  <button
                    class="stitch-recent-test-item"
                    data-action="select-folder"
                    data-folder-id="${tf.id}"
                  >
                    <strong>${escapeHtml(tf.name)}</strong>
                    <div class="stitch-meta-row">
                      <span>${escapeHtml(student?.name ?? 'Student')}</span>
                      <span>${totals.percent !== null ? `${totals.percent}%` : status.label}</span>
                    </div>
                  </button>
                `
        })
        .join('')}
          </div>
        `
    }
    </aside>
  `
}


function renderHomeDashboard(portrait: boolean): string {
  const tests = state.workspace.folders
    .filter((folder) => folder.kind === 'test')
    .sort((left, right) => right.updatedAt - left.updatedAt)
  const query = state.homeSearch.trim().toLowerCase()
  const featuredTests = tests
    .filter((testFolder) => {
      if (!query) return true
      const student = findStudentAncestor(state.workspace, testFolder.id)
      return (
        testFolder.name.toLowerCase().includes(query) ||
        student?.name.toLowerCase().includes(query)
      )
    })
    .slice(0, portrait ? 4 : 8)

  const mainContent = `
    <section class="screen-home workspace-home-surface ${portrait ? 'is-portrait' : ''}" >
      <div class="stitch-home-header" >
        <h2>All Tests & Copies</h2>
        <button class="primary-button quick-start-btn" data-action="quick-mark">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Quick Start Marking
        </button>
      </div>
      ${featuredTests.length === 0
      ? renderHomeEmptyCard()
      : `<div class="stitch-today-grid">
               ${featuredTests.map((tf) => renderHomeTaskCard(tf, false)).join('')}
             </div>`
    }
  </section>
    `

  return renderWorkspaceShell(mainContent)
}


function renderHomeTaskCard(folder: FolderRecord, _compact: boolean): string {
  const student = findStudentAncestor(state.workspace, folder.id)
  const classroom = findClassAncestor(state.workspace, folder.id)
  const sheets = getSheetsInFolder(state.workspace, folder.id)
  const markedCount = countMarkedSheets(state.workspace, folder.id)
  const fillPercent = sheets.length > 0 ? Math.round((markedCount / sheets.length) * 100) : 0
  const status = getTestStatusMeta(folder)
  const isDone = status.label === 'Shared' || status.label === 'Scored'
  const studentsLeft = Math.max(0, sheets.length - markedCount)

  return `
    <article class="stitch-task-card" >
      <div class="stitch-task-card-head" >
        <h3>${escapeHtml(folder.name)} </h3>
          <p > ${escapeHtml(classroom?.name ?? student?.name ?? 'Exam')} </p>
            </div>
            <div >
            <div class="stitch-task-progress-track" >
              <div class="stitch-task-progress-fill" style = "width:${fillPercent}%;" > </div>
                </div>
                <p class="stitch-task-progress-label" >
                  ${markedCount === sheets.length && sheets.length > 0
      ? `All ${sheets.length} students marked`
      : `${markedCount} of ${sheets.length} students marked`
    }
  </p>
    </div>
    <div class="stitch-task-card-footer" >
      <button
          class="stitch-mark-btn ${isDone ? 'is-review' : ''}"
  data-action="${isDone ? 'open-result-surface' : 'select-folder'}"
  data-folder-id="${folder.id}"
    >
    ${isDone ? 'Review Marks' : 'Mark Now'}
  </button>
    <span class="stitch-students-left" > ${isDone ? '' : `${studentsLeft} student${studentsLeft === 1 ? '' : 's'} left`} </span>
      </div>
      </article>
        `
}

function renderHomeTaskCardLegacy(folder: FolderRecord, compact: boolean): string {
  const student = findStudentAncestor(state.workspace, folder.id)
  const classroom = findClassAncestor(state.workspace, folder.id)
  const sheets = getSheetsInFolder(state.workspace, folder.id)
  const markedCount = countMarkedSheets(state.workspace, folder.id)
  const percent = sheets.length > 0 ? Math.round((markedCount / sheets.length) * 100) : 0
  const status = getTestStatusMeta(folder)
  const cta = status.label === 'Shared' || status.label === 'Scored' ? 'Review Marks' : 'Mark'

  return `
      <article class="home-task-card ${compact ? 'is-compact' : ''}" >
        <div class="home-task-copy" >
          <h3>${escapeHtml(folder.name)} </h3>
            <p > ${escapeHtml([student?.name, classroom?.name].filter(Boolean).join(' · ') || 'Class exam')} </p>
              <div class="progress-rail" >
                <span style="width:${percent}%;" > </span>
                  </div>
                  <div class="home-task-meta" >
                    <span>${markedCount} of ${sheets.length || 0} pages marked </span>
                      <span > ${Math.max(0, sheets.length - markedCount)} left </span>
                        </div>
                        </div>
                        <button
  class="primary-button home-card-button"
  data-action="${status.label === 'Shared' || status.label === 'Scored' ? 'open-result-surface' : 'select-folder'}"
  data-folder-id="${folder.id}"
    >
    ${cta}
  </button>
    </article>
      `
}

void renderHomeTaskCardLegacy
void renderHomeStudentRow

function renderHomeStudentRow(student: FolderRecord): string {
  const students = getChildFolders(state.workspace, student.id).filter((folder) => folder.kind === 'student')
  const tests = getDescendantTests(state.workspace, student.id)
  const pending = tests.filter((testFolder) => getTestStatusMeta(testFolder).tone !== 'success').length
  const statusLabel =
    pending === 0
      ? `${students.length} student${students.length === 1 ? '' : 's'} ready`
      : `${pending} exam${pending === 1 ? '' : 's'} to review`
  const tone = pending === 0 ? 'success' : pending > 1 ? 'warning' : 'idle'

  return `
    <button class="home-student-row" data-action="select-folder" data-folder-id="${student.id}" >
      <span class="home-student-avatar" > ${escapeHtml(student.name.slice(0, 1).toUpperCase())} </span>
        <span class="home-student-copy" >
          <strong>${escapeHtml(student.name)} </strong>
            <span > ${statusLabel} </span>
              </span>
              <span class="home-status-dot" data-tone="${tone}" > </span>
                </button>
                  `
}

function renderStitchCreatePanel(): string {
  const placeholder =
    state.folderDraftKind === 'classroom'
      ? 'E.g. Math 101'
      : state.folderDraftKind === 'student'
        ? 'Student name'
        : 'Exam name'

  return `
    <div class="stitch-create-panel">
      <p class="stitch-create-label">Create New</p>
      <div class="stitch-create-actions">
        <button
          class="stitch-create-btn${state.folderDraftKind === 'classroom' ? ' is-active' : ''}"
          data-action="set-folder-kind"
          data-kind="classroom"
        >+ Class</button>
        <button
          class="stitch-create-btn${state.folderDraftKind === 'student' ? ' is-active' : ''}"
          data-action="set-folder-kind"
          data-kind="student"
        >+ Student</button>
        <button
          class="stitch-create-btn${state.folderDraftKind === 'test' ? ' is-active' : ''}"
          data-action="set-folder-kind"
          data-kind="test"
        >+ Exam</button>
      </div>
      <div class="stitch-create-inline-form">
        <input
          class="text-input"
          type="text"
          data-field="folder-name"
          value="${escapeHtml(state.folderDraftName)}"
          placeholder="${placeholder}"
          autocomplete="off"
        />
        <button data-action="create-folder">Add</button>
      </div>
    </div>
  `
}

function renderHomeEmptyCard(): string {
  return `
    <div class="home-empty-card">
      <p class="section-kicker">Workspace setup</p>
      <h3>Create a class, add students, then open each exam to check copies.</h3>
      <p class="supporting-copy">Each class contains students. Each student contains exam folders. Open the exam folder to upload and check that student's copies.</p>
    </div>
  `
}


function renderStudentHistoryScreen(
  folder: FolderRecord,
  history: ReturnType<typeof getFolderHistory>,
  historySummary: ReturnType<typeof getFolderAnalyticsSummary>,
  _studentAncestor: FolderRecord | null,
  portrait: boolean,
): string {
  const classAncestor = findClassAncestor(state.workspace, folder.id)
  const students = getChildFolders(state.workspace, folder.id).filter((item) => item.kind === 'student')
  const tests = getDescendantTests(state.workspace, folder.id)
  const latestTest = tests[0] ?? null
  const isClassView = folder.kind === 'classroom'

  return renderWorkspaceShell(`
            <section class="screen-student-history ${portrait ? 'is-portrait' : ''}" >
              <div class="student-shell-main" >
                <header class="student-history-header" >
                  <div>
                  <div class="breadcrumb-row breadcrumb-row-tight" >
                    <button class="breadcrumb-back" data-action="go-home" > Workspace </button>
                      <span class="breadcrumb-pill" > ${escapeHtml(isClassView ? folder.name : classAncestor?.name ?? folder.name)} </span>
                        </div>
                        <h2> ${escapeHtml(isClassView ? `${folder.name}: Students` : `${folder.name}: Exams`)} </h2>
                          </div>
                          <div class="student-history-actions" >
                            ${isClassView
      ? `
                  <button class="primary-button" data-action="prepare-student-create">
                    Add Student
                  </button>
                `
      : latestTest
        ? `
                  <button
                    class="primary-button"
                    data-action="open-latest-test"
                    data-folder-id="${latestTest.id}"
                  >
                    Open Latest Exam
                  </button>
                `
        : `
                  <button class="primary-button" data-action="prepare-test-create">
                    Create Exam Folder
                  </button>
                `
    }
  <button class="subtle-button" data-action="${isClassView ? 'prepare-student-create' : 'prepare-test-create'}" > ${isClassView ? 'New Student' : 'New Exam Folder'} </button>
    </div>
    </header>
    <div class="student-history-timeline" >
      ${isClassView
      ? students.length === 0
        ? `
                  <div class="history-empty-panel student-empty-panel">
                    <div>
                      <p class="section-kicker">No students yet</p>
                      <h3>Add students inside ${escapeHtml(folder.name)}.</h3>
                      <p class="supporting-copy">After that, open each student and create an exam folder for their copies.</p>
                    </div>
                  </div>
                `
        : students
          .map(
            (student) => `
                        <button class="timeline-row" data-action="select-folder" data-folder-id="${student.id}">
                          <span class="timeline-rail is-last">
                            <span class="timeline-dot" data-tone="info"></span>
                          </span>
                          <span class="timeline-content">
                            <span class="timeline-row-main">
                              <span class="overview-copy">
                                <strong>${escapeHtml(student.name)}</strong>
                                <span class="timeline-meta">${getDescendantTests(state.workspace, student.id).length} exam${getDescendantTests(state.workspace, student.id).length === 1 ? '' : 's'}</span>
                              </span>
                              <span class="status-badge" data-tone="info">Open student</span>
                            </span>
                          </span>
                        </button>
                      `,
          )
          .join('')
      : tests.length === 0
        ? `
                <div class="history-empty-panel student-empty-panel">
                  <div>
                    <p class="section-kicker">No exams yet</p>
                    <h3>No exam folders found for ${escapeHtml(folder.name)}.</h3>
                    <p class="supporting-copy">Create an exam folder for this student, then upload the exam copies there.</p>
                    <div class="empty-panel-actions">
                      <button class="primary-button" data-action="prepare-test-create">Create Exam Folder</button>
                    </div>
                  </div>
                </div>
              `
        : tests.map((testFolder, index) => renderHistoryTimelineRow(testFolder, index, tests.length)).join('')
    }
  <div class="history-empty-panel student-tail-panel" >
    <div>
    <p class="section-kicker" > Next batch </p>
      <h3 > ${isClassView ? `Add the next student to ${escapeHtml(folder.name)}.` : tests.length === 0 ? `Start ${escapeHtml(folder.name)}'s first exam.` : `No more exams found for ${escapeHtml(folder.name)}.`} </h3>
        <p class="supporting-copy" > ${isClassView ? 'Each student gets their own exam folders and checked copies.' : 'Use the left rail to create the next exam folder and keep the full checking history clean.'} </p>
          </div>
          </div>
          </div>
          </div>

          <aside class="student-shell-summary" >
            <div class="overview-section" >
              <div class="section-heading" >
                <p class="section-kicker" > ${isClassView ? 'Class summary' : 'Student summary'} </p>
                  <span class="section-caption" > ${escapeHtml(getFolderLabel(folder.kind))} </span>
                    </div>
                    <div class="metric-stack" >
                      <div class="metric-line" > <span>${isClassView ? 'Students' : 'Exams scored'} </span><strong>${isClassView ? students.length : historySummary.testsWithScores}</strong> </div>
                        <div class="metric-line" > <span>Pending checking </span><strong>${tests.filter((testFolder) => getTestStatusMeta(testFolder).tone !== 'success').length}</strong> </div>
                          <div class="metric-line" > <span>Overall average </span><strong>${historySummary.averagePercent === null ? 'Not yet' : `${historySummary.averagePercent}%`}</strong> </div>
                            </div>
                            </div>
                            <div class="overview-section" >
                              <div class="section-heading" >
                                <p class="section-kicker" > Recent activity </p>
                                  <span class="section-caption" > ${history.length} </span>
                                    </div>
          ${history.length === 0
      ? '<p class="empty-copy">Shared and scored tests will appear here after the first completed result.</p>'
      : history
        .slice(0, 3)
        .map(
          ({ folder: testFolder, totals }) => `
                      <button class="history-row compact-history" data-action="select-folder" data-folder-id="${testFolder.id}">
                        <span class="history-title">${escapeHtml(testFolder.name)}</span>
                        <span class="history-percent">${totals.percent === null ? 'Needs review' : `${totals.percent}%`}</span>
                      </button>
                    `,
        )
        .join('')
    }
  </div>
    </aside>
    </section>
      `)
}

function renderTestOrganizerScreen(
  folder: FolderRecord,
  sheets: SheetRecord[],
  selectedSheet: SheetRecord | null,
  scoreTotals: ReturnType<typeof calculateScoreTotals> | null,
  portrait: boolean,
): string {
  const student = findStudentAncestor(state.workspace, folder.id)
  const classroom = findClassAncestor(state.workspace, folder.id)
  const activeSheet = selectedSheet ?? sheets[0] ?? null

  return renderWorkspaceShell(`
    <section class="screen-organizer ${portrait ? 'is-portrait' : ''}" >
      <header class="surface-topbar" >
        <div class="surface-topbar-start" >
          <button class="icon-square" data-action="${portrait ? 'go-home' : 'back-to-student'}" > ${portrait ? 'Menu' : 'Back'} </button>
          ${portrait ? '' : '<span>Workspace</span>'}
  </div>
    <h2> ${escapeHtml(folder.name)} </h2>
      <div class="surface-topbar-end" >
        <button class="primary-button" data-action="open-edit-mode" ${activeSheet ? '' : 'disabled'}> Check Copy </button>
          </div>
          </header>
          <div class="organizer-layout" >
            <div class="organizer-board" >
              ${sheets.length === 0
      ? `
                <div class="organizer-empty">
                  <p class="section-kicker">Page organizer</p>
                  <h3>Upload this student's exam copies to begin checking.</h3>
                  <p class="supporting-copy">Add all pages for this exam here, arrange them, then open each copy for checking and marking.</p>
                </div>
              `
      : `
                <div class="organizer-grid stitch-organizer-grid">
                  ${sheets.map((sheet, index) => renderPageOrganizerCard(sheet, index, sheet.id === selectedSheet?.id, sheets.length)).join('')}
                </div>
              `
    }
  <div class="organizer-bottom-bar" >
    ${portrait ? '<button class="subtle-button stretch-button">Reorder Pages</button>' : ''}
  <button class="primary-button organizer-add-button" data-action="trigger-upload" > Add Page </button>
    </div>
    <input class="hidden-file-input" type = "file" accept = "image/*" multiple data-upload="test" />
      </div>
      <aside class="organizer-detail-card" >
        <div class="organizer-detail-head" >
          <h3>Test Details </h3>
            </div>
            <div class="section-heading" >
              <p class="section-kicker" > Metadata </p>
                <span class="section-caption" > ${escapeHtml(student?.name ?? 'Student')} </span>
                  </div>
                  <div class="metric-stack" >
                    <div class="metric-line" > <span>Class </span><strong>${escapeHtml(classroom?.name ?? 'Class')}</strong> </div>
                      <div class="metric-line" > <span>Date Taken </span><strong>${formatDate(folder.createdAt)}</strong> </div>
                        <div class="metric-line" > <span>Max Marks </span><strong>${scoreTotals?.possibleTotal === null || !scoreTotals ? 'Unknown' : formatScoreValue(scoreTotals.possibleTotal)}</strong> </div>
                          <div class="metric-line" > <span>Student </span><strong>${escapeHtml(student?.name ?? 'Workspace')}</strong> </div>
                            <div class="metric-line" > <span>Pages </span><strong>${sheets.length}</strong> </div>
                              </div>
          ${activeSheet
      ? `
                <div class="selected-page-callout selected-page-callout-tall">
                  <img src="${getObjectUrl(activeSheet)}" alt="" />
                  <div class="overview-copy">
                    <span class="section-kicker">Selected page</span>
                    <strong>${escapeHtml(activeSheet.pageLabel || activeSheet.name)}</strong>
                    <span>${activeSheet.strokes.length > 0 ? 'Checked copy' : 'Ready to check'}</span>
                  </div>
                </div>
              `
      : ''
    }
  <div class="organizer-detail-actions" >
    <button class="primary-button stretch-button" data-action="open-edit-mode" ${activeSheet ? '' : 'disabled'}> Check Copy </button>
      <button class="subtle-button stretch-button" data-action="open-scoring-surface" > Scoring & Totals </button>
        </div>
        </aside>
        </div>
        </section>
          `, 'workspace-test-shell')
}

function renderTestScoringScreen(
  folder: FolderRecord,
  sheets: SheetRecord[],
  selectedSheet: SheetRecord | null,
  scoreTotals: ReturnType<typeof calculateScoreTotals> | null,
  portrait: boolean,
): string {
  const activeEntry = getActiveScoreEntry(folder)
  const activeSheet = selectedSheet ?? sheets[0] ?? null
  const currentValue = activeEntry?.awardedRaw || state.scorePadBuffer || '0'
  const currentPossible = activeEntry?.possibleRaw || '5'
  const currentIndex = activeSheet ? sheets.findIndex((sheet) => sheet.id === activeSheet.id) : -1

  return renderWorkspaceShell(`
        <section class="screen-scoring ${portrait ? 'is-portrait' : ''}" >
          <header class="surface-topbar" >
            <div class="surface-topbar-start" >
              <button class="icon-square" data-action="back-to-organizer" > Back </button>
                <span > ${portrait ? 'Marks and Totals Panel' : 'Teacher Workspace'} </span>
                  </div>
                  <h2> ${portrait ? '' : escapeHtml(folder.name)} </h2>
                    <div class="surface-topbar-end" >
                      <button class="subtle-button" data-action="open-result-surface" > Result </button>
                        </div>
                        </header>
                        <div class="scoring-layout" >
                          <div class="scoring-stage-column" >
                            <div class="scoring-floating-toolbar" >
                              <button class="toolbar-chip is-active" > Select </button>
                                <button class="toolbar-chip" data-action="open-edit-mode" > Pen </button>
                                  <button class="toolbar-chip" > Erase </button>
                                    <button class="toolbar-chip" data-action="download-sheet" ${activeSheet ? '' : 'disabled'}> Save </button>
                                      <button class="toolbar-chip" data-action="prev-sheet" ${currentIndex <= 0 ? 'disabled' : ''}> Prev </button>
                                        <button class="toolbar-chip" data-action="next-sheet" ${currentIndex < 0 || currentIndex >= sheets.length - 1 ? 'disabled' : ''}> Next </button>
                                          </div>
                                          <div class="scoring-stage-shell" >
                                            ${activeSheet
      ? `
                  <div class="stage-scroll scoring-stage-scroll">
                    <div class="stage-frame scoring-stage-frame" data-stage-frame style="aspect-ratio:${activeSheet.width} / ${activeSheet.height};">
                      <img id="stage-image" src="${getObjectUrl(activeSheet)}" alt="${escapeHtml(activeSheet.name)}" />
                      <canvas id="ink-layer"></canvas>
                    </div>
                  </div>
                `
      : `
                  <div class="organizer-empty">
                    <p class="section-kicker">Choose a page</p>
                    <h3>Select a page from the organizer before scoring.</h3>
                  </div>
                `
    }
  </div>
    </div>
    <aside class="stitch-score-panel" >
      <div class="stitch-score-panel-head" >
        <h3>Scoring & Totals </h3>
          <button class="icon-square" data-action="open-result-surface" title = "View result" ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div class="stitch-score-current-banner" >
              <span>${escapeHtml(activeEntry?.label || 'No question selected')} </span>
                <span class="stitch-score-current-value" > ${escapeHtml(currentValue || '—')} / ${escapeHtml(currentPossible)}</span >
                  </div>
                  <div class="stitch-keypad" >
                    ${['7', '8', '9', '4', '5', '6', '1', '2', '3']
      .map(
        (key) =>
          `<button class="stitch-key" data-action="score-key" data-key="${key}">${key}</button>`,
      )
      .join('')
    }
  <button class="stitch-key" data-action="score-key" data-key="." >.</button>
    <button class="stitch-key" data-action="score-key" data-key="0" > 0 </button>
      <button class="stitch-key stitch-key-enter" data-action="score-enter" > ENTER </button>
        </div>
        <div style = "padding:6px 14px;background:#0f2744;display:flex;gap:6px;" >
          <button class="subtle-button" data-action="score-backspace" style = "flex:1;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.07);border-color:transparent;" >⌫ Back </button>
            <button class="subtle-button" data-action="score-clear" style = "flex:1;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.07);border-color:transparent;" > Clear </button>
              </div>
              <div class="stitch-score-question-list" >
                <h4>Question Scores(${folder.scoreEntries.length}) </h4>
            ${folder.scoreEntries.length === 0
      ? '<p class="empty-copy" style="padding:4px 0 0;">Add the first score row, then use the keypad above to enter marks.</p>'
      : folder.scoreEntries
        .map(
          (entry) => `
                      <button
                        class="stitch-score-list-row"
                        data-action="select-score-entry"
                        data-entry-id="${entry.id}"
                        data-active="${entry.id === state.scorePadEntryId}"
                      >
                        <strong>${escapeHtml(entry.label || 'Question')}</strong>
                        <span>${escapeHtml(entry.awardedRaw || '—')} / ${escapeHtml(entry.possibleRaw || '—')}</span>
                      </button>
                    `,
        )
        .join('')
    }
  </div>
    <div class="stitch-score-total-row" >
      <span>Total Score </span>
        <span class="stitch-score-total-percent" >
          ${scoreTotals?.percent === null || !scoreTotals
      ? `${formatScoreValue(scoreTotals?.awardedTotal ?? 0)} pts`
      : `${formatScoreValue(scoreTotals.awardedTotal)} / ${formatScoreValue(scoreTotals.possibleTotal ?? 0)} (${scoreTotals.percent}%)`
    }
  </span>
    </div>
    <div class="stitch-score-panel-actions" >
      <button class="stitch-save-next-btn" data-action="open-result-surface" > Save & View Results </button>
        <button class="subtle-button stretch-button" data-action="add-score-entry" > + Add Question </button>
          </div>
          </aside>
          </div>
          </section>
            `, 'workspace-test-shell')
}

function renderTestResultScreen(
  folder: FolderRecord,
  sheets: SheetRecord[],
  selectedSheet: SheetRecord | null,
  scoreTotals: ReturnType<typeof calculateScoreTotals> | null,
  portrait: boolean,
): string {
  const student = findStudentAncestor(state.workspace, folder.id)
  const classroom = findClassAncestor(state.workspace, folder.id)

  return renderWorkspaceShell(`
          <section class="screen-result ${portrait ? 'is-portrait' : ''}" >
            <header class="surface-topbar" >
              <div class="surface-topbar-start" >
                <button class="icon-square" data-action="back-to-organizer" > Back </button>
                  </div>
                  <h2> Test Result </h2>
                    <div class="surface-topbar-end" >
                      <button class="primary-button" data-action="go-home" > Done </button>
                        </div>
                        </header>
                        <div style = "padding:var(--space-4);" >
                          ${renderTestResultSummaryCard(folder, sheets, selectedSheet, scoreTotals)}
        ${scoreTotals?.percent !== null && scoreTotals !== null
      ? ''
      : `
            <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
              <button class="subtle-button" data-action="run-ai-scores" ${state.aiBusy ? 'disabled' : ''}>${state.aiBusy ? 'Calculating...' : 'Calculate Marks from AI'}</button>
              <button class="subtle-button" data-action="back-to-organizer">Back to Exam</button>
            </div>
            <div style="margin-top:12px;font-size:0.8rem;color:var(--muted);">
              ${[classroom?.name, student?.name, folder.name].filter(Boolean).join(' / ')}
            </div>
          `}
  </div>
    </section>
      `, 'workspace-test-shell')
}

function isPortraitViewport(): boolean {
  return window.innerHeight > window.innerWidth
}

function getActiveScoreEntry(folder: FolderRecord): ScoreEntry | null {
  const active =
    folder.scoreEntries.find((entry) => entry.id === state.scorePadEntryId) ??
    folder.scoreEntries[0] ??
    null

  if (active && active.id !== state.scorePadEntryId) {
    state.scorePadEntryId = active.id
    state.scorePadBuffer = active.awardedRaw
  }

  return active
}

function primeScorePadSelection(): void {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  const entry = getActiveScoreEntry(folder)
  state.scorePadEntryId = entry?.id ?? null
  state.scorePadBuffer = entry?.awardedRaw ?? ''
}

function selectScoreEntry(entryId: string): void {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  const entry = folder.scoreEntries.find((item) => item.id === entryId)

  if (!entry) {
    return
  }

  state.scorePadEntryId = entry.id
  state.scorePadBuffer = entry.awardedRaw
  render()
}

function applyScorePadKey(key: string): void {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  if (!state.scorePadEntryId && folder.scoreEntries.length > 0) {
    state.scorePadEntryId = folder.scoreEntries[0].id
  }

  if (key === '.' && state.scorePadBuffer.includes('.')) {
    return
  }

  state.scorePadBuffer = `${state.scorePadBuffer}${key} `
  render()
}

function scorePadBackspace(): void {
  state.scorePadBuffer = state.scorePadBuffer.slice(0, -1)
  render()
}

function clearScorePad(): void {
  state.scorePadBuffer = ''
  render()
}

async function commitScorePad(): Promise<void> {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  const activeEntry = getActiveScoreEntry(folder)

  if (!activeEntry) {
    await addScoreEntry()
    return
  }

  folder.scoreEntries = folder.scoreEntries.map((entry) => {
    if (entry.id !== activeEntry.id) {
      return entry
    }

    return buildScoreEntryPatch({
      ...entry,
      awardedRaw: state.scorePadBuffer,
    })
  })

  await persistWorkspace('Score entry saved.')
}

function renderWorkspaceHeader(
  selectedFolder: FolderRecord | null,
  selectedSheet: SheetRecord | null,
  sheets: SheetRecord[],
  studentAncestor: FolderRecord | null,
): string {
  const breadcrumbs = getBreadcrumbs(state.workspace, selectedFolder?.id ?? null)
  const currentIndex = selectedSheet ? sheets.findIndex((sheet) => sheet.id === selectedSheet.id) : -1
  const markedCount =
    selectedFolder?.kind === 'test' ? countMarkedSheets(state.workspace, selectedFolder.id) : 0

  return `
    < header class="workspace-header workspace-hero" >
      <div class="header-copy" >
        <p class="eyebrow" > ${escapeHtml(selectedFolder ? `${getFolderLabel(selectedFolder.kind)} workspace` : 'Workspace home')} </p>
          <div class="breadcrumb-row" >
            <span class="breadcrumb-root" > Workspace </span>
          ${breadcrumbs.map((folder) => `<span class="breadcrumb-pill">${escapeHtml(folder.name)}</span>`).join('')}
  </div>
    <h2> ${escapeHtml(selectedFolder?.name ?? 'No folder selected')} </h2>
      <p class="supporting-copy" >
        ${selectedFolder?.kind === 'test'
      ? `One calm desk for this paper: organize the pages, jump into full-screen Pencil edit mode, then finish with scoring and sharing.`
      : studentAncestor
        ? `Review ${escapeHtml(studentAncestor.name)} across recent tests, scores, and completion state without leaving this workspace.`
        : 'Create a student, add a test inside it, then start marking from the page organizer.'
    }
  </p>
        ${selectedFolder?.kind === 'test'
      ? `
              <div class="hero-chip-row">
                <span class="info-chip">${sheets.length} page${sheets.length === 1 ? '' : 's'}</span>
                <span class="info-chip">${markedCount} marked</span>
                <span class="info-chip">${Math.max(0, sheets.length - markedCount)} waiting</span>
              </div>
            `
      : ''
    }
  </div>
    <div class="header-actions" >
      ${selectedFolder?.kind === 'test'
      ? `
              <div class="pager-group">
                <button class="subtle-button group-button" data-action="prev-sheet" ${currentIndex <= 0 ? 'disabled' : ''}>Previous</button>
                <span class="pager-label">${currentIndex >= 0 ? currentIndex + 1 : 0} / ${sheets.length}</span>
                <button class="subtle-button group-button" data-action="next-sheet" ${currentIndex < 0 || currentIndex >= sheets.length - 1 ? 'disabled' : ''}>Next</button>
              </div>
            `
      : ''
    }
  </div>
    </header>
      `
}

function renderRootEmptyState(): string {
  return `
    <section class="hero-empty home-launch" >
      <div class="empty-copy-block" >
        <p class="section-kicker" > Workspace home </p>
          <h3 > Set up one student, one test, then start marking with almost no friction.</h3>
            <p class="supporting-copy" > This desk is built around the iPad tutoring flow: receive messy photos, sort them into a test, mark one page at a time, then total and share the finished result.</p>
              </div>
              <div class="empty-steps" >
                <div class="empty-step" >
                  <strong>1 </strong>
                  <div >
                  <span>Create a student </span>
                    <p class="supporting-copy" > Use the left rail and choose Student before you create the first folder.</p>
                      </div>
                      </div>
                      <div class="empty-step" >
                        <strong>2 </strong>
                        <div >
                        <span>Add a test </span>
                          <p class="supporting-copy" > Open that student folder, switch the type to Test, and create the paper folder under it.</p>
                            </div>
                            </div>
                            <div class="empty-step" >
                              <strong>3 </strong>
                              <div >
                              <span>Upload and mark </span>
                                <p class="supporting-copy" > Choose the test folder, add pages in bulk, then open one page in full - screen edit mode.</p>
                                  </div>
                                  </div>
                                  </div>
                                  </section>
                                    `
}

function renderFolderOverview(
  folder: FolderRecord,
  history: ReturnType<typeof getFolderHistory>,
  historySummary: ReturnType<typeof getFolderAnalyticsSummary>,
): string {
  const children = getChildFolders(state.workspace, folder.id)
  const tests = getDescendantTests(state.workspace, folder.id)

  return `
                                  <section class="timeline-shell" >
                                    <div class="overview-section timeline-section" >
                                      <div class="section-heading" >
                                        <div class="overview-copy" >
                                          <p class="section-kicker" > ${folder.kind === 'student' ? 'Test history' : 'Folder history'} </p>
                                            <h3 > ${escapeHtml(folder.kind === 'student' ? `${folder.name}: test timeline` : `${folder.name}: nested tests`)} </h3>
                                              </div>
                                              <span class="section-caption" > ${tests.length} test${tests.length === 1 ? '' : 's'} </span>
                                                </div>
        ${tests.length === 0
      ? `
              <div class="history-empty-panel">
                <div>
                  <p class="section-kicker">No tests yet</p>
                  <h3>Create the next test from the left rail.</h3>
                  <p class="supporting-copy">Once pages and scores start coming in, this becomes the student timeline for quick review, sharing, and progress tracking.</p>
                </div>
              </div>
            `
      : `
              <div class="timeline-list">
                ${tests.map((testFolder, index) => renderHistoryTimelineRow(testFolder, index, tests.length)).join('')}
              </div>
            `
    }
  </div>
    <div class="detail-stack" >
      <div class="overview-section" >
        <div class="section-heading" >
          <p class="section-kicker" > Student summary </p>
            <span class="section-caption" > ${escapeHtml(getFolderLabel(folder.kind))} </span>
              </div>
              <div class="metric-strip compact-metric-strip" >
                <div class="metric-cell" >
                  <span>Tests scored </span>
                    <strong > ${historySummary.testsWithScores} </strong>
                      </div>
                      <div class="metric-cell" >
                        <span>Pending marking </span>
                          <strong > ${tests.filter((testFolder) => countMarkedSheets(state.workspace, testFolder.id) === 0).length} </strong>
                            </div>
                            <div class="metric-cell" >
                              <span>Overall average </span>
                                <strong > ${historySummary.averagePercent === null ? 'Not yet' : `${historySummary.averagePercent}%`} </strong>
                                  </div>
                                  </div>
                                  </div>
                                  <div class="overview-section" >
                                    <div class="section-heading" >
                                      <p class="section-kicker" > Child folders </p>
                                        <span class="section-caption" > ${children.length} </span>
                                          </div>
          ${children.length === 0
      ? '<p class="empty-copy">No child folders yet. Create a test or folder here to keep the batch structured.</p>'
      : children
        .slice(0, 6)
        .map(
          (child) => `
                      <button class="overview-row" data-action="select-folder" data-folder-id="${child.id}">
                        <span class="accent-dot" style="--accent:${child.accent};"></span>
                        <span class="overview-copy">
                          <strong>${escapeHtml(child.name)}</strong>
                          <span>${escapeHtml(getFolderLabel(child.kind))}</span>
                        </span>
                      </button>
                    `,
        )
        .join('')
    }
  </div>
    <div class="overview-section" >
      <div class="section-heading" >
        <p class="section-kicker" > Recent results </p>
          <span class="section-caption" > ${history.length} </span>
            </div>
          ${history.length === 0
      ? '<p class="empty-copy">Scores from child test folders appear here after the first paper is marked and tallied.</p>'
      : history
        .slice(0, 4)
        .map(
          ({ folder: historyFolder, totals }) => `
                      <button class="history-row compact-history" data-action="select-folder" data-folder-id="${historyFolder.id}">
                        <span class="history-title">${escapeHtml(historyFolder.name)}</span>
                        <span class="history-percent">${totals.percent === null ? 'Incomplete' : `${totals.percent}%`}</span>
                      </button>
                    `,
        )
        .join('')
    }
  </div>
    </div>
    </section>
      `
}

function renderTestWorkspace(
  folder: FolderRecord,
  sheets: SheetRecord[],
  selectedSheet: SheetRecord | null,
  scoreTotals: ReturnType<typeof calculateScoreTotals> | null,
): string {
  const markedCount = countMarkedSheets(state.workspace, folder.id)
  const currentIndex = selectedSheet ? sheets.findIndex((sheet) => sheet.id === selectedSheet.id) : -1

  return `
    <section class="review-shell test-review-shell" >
      <div class="toolbar-row test-hero-panel" >
        <div class="toolbar-cluster" >
          <div>
          <p class="section-kicker" > Test workspace </p>
            <h3 > ${escapeHtml(folder.name)} </h3>
              <p class="supporting-copy" > Keep the paper order clean, mark one page in the focused canvas, then finish from the score and share summary.</p>
                </div>
                <div class="hero-chip-row" >
                  <span class="info-chip" > ${sheets.length} uploaded </span>
                    <span class="info-chip" > ${markedCount} marked </span>
                      <span class="info-chip" > ${scoreTotals?.percent === null || !scoreTotals ? 'Score pending' : `${scoreTotals.percent}% total`} </span>
                        </div>
                        </div>
                        <div class="toolbar-cluster toolbar-actions" >
                          <button class="primary-button" data-action="open-edit-mode" ${selectedSheet ? '' : 'disabled'}> Edit full screen </button>
                            <button class="subtle-button" data-action="download-sheet" ${selectedSheet ? '' : 'disabled'}> Download PNG </button>
                              <div class="save-pill" data-tone="${state.saveTone}" > ${escapeHtml(state.saveLabel)} </div>
                                </div>
                                </div>

                                <div class="test-review-grid" >
                                  <div class="stage-card" >
                                    <div class="stage-card-head" >
                                      <div>
                                      <p class="section-kicker" > Current page </p>
                                        <h3 > ${escapeHtml(selectedSheet?.pageLabel || selectedSheet?.name || 'Choose a page')} </h3>
                                          </div>
            ${selectedSheet
      ? `
                  <div class="hero-chip-row">
                    <span class="info-chip">Page ${currentIndex + 1} of ${sheets.length}</span>
                    <span class="info-chip">${selectedSheet.strokes.length > 0 ? 'Marked' : 'Ready'}</span>
                  </div>
                `
      : ''
    }
  </div>
          ${sheets.length === 0
      ? `
                <div class="hero-empty compact-empty">
                  <div>
                    <p class="section-kicker">Upload pages</p>
                    <h3>This test is ready for a batch of answer-sheet photos.</h3>
                    <p class="supporting-copy">Add pages below, then tap any card to inspect it before opening the full-screen edit canvas.</p>
                  </div>
                </div>
              `
      : !selectedSheet
        ? `
                  <div class="hero-empty compact-empty">
                    <div>
                      <p class="section-kicker">Pick a page</p>
                      <h3>Select a page from the organizer to load it into the review stage.</h3>
                    </div>
                  </div>
                `
        : `
                  <div class="stage-scroll">
                    <div class="stage-frame" data-stage-frame style="--zoom:${state.zoom}; aspect-ratio:${selectedSheet.width} / ${selectedSheet.height};">
                      <img id="stage-image" src="${getObjectUrl(selectedSheet)}" alt="${escapeHtml(selectedSheet.name)}" />
                      <canvas id="ink-layer"></canvas>
                    </div>
                  </div>
                `
    }
  <div class="stage-card-footer" >
    <div class="pager-group" >
      <button class="subtle-button group-button" data-action="prev-sheet" ${currentIndex <= 0 ? 'disabled' : ''}> Previous </button>
        <span class="pager-label" > ${currentIndex >= 0 ? currentIndex + 1 : 0} / ${sheets.length}</span >
          <button class="subtle-button group-button" data-action="next-sheet" ${currentIndex < 0 || currentIndex >= sheets.length - 1 ? 'disabled' : ''}> Next </button>
            </div>
            <div class="hero-chip-row" >
              <span class="info-chip" > ${markedCount} saved locally </span>
                <span class="info-chip" > ${Math.max(0, sheets.length - markedCount)} still to review </span>
                  </div>
                  </div>
                  </div>

        ${renderTestResultSummaryCard(folder, sheets, selectedSheet, scoreTotals)}
  </div>

    <div class="organizer-panel" >
      <div class="section-heading" >
        <div class="overview-copy" >
          <p class="section-kicker" > Page organizer </p>
            <h3 > Reorder the batch before or during marking.</h3>
              </div>
              <button class="primary-button" data-action="trigger-upload" > Add pages </button>
                </div>
                <input class="hidden-file-input" type = "file" accept = "image/*" multiple data-upload="test" />
                  ${sheets.length === 0
      ? '<p class="empty-copy">No pages yet. Add the student images in one batch, then rearrange them here if the order is messy.</p>'
      : `
              <div class="organizer-grid">
                ${sheets.map((sheet, index) => renderPageOrganizerCard(sheet, index, sheet.id === selectedSheet?.id, sheets.length)).join('')}
              </div>
            `
    }
  </div>
    </section>
      `
}

function renderWelcomeInspector(): string {
  return `
    <div class="inspector-section" >
      <div class="section-heading" >
        <p class="section-kicker" > Flow </p>
          <span class="section-caption" > How it works </span>
            </div>
            <h3 > Organize by student, then by test.</h3>
              <p class="supporting-copy" > After that, each page can be marked, scored, and shared as a plain image bundle.</p>
                < ul class="summary-list" >
                  <li>Folders help a tutor keep one batch tidy and easy to revisit.</li>
                    < li > Each uploaded page stays local to this browser until it is shared.</li>
                      < li > Marked pages, scores, and AI drafts stay attached to the chosen test folder.</li>
                        </ul>
                        </div>
                        <div class="inspector-section" >
                          <div class="section-heading" >
                            <p class="section-kicker" > Best practice </p>
                              <span class="section-caption" > Fast setup </span>
                                </div>
                                <p class="supporting-copy" > Name folders with the student first, then the test name and date, so the history view stays easy to scan later.</p>
                                  </div>
                                    `
}

function renderFolderInspector(
  folder: FolderRecord,
  history: ReturnType<typeof getFolderHistory>,
  historySummary: ReturnType<typeof getFolderAnalyticsSummary>,
): string {
  return `
                                  <div class="inspector-section" >
                                    <div class="section-heading" >
                                      <p class="section-kicker" > Summary </p>
                                        <span class="section-caption" > ${escapeHtml(getFolderLabel(folder.kind))} </span>
                                          </div>
                                          <div class="metric-stack" >
                                            <div class="metric-line" > <span>Child folders </span><strong>${getChildFolders(state.workspace, folder.id).length}</strong> </div>
                                              <div class="metric-line" > <span>Tests below </span><strong>${getDescendantTests(state.workspace, folder.id).length}</strong> </div>
                                                <div class="metric-line" > <span>Average </span><strong>${historySummary.averagePercent === null ? 'Not yet' : `${historySummary.averagePercent}%`}</strong> </div>
                                                  </div>
                                                  </div>
                                                  <div class="inspector-section" >
                                                    <div class="section-heading" >
                                                      <p class="section-kicker" > Recent results </p>
                                                        <span class="section-caption" > ${history.length} </span>
                                                          </div>
      ${history.length === 0
      ? '<p class="empty-copy">Scores from child test folders appear here.</p>'
      : history
        .slice(0, 6)
        .map(
          ({ folder: testFolder, totals }) => `
                  <button class="history-row compact-history" data-action="select-folder" data-folder-id="${testFolder.id}">
                    <span class="history-title">${escapeHtml(testFolder.name)}</span>
                    <span class="history-percent">${totals.percent === null ? 'Incomplete' : `${totals.percent}%`}</span>
                  </button>
                `,
        )
        .join('')
    }
  </div>
    `
}

function renderTestInspector(
  folder: FolderRecord,
  sheets: SheetRecord[],
  selectedSheet: SheetRecord | null,
  scoreTotals: ReturnType<typeof calculateScoreTotals> | null,
): string {
  const markedCount = countMarkedSheets(state.workspace, folder.id)
  const aiSelected = sheets.filter((sheet) => sheet.selectedForAi).length

  return `
    <div class="inspector-section" >
      <div class="section-heading" >
        <p class="section-kicker" > Test details </p>
          <span class="section-caption" > ${escapeHtml(folder.name)} </span>
            </div>
            <div class="metric-stack" >
              <div class="metric-line" > <span>Uploaded pages </span><strong>${sheets.length}</strong> </div>
                <div class="metric-line" > <span>Marked pages </span><strong>${markedCount}</strong> </div>
                  <div class="metric-line" > <span>AI selected </span><strong>${aiSelected}</strong> </div>
                    <div class="metric-line" > <span>Last shared </span><strong>${folder.lastSharedAt ? formatDate(folder.lastSharedAt) : 'Not yet'}</strong> </div>
                      </div>
      ${selectedSheet
      ? `
            <div class="selected-page-callout">
              <img src="${getObjectUrl(selectedSheet)}" alt="" />
              <div class="overview-copy">
                <span class="section-kicker">Selected page</span>
                <strong>${escapeHtml(selectedSheet.pageLabel || selectedSheet.name)}</strong>
                <span>${selectedSheet.strokes.length > 0 ? 'Marked and saved locally' : 'Ready for marking'}</span>
              </div>
            </div>
          `
      : ''
    }
  </div>

    <div class="inspector-section" >
      <div class="section-heading" >
        <p class="section-kicker" > Scoring & Totals </p>
          <span class="section-caption" > ${scoreTotals ? `${formatScoreValue(scoreTotals.awardedTotal)}${scoreTotals.possibleTotal !== null ? ` / ${formatScoreValue(scoreTotals.possibleTotal)}` : ''}` : 'No scores yet'} </span>
            </div>
            <div class="metric-strip compact-metric-strip" >
              <div class="metric-cell" >
                <span>Total </span>
                <strong > ${scoreTotals ? formatScoreValue(scoreTotals.awardedTotal) : '0'} </strong>
                  </div>
                  <div class="metric-cell" >
                    <span>Possible </span>
                    <strong > ${scoreTotals === null || scoreTotals.possibleTotal === null ? 'Unknown' : formatScoreValue(scoreTotals.possibleTotal)} </strong>
                      </div>
                      <div class="metric-cell" >
                        <span>Percent </span>
                        <strong > ${scoreTotals === null || scoreTotals.percent === null ? 'Pending' : `${scoreTotals.percent}%`} </strong>
                          </div>
                          </div>
                          <button class="subtle-button stretch-button" data-action="add-score-entry" > Add score row </button>
                            <div class="score-stack" >
                              ${folder.scoreEntries.length === 0
      ? '<p class="empty-copy">Manual or AI-extracted scores show up here. Use separate fields for awarded and total marks.</p>'
      : folder.scoreEntries
        .map((entry) => renderScoreEntry(entry))
        .join('')
    }
  </div>
    </div>

    <div class="inspector-section" >
      <div class="section-heading" >
        <p class="section-kicker" > AI total draft </p>
          <span class="section-caption" > ${folder.aiLastRunAt ? formatDate(folder.aiLastRunAt) : 'Not run yet'} </span>
            </div>
            < label class="field-label" >
              <span>OpenAI API key </span>
                <input class="text-input" type = "password" data-field="openai-key" value = "${escapeHtml(state.aiApiKey)}" placeholder = "sk-..." />
                  </label>
                  < label class="field-label" >
                    <span>Model </span>
                    <input class="text-input" type = "text" data-field="ai-model" value = "${escapeHtml(state.workspace.settings.aiModel)}" placeholder = "gpt-5" />
                      </label>
                      <button class="subtle-button stretch-button" data-action="run-ai-scores" ${state.aiBusy ? 'disabled' : ''}>
                        ${state.aiBusy ? 'Reading selected pages...' : 'Calculate from selected pages'}
  </button>
      ${folder.aiSummary.length === 0
      ? '<p class="empty-copy">Select the marked pages you want AI to read, then review and edit the suggested score rows.</p>'
      : `<ul class="summary-list">${folder.aiSummary.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    }
  </div>
    `
}

void [
  renderWorkspaceHeader,
  renderRootEmptyState,
  renderFolderOverview,
  renderTestWorkspace,
  renderWelcomeInspector,
  renderFolderInspector,
  renderTestInspector,
]

function renderScoreEntry(entry: ScoreEntry): string {
  return `
    <div class="score-row" >
      <div class="score-grid" >
        <label class="field-label" >
          <span>Question </span>
          <input class="text-input" type = "text" data-entry-id="${entry.id}" data-score-field="label" value = "${escapeHtml(entry.label)}" placeholder = "Question" />
            </label>
            < label class="field-label" >
              <span>Awarded </span>
              <input class="text-input" type = "text" data-entry-id="${entry.id}" data-score-field="awardedRaw" value = "${escapeHtml(entry.awardedRaw)}" placeholder = "Awarded" />
                </label>
                < label class="field-label" >
                  <span>Out of </span>
                    <input class="text-input" type = "text" data-entry-id="${entry.id}" data-score-field="possibleRaw" value = "${escapeHtml(entry.possibleRaw)}" placeholder = "Out of" />
                      </label>
                      </div>
                      <div class="score-grid score-grid-note" >
                        <label class="field-label" >
                          <span>Teacher note </span>
                            <input class="text-input note-input" type = "text" data-entry-id="${entry.id}" data-score-field="note" value = "${escapeHtml(entry.note)}" placeholder = "Teacher note" />
                              </label>
                              <div class="score-chip-row" >
                                <span class="info-chip" > ${entry.source === 'ai' ? `AI ${entry.confidence ? `${Math.round(entry.confidence * 100)}%` : ''}` : 'Manual'} </span>
                                  <span class="info-chip" > ${entry.awardedValue === null ? 'Awarded: pending' : `Awarded: ${formatScoreValue(entry.awardedValue)}`} </span>
                                    <button class="icon-button danger-button" data-action="remove-score-entry" data-entry-id="${entry.id}" > Remove </button>
                                      </div>
                                      </div>
                                      </div>
                                        `
}

function renderTestResultSummaryCard(
  folder: FolderRecord,
  sheets: SheetRecord[],
  selectedSheet: SheetRecord | null,
  scoreTotals: ReturnType<typeof calculateScoreTotals> | null,
): string {
  void selectedSheet
  const markedCount = countMarkedSheets(state.workspace, folder.id)
  const percent = scoreTotals?.percent ?? null
  const shareDisabled = state.shareBusy || markedCount === 0
  const awardedStr =
    scoreTotals !== null
      ? `${formatScoreValue(scoreTotals.awardedTotal)}${scoreTotals.possibleTotal !== null && scoreTotals.possibleTotal !== undefined ? ` / ${formatScoreValue(scoreTotals.possibleTotal)}` : ''} `
      : null

  if (percent !== null) {
    // Full result state — stitch completion card
    return `
    <div class="stitch-result-layout" >
      <div class="stitch-result-card" >
        <div class="stitch-result-confetti-bg" > </div>
          <p class="stitch-result-score-label" > Final Score </p>
            <p class="stitch-result-percent" > ${percent}% </p>
              <h3 class="stitch-result-grade" > ${getGradeLabel(percent)} </h3>
          ${awardedStr !== null ? `<p class="stitch-result-points">Total Points: ${awardedStr}</p>` : ''}
  <div class="stitch-result-saved-indicator" >
    <span class="stitch-result-checkmark" >✓</span>
      <span class="stitch-result-saved-label" >
        ${folder.lastSharedAt ? `Shared ${formatDate(folder.lastSharedAt)}` : 'Saved locally'}
  </span>
    </div>
    <div class="stitch-result-actions" >
      <button class="stitch-share-btn" data-action="share-marked" ${shareDisabled ? 'disabled' : ''}>
        ${state.shareBusy ? 'Preparing...' : '↑ Share Results'}
  </button>
    <button class="stitch-done-btn" data-action="go-home" > Done </button>
      </div>
      </div>
      <div class="stitch-result-preview-panel" >
        ${sheets.length > 0
        ? `
                <div class="stitch-result-preview-card">
                  <p class="stitch-result-preview-label">Marked Document — ${escapeHtml(folder.name)}</p>
                  <div class="stitch-result-preview-img">
                    <img src="${getObjectUrl(sheets[0])}" alt="Marked sheet preview" />
                  </div>
                </div>
              `
        : ''
      }
  <div class="stitch-result-meta-bar" >
    <strong>${escapeHtml(folder.name)} </strong>
      <span > ${markedCount} of ${sheets.length} pages marked · ${folder.scoreEntries.length} score rows </span>
        </div>
        </div>
        </div>
          `
  }

  // Progress / empty state — compact card
  return `
        <aside class="result-card" data-state="${markedCount > 0 ? 'progress' : 'empty'}" >
          <div class="section-heading" >
            <p class="section-kicker" > Result summary </p>
              <span class="section-caption" > ${folder.lastSharedAt ? `Shared ${formatDate(folder.lastSharedAt)}` : 'Local only'} </span>
                </div>
                <div class="result-score" >
                  <strong>${markedCount} /${Math.max(1, sheets.length)}</strong>
                    <span>Pages marked </span>
                      </div>
                      <p class="supporting-copy" >
                        ${markedCount === 0
      ? 'Once the first page is marked, this panel becomes the quick completion and share checkpoint for the whole test.'
      : 'Mark every needed page, then fill the score rows to generate the final percent before you share the paper back.'
    }
  </p>
    <button class="primary-button stretch-button" data-action="share-marked" ${shareDisabled ? 'disabled' : ''}>
      ${state.shareBusy ? 'Preparing share...' : 'Share results'}
  </button>
    </aside>
      `
}

function renderPageOrganizerCard(
  sheet: SheetRecord,
  index: number,
  isSelected: boolean,
  totalSheets: number,
): string {
  return `
    <div class="stitch-page-card" data-active="${isSelected}" >
      <div class="stitch-page-card-header" >
        <span>${escapeHtml(sheet.pageLabel || sheet.name)} </span>
          <div class="stitch-page-card-arrows" >
            <button
            data-action="move-sheet-up"
  data-sheet-id="${sheet.id}"
            ${index === 0 ? 'disabled' : ''}
  title = "Move up"
    ><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button
  data-action="move-sheet-down"
  data-sheet-id="${sheet.id}"
            ${index === totalSheets - 1 ? 'disabled' : ''}
  title = "Move down"
    ><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
      </div>
      <button
  class="stitch-page-thumb"
  data-action="select-sheet"
  data-sheet-id="${sheet.id}"
  style = "border:none;padding:8px;width:100%;"
    >
    <img src="${getObjectUrl(sheet)}" alt = "Page ${index + 1}" />
      <span class="stitch-page-thumb-badge" > ${sheet.strokes.length > 0 ? 'Marked' : 'Ready'} </span>
        </button>
        <div class="stitch-page-card-footer" >
          <span class="status-badge" data-tone="${sheet.strokes.length > 0 ? 'success' : 'info'}" > ${sheet.strokes.length > 0 ? 'Marked' : 'Ready'} </span>
            <button
  class="icon-button danger-button"
  data-action="remove-sheet"
  data-sheet-id="${sheet.id}"
  title = "Delete page"
    > Del </button>
    </div>
    </div>
      `
}

function renderHistoryTimelineRow(
  folder: FolderRecord,
  index: number,
  total: number,
): string {
  void index; void total
  const totals = calculateScoreTotals(folder.scoreEntries)
  const status = getTestStatusMeta(folder)
  const sheetCount = getSheetsInFolder(state.workspace, folder.id).length
  const markedCount = countMarkedSheets(state.workspace, folder.id)

  const isGraded = status.tone === 'success'
  const isPending = status.tone === 'warning' || status.tone === 'info'
  const scoreDisplay =
    totals.percent !== null
      ? `${totals.percent}% ${getGradeLabel(totals.percent) ? ` (${getGradeLabel(totals.percent).replace('Grade ', '')})` : ''} `
      : `${markedCount} / ${sheetCount || 0} marked`
  const badgeClass = isGraded ? 'is-graded' : isPending ? 'is-pending' : 'is-idle'
  const badgeIcon = isGraded ? '✓' : isPending ? '!' : '…'
  const badgeLabel = isGraded ? 'Graded' : isPending ? 'Pending Review' : 'Awaiting'

  return `
    <div class="stitch-history-card">
      <div class="stitch-history-badge ${badgeClass}">
        <span style="font-size:1.1rem;">${badgeIcon}</span>
        <span>${badgeLabel}</span>
      </div>
      <div class="stitch-history-body">
        <p class="stitch-history-meta">${formatDate(folder.createdAt)}</p>
        <p class="stitch-history-test-name">${escapeHtml(folder.name)}</p>
        ${totals.percent !== null ? `<p class="stitch-history-score">${scoreDisplay}</p>` : `<p class="stitch-history-score" style="font-size:0.92rem;font-weight:500;color:var(--muted);">${scoreDisplay}</p>`}
        <div class="stitch-history-actions">
          ${isGraded
      ? `<button class="stitch-history-btn" data-action="open-result-surface" data-folder-id="${folder.id}">View & Share</button>`
      : isPending
        ? `<button class="stitch-history-btn is-primary" data-action="select-folder" data-folder-id="${folder.id}">Review Now</button>`
        : `<button class="stitch-history-btn is-primary" data-action="select-folder" data-folder-id="${folder.id}">Open Test</button>`
    }
        </div>
      </div>
    </div>
  `
}

function renderEditOverlay(sheet: SheetRecord): string {
  const stageSize = getEditorStageSize(sheet)
  const draftStrokes = state.editSession?.draftStrokes.length ?? 0
  const sheets = getSheetsInFolder(state.workspace, sheet.folderId)
  const currentIndex = sheets.findIndex((item) => item.id === sheet.id)
  const folder = getFolderById(state.workspace, sheet.folderId)
  const student = findStudentAncestor(state.workspace, sheet.folderId)

  return `
    <div class="edit-overlay">
      <div class="edit-shell edit-shell-focus">
        <header class="edit-topbar">
          <div class="edit-title-block">
            <button class="subtle-button" data-action="cancel-edit-mode">Back</button>
            <div class="header-copy">
              <p class="eyebrow">Focused marking canvas</p>
              <h2>${escapeHtml(student?.name || folder?.name || 'Current page')}</h2>
              <p class="supporting-copy">${escapeHtml(sheet.pageLabel || sheet.name)}${folder ? ` | ${folder.name}` : ''}</p>
            </div>
          </div>
          <div class="edit-action-row">
            <span class="info-chip">${currentIndex >= 0 ? `Page ${currentIndex + 1} of ${sheets.length}` : 'Single page'}</span>
            <button class="subtle-button" data-action="undo-edit-stroke" ${draftStrokes === 0 ? 'disabled' : ''}>Undo</button>
            <button class="subtle-button" data-action="clear-edit-strokes" ${draftStrokes === 0 ? 'disabled' : ''}>Clear</button>
            <button class="primary-button" data-action="save-edit-mode">Save marks</button>
          </div>
        </header>

        <div class="edit-workbench">
          <aside class="edit-tool-rail">
            <div class="tool-rail-group">
              <span class="section-kicker">Marking Mode</span>
              <div class="tool-picker-stack">
                <button 
                  class="tool-picker-btn" 
                  data-action="set-edit-tool" 
                  data-tool="pen" 
                  data-active="${state.editTool === 'pen'}"
                  title="Mark (Pencil)"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Mark</span>
                </button>
                <button 
                  class="tool-picker-btn" 
                  data-action="set-edit-tool" 
                  data-tool="hand" 
                  data-active="${state.editTool === 'hand'}"
                  title="Move (Hand)"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 11.5V5a2 2 0 114 0v6.5m0 0V3.5a2 2 0 114 0v8m0 0V5.5a2 2 0 114 0V12a7 7 0 11-14 0V9a2 2 0 114 0v2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Move</span>
                </button>
              </div>
            </div>

            <div class="tool-rail-group" style="${state.editTool === 'hand' ? 'opacity:0.3; pointer-events:none;' : ''}">
              <span class="section-kicker">Ink</span>
              <div class="swatch-column">
                ${COLORS.map(
    (color) => `
                    <button
                      class="swatch-button"
                      data-action="set-color"
                      data-color="${color}"
                      data-active="${state.penColor === color}"
                      style="--swatch:${color};"
                      aria-label="Set ink color"
                    ></button>
                  `,
  ).join('')}
              </div>
            </div>
            
            <div class="tool-rail-group" style="${state.editTool === 'hand' ? 'opacity:0.3; pointer-events:none;' : ''}">
              <label class="range-control rail-range">
                <span>Stroke</span>
                <input type="range" min="3" max="24" step="1" value="${state.penWidth}" data-field="pen-width" />
                <strong>${state.penWidth}px</strong>
              </label>
            </div>

            <div class="tool-rail-group">
              <span class="section-kicker">Session</span>
              <span class="info-chip">${draftStrokes} stroke${draftStrokes === 1 ? '' : 's'}</span>
              <span class="edit-footnote">
                ${state.editTool === 'pen' ? 'Canvas is locked for marking. Switch to Move to pan/zoom.' : 'Free pan and zoom active. Switch to Mark to write.'}
              </span>
            </div>
          </aside>

          <div class="edit-stage-shell edit-stage-shell-focus" style="overflow: auto; touch-action: ${state.editTool === 'hand' ? 'pan-x pan-y pinch-zoom' : 'pinch-zoom'}; -webkit-overflow-scrolling: touch;">
            <div
              class="edit-stage-frame"
              data-edit-stage-frame
              style="width:${stageSize.width}px; height:${stageSize.height}px; margin: auto;"
            >
              <img id="edit-stage-image" src="${getObjectUrl(sheet)}" alt="${escapeHtml(sheet.name)}" />
              <canvas id="edit-ink-layer"></canvas>
              <canvas id="edit-ink-preview-layer"></canvas>
            </div>
          </div>
        </div>

        <footer class="edit-footer">
          <div class="hero-chip-row">
            <span class="info-chip">${sheet.strokes.length > 0 ? 'Existing marks loaded' : 'Fresh page'}</span>
            <span class="info-chip">Pencil and touch ready</span>
          </div>
          <div class="edit-action-row">
            <button class="subtle-button" data-action="cancel-edit-mode">Cancel</button>
            <button class="primary-button" data-action="save-edit-mode">Done</button>
          </div>
        </footer>
      </div>
    </div>
  `
}

function getTestStatusMeta(folder: FolderRecord): {
  label: string
  tone: 'idle' | 'info' | 'warning' | 'success'
  actionLabel: string
} {
  const sheets = getSheetsInFolder(state.workspace, folder.id)
  const markedCount = countMarkedSheets(state.workspace, folder.id)
  const totals = calculateScoreTotals(folder.scoreEntries)

  if (sheets.length === 0) {
    return { label: 'Awaiting pages', tone: 'idle', actionLabel: 'Open test' }
  }

  if (markedCount === 0) {
    return { label: 'Needs marking', tone: 'warning', actionLabel: 'Mark test' }
  }

  if (totals.percent === null) {
    return { label: 'Scoring', tone: 'info', actionLabel: 'Continue review' }
  }

  if (folder.lastSharedAt) {
    return { label: 'Shared', tone: 'success', actionLabel: 'View & share' }
  }

  return { label: 'Scored', tone: 'success', actionLabel: 'View result' }
}

function getGradeLabel(percent: number): string {
  if (percent >= 90) {
    return 'Grade A'
  }

  if (percent >= 80) {
    return 'Grade B'
  }

  if (percent >= 70) {
    return 'Grade C'
  }

  if (percent >= 60) {
    return 'Grade D'
  }

  return 'Needs review'
}

function attachStageLayers(): void {
  resizeObserver?.disconnect()
  resizeObserver = null
  currentStroke = null
  currentPointerId = null
  predictedPoints = []

  if (state.editSession) {
    attachEditStage()
    return
  }

  attachReadOnlyStage()
}

function attachReadOnlyStage(): void {
  const sheet = getSelectedSheet()
  const frame = app.querySelector<HTMLElement>('[data-stage-frame]')
  const committedCanvas = app.querySelector<HTMLCanvasElement>('#ink-layer')

  if (!sheet || !frame || !committedCanvas) {
    return
  }

  const mountId = ++stageMountId

  const renderPreview = (): void => {
    if (mountId !== stageMountId) {
      return
    }

    const width = frame.clientWidth
    const height = frame.clientHeight
    const committedContext = syncCanvasSize(committedCanvas, width, height)

    if (committedContext) {
      for (const stroke of sheet.strokes) {
        drawStrokeOnContext(
          committedContext,
          stroke,
          { width: sheet.width, height: sheet.height },
          { width, height },
        )
      }
    }
  }

  resizeObserver = new ResizeObserver(() => {
    renderPreview()
  })
  resizeObserver.observe(frame)
  window.requestAnimationFrame(renderPreview)
}

function attachEditStage(): void {
  const editSession = state.editSession
  const sheet = getEditingSheet()
  const frame = app.querySelector<HTMLElement>('[data-edit-stage-frame]')
  const committedCanvas = app.querySelector<HTMLCanvasElement>('#edit-ink-layer')
  const previewCanvas = app.querySelector<HTMLCanvasElement>('#edit-ink-preview-layer')

  if (!editSession || !sheet || !frame || !committedCanvas || !previewCanvas) {
    return
  }

  const mountId = ++stageMountId

  const getSurfaceSize = (): { width: number; height: number } => ({
    width: frame.clientWidth,
    height: frame.clientHeight,
  })

  const renderCommitted = (): void => {
    if (mountId !== stageMountId) {
      return
    }

    const { width, height } = getSurfaceSize()
    const committedContext = syncCanvasSize(committedCanvas, width, height)
    const previewContext = syncCanvasSize(previewCanvas, width, height)

    if (committedContext) {
      for (const stroke of editSession.draftStrokes) {
        drawStrokeOnContext(
          committedContext,
          stroke,
          { width: sheet.width, height: sheet.height },
          { width, height },
        )
      }
    }

    if (previewContext && currentStroke) {
      drawLiveStrokeOnContext(
        previewContext,
        currentStroke,
        { width: sheet.width, height: sheet.height },
        { width, height },
        predictedPoints,
      )
    }
  }

  const renderPreview = (): void => {
    if (mountId !== stageMountId) {
      return
    }

    const { width, height } = getSurfaceSize()
    const previewContext = syncCanvasSize(previewCanvas, width, height)

    if (!previewContext) {
      return
    }

    if (currentStroke) {
      drawLiveStrokeOnContext(
        previewContext,
        currentStroke,
        { width: sheet.width, height: sheet.height },
        { width, height },
        predictedPoints,
      )
    }
  }

  const schedulePreview = (): void => {
    if (previewFrameHandle) {
      return
    }

    previewFrameHandle = window.requestAnimationFrame(() => {
      previewFrameHandle = 0
      renderPreview()
    })
  }

  const handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== currentPointerId || !currentStroke) {
      return
    }

    currentStroke.points.push(...samplePoints(event, previewCanvas, sheet))
    predictedPoints = samplePredictedPoints(event, previewCanvas, sheet)
    schedulePreview()
  }

  previewCanvas.addEventListener('pointerdown', (event) => {
    // Only draw if Mark tool is active
    if (state.editTool !== 'pen') {
      return
    }

    if (event.button !== 0 && event.pointerType === 'mouse') {
      return
    }

    event.preventDefault()
    currentPointerId = event.pointerId
    currentStroke = {
      id: crypto.randomUUID(),
      color: state.penColor,
      width: state.penWidth,
      opacity: 1,
      points: samplePoints(event, previewCanvas, sheet),
    }
    predictedPoints = samplePredictedPoints(event, previewCanvas, sheet)
    previewCanvas.setPointerCapture(event.pointerId)
    schedulePreview()
  })

  previewCanvas.addEventListener(
    'onpointerrawupdate' in previewCanvas ? 'pointerrawupdate' : 'pointermove',
    handlePointerMove as EventListener,
  )

  const finishStroke = (): void => {
    if (!currentStroke || !state.editSession) {
      return
    }

    if (currentStroke.points.length > 0) {
      state.editSession.draftStrokes = [...state.editSession.draftStrokes, currentStroke]
    }

    currentStroke = null
    currentPointerId = null
    predictedPoints = []
    render()
  }

  previewCanvas.addEventListener('pointerup', finishStroke)
  previewCanvas.addEventListener('pointercancel', finishStroke)
  previewCanvas.addEventListener('lostpointercapture', finishStroke)

  resizeObserver = new ResizeObserver(() => {
    renderCommitted()
  })
  resizeObserver.observe(frame)
  window.requestAnimationFrame(renderCommitted)
}

function refreshStageCanvases(): void {
  const committedCanvas =
    app.querySelector<HTMLCanvasElement>('#ink-layer') ??
    app.querySelector<HTMLCanvasElement>('#edit-ink-layer')

  if (!committedCanvas) {
    return
  }

  attachStageLayers()
}

async function createFolder(): Promise<void> {
  const name = state.folderDraftName.trim()
  const selectedFolder = getSelectedFolder()

  if (!name) {
    setFlash('Enter a name first.', 'error')
    render()
    return
  }

  if (state.folderDraftKind === 'student' && (!selectedFolder || selectedFolder.kind !== 'classroom')) {
    setFlash('Select a class from the sidebar first, then use "+ Student".', 'error')
    render()
    return
  }

  if (state.folderDraftKind === 'test' && (!selectedFolder || selectedFolder.kind !== 'student')) {
    setFlash('Select a student from the sidebar first, then use "+ Exam".', 'error')
    render()
    return
  }

  const parentId = getFolderCreateParentId(
    state.workspace,
    state.selectedFolderId,
    state.folderDraftKind,
  )
  const folder = createFolderRecord(
    name,
    state.folderDraftKind,
    parentId,
    FOLDER_ACCENTS[state.workspace.folders.length % FOLDER_ACCENTS.length],
  )

  state.workspace.folders = [...state.workspace.folders, folder]
  state.homeMode = false
  state.selectedFolderId = folder.id
  state.selectedSheetId = null
  state.testSurface = folder.kind === 'test' ? 'organizer' : state.testSurface
  state.scorePadEntryId = null
  state.scorePadBuffer = ''
  state.folderDraftName = ''
  setFlash(`${getFolderLabel(folder.kind)} "${folder.name}" created.`, 'info')
  await persistWorkspace(`${folder.name} is ready.`)
}


function selectFolder(folderId: string): void {
  state.homeMode = false
  state.selectedFolderId = folderId
  const selectedFolder = getFolderById(state.workspace, folderId)
  const firstSheet = getSheetsInFolder(state.workspace, selectedFolder?.kind === 'test' ? folderId : null)[0]
  state.selectedSheetId = firstSheet?.id ?? null
  state.testSurface = selectedFolder?.kind === 'test' ? 'organizer' : state.testSurface
  state.scorePadEntryId = null
  state.scorePadBuffer = ''
  setFlash(null)
  render()
}

function stepSheet(direction: -1 | 1): void {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  const sheets = getSheetsInFolder(state.workspace, folder.id)
  const currentIndex = sheets.findIndex((sheet) => sheet.id === state.selectedSheetId)
  const nextSheet = sheets[currentIndex + direction]

  if (!nextSheet) {
    return
  }

  state.selectedSheetId = nextSheet.id
  render()
}

async function uploadSheets(files: readonly File[]): Promise<void> {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    setFlash('Open a student exam folder before uploading copies.', 'error')
    render()
    return
  }

  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    setFlash('Only image files can be added here.', 'error')
    render()
    return
  }

  state.saveTone = 'saving'
  state.saveLabel = 'Importing pages...'
  render()

  const currentSheets = getSheetsInFolder(state.workspace, folder.id)
  let sortOrder = currentSheets.length
  const newSheets: SheetRecord[] = []

  for (const file of imageFiles) {
    const size = await readImageSize(file)
    const now = Date.now()

    newSheets.push({
      id: crypto.randomUUID(),
      folderId: folder.id,
      name: file.name,
      pageLabel: `Page ${sortOrder + 1}`,
      image: file,
      width: size.width,
      height: size.height,
      sortOrder,
      strokes: [],
      markedAt: null,
      selectedForAi: false,
      createdAt: now,
      updatedAt: now,
    })

    sortOrder += 1
  }

  state.workspace.sheets = [...state.workspace.sheets, ...newSheets]
  state.selectedSheetId = state.selectedSheetId ?? newSheets[0]?.id ?? null
  setFlash(`${newSheets.length} exam cop${newSheets.length === 1 ? 'y' : 'ies'} imported.`, 'info')
  await persistWorkspace('Exam copies imported and ready to check.')
}

function reorderSheet(sheetId: string, direction: -1 | 1): void {
  const sheet = state.workspace.sheets.find((item) => item.id === sheetId)

  if (!sheet) {
    return
  }

  const sheets = getSheetsInFolder(state.workspace, sheet.folderId)
  const index = sheets.findIndex((item) => item.id === sheetId)
  const target = sheets[index + direction]

  if (!target) {
    return
  }

  const currentOrder = sheet.sortOrder
  sheet.sortOrder = target.sortOrder
  target.sortOrder = currentOrder
  setFlash('Page order updated.', 'info')
  void persistWorkspace('Page order saved.')
}

async function removeSheet(sheetId: string): Promise<void> {
  const sheet = state.workspace.sheets.find((item) => item.id === sheetId)

  if (!sheet) {
    return
  }

  state.workspace.sheets = state.workspace.sheets.filter((item) => item.id !== sheetId)
  revokeObjectUrl(sheetId)
  if (state.editSession?.sheetId === sheetId) {
    state.editSession = null
  }

  for (const folder of state.workspace.folders) {
    folder.scoreEntries = folder.scoreEntries.map((entry) => ({
      ...entry,
      linkedSheetIds: entry.linkedSheetIds.filter((id) => id !== sheetId),
    }))
  }

  normalizeSheetOrdering(sheet.folderId)
  syncSelection()
  setFlash('Page removed from this test.', 'info')
  await persistWorkspace('Page removed.')
}

function toggleAiSelection(sheetId: string, checked: boolean): void {
  const sheet = state.workspace.sheets.find((item) => item.id === sheetId)

  if (!sheet) {
    return
  }

  sheet.selectedForAi = checked
  void persistWorkspace('AI page selection saved.')
}

async function downloadSelectedSheet(): Promise<void> {
  const sheet = getSelectedSheet()

  if (!sheet) {
    return
  }

  const blob = await renderMarkedSheetBlob(sheet)
  downloadBlob(blob, `${buildSafeFilename(sheet.pageLabel || sheet.name)}.png`)
  setFlash('Marked page downloaded as PNG.', 'info')
  render()
}

function openEditMode(): void {
  const sheet = getSelectedSheet()

  if (!sheet) {
    return
  }

  state.editSession = {
    sheetId: sheet.id,
    draftStrokes: cloneStrokes(sheet.strokes),
  }
  setFlash(null)
  render()
}

async function saveEditMode(): Promise<void> {
  const sheet = getEditingSheet()
  const editSession = state.editSession

  if (!sheet || !editSession) {
    return
  }

  sheet.strokes = cloneStrokes(editSession.draftStrokes)
  sheet.markedAt = sheet.strokes.length > 0 ? Date.now() : null
  sheet.selectedForAi = sheet.strokes.length > 0
  sheet.updatedAt = Date.now()
  state.editSession = null
  setFlash('Edit session saved.', 'info')
  await persistWorkspace('Marks saved from full-screen edit mode.')
}

function cancelEditMode(): void {
  state.editSession = null
  setFlash('Edit session discarded.', 'info')
  render()
}

function undoEditStroke(): void {
  if (!state.editSession || state.editSession.draftStrokes.length === 0) {
    return
  }

  state.editSession.draftStrokes = state.editSession.draftStrokes.slice(0, -1)
  render()
}

function clearEditStrokes(): void {
  if (!state.editSession || state.editSession.draftStrokes.length === 0) {
    return
  }

  state.editSession.draftStrokes = []
  render()
}

async function shareMarkedSheets(): Promise<void> {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  const sheets = getSheetsInFolder(state.workspace, folder.id).filter((sheet) => sheet.strokes.length > 0)

  if (sheets.length === 0) {
    setFlash('Check at least one copy before sharing.', 'error')
    render()
    return
  }

  state.shareBusy = true
  render()

  try {
    // 1. Render all individual page blobs
    const blobs = await Promise.all(sheets.map(renderMarkedSheetBlob))

    // 2. Load them all into HTMLImageElements
    type ImgUrlPair = { img: HTMLImageElement, url: string }
    const pairs = await Promise.all(blobs.map(blob => {
      return new Promise<ImgUrlPair>((resolve, reject) => {
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => resolve({ img, url })
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Page image failed to load')) }
        img.src = url
      })
    }))

    const images = pairs.map(p => p.img)

    // 3. Calculate canvas dimensions to stack vertically
    const maxWidth = Math.max(...images.map(img => img.naturalWidth || 800))
    const totalHeight = images.reduce((sum, img) => sum + (img.naturalHeight || 1100), 0)

    // 4. Create master canvas and draw each image (Safe limit for canvas memory is ~16kpx height)
    let finalBlob: Blob | null = null
    const MAX_CANVAS_HEIGHT = 16384 // iOS Safari limit

    if (totalHeight > 0 && totalHeight <= MAX_CANVAS_HEIGHT) {
      const canvas = document.createElement('canvas')
      canvas.width = maxWidth
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')

      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, maxWidth, totalHeight)
        let yOffset = 0
        for (const img of images) {
          const xOffset = (maxWidth - img.naturalWidth) / 2
          ctx.drawImage(img, xOffset, yOffset, img.naturalWidth, img.naturalHeight)

          if (yOffset > 0) {
            ctx.fillStyle = '#111827'
            ctx.fillRect(0, yOffset - 2, maxWidth, 4)
          }
          yOffset += img.naturalHeight
        }
        finalBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
      }
    }

    // Cleanup URLs only AFTER draw is complete
    pairs.forEach(p => URL.revokeObjectURL(p.url))

    let shareFiles: File[] = []

    if (finalBlob) {
      shareFiles = [new File([finalBlob], `${buildSafeFilename(folder.name)}_Checked.jpg`, { type: 'image/jpeg' })]
    } else {
      // Fallback for canvas memory limits on huge exams OR if stitching failed
      shareFiles = blobs.map((blob, idx) =>
        new File([blob], `${buildSafeFilename(sheets[idx].pageLabel || sheets[idx].name)}.png`, { type: 'image/png' })
      )
    }

    if (navigator.canShare && navigator.canShare({ files: shareFiles })) {
      await navigator.share({
        files: shareFiles,
        title: folder.name,
        text: `Checked copies for ${folder.name}`,
      })
    } else {
      for (const file of shareFiles) {
        downloadBlob(file, file.name)
      }
    }

    folder.lastSharedAt = Date.now()
    setFlash(finalBlob
      ? 'The checked copies were combined into a single image to send via WhatsApp.'
      : 'The exam is large, so individual pages are ready to send via WhatsApp.', 'info')
    await persistWorkspace('Checked copies share bundle prepared.')
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      setFlash('Share cancelled.', 'info')
    } else {
      setFlash(getErrorMessage(error, 'Unable to prepare the marked pages for sharing.'), 'error')
    }
  } finally {
    state.shareBusy = false
    render()
  }
}

async function shareCurrentSheet(): Promise<void> {
  const folder = getSelectedFolder()
  const sheet = getSelectedSheet()

  if (!folder || folder.kind !== 'test' || !sheet || sheet.strokes.length === 0) {
    setFlash('Mark the current copy before sharing it.', 'error')
    render()
    return
  }

  state.shareBusy = true
  render()

  try {
    const blob = await renderMarkedSheetBlob(sheet)
    const file = new File([blob], `${buildSafeFilename(sheet.pageLabel || sheet.name)}.png`, {
      type: 'image/png',
    })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${folder.name} - ${sheet.pageLabel || sheet.name}`,
        text: `Checked copy for ${sheet.pageLabel || sheet.name}`,
      })
    } else {
      downloadBlob(file, file.name)
    }

    folder.lastSharedAt = Date.now()
    setFlash('This checked copy is ready to send from the device share sheet.', 'info')
    await persistWorkspace('Current checked copy prepared.')
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      setFlash('Share cancelled.', 'info')
    } else {
      setFlash(getErrorMessage(error, 'Unable to prepare this checked copy for sharing.'), 'error')
    }
    render()
  } finally {
    state.shareBusy = false
    render()
  }
}

async function addScoreEntry(): Promise<void> {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  const entry = createScoreEntry()
  entry.label = `Q${folder.scoreEntries.length + 1}`
  folder.scoreEntries = [...folder.scoreEntries, entry]
  state.scorePadEntryId = entry.id
  state.scorePadBuffer = entry.awardedRaw
  await persistWorkspace('Score row added.')
}

function updateScoreField(entryId: string, field: string, value: string): void {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  folder.scoreEntries = folder.scoreEntries.map((entry) => {
    if (entry.id !== entryId) {
      return entry
    }

    const updatedEntry = {
      ...entry,
      [field]: value,
    } as ScoreEntry

    return buildScoreEntryPatch(updatedEntry)
  })

  void persistWorkspace('Score entry saved.')
}

async function removeScoreEntry(entryId: string): Promise<void> {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  folder.scoreEntries = folder.scoreEntries.filter((entry) => entry.id !== entryId)
  const nextEntry = folder.scoreEntries[0] ?? null
  state.scorePadEntryId = nextEntry?.id ?? null
  state.scorePadBuffer = nextEntry?.awardedRaw ?? ''
  await persistWorkspace('Score row removed.')
}

async function runAiScores(): Promise<void> {
  const folder = getSelectedFolder()

  if (!folder || folder.kind !== 'test') {
    return
  }

  if (!state.aiApiKey.trim()) {
    setFlash('Add an OpenAI API key on this device before running AI scoring.', 'error')
    render()
    return
  }

  const markedSheets = getSheetsInFolder(state.workspace, folder.id).filter(
    (sheet) => sheet.strokes.length > 0,
  )
  const selectedSheets = markedSheets.filter((sheet) => sheet.selectedForAi)
  const sheetsForScoring = selectedSheets.length > 0 ? selectedSheets : markedSheets

  if (sheetsForScoring.length === 0) {
    setFlash('Mark at least one copy before calculating marks.', 'error')
    render()
    return
  }

  state.aiBusy = true
  state.saveTone = 'saving'
  state.saveLabel = 'Calculating marks from the checked copies...'
  render()

  try {
    const images = await Promise.all(
      sheetsForScoring.map(async (sheet) => {
        const blob = await renderMarkedSheetBlob(sheet)
        return {
          name: sheet.name,
          dataUrl: await blobToDataUrl(blob),
        }
      }),
    )

    const result = await calculateScoresWithOpenAI({
      apiKey: state.aiApiKey,
      model: state.workspace.settings.aiModel,
      images,
    })
    const now = Date.now()
    const manualEntries = folder.scoreEntries.filter((entry) => entry.source !== 'ai')
    const aiEntries = result.entries.map((entry) =>
      buildScoreEntryPatch({
        id: crypto.randomUUID(),
        label: entry.label,
        awardedRaw: entry.awardedRaw,
        awardedValue: null,
        possibleRaw: entry.possibleRaw,
        possibleValue: null,
        note: entry.note,
        linkedSheetIds: sheetsForScoring.map((sheet) => sheet.id),
        source: 'ai',
        confidence: entry.confidence,
        createdAt: now,
        updatedAt: now,
      }),
    )

    folder.scoreEntries = [...manualEntries, ...aiEntries]
    folder.aiSummary = result.summary
    folder.aiLastRunAt = now
    setFlash('Marks calculated from the checked copies. Review before sharing.', 'info')
    await persistWorkspace('AI suggestions saved.')
  } catch (error) {
    state.saveTone = 'error'
    state.saveLabel = getErrorMessage(error, 'AI score calculation failed.')
    setFlash(state.saveLabel, 'error')
    render()
  } finally {
    state.aiBusy = false
    render()
  }
}

async function resetWorkspace(): Promise<void> {
  const confirmed = window.confirm(
    'Reset the local workspace on this device? This clears folders, pages, and scores stored in this browser only.',
  )

  if (!confirmed) {
    return
  }

  await clearWorkspaceData()
  for (const sheet of state.workspace.sheets) {
    revokeObjectUrl(sheet.id)
  }
  state.workspace = createEmptyWorkspace()
  state.homeMode = true
  state.selectedFolderId = null
  state.selectedSheetId = null
  state.folderDraftName = ''
  state.testSurface = 'organizer'
  state.scorePadEntryId = null
  state.scorePadBuffer = ''
  state.editSession = null
  setFlash('Local workspace reset on this device.', 'info')
  await persistWorkspace('Local workspace reset.')
}

async function persistWorkspace(label: string): Promise<void> {
  syncSelection()
  state.saveTone = 'saving'
  state.saveLabel = 'Saving locally...'
  render()

  try {
    state.workspace.updatedAt = Date.now()
    await saveWorkspace(state.workspace)
    state.saveTone = 'saved'
    state.saveLabel = label
  } catch (error) {
    state.saveTone = 'error'
    state.saveLabel = getErrorMessage(error, 'Unable to save the workspace.')
  }

  render()
}

function syncSelection(): void {
  if (state.homeMode) {
    state.selectedSheetId = null
    return
  }

  const selection = ensureValidSelection(
    state.workspace,
    state.selectedFolderId,
    state.selectedSheetId,
  )
  state.selectedFolderId = selection.selectedFolderId
  state.selectedSheetId = selection.selectedSheetId
}

function normalizeSheetOrdering(folderId: string): void {
  getSheetsInFolder(state.workspace, folderId).forEach((sheet, index) => {
    sheet.sortOrder = index
    if (!sheet.pageLabel || /^Page \d+$/i.test(sheet.pageLabel)) {
      sheet.pageLabel = `Page ${index + 1}`
    }
  })
}

function getSelectedFolder(): FolderRecord | null {
  return getFolderById(state.workspace, state.selectedFolderId)
}

function getSelectedSheet(): SheetRecord | null {
  return state.workspace.sheets.find((sheet) => sheet.id === state.selectedSheetId) ?? null
}

function getEditingSheet(): SheetRecord | null {
  if (!state.editSession) {
    return null
  }

  return state.workspace.sheets.find((sheet) => sheet.id === state.editSession?.sheetId) ?? null
}

function samplePoints(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  sheet: SheetRecord,
): InkPoint[] {
  const rect = canvas.getBoundingClientRect()
  const samples = event.getCoalescedEvents ? event.getCoalescedEvents() : [event]

  return samples.map((sample) => ({
    x: clamp(((sample.clientX - rect.left) / rect.width) * sheet.width, 0, sheet.width),
    y: clamp(((sample.clientY - rect.top) / rect.height) * sheet.height, 0, sheet.height),
    pressure:
      sample.pointerType === 'mouse'
        ? 0.5
        : clamp(sample.pressure && sample.pressure > 0 ? sample.pressure : 0.5, 0.05, 1),
  }))
}

function samplePredictedPoints(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  sheet: SheetRecord,
): InkPoint[] {
  if (!event.getPredictedEvents) {
    return []
  }

  const rect = canvas.getBoundingClientRect()

  return event.getPredictedEvents().map((sample) => ({
    x: clamp(((sample.clientX - rect.left) / rect.width) * sheet.width, 0, sheet.width),
    y: clamp(((sample.clientY - rect.top) / rect.height) * sheet.height, 0, sheet.height),
    pressure:
      sample.pointerType === 'mouse'
        ? 0.5
        : clamp(sample.pressure && sample.pressure > 0 ? sample.pressure : 0.5, 0.05, 1),
  }))
}

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Unable to read ${file.name}.`))
    }

    image.src = url
  })
}

const objectUrlCache = new Map<string, string>()

function getObjectUrl(sheet: SheetRecord): string {
  const existing = objectUrlCache.get(sheet.id)

  if (existing) {
    return existing
  }

  const url = URL.createObjectURL(sheet.image)
  objectUrlCache.set(sheet.id, url)
  return url
}

function cloneStrokes(strokes: InkStroke[]): InkStroke[] {
  return strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((point) => ({ ...point })),
  }))
}

function getEditorStageSize(sheet: SheetRecord): { width: number; height: number } {
  const portrait = window.innerHeight > window.innerWidth
  const horizontalChrome = portrait ? 40 : 120
  const verticalChrome = portrait ? 200 : 160
  const maxWidth = Math.max(260, window.innerWidth - horizontalChrome)
  const maxHeight = Math.max(260, window.innerHeight - verticalChrome)
  const scale = Math.min(maxWidth / sheet.width, maxHeight / sheet.height, 1)

  return {
    width: Math.max(220, Math.floor(sheet.width * scale)),
    height: Math.max(220, Math.floor(sheet.height * scale)),
  }
}

function revokeObjectUrl(sheetId: string): void {
  const url = objectUrlCache.get(sheetId)

  if (!url) {
    return
  }

  URL.revokeObjectURL(url)
  objectUrlCache.delete(sheetId)
}

function setFlash(text: string | null, tone: FlashTone = 'info'): void {
  state.flash = text ? { tone, text } : null
}

function readStoredApiKey(): string {
  try {
    return window.localStorage.getItem(OPENAI_KEY_STORAGE) ?? ''
  } catch {
    return ''
  }
}

function writeStoredApiKey(value: string): void {
  try {
    if (value) {
      window.localStorage.setItem(OPENAI_KEY_STORAGE, value)
    } else {
      window.localStorage.removeItem(OPENAI_KEY_STORAGE)
    }
  } catch {
    return
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(timestamp)
}

function buildSafeFilename(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'marked-sheet'
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}






