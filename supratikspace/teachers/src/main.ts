import './style.css'

import { clearWorkspaceData, createEmptyWorkspace, loadWorkspace, saveWorkspace } from './db'
import { renderMarkedSheetBlob } from './export'
import { drawLiveStrokeOnContext, drawStrokeOnContext, syncCanvasSize } from './ink'
import type {
  FolderKind,
  FolderRecord,
  InkPoint,
  InkStroke,
  SheetRecord,
  WorkspaceSnapshot,
} from './types'
import {
  countMarkedSheets,
  createFolderRecord,
  ensureValidSelection,
  findStudentAncestor,
  getFolderById,
  getFolderCreateParentId,
  getFolderHistory,
  getSheetsInFolder,
  type FolderHistoryItem
} from './workspace'

// --- Constants & Types ---

const OPENAI_KEY_STORAGE = 'paper-marking-desk:openai-key'
const COLORS = ['#d14343', '#2453ff', '#12705a', '#7347d6', '#111827']
const FOLDER_ACCENTS = ['#6b8afd', '#ff8f66', '#56a77a', '#6b6fd3', '#d76464', '#2b7fff']

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
  multiSelectIds: Set<string>
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
  activePointingType: PointerEvent['pointerType']
  sidebarOpen: boolean
}

// --- App State ---

const appRoot = document.querySelector<HTMLDivElement>('#app')
if (!appRoot) throw new Error('The app container is missing.')
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
  multiSelectIds: new Set(),
  penColor: COLORS[0],
  penWidth: 7,
  zoom: 1,
  isLoading: true,
  saveTone: 'saved',
  saveLabel: 'Ready.',
  flash: null,
  aiApiKey: readStoredApiKey(),
  aiBusy: false,
  shareBusy: false,
  editSession: null,
  editTool: 'pen',
  activePointingType: 'mouse',
  sidebarOpen: false,
}

// --- Initialization ---

app.addEventListener('click', handleClick)
document.addEventListener('change', handleChange)
app.addEventListener('input', handleInput)
window.addEventListener('resize', () => {
  if (state.editSession) {
    render()
  } else {
    window.requestAnimationFrame(refreshStageCanvases)
  }
})

void boot()

async function boot(): Promise<void> {
  render()
  try {
    state.workspace = await loadWorkspace()
    syncSelection()
    state.isLoading = false
    state.saveTone = 'saved'
    state.saveLabel = 'Ready for marking.'
  } catch (error) {
    state.isLoading = false
    state.saveTone = 'error'
    state.saveLabel = getErrorMessage(error, 'Unable to open the local workspace.')
    setFlash(state.saveLabel, 'error')
  }
  render()
}

// --- Event Handlers ---

function handleClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null
  const actionTarget = target?.closest<HTMLElement>('[data-action]')
  if (!actionTarget) return
  const action = actionTarget.dataset.action
  if (action) void routeAction(action, actionTarget)
}

function handleInput(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLElement)) return

  if (target instanceof HTMLInputElement) {
    const field = target.dataset.field
    if (field === 'home-search') {
      state.homeSearch = target.value
      render()
    } else if (field === 'folder-name') {
      state.folderDraftName = target.value
    } else if (field === 'openai-key') {
      state.aiApiKey = target.value
      writeStoredApiKey(target.value)
    } else if (field === 'pen-width') {
      state.penWidth = Number(target.value)
      render()
    }
  }
}

function handleChange(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLElement)) return

  if (target instanceof HTMLInputElement) {
    if (target.id === 'stable-test-upload') {
      const files = target.files ? Array.from(target.files) : []
      target.value = ''
      if (files.length > 0) void uploadSheets(files)
    } else if (target.dataset.field === 'ai-model') {
      state.workspace.settings.aiModel = target.value.trim() || 'gpt-4o'
      void persistWorkspace('AI settings saved.')
    }
  }
}

async function routeAction(action: string, target: HTMLElement): Promise<void> {
  switch (action) {
    case 'go-home':
      state.homeMode = true
      state.testSurface = 'organizer'
      setFlash(null)
      render()
      break

    case 'quick-mark': {
      const accent = FOLDER_ACCENTS[Math.floor(Math.random() * FOLDER_ACCENTS.length)]
      const label = `Quick Check — ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}`
      const folder = createFolderRecord(label, 'test', null, accent)
      state.workspace.folders.unshift(folder)
      state.selectedFolderId = folder.id
      state.homeMode = false
      state.testSurface = 'organizer'
      setFlash('Quick session started.', 'info')
      await persistWorkspace('Quick session started.')
      break
    }

    case 'select-folder': {
      const id = target.dataset.folderId
      if (id) selectFolder(id)
      break
    }

    case 'toggle-fleet-select': {
      const id = target.dataset.sheetId
      if (id) {
        if (state.multiSelectIds.has(id)) state.multiSelectIds.delete(id)
        else state.multiSelectIds.add(id)
        render()
      }
      break
    }

    case 'share-fleet':
      await shareMarkedSheets(state.multiSelectIds)
      break

    case 'clear-fleet':
      state.multiSelectIds.clear()
      render()
      break

    case 'open-edit-mode':
      openEditMode()
      break

    case 'cancel-edit-mode':
      cancelEditMode()
      break

    case 'save-edit-mode':
      await saveEditMode()
      break

    case 'set-edit-tool': {
      const tool = target.dataset.tool as 'pen' | 'hand' | undefined
      if (tool) {
        state.editTool = tool
        render()
      }
      break
    }

    case 'set-color': {
      const color = target.dataset.color
      if (color) {
        state.penColor = color
        state.editTool = 'pen'
        render()
      }
      break
    }

    case 'undo-edit-stroke':
      undoEditStroke()
      break

    case 'clear-edit-strokes':
      clearEditStrokes()
      break

    case 'prev-sheet':
      stepSheet(-1)
      break

    case 'next-sheet':
      stepSheet(1)
      break

    case 'select-sheet': {
      const id = target.dataset.sheetId
      if (id) {
        state.selectedSheetId = id
        render()
      }
      break
    }

    case 'remove-sheet': {
      const id = target.dataset.sheetId
      if (id) await removeSheet(id)
      break
    }

    case 'trigger-upload':
      document.querySelector<HTMLInputElement>('#stable-test-upload')?.click()
      break

    case 'create-folder':
      await createFolder()
      break

    case 'set-folder-kind': {
      const kind = target.dataset.kind as FolderKind | undefined
      if (kind) {
        state.folderDraftKind = kind
        render()
      }
      break
    }

    case 'toggle-sidebar':
      state.sidebarOpen = !state.sidebarOpen
      render()
      break

    case 'close-sidebar':
      state.sidebarOpen = false
      render()
      break

    case 'reset-workspace':
      await resetWorkspace()
      break

    default:
      break
  }
}

// --- Main Renderers ---

function render(): void {
  const stageSurface = app.querySelector('.edit-stage-surface')
  const scrollPos = stageSurface ? { left: stageSurface.scrollLeft, top: stageSurface.scrollTop } : null

  const selectedFolder = getSelectedFolder()
  const selectedSheet = getSelectedSheet()
  const editingSheet = getEditingSheet()

  const portrait = isPortraitViewport()
  let screen = ''

  if (state.homeMode || !selectedFolder) {
    screen = renderHomeDashboard(portrait)
  } else if (selectedFolder.kind === 'test') {
    const sheets = getSheetsInFolder(state.workspace, selectedFolder.id)
    screen = renderTestOrganizerScreen(selectedFolder, sheets, selectedSheet)
  } else {
    // Student history view
    const history = getFolderHistory(state.workspace, selectedFolder.id)
    screen = renderStudentHistoryScreen(selectedFolder, history)
  }

  app.innerHTML = `
    <div class="app-shell-v2">
      ${renderWorkspaceSidebar()}
      
      <main class="pane main-pane">
        ${screen}
      </main>
      
      ${state.flash ? `
        <div class="flash-message glass-panel">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>${escapeHtml(state.flash.text)}</span>
        </div>
      ` : ''}
    </div>
    ${editingSheet ? renderEditOverlay(editingSheet) : ''}

    ${state.multiSelectIds.size > 0 ? `
      <div class="fleet-action-panel glass-panel">
        <div class="fleet-count">
           <strong>${state.multiSelectIds.size}</strong> pages selected
        </div>
        <div class="fleet-actions">
           <button class="btn btn-subtle" data-action="clear-fleet">Clear</button>
           <button class="btn btn-primary" data-action="share-fleet">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Share Fleet</span>
           </button>
        </div>
      </div>
    ` : ''}
  `

  attachStageLayers()

  if (scrollPos) {
    const newStageSurface = app.querySelector('.edit-stage-surface')
    if (newStageSurface) {
      newStageSurface.scrollLeft = scrollPos.left
      newStageSurface.scrollTop = scrollPos.top
    }
  }
}

function renderWorkspaceSidebar(): string {
  const classes = state.workspace.folders
    .filter(f => f.kind === 'classroom')
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  return `
    <aside class="sidebar-pane ${state.sidebarOpen ? 'is-active' : ''}">
       <div class="sidebar-backdrop" data-action="close-sidebar"></div>
       <div class="slate-sidebar">
          <div class="slate-brand">
             <div class="slate-logo-box">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-linecap="round" stroke-linejoin="round"/></svg>
             </div>
             <div class="slate-brand-text">
                <h1>Paper Desk</h1>
                <p>Teacher Slate v1.1</p>
             </div>
          </div>

          <div class="nav-stack">
             <button class="nav-item ${state.homeMode ? 'is-active' : ''}" data-action="go-home">
                <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Dashboard
             </button>
             <button class="nav-item" data-action="quick-mark" style="color:var(--primary);">
                <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Fast Mark
             </button>
          </div>

          <div class="sidebar-scrollable" style="flex:1; overflow-y:auto; margin-top:24px;">
             ${renderStitchCreatePanel()}
             
             <div style="margin-top:24px;">
                <span class="sidebar-section-label">Your Classes</span>
                <div class="nav-stack">
                   ${classes.map(c => `
                      <button class="nav-item ${state.selectedFolderId === c.id ? 'is-active' : ''}" data-action="select-folder" data-folder-id="${c.id}">
                         <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                         ${escapeHtml(c.name)}
                      </button>
                   `).join('')}
                </div>
             </div>
          </div>

          <div class="sidebar-footer">
             <button class="btn btn-subtle btn-sm" data-action="reset-workspace" style="width:100%; opacity:0.6;">Reset Device Cache</button>
          </div>
       </div>
    </aside>
  `
}

function renderHomeDashboard(portrait: boolean): string {
  const tests = state.workspace.folders.filter(f => f.kind === 'test').sort((a, b) => b.updatedAt - a.updatedAt)
  const query = state.homeSearch.toLowerCase()
  const filtered = tests.filter(t => t.name.toLowerCase().includes(query))
  const display = filtered.slice(0, portrait ? 6 : 12)

  return `
    <div class="slate-dashboard">
      <header class="dashboard-header">
        <div class="dashboard-title">
           <h2>Welcome to Slate</h2>
           <p>Fast, administrative-free paper checking</p>
        </div>
        <button class="btn btn-primary" data-action="quick-mark">
           <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/></svg>
           <span>New Session</span>
        </button>
      </header>

      <section>
         <span class="sidebar-section-label">Recent Sessions</span>
         ${display.length === 0 ? renderHomeEmptyCard() : `
           <div class="dashboard-grid">
             ${display.map(t => renderHomeTaskCard(t)).join('')}
           </div>
         `}
      </section>
    </div>
  `
}

function renderHomeTaskCard(folder: FolderRecord): string {
  const sheets = getSheetsInFolder(state.workspace, folder.id)
  const marked = countMarkedSheets(state.workspace, folder.id)
  const percent = sheets.length > 0 ? Math.round((marked / sheets.length) * 100) : 0

  return `
    <article class="slate-card" data-action="select-folder" data-folder-id="${folder.id}">
      <div class="card-body">
         <h3>${escapeHtml(folder.name)}</h3>
         <div class="card-footer" style="padding:0; margin-top:20px;">
            <div class="card-meta">
               <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
               <span>${marked} / ${sheets.length} pages</span>
            </div>
            <div class="progress-segment" style="width: 80px; height: 6px; background: var(--bg-darker); border-radius: 99px; overflow: hidden;">
               <div style="width:${percent}%; height: 100%; background: var(--primary);"></div>
            </div>
         </div>
      </div>
    </article>
  `
}

function renderHomeEmptyCard(): string {
  return `
    <div class="slate-card is-empty-state">
       <div class="card-body" style="text-align:center; padding:60px 40px;">
          <h3 style="margin-bottom:12px;">No active sessions</h3>
          <p style="color:var(--text-soft);">Start a "Fast Mark" session or create a class to begin.</p>
       </div>
    </div>
  `
}

function renderTestOrganizerScreen(folder: FolderRecord, sheets: SheetRecord[], selectedSheet: SheetRecord | null): string {
  const activeSheet = selectedSheet ?? sheets[0] ?? null
  const student = findStudentAncestor(state.workspace, folder.id)

  return `
    <div class="slate-workspace">
      <header class="workspace-top-bar">
         <div class="workspace-info">
            <button class="liquid-back-btn" data-action="go-home">
               <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 14 24"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="workspace-title-block">
               <h2>${escapeHtml(folder.name)}</h2>
               <p>${escapeHtml(student?.name || 'Quick Session')}</p>
            </div>
         </div>
         <div class="workspace-actions">
            <button class="btn btn-primary" data-action="open-edit-mode" ${activeSheet ? '' : 'disabled'}>
               <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-linecap="round" stroke-linejoin="round"/></svg>
               <span>Mark Selected Page</span>
            </button>
         </div>
      </header>

      <div class="workspace-viewer">
         <div class="workspace-sub-header">
            <span class="sidebar-section-label">Organizer & Fleet Selection</span>
            <div class="header-pagination">
               <span class="pag-label">Total Pages</span>
               <span class="pag-value" style="color:var(--primary);">${sheets.length}</span>
            </div>
         </div>

         ${sheets.length === 0 ? `
           <div class="empty-state">
              <h3 style="margin-bottom:12px;">No pages added</h3>
              <p>Upload student answer sheets to start.</p>
              <button class="btn btn-primary" data-action="trigger-upload" style="margin-top:24px;">Add Pages</button>
           </div>
         ` : `
           <div class="page-grid">
              ${sheets.map((s, i) => renderPageSlug(s, i, s.id === activeSheet?.id)).join('')}
           </div>
         `}
      </div>

      <div class="workspace-bottom-bar glass-panel">
         <div class="card-meta">
            <p style="font-size:0.85rem; color:var(--text-soft);">Select marked pages to share as a bulk individual bundle.</p>
         </div>
         <button class="btn btn-subtle" data-action="trigger-upload">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Add More Pages</span>
         </button>
      </div>
    </div>
  `
}

function renderPageSlug(sheet: SheetRecord, index: number, isActive: boolean): string {
  const isSelected = state.multiSelectIds.has(sheet.id)
  return `
    <div class="page-slug ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}" data-action="select-sheet" data-sheet-id="${sheet.id}">
       <div class="page-thumb">
          <img src="${getObjectUrl(sheet)}" alt="">
          <div class="page-overlay">
             <div class="page-badge">P${index + 1}</div>
             <button class="fleet-select-box" data-action="toggle-fleet-select" data-sheet-id="${sheet.id}" onclick="event.stopPropagation()">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
             </button>
          </div>
       </div>
       <div class="page-info">
          <span>Page ${index + 1}</span>
          <div class="page-status ${sheet.strokes.length > 0 ? 'is-marked' : ''}"></div>
       </div>
    </div>
  `
}

function renderStudentHistoryScreen(folder: FolderRecord, history: FolderHistoryItem[]): string {
  return `
    <div class="slate-workspace">
      <header class="workspace-top-bar">
         <div class="workspace-info">
            <button class="liquid-back-btn" data-action="go-home">
               <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 14 24"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="workspace-title-block">
               <h2>${escapeHtml(folder.name)}</h2>
               <p>${folder.kind === 'classroom' ? 'Classroom Repository' : 'Student Performance'}</p>
            </div>
         </div>
      </header>

      <div class="workspace-viewer">
         <div class="history-list">
            ${history.map(h => `
               <article class="slate-card timeline-row" data-action="select-folder" data-folder-id="${h.folder.id}">
                  <div class="card-body" style="display:flex; justify-content:space-between; align-items:center;">
                     <div>
                        <h4 style="margin:0;">${escapeHtml(h.folder.name)}</h4>
                        <p style="margin:0; font-size:0.8rem; color:var(--text-soft);">${formatDate(h.folder.createdAt)}</p>
                     </div>
                     <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
               </article>
            `).join('')}
         </div>
      </div>
    </div>
  `
}

function renderEditOverlay(sheet: SheetRecord): string {
  const stageSize = getEditorStageSize(sheet)
  const folder = getFolderById(state.workspace, sheet.folderId)
  const student = findStudentAncestor(state.workspace, sheet.folderId)

  return `
    <div class="edit-overlay">
      <div class="edit-shell edit-shell-focus">
        <header class="edit-liquid-header">
          <div class="header-left">
            <button class="liquid-back-btn" data-action="cancel-edit-mode">
               <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          
          <div class="header-center">
            <div class="liquid-marker-pill">
              <span class="pill-eyebrow">Marking Perspective</span>
              <div class="pill-pair">
                 <span class="student-name">${escapeHtml(student?.name || 'Check Mode')}</span>
                 <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="opacity:0.4;"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                 <span class="exam-label">${escapeHtml(folder?.name || 'Classroom')}</span>
              </div>
            </div>
          </div>

          <div class="header-right">
             <button class="liquid-done-btn" data-action="save-edit-mode">
                <span>Done</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
             </button>
          </div>
        </header>

        <div class="edit-workbench-v2">
          <div class="edit-stage-surface" style="touch-action: ${state.editTool === 'hand' ? 'pan-x pan-y pinch-zoom' : 'none'};">
             <div class="edit-stage-frame" data-edit-stage-frame style="width:${stageSize.width}px; height:${stageSize.height}px;">
               <img id="edit-stage-image" src="${getObjectUrl(sheet)}" alt="" />
               <canvas id="edit-ink-layer"></canvas>
               <canvas id="edit-ink-preview-layer"></canvas>
             </div>
          </div>

          <aside class="edit-floating-toolkit">
            <div class="toolkit-section">
              <div class="toolkit-row">
                 <button class="toolkit-tool-btn" data-action="set-edit-tool" data-tool="pen" data-active="${state.editTool === 'pen'}">
                   <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                 </button>
                 <button class="toolkit-tool-btn" data-action="set-edit-tool" data-tool="hand" data-active="${state.editTool === 'hand'}">
                   <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M7 11.5V5a2 2 0 114 0v6.5m0 0V3.5a2 2 0 114 0v8m0 0V5.5a2 2 0 114 0V12a7 7 0 11-14 0V9a2 2 0 114 0v2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                 </button>
              </div>
            </div>

            <div class="toolkit-divider"></div>

            <div class="toolkit-section" style="${state.editTool === 'hand' ? 'opacity:0.3; pointer-events:none;' : ''}">
              <div class="toolkit-swatch-grid">
                 ${COLORS.map(c => `
                    <button class="toolkit-swatch" data-action="set-color" data-color="${c}" data-active="${state.penColor === c}" style="--ink:${c};"></button>
                 `).join('')}
              </div>
              <input type="range" class="toolkit-range" min="3" max="40" step="1" value="${state.penWidth}" data-field="pen-width" />
            </div>

             <div class="toolkit-divider"></div>

             <div class="toolkit-section">
                 <button class="toolkit-action-btn-sm" data-action="undo-edit-stroke" title="Undo">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M3 10h10a5 5 0 110 10H8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                 </button>
             </div>
          </aside>
        </div>
      </div>
    </div>
  `
}

function renderStitchCreatePanel(): string {
  const placeholder = state.folderDraftKind === 'classroom' ? 'E.g. Class 10' : state.folderDraftKind === 'student' ? 'Student Name' : 'Exam Name'
  return `
    <div class="stitch-create-panel">
      <div class="stitch-create-actions">
        <button class="stitch-create-btn ${state.folderDraftKind === 'classroom' ? 'is-active' : ''}" data-action="set-folder-kind" data-kind="classroom">+ Class</button>
        <button class="stitch-create-btn ${state.folderDraftKind === 'student' ? 'is-active' : ''}" data-action="set-folder-kind" data-kind="student">+ Student</button>
        <button class="stitch-create-btn ${state.folderDraftKind === 'test' ? 'is-active' : ''}" data-action="set-folder-kind" data-kind="test">+ Session</button>
      </div>
      <div class="stitch-create-inline-form">
        <input class="text-input" type="text" data-field="folder-name" value="${escapeHtml(state.folderDraftName)}" placeholder="${placeholder}" autocomplete="off" />
        <button class="btn-add" data-action="create-folder">Add</button>
      </div>
    </div>
  `
}

// --- Action Logic ---

async function createFolder(): Promise<void> {
  const name = state.folderDraftName.trim()
  if (!name) return setFlash('Enter a name.', 'error')

  const parentId = getFolderCreateParentId(state.workspace, state.selectedFolderId, state.folderDraftKind)
  const folder = createFolderRecord(name, state.folderDraftKind, parentId, FOLDER_ACCENTS[state.workspace.folders.length % FOLDER_ACCENTS.length])

  state.workspace.folders.push(folder)
  state.homeMode = false
  state.selectedFolderId = folder.id
  state.selectedSheetId = null
  state.folderDraftName = ''
  setFlash(`Created "${name}"`, 'info')
  await persistWorkspace('Ready to start.')
}

function selectFolder(id: string): void {
  state.homeMode = false
  state.selectedFolderId = id
  const sheets = getSheetsInFolder(state.workspace, id)
  state.selectedSheetId = sheets[0]?.id ?? null
  state.multiSelectIds.clear()
  render()
}

async function uploadSheets(files: File[]): Promise<void> {
  const folder = getSelectedFolder()
  if (!folder || folder.kind !== 'test') return setFlash('Open a session to upload.', 'error')

  state.saveTone = 'saving'
  state.saveLabel = 'Importing...'
  render()

  try {
    const currentCount = getSheetsInFolder(state.workspace, folder.id).length
    const newSheets: SheetRecord[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const size = await readImageSize(file)
        newSheets.push({
          id: crypto.randomUUID(),
          folderId: folder.id,
          name: file.name,
          pageLabel: `Page ${currentCount + i + 1}`,
          image: file,
          width: size.width,
          height: size.height,
          sortOrder: currentCount + i,
          strokes: [],
          markedAt: null,
          selectedForAi: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      } catch (err) {
        console.error('Failed to read image size for', file.name, err)
      }
    }

    if (newSheets.length > 0) {
      state.workspace.sheets.push(...newSheets)
      state.selectedSheetId = state.selectedSheetId ?? newSheets[0]?.id ?? null
      setFlash(`Imported ${newSheets.length} pages.`, 'info')
      await persistWorkspace('Pages ready.')
    } else {
      setFlash('No valid images were found.', 'error')
    }
  } catch (e) {
    setFlash('Failed to process upload.', 'error')
  } finally {
    render()
  }
}

async function removeSheet(id: string): Promise<void> {
  state.workspace.sheets = state.workspace.sheets.filter(s => s.id !== id)
  revokeObjectUrl(id)
  syncSelection()
  await persistWorkspace('Page removed.')
}

function openEditMode(): void {
  const sheet = getSelectedSheet()
  if (!sheet) return
  state.editSession = {
    sheetId: sheet.id,
    draftStrokes: cloneStrokes(sheet.strokes)
  }
  render()
}

async function saveEditMode(): Promise<void> {
  const sheet = getEditingSheet()
  if (!sheet || !state.editSession) return
  sheet.strokes = cloneStrokes(state.editSession.draftStrokes)
  sheet.markedAt = sheet.strokes.length > 0 ? Date.now() : null
  sheet.updatedAt = Date.now()
  state.editSession = null
  await persistWorkspace('Marks saved.')
}

function cancelEditMode(): void {
  state.editSession = null
  render()
}

function undoEditStroke(): void {
  if (state.editSession && state.editSession.draftStrokes.length > 0) {
    state.editSession.draftStrokes.pop()
    render()
  }
}

function clearEditStrokes(): void {
  if (state.editSession) {
    state.editSession.draftStrokes = []
    render()
  }
}

function stepSheet(dir: number): void {
  const folder = getSelectedFolder()
  if (!folder) return
  const sheets = getSheetsInFolder(state.workspace, folder.id)
  const idx = sheets.findIndex(s => s.id === state.selectedSheetId)
  const next = sheets[idx + dir]
  if (next) {
    state.selectedSheetId = next.id
    render()
  }
}

async function shareMarkedSheets(ids?: Set<string>): Promise<void> {
  const folder = getSelectedFolder()
  if (!folder) return

  const allInFolder = getSheetsInFolder(state.workspace, folder.id)
  const targetIds = ids ? Array.from(ids) : null
  const targets = targetIds ? allInFolder.filter(s => targetIds.includes(s.id)) : allInFolder.filter(s => s.strokes.length > 0)

  if (targets.length === 0) return setFlash('No pages to share.', 'info')

  state.shareBusy = true
  render()

  try {
    const files: File[] = []
    for (const sheet of targets) {
      const blob = await renderMarkedSheetBlob(sheet)
      files.push(new File([blob], `${buildSafeFilename(sheet.pageLabel || sheet.name)}.jpg`, { type: 'image/jpeg' }))
    }

    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({ files, title: folder.name, text: 'Marked copies' })
    } else {
      for (const f of files) {
        const url = URL.createObjectURL(f)
        const a = document.createElement('a')
        a.href = url; a.download = f.name; a.click()
        URL.revokeObjectURL(url)
      }
    }
    setFlash('Shared successfully.', 'info')
  } catch (e) {
    setFlash(getErrorMessage(e, 'Sharing failed.'), 'error')
  } finally {
    state.shareBusy = false
    render()
  }
}

async function resetWorkspace(): Promise<void> {
  if (!window.confirm('Clear all local data?')) return
  await clearWorkspaceData()
  state.workspace.sheets.forEach(s => revokeObjectUrl(s.id))
  state.workspace = createEmptyWorkspace()
  state.homeMode = true
  state.selectedFolderId = null
  state.selectedSheetId = null
  await persistWorkspace('Workspace reset.')
}

async function persistWorkspace(msg: string): Promise<void> {
  syncSelection()
  state.saveTone = 'saving'
  state.saveLabel = 'Syncing...'
  render()
  try {
    state.workspace.updatedAt = Date.now()
    await saveWorkspace(state.workspace)
    state.saveTone = 'saved'
    state.saveLabel = msg
  } catch (e) {
    state.saveTone = 'error'
    state.saveLabel = 'Save failed.'
  }
  render()
}

// --- Ink & Canvas Logic ---

let stageMountId = 0
let resizeObserver: ResizeObserver | null = null
let currentPointerId: number | null = null
let currentStroke: InkStroke | null = null
let predictedPoints: InkPoint[] = []
let previewFrameHandle = 0

function attachStageLayers(): void {
  resizeObserver?.disconnect()
  resizeObserver = null
  currentStroke = null
  currentPointerId = null
  predictedPoints = []

  if (state.editSession) attachEditStage()
  else attachReadOnlyStage()
}

function attachReadOnlyStage(): void {
  const sheet = getSelectedSheet()
  const frame = app.querySelector<HTMLElement>('[data-stage-frame]')
  const committedCanvas = app.querySelector<HTMLCanvasElement>('#ink-layer')
  if (!sheet || !frame || !committedCanvas) return

  const mountId = ++stageMountId
  const draw = () => {
    if (mountId !== stageMountId) return
    const w = frame.clientWidth, h = frame.clientHeight
    const ctx = syncCanvasSize(committedCanvas, w, h)
    if (ctx) sheet.strokes.forEach(s => drawStrokeOnContext(ctx, s, { width: sheet.width, height: sheet.height }, { width: w, height: h }))
  }

  resizeObserver = new ResizeObserver(draw)
  resizeObserver.observe(frame)
  window.requestAnimationFrame(draw)
}

function attachEditStage(): void {
  const session = state.editSession
  const sheet = getEditingSheet()
  const frame = app.querySelector<HTMLElement>('[data-edit-stage-frame]')
  const committedCanvas = app.querySelector<HTMLCanvasElement>('#edit-ink-layer')
  const previewCanvas = app.querySelector<HTMLCanvasElement>('#edit-ink-preview-layer')
  if (!session || !sheet || !frame || !committedCanvas || !previewCanvas) return

  const mountId = ++stageMountId
  const renderAll = () => {
    if (mountId !== stageMountId) return
    const w = frame.clientWidth, h = frame.clientHeight
    const cCtx = syncCanvasSize(committedCanvas, w, h)
    const pCtx = syncCanvasSize(previewCanvas, w, h)
    if (cCtx) session.draftStrokes.forEach(s => drawStrokeOnContext(cCtx, s, { width: sheet.width, height: sheet.height }, { width: w, height: h }))
    if (pCtx && currentStroke) drawLiveStrokeOnContext(pCtx, currentStroke, { width: sheet.width, height: sheet.height }, { width: w, height: h }, predictedPoints)
  }

  const renderPre = () => {
    const w = frame.clientWidth, h = frame.clientHeight
    const pCtx = syncCanvasSize(previewCanvas, w, h)
    if (pCtx && currentStroke) drawLiveStrokeOnContext(pCtx, currentStroke, { width: sheet.width, height: sheet.height }, { width: w, height: h }, predictedPoints)
  }

  const schedulePr = () => {
    if (previewFrameHandle) return
    previewFrameHandle = window.requestAnimationFrame(() => {
      previewFrameHandle = 0
      renderPre()
    })
  }

  previewCanvas.addEventListener('pointerdown', (e) => {
    state.activePointingType = e.pointerType
    if (state.editTool !== 'pen' || (e.pointerType === 'touch' && state.activePointingType === 'pen')) return
    e.preventDefault()
    currentPointerId = e.pointerId
    currentStroke = { id: crypto.randomUUID(), color: state.penColor, width: state.penWidth, opacity: 1, points: samplePoints(e, previewCanvas, sheet) }
    previewCanvas.setPointerCapture(e.pointerId)
    schedulePr()
  })

  previewCanvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== currentPointerId || !currentStroke) return
    currentStroke.points.push(...samplePoints(e, previewCanvas, sheet))
    predictedPoints = samplePredictedPoints(e, previewCanvas, sheet)
    schedulePr()
  })

  const end = () => {
    if (currentStroke && session) session.draftStrokes.push(currentStroke)
    currentStroke = null; currentPointerId = null; predictedPoints = []
    renderAll()
  }

  previewCanvas.addEventListener('pointerup', end)
  previewCanvas.addEventListener('pointercancel', end)
  previewCanvas.addEventListener('lostpointercapture', end)

  resizeObserver = new ResizeObserver(renderAll)
  resizeObserver.observe(frame)
  window.requestAnimationFrame(renderAll)
}

function refreshStageCanvases(): void {
  attachStageLayers()
}

// --- Utils ---

function getSelectedFolder(): FolderRecord | null { return getFolderById(state.workspace, state.selectedFolderId) }
function getSelectedSheet(): SheetRecord | null { return state.workspace.sheets.find(s => s.id === state.selectedSheetId) ?? null }
function getEditingSheet(): SheetRecord | null { return state.workspace.sheets.find(s => s.id === state.editSession?.sheetId) ?? null }

function syncSelection(): void {
  if (state.homeMode) { state.selectedSheetId = null; return }
  const sel = ensureValidSelection(state.workspace, state.selectedFolderId, state.selectedSheetId)
  state.selectedFolderId = sel.selectedFolderId
  state.selectedSheetId = sel.selectedSheetId
}

const objectUrlCache = new Map<string, string>()
function getObjectUrl(sheet: SheetRecord): string {
  if (objectUrlCache.has(sheet.id)) return objectUrlCache.get(sheet.id)!
  const url = URL.createObjectURL(sheet.image)
  objectUrlCache.set(sheet.id, url)
  return url
}
function revokeObjectUrl(id: string): void {
  const url = objectUrlCache.get(id)
  if (url) { URL.revokeObjectURL(url); objectUrlCache.delete(id) }
}

function cloneStrokes(s: InkStroke[]): InkStroke[] { return s.map(x => ({ ...x, points: x.points.map(p => ({ ...p })) })) }
function samplePoints(e: PointerEvent, c: HTMLCanvasElement, s: SheetRecord): InkPoint[] {
  const r = c.getBoundingClientRect()
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
  return evs.map(ex => ({
    x: clamp(((ex.clientX - r.left) / r.width) * s.width, 0, s.width),
    y: clamp(((ex.clientY - r.top) / r.height) * s.height, 0, s.height),
    pressure: ex.pointerType === 'mouse' ? 0.5 : clamp(ex.pressure || 0.5, 0.05, 1)
  }))
}
function samplePredictedPoints(e: PointerEvent, c: HTMLCanvasElement, s: SheetRecord): InkPoint[] {
  if (!e.getPredictedEvents) return []
  const r = c.getBoundingClientRect()
  return e.getPredictedEvents().map(ex => ({
    x: clamp(((ex.clientX - r.left) / r.width) * s.width, 0, s.width),
    y: clamp(((ex.clientY - r.top) / r.height) * s.height, 0, s.height),
    pressure: ex.pointerType === 'mouse' ? 0.5 : clamp(ex.pressure || 0.5, 0.05, 1)
  }))
}

function getEditorStageSize(sheet: SheetRecord): { width: number; height: number } {
  const maxWidth = window.innerWidth * 0.9, maxHeight = window.innerHeight * 0.75
  const scale = Math.min(maxWidth / sheet.width, maxHeight / sheet.height)
  return { width: sheet.width * scale, height: sheet.height * scale }
}

function readImageSize(f: File): Promise<{ width: number; height: number }> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(f), img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); res({ width: img.naturalWidth, height: img.naturalHeight }) }
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Image load failed')) }
    img.src = url
  })
}

let flashTimeout = 0
function setFlash(text: string | null, tone: FlashTone = 'info'): void {
  window.clearTimeout(flashTimeout)
  state.flash = text ? { text, tone } : null
  if (text) flashTimeout = window.setTimeout(() => { state.flash = null; render() }, 3000)
  render()
}

function isPortraitViewport(): boolean { return window.innerHeight > window.innerWidth }
function escapeHtml(s: string): string { return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;') }
function formatDate(t: number): string { return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(t) }
function buildSafeFilename(v: string): string { return v.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'page' }
function clamp(v: number, min: number, max: number): number { return Math.min(max, Math.max(min, v)) }
function getErrorMessage(e: any, f: string): string { return e instanceof Error ? e.message : f }
function readStoredApiKey(): string { return window.localStorage.getItem(OPENAI_KEY_STORAGE) || '' }
function writeStoredApiKey(v: string): void { if (v) window.localStorage.setItem(OPENAI_KEY_STORAGE, v); else window.localStorage.removeItem(OPENAI_KEY_STORAGE) }
