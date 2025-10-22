# Implementation Checklist - Core Shortcut Management (Requirement #1)

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Project
- [ ] Create `src/` directory structure
- [ ] Set up `package.json` with dependencies
- [ ] Configure Vite for bundling
- [ ] Set up ESLint and Prettier
- [ ] Create `manifest.json` for Chrome extension
- [ ] Create `.gitignore` and `.env.example`

### 1.2 Dependencies & Libraries
- [ ] Install React, React-DOM
- [ ] Install Zustand (state management)
- [ ] Install UUID library (for generating IDs)
- [ ] Install dexie.js (IndexedDB wrapper - optional, or vanilla IndexedDB)
- [ ] Install date-fns (for date formatting)
- [ ] Configure Tailwind CSS or CSS modules

### 1.3 Chrome Extension Configuration
- [ ] Set up content script for context menu
- [ ] Set up background service worker
- [ ] Configure popup window dimensions and properties
- [ ] Set up permissions in manifest.json:
  - `activeTab`
  - `scripting`
  - `contextMenus`
  - `storage`
  - `tabs`

### 1.4 Development Environment
- [ ] Set up dev build process
- [ ] Set up watch mode for development
- [ ] Configure hot reload (if needed)
- [ ] Create build output directory

---

## Phase 2: Core Data Layer & Services

### 2.1 IndexedDB Setup
- [ ] Create `services/db.js` with:
  - IndexedDB initialization
  - Database schema (version 1)
  - Store creation (shortcuts, folders, searches)
  - Migration logic
  - Error handling

### 2.2 Shortcut Service (`services/shortcutService.js`)
- [ ] `createShortcut(data)` - Add new shortcut
  - Validate alias uniqueness within folder
  - Validate URL format
  - Generate UUID
  - Store metadata (createdAt, accessCount, lastAccessedAt)
  - Return created shortcut

- [ ] `getShortcut(id)` - Get single shortcut
- [ ] `getShortcutByFullAlias(folder, alias)` - Get by folder/alias combo
- [ ] `getShortcutByUrl(url)` - Get by URL
- [ ] `getAllShortcuts()` - Get all shortcuts
- [ ] `getShortcutsByFolder(folder)` - Get shortcuts in folder
- [ ] `getShortcutsByTag(tag)` - Get shortcuts with tag
- [ ] `updateShortcut(id, data)` - Update shortcut
  - Validate new alias doesn't conflict
  - Update `updatedAt` timestamp
- [ ] `deleteShortcut(id)` - Delete shortcut
- [ ] `searchShortcuts(query)` - Search implementation
  - Priority: exact alias > partial alias > tags > URL
- [ ] `getFrequentShortcuts(limit)` - Get top N by access count
- [ ] `incrementAccessCount(id)` - Track usage

### 2.3 Folder Service
- [ ] `createFolder(name)` - Create folder
  - Validate name uniqueness
  - Store folder metadata
- [ ] `getAllFolders()` - Get all folders with counts
- [ ] `renameFolder(oldName, newName)` - Rename folder
  - Validate new name uniqueness
  - Update all shortcuts in folder
- [ ] `deleteFolder(name)` - Delete folder
  - Only allow if empty
- [ ] `getFolderStats(name)` - Get folder shortcut count

### 2.4 Chrome Storage Service (`services/storageService.js`)
- [ ] `getSettings()` - Retrieve user settings
- [ ] `updateSettings(settings)` - Update settings
- [ ] `getUndoStack()` - Get undo history
- [ ] `addToUndoStack(action, data)` - Add deletion to undo
- [ ] `clearOldUndoItems()` - Clear undo older than 30 seconds

### 2.5 Chrome API Service (`services/chromeApi.js`)
- [ ] `getCurrentTab()` - Get active tab URL and title
- [ ] `openUrl(url, newTab)` - Open URL
- [ ] `copyToClipboard(text)` - Copy URL to clipboard
- [ ] `registerContextMenu()` - Set up right-click menu
- [ ] `setupOmnibox()` - Set up address bar integration (Requirement #2)

### 2.6 Utilities & Helpers
- [ ] `validators.js`:
  - `isValidUrl(url)` - HTTP/HTTPS validation
  - `isValidAlias(alias)` - Alphanumeric, hyphens, underscores
  - `isValidFolderName(name)` - Same as alias validation
  - `isValidTag(tag)` - Lowercase only
  - `isUniqueAlias(folder, alias)` - Check uniqueness

- [ ] `formatters.js`:
  - `formatFullAlias(folder, alias)` - Generate folder/alias
  - `parseFullAlias(fullAlias)` - Parse folder/alias
  - `formatDate(date)` - User-friendly date formatting
  - `extractTitleFromUrl(url)` - Parse page title to suggest alias

---

## Phase 3: State Management

### 3.1 Zustand Store (`store/appStore.js`)
- [ ] **Shortcuts State**:
  - `shortcuts: []` - All shortcuts
  - `selectedShortcutId: null` - Currently selected
  - `editingShortcutId: null` - In edit mode
  - `addShortcut(shortcut)` - Add to state
  - `updateShortcut(id, data)` - Update in state
  - `deleteShortcut(id)` - Remove from state
  - `setShortcuts(shortcuts)` - Load all

- [ ] **Search State**:
  - `searchQuery: ''` - Current search term
  - `searchResults: []` - Filtered results
  - `setSearchQuery(query)` - Update search
  - `performSearch(query)` - Run search algorithm

- [ ] **Folder State**:
  - `folders: []` - All folders with counts
  - `selectedFolder: null` - Active folder filter
  - `addFolder(name)` - Add folder
  - `renameFolder(oldName, newName)` - Rename
  - `deleteFolder(name)` - Remove folder
  - `setFolders(folders)` - Load all

- [ ] **UI State**:
  - `showDashboard: false` - Dashboard visibility
  - `showSearchPopup: false` - Search popup visibility
  - `editMode: false` - Edit mode toggle
  - `toasts: []` - Toast notifications queue
  - `addToast(message, type)` - Show notification
  - `removeToast(id)` - Remove notification

- [ ] **Undo State**:
  - `undoStack: []` - Recent deletions
  - `addToUndoStack(action)` - Add deletion
  - `undo()` - Perform undo
  - `clearOldUndos()` - Clean up old items

---

## Phase 4: React Components

### 4.1 Plugin Popup Components (`components/PluginPopup/`)

#### ContextAwareModal.jsx
- [ ] Detect if URL is already shortcut
- [ ] Conditionally render:
  - Add shortcut form (if new)
  - View shortcut card (if existing)
- [ ] [🏠 Home] button → Opens Dashboard
- [ ] Props: `currentUrl`, `currentTitle`

#### AddShortcutForm.jsx
- [ ] Form fields:
  - Alias (auto-focused, auto-filled from title)
  - URL (read-only, grayed)
  - Folder dropdown
  - Tags input
- [ ] Validation on blur for each field
- [ ] Error messages displayed inline
- [ ] [Save] button (disabled if invalid)
- [ ] [Cancel] button
- [ ] Keyboard: `Cmd+Enter` to save, `Escape` to cancel
- [ ] Success toast on save
- [ ] Reset form after save

#### ViewShortcutCard.jsx
- [ ] Display read-only shortcut details:
  - Alias (folder/alias)
  - URL
  - Folder
  - Tags (as pills)
  - Created date
  - Last accessed
  - Access count
- [ ] Action buttons:
  - [Open in Tab] - `O` shortcut
  - [Open in New Tab] - `N` shortcut
  - [Copy URL] - `C` shortcut
  - [Edit] - Opens EditMode
  - [Delete] - Shows confirmation
- [ ] [🏠 Home] button → Opens Dashboard

#### EditShortcutModal.jsx (from ViewCard)
- [ ] Same as AddShortcutForm but:
  - Shows full alias (folder/alias)
  - URL is editable
  - Can change folder (updates full alias)
  - Validation checks for conflicts
- [ ] [Save] [Cancel] buttons
- [ ] `Cmd+Enter` to save, `Escape` to cancel
- [ ] Success toast on update

### 4.2 Dashboard Components (`components/Dashboard/`)

#### Dashboard.jsx
- [ ] Main layout:
  - Left sidebar (FolderSidebar)
  - Right content (ShortcutList)
- [ ] Header with search bar
- [ ] [+ New] button
- [ ] [⌘+Shift+O] hint
- [ ] Props: `shortcuts`, `folders`

#### FolderSidebar.jsx
- [ ] Hamburger menu toggle (☰)
- [ ] Folder list with counts:
  - Clickable folders
  - "Root" section
  - Ungrouped section
- [ ] Total shortcuts summary
- [ ] Bottom actions:
  - [Settings]
  - [Export]
  - [Import]
- [ ] Click folder → Filter shortcuts

#### ShortcutList.jsx
- [ ] Organize by folder:
  - Collapsible folder sections
  - Each shortcut as expandable item
- [ ] Shortcut display:
  - Alias with folder prefix
  - URL (always visible)
  - Tags as pills
  - Stars (⭐) for frequent
  - Last accessed time
  - Access count
- [ ] Keyboard navigation:
  - ↑↓ between shortcuts
  - → to expand/collapse
  - Enter to open
  - E to edit
  - D to delete
  - C to copy
- [ ] Click shortcut → Expand/show actions

#### ShortcutEditForm.jsx
- [ ] Inline edit form (expands item):
  - Alias input (shows full path)
  - URL input (editable)
  - Folder dropdown
  - Tags input
- [ ] Validation in real-time
- [ ] [Save] [Cancel] buttons
- [ ] `Cmd+Enter` to save
- [ ] Success toast on update

### 4.3 Search Popup Components (`components/SearchPopup/`)

#### SearchPopup.jsx
- [ ] Modal overlay:
  - Search input (auto-focused)
  - Results list
  - Footer with navigation hints
- [ ] [🏠 Home] button → Opens Dashboard
- [ ] Keyboard: `Escape` to close
- [ ] Listen for `Cmd+Shift+O` to open

#### SearchResults.jsx
- [ ] Show frequent shortcuts when empty
- [ ] Categorize results:
  - Exact matches (heading with count)
  - Partial matches (heading with count)
  - Tag matches (heading with count)
  - URL matches (heading with count, dimmed)
- [ ] Each result shows:
  - Full alias (folder/alias)
  - URL
  - Tags (pills)
- [ ] Highlight current selection
- [ ] Keyboard navigation:
  - ↑↓ between results
  - Enter to open
  - Cmd+Enter for new tab
  - C to copy
  - E to edit
  - D to delete
  - Escape to close

### 4.4 Common Components (`components/Common/`)

#### Toast.jsx
- [ ] Render toast notifications:
  - Success (green, checkmark)
  - Error (red, X)
  - Info (blue, info icon)
- [ ] Position: top-right
- [ ] Auto-dismiss after 5 seconds
- [ ] [Undo] button for delete toasts (30 sec window)
- [ ] Dismiss icon
- [ ] Animation: slide-in 300ms

#### Modal.jsx
- [ ] Reusable modal wrapper:
  - Backdrop overlay
  - Center modal box
  - Close button (X)
  - Proper focus management
- [ ] Keyboard: Escape to close
- [ ] Props: `title`, `children`, `onClose`

#### ConfirmDialog.jsx
- [ ] Confirmation modal:
  - Title (e.g., "Delete Shortcut?")
  - Description
  - Details (shortcut info)
  - [Confirm] and [Cancel] buttons
- [ ] Keyboard: D to confirm, Escape to cancel
- [ ] Props: `title`, `message`, `details`, `onConfirm`

#### Input.jsx
- [ ] Custom input component:
  - Dark mode styling
  - Focus glow (cyan)
  - Error state (red border)
  - Success indicator (checkmark)
  - Placeholder styling
- [ ] Props: `value`, `onChange`, `error`, `validated`

#### Button.jsx
- [ ] Custom button component:
  - Accent color
  - Hover/active states
  - Disabled state
  - Loading spinner
  - Size variants (sm, md, lg)
- [ ] Props: `onClick`, `disabled`, `loading`, `variant`

#### TagPill.jsx
- [ ] Display single tag:
  - Dark background
  - Rounded corners
  - Optional close icon (X)
- [ ] Props: `tag`, `onRemove`

### 4.5 Icons (`components/Icons/`)
- [ ] SVG icon components:
  - FolderIcon, HomeIcon, SearchIcon
  - DeleteIcon, EditIcon, CopyIcon
  - ChevronUp/Down, ChevronRight
  - StarIcon, CheckIcon, XIcon
  - HamburgerIcon, SettingsIcon

---

## Phase 5: Keyboard Shortcuts & Navigation

### 5.1 Keyboard Handler Hook (`hooks/useKeyboard.js`)
- [ ] Listen for global shortcuts:
  - `Cmd+Shift+O` → Toggle search popup
  - `Cmd+Z` → Undo (when focus is on our UI)
- [ ] Listen for context shortcuts:
  - Within Dashboard: /, N, D, E, C, ↑↓, →, Enter
  - Within Search: ↑↓, Enter, Cmd+Enter, C, E, D, Escape
  - Within Forms: Tab, Shift+Tab, Cmd+Enter, Escape
- [ ] Prevent default browser behavior where needed
- [ ] Return cleanup function for event listeners

### 5.2 Focus Management (`hooks/useFocus.js`)
- [ ] Auto-focus first input in modals
- [ ] Restore focus on modal close
- [ ] Trap focus within modals (keyboard navigation)
- [ ] Focus on newly created/edited items

---

## Phase 6: Styling & Theming

### 6.1 Global Styles (`styles/global.css`)
- [ ] CSS variables for colors (dark mode palette)
- [ ] Base element styles:
  - `body`, `html`
  - Scrollbars (thin, dark)
  - Focus outlines (cyan glow)
- [ ] Dark mode by default
- [ ] Typography defaults

### 6.2 Component Styles
- [ ] Modal styling (backdrop, centered box)
- [ ] Input styling (dark background, glow on focus)
- [ ] Button styling (accent colors, hover states)
- [ ] List/grid layout for shortcuts
- [ ] Sidebar styling
- [ ] Toast positioning and animations

### 6.3 Animations (`styles/animations.css`)
- [ ] Modal fade-in: 200ms
- [ ] Toast slide-in: 300ms from top-right
- [ ] Shortcut expand: 150ms height animation
- [ ] Button hover: 100ms scale
- [ ] Search results stagger: 50ms per item
- [ ] Focus glow pulse: continuous subtle animation

---

## Phase 7: Testing & Validation

### 7.1 Manual Testing Checklist
- [ ] Test plugin icon click on new URL → Shows add form
- [ ] Test plugin icon click on existing URL → Shows view card
- [ ] Test adding shortcut with all fields
- [ ] Test adding shortcut with only alias
- [ ] Test validation errors for each field
- [ ] Test editing shortcut from view card
- [ ] Test editing shortcut from dashboard
- [ ] Test keyboard shortcuts (all of them)
- [ ] Test search with exact, partial, tag, URL matches
- [ ] Test opening shortcuts from search and dashboard
- [ ] Test delete with confirmation
- [ ] Test undo deletion (within 30 sec)
- [ ] Test folder organization and filtering
- [ ] Test creating/renaming folders
- [ ] Test toast notifications
- [ ] Test keyboard-only navigation (no mouse)
- [ ] Test dark mode appearance
- [ ] Test responsive layout (if applicable)

### 7.2 Browser Testing
- [ ] Chrome (primary)
- [ ] Edge (Chromium-based)
- [ ] Test on different screen sizes

### 7.3 Edge Cases
- [ ] Very long URLs
- [ ] Special characters in aliases
- [ ] Unicode in tags
- [ ] Rapid-fire deletions
- [ ] Undo after refresh
- [ ] Large number of shortcuts (1000+)
- [ ] Empty search results
- [ ] Duplicate URL additions

---

## Phase 8: Build & Deployment

### 8.1 Build Process
- [ ] Configure production build
- [ ] Minify and bundle code
- [ ] Create source maps for debugging
- [ ] Test production build locally

### 8.2 Extension Packaging
- [ ] Generate extension ZIP file
- [ ] Create README for extension submission
- [ ] Prepare screenshots/icon assets

### 8.3 Documentation
- [ ] Create USER_GUIDE.md for users
- [ ] Create DEVELOPER_GUIDE.md for contributors
- [ ] Document keyboard shortcuts
- [ ] Document settings/configuration

---

## Priority & Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: Data Layer (critical path)
    ↓
Phase 3: State Management
    ├→ Phase 4: Components
    ├→ Phase 5: Keyboard
    └→ Phase 6: Styling
    ↓
Phase 7: Testing
    ↓
Phase 8: Build & Deploy
```

**Fast Track for MVP:**
1. Phase 1 (Setup)
2. Phase 2 (Data layer - core services only)
3. Phase 3 (Zustand store)
4. Phase 4 (PluginPopup + Dashboard basic)
5. Phase 5 (Basic keyboard)
6. Phase 6 (Core styling)
7. Phase 7 (Manual testing)

This gets core shortcut add/view/edit/delete working with keyboard support.

**Next Phases (Requirement #2+):**
- Search Dashboard (Requirement #2)
- Omnibox integration (Requirement #2)
- Import/Export (Requirement #4)
- Settings (Requirement #5)

