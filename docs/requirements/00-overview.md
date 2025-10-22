# URL Shortcut Chrome Plugin - Requirements Overview

## Project Vision

A lightweight, keyboard-first Chrome plugin that enables users to create, search, and navigate to URLs using memorable aliases and advanced organization features (folders and tags). The plugin prioritizes speed, accessibility, and user control through extensive customization.

**Tagline:** "Quick access to your shortcuts - without leaving your keyboard"

---

## Core Concept

Users create shortcuts like:
- `work/meet` → `https://work.com/meet`
- `github` → `https://github.com`
- `slack/general` → `https://slack.com/workspace/general`

Then access them via:
1. **Search Dashboard** (Cmd+Shift+O) - keyboard-navigable list with real-time search
2. **Address Bar** (type `o meet`) - omnibox suggestions
3. **Right-click Context Menu** - on any link to save it
4. **Plugin Icon** - to add current page

---

## Key Features Summary

### 1. **Core Shortcut Management** (Requirement 1)
- ✅ Create shortcuts via UI, context menu, or plugin icon
- ✅ Edit and delete shortcuts with undo support
- ✅ Organize with single-level folders (e.g., `work/meet`)
- ✅ View all shortcuts in organized dashboard

### 2. **Search & Navigation** (Requirement 2)
- ✅ Search Dashboard (Cmd+Shift+O) with top 10 favorites
- ✅ Real-time search with priority-based results
- ✅ Keyboard-navigable: ↑↓ arrows, Enter to open, C to copy URL, O for new tab
- ✅ Address bar integration (omnibox) with `o` keyword
- ✅ Folder-scoped search (e.g., `work/meet` or `work/`)
- ✅ Multiple open options (current tab, new tab, new window)

### 3. **Tags & Categorization** (Requirement 3)
- ✅ Add multiple tags per shortcut (lowercase only)
- ✅ Search by single tag (`tag:meeting`) or multiple tags
- ✅ Tag autocomplete with suggestions
- ✅ Tag management (rename, delete, merge)
- ✅ Bulk tag operations on multiple shortcuts
- ✅ Saved tag search filters for quick access

### 4. **Import & Export** (Requirement 4)
- ✅ Export all shortcuts or filtered subsets
- ✅ Multiple formats: JSON, CSV, HTML, Plain Text
- ✅ Import with conflict resolution and merge strategies
- ✅ Auto-backup with customizable frequency (Daily/Weekly/Monthly)
- ✅ Restore from previous backups
- ✅ Undo support for imports (30 seconds)

### 5. **Settings & Customization** (Requirement 5)
- ✅ Customizable keyboard shortcuts per action
- ✅ Platform-specific shortcut handling (Mac/Windows/Linux)
- ✅ Theme preferences (Light/Dark/Auto)
- ✅ Display format customization
- ✅ Privacy controls (tracking, data storage location)
- ✅ Auto-backup configuration
- ✅ Search behavior tuning

---

## User Flows

### Flow 1: Create and Access a Shortcut
```
1. User saves link: Right-click → "Add to URL Shortcut"
2. Enter alias "meet" and folder "work" → saved as "work/meet"
3. Later: Press Cmd+Shift+O to open search dashboard
4. Type "meet" to find the shortcut
5. Press Enter to navigate
```

### Flow 2: Address Bar Access
```
1. User types "o meet" in address bar
2. Omnibox suggests "work/meet → https://work.com/meet"
3. Press Enter to navigate
```

### Flow 3: Tag-Based Discovery
```
1. User has shortcuts tagged with "meeting" and "recurring"
2. Press Cmd+Shift+O to open search dashboard
3. Type "tag:meeting tag:recurring" to find shortcuts with both tags
4. Select result and press Enter
```

### Flow 4: Backup & Restore
```
1. Auto-backup runs weekly (configurable)
2. User exports current collection as JSON
3. Later: Can restore from auto-backup or import exported file
4. On import, conflicts resolved with merge strategies
```

---

## Technology Stack

### Storage
- **IndexedDB**: Primary storage for shortcuts with advanced querying
- **Chrome Storage API**: Settings and preferences (auto-sync within profile)
- **Local Backups**: Stored within extension storage

### Frontend
- **React**: UI components for dashboard and settings
- **CSS/SCSS**: Styling with theme support (light/dark)
- **Keyboard Navigation**: Custom keyboard event handling

### Backend/Logic
- **Chrome APIs**:
  - `chrome.omnibox`: Address bar integration
  - `chrome.contextMenus`: Right-click menu
  - `chrome.storage`: Settings persistence
  - `chrome.tabs`: Tab management
  - `chrome.windows`: Window management

### Data Format
- **JSON**: Export/import, settings, backups
- **CSV**: Spreadsheet compatibility
- **HTML**: Shareable, viewable export

---

## Search Behavior & Priorities

### Search Result Priority (Highest to Lowest)
1. **Exact alias match** - "meet" → matches alias "meet" exactly
2. **Partial alias match** - "me" → matches "meet", "meeting", "work-meet", "work/meet"
3. **Tag match** - "sync" → matches shortcuts tagged "sync"
4. **URL match** - "work.com" → matches URLs containing "work.com"

### Folder-Scoped Search
- `work/meet` → Aliases "meet" in "work" folder
- `work/` → All aliases in "work" folder
- `meet` → "meet" from any folder (includes `work/meet`)

---

## Data Schema

### Shortcut Object
```json
{
  "id": "uuid-123",
  "alias": "meet",
  "folder": "work",
  "url": "https://work.com/meet",
  "tags": ["meeting", "recurring", "sync"],
  "createdAt": "2025-10-22T10:00:00Z",
  "updatedAt": "2025-10-22T12:00:00Z",
  "lastAccessedAt": "2025-10-22T14:30:00Z",
  "accessCount": 42
}
```

### Validation Rules
| Field | Rules |
|-------|-------|
| Alias | Max 50 chars, alphanumeric/hyphens/underscores, unique per folder |
| URL | Valid HTTP/HTTPS, max 2000 chars, required |
| Folder | Max 30 chars, alphanumeric/hyphens/underscores, optional, single level |
| Tags | Lowercase only, max 20 chars each, max 50 per shortcut |
| Full Alias | Unique: `folder/alias` or just `alias` for root |

---

## Keyboard Shortcuts (Customizable)

| Action | Default | Platform |
|--------|---------|----------|
| Open Search | Cmd+Shift+O / Ctrl+Shift+O | Mac / Windows-Linux |
| Open in New Tab | Shift+O or Ctrl+Enter | All |
| Open in New Window | Cmd+Shift+Enter / Ctrl+Shift+Enter | Mac / Windows-Linux |
| Copy URL | C | All |
| Edit Shortcut | E | All |
| Delete Shortcut | D | All |
| Navigate Up | ↑ | All |
| Navigate Down | ↓ | All |
| Select/Open | Enter | All |
| Close | Escape | All |

---

## Minimum Viable Product (MVP)

**Phase 1 - Core:**
1. Create/Read/Update/Delete shortcuts
2. Folder organization (single level)
3. Search dashboard (keyboard-navigable)
4. Omnibox address bar integration
5. Basic import/export (JSON)
6. Essential keyboard shortcuts

**Phase 2 - Enhancement:**
7. Tag system and tag-based search
8. Auto-backup functionality
9. Settings customization
10. Multiple export formats (CSV, HTML)

**Phase 3 - Polish:**
11. Advanced search features
12. Tag visualization (tag cloud)
13. Bulk operations
14. Debug/analytics

---

## Non-Functional Requirements

### Performance
- Search results display within 300ms (debounced)
- Omnibox suggestions respond within 200ms
- Dashboard loads within 500ms
- Max 1000 shortcuts per browser session
- Store up to 50MB of data (settings + backups)

### Accessibility
- 100% keyboard navigable (no mouse required for any action)
- WCAG 2.1 AA compliance
- Clear error messages
- Visual and keyboard feedback for all actions

### Security & Privacy
- All data stored locally (no cloud transmission)
- No user tracking or analytics
- URLs/shortcuts never leave the browser
- Optional access statistics tracking (user opt-in)
- Clear privacy notice on install

### Browser Compatibility
- Chrome 88+ (for Omnibox API support)
- Works on Mac, Windows, Linux

### Reliability
- Auto-backup prevents data loss
- Undo support for critical operations (delete, import)
- Graceful error handling
- Data validation on import/export

---

## Future Enhancements (Post-MVP)

- Cloud sync across devices (Firebase/Supabase)
- Shared shortcut collections
- Analytics dashboard (anonymized)
- Browser profile sync
- Mobile app companion
- Dark mode refinement
- Advanced search syntax (nested queries)
- Shortcut usage reports
- Team/organization workspaces

---

## Success Metrics

- ✅ 80%+ actions completable without mouse
- ✅ Search results within 300ms for 99% of queries
- ✅ Zero data loss (auto-backup + undo)
- ✅ Settings persistence across sessions
- ✅ Conflict-free import/export
- ✅ All keyboard shortcuts customizable
- ✅ Export/import formats validated

---

## Requirements Documents

1. **01-core-shortcut-management.md** - CRUD, folders, validation
2. **02-search-navigation.md** - Dashboard, omnibox, search features
3. **03-tags-and-categorization.md** - Tag system, tag-based search
4. **04-import-export.md** - Backup, restore, multiple formats
5. **05-settings-and-customization.md** - Shortcuts, preferences, privacy

---

## Getting Started

- Read requirements in order (01 → 05)
- Each requirement has detailed user stories with acceptance criteria
- Technical implementation notes provided in each requirement
- Refer to data schema and validation rules for consistency
