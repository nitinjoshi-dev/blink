# Design Overview - URL Shortcut Chrome Plugin

## Quick Links

- **📋 Full Design Spec**: [01-ui-ux-design.md](./01-ui-ux-design.md)
- **✅ Implementation Checklist**: [02-implementation-checklist.md](./02-implementation-checklist.md)
- **📝 Requirement Spec**: [../requirements/01-core-shortcut-management.md](../requirements/01-core-shortcut-management.md)
- **💬 Design Discussions**: [../prompts/session-2.md](../prompts/session-2.md)

---

## 🎯 Design Vision

**Context-Aware URL Shortcut Management with Keyboard-First Navigation**

The plugin is designed around three core principles:
1. **Context Matters** - Plugin shows relevant actions based on current page
2. **Keyboard First** - Navigate and manage entirely without mouse
3. **Dark & Modern** - Sleek dark mode with cyan accents and smooth animations

---

## 🏗️ Architecture Overview

### Three Main Interfaces

#### 1. Plugin Context Modal (Popup when clicking plugin icon)

**Scenario A - New URL (not yet saved):**
```
┌──────────────────────────────┐
│ Add to URL Shortcuts [🏠]   │  ← Dashboard link top-right
├──────────────────────────────┤
│ URL: https://example.com     │  (read-only, grayed)
│ Alias: [suggested-name]      │  (auto-focused)
│ Folder: [Root ▼]              │
│ Tags: [comma,separated]      │
│ [Save]  [Cancel]             │
│ ⌨️  Cmd+Enter to save        │
└──────────────────────────────┘
```

**Scenario B - Existing URL (already saved):**
```
┌──────────────────────────────┐
│ Shortcut Details [🏠]        │
├──────────────────────────────┤
│ ✓ Already exists!             │
│ Alias: work/meet             │
│ URL: https://work.com/meet   │
│ Folder: work                 │
│ Tags: [meeting][sync]        │
│ [Edit]  [Delete]  [Open]     │
│ ⌨️  E=Edit | D=Delete        │
└──────────────────────────────┘
```

#### 2. Search Popup (Press Cmd+Shift+O globally)

```
┌──────────────────────────────┐
│ [🏠 Home]                    │  ← Dashboard link
├──────────────────────────────┤
│ 🔍 [search shortcuts____]   │  (auto-focused)
│                              │
│ 📌 FREQUENT (Top 10)         │
│ ▶ work/meet ⭐⭐⭐           │
│   https://work.com/meet      │
│ ▶ personal/github ⭐⭐       │
│   https://github.com         │
│                              │
│ ↑↓ Navigate | Enter to Open  │
└──────────────────────────────┘
```

#### 3. Dashboard (Full-Screen Manager)

```
┌──────────────────────┬──────────────────────┐
│ ☰ FOLDERS           │ Search & Add         │
│                     │ 🔍 [search_____]     │
│ 📁 work (12)        │ [+ New] [⌘+Shift+O] │
│ 📁 personal (8)     │                      │
│ 🌐 Ungrouped (5)    │ 📁 work (12)         │
│                     │ ├─ meet              │
│ [Settings]          │ │ → https://...      │
│ [Export]            │ │ [E]dit [D]elete    │
│ [Import]            │                      │
│                     │ 📁 personal (8)      │
│                     │ ├─ github            │
│                     │ │ → https://...      │
│                     │ │ [E]dit [D]elete    │
└──────────────────────┴──────────────────────┘
```

---

## 🔑 Key Features

| Feature | Behavior |
|---------|----------|
| **Add Shortcut** | Plugin click on new URL → auto-fill form |
| **View/Edit** | Plugin click on existing → show details + edit option |
| **Keyboard Shortcuts** | Cmd+Shift+O (search), Cmd+Enter (save), E (edit), D (delete), C (copy) |
| **Search** | Categorized: exact > partial > tags > URL |
| **Dashboard** | Full-screen manager with folder organization |
| **Validation** | Real-time on blur, inline error messages |
| **Undo** | 30-second window for recent deletions |
| **Navigation** | Plugin ↔ Search ↔ Dashboard (icons at top) |

---

## 🎨 Design System

### Colors (Dark Mode Only)
```
Background:      #0f0f0f (pure black)
Surface:         #1a1a1a (cards, panels)
Text Primary:    #e8e8e8 (main content)
Text Secondary:  #888888 (labels, hints)
Accent Primary:  #00d9ff (actions, cyan glow)
Accent Success:  #10b981 (confirmations)
Accent Error:    #ef4444 (destructive)
```

### Typography
- **Font**: System fonts (SF Pro, Segoe UI, Roboto)
- **Sizes**: 16px (title), 14px (body), 12px (label), 11px (hint)

### Interactions
- **Buttons**: Filled accent, hover darkens, active scales
- **Inputs**: Focus glow `0 0 8px rgba(0, 217, 255, 0.3)`
- **Transitions**: 200ms cubic-bezier
- **Animations**: Modal fade (200ms), toast slide (300ms)

---

## ⌨️ Keyboard Navigation

### Global Shortcuts (Works Anywhere)
| Shortcut | Action | Notes |
|----------|--------|-------|
| `Cmd+Shift+O` | Open Search Popup | Safe, unused by Chrome |
| `Cmd+Z` | Undo recent deletion | 30-second window |

### In Plugin/Search/Dashboard
| Shortcut | Action |
|----------|--------|
| `Escape` | Close modal / Cancel |
| `Tab` / `Shift+Tab` | Navigate form fields |
| `↑↓` | Navigate list items |
| `→` | Expand/collapse item |
| `Enter` | Open URL (current tab) |
| `Cmd+Enter` | Open URL (new tab) / Save form |
| `C` | Copy URL to clipboard |
| `E` | Edit shortcut |
| `D` | Delete shortcut |
| `/` | Focus search (Dashboard only) |
| `N` | Create new (Dashboard only) |

---

## 🔄 User Workflows

### Workflow 1: Adding a Shortcut
```
1. User browsing example.com
2. Click plugin icon
3. Form shows with URL pre-filled, alias auto-suggested
4. User types remaining info (folder, tags optional)
5. Cmd+Enter to save
6. Toast confirms: "✓ Shortcut saved: work/example"
7. User can stay or go to Dashboard
```

### Workflow 2: Quick Search
```
1. User anywhere on web
2. Press Cmd+Shift+O
3. Search popup opens, focused
4. Shows frequent shortcuts by default
5. User types "meet" to filter
6. Results categorized: exact, partial, tags
7. ↓ to navigate, Enter to open
8. URL opens in current tab
```

### Workflow 3: Managing Shortcuts
```
1. Click Dashboard icon or press Cmd+Shift+O then Home
2. Dashboard shows all shortcuts by folder
3. ↑↓ to navigate, → to expand item
4. Press E to edit
5. Item expands into inline edit form
6. Modify fields, Cmd+Enter to save
7. Toast confirms update
```

---

## 📐 Component Tree

```
App
├─ PluginPopup
│  ├─ ContextAwareModal
│  ├─ AddShortcutForm
│  ├─ ViewShortcutCard
│  └─ EditShortcutForm
├─ SearchPopup
│  ├─ SearchResults
│  └─ FrequentShortcuts
├─ Dashboard
│  ├─ FolderSidebar
│  ├─ ShortcutList
│  └─ ShortcutEditForm
└─ Common
   ├─ Toast
   ├─ Modal
   ├─ ConfirmDialog
   ├─ Input
   ├─ Button
   └─ TagPill
```

---

## 🗄️ Data Model

### Shortcut Object
```json
{
  "id": "uuid",
  "alias": "meet",
  "folder": "work",
  "url": "https://work.com/meet",
  "tags": ["meeting", "sync"],
  "createdAt": "2025-10-22T10:00:00Z",
  "updatedAt": "2025-10-22T10:00:00Z",
  "lastAccessedAt": "2025-10-22T14:30:00Z",
  "accessCount": 42
}
```

### Folder Object
```json
{
  "name": "work",
  "createdAt": "2025-10-20T08:00:00Z",
  "shortcutCount": 12
}
```

### Storage
- **IndexedDB**: All shortcuts and folders
- **chrome.storage.local**: Settings, undo stack, preferences

---

## 📋 Validation Rules

### Alias
- ✓ Required, unique within folder
- ✓ 1-50 characters
- ✓ Alphanumeric, hyphens, underscores
- ✓ Case-insensitive comparison, preserves input case

### URL
- ✓ Required
- ✓ Must be valid HTTP/HTTPS
- ✓ Max 2048 characters

### Folder
- ✓ Optional
- ✓ 1-30 characters
- ✓ Alphanumeric, hyphens, underscores
- ✓ Unique

### Tags
- ✓ Optional
- ✓ Lowercase only
- ✓ Comma-separated
- ✓ Each tag max 20 characters

---

## 🚀 Implementation Phases

1. **Phase 1**: Project setup & infrastructure
2. **Phase 2**: Core data layer (IndexedDB, services)
3. **Phase 3**: State management (Zustand)
4. **Phase 4**: React components
5. **Phase 5**: Keyboard shortcuts
6. **Phase 6**: Styling & animations
7. **Phase 7**: Testing
8. **Phase 8**: Build & deploy

**MVP Fast-Track**: Phases 1-7 get core features working

---

## 📚 Document Organization

```
docs/
├─ design/
│  ├─ 00-design-overview.md (this file)
│  ├─ 01-ui-ux-design.md (detailed specs)
│  └─ 02-implementation-checklist.md (dev guide)
├─ requirements/
│  ├─ 00-overview.md
│  ├─ 01-core-shortcut-management.md
│  ├─ 02-search-navigation.md
│  ├─ 03-tags-and-categorization.md
│  ├─ 04-import-export.md
│  └─ 05-settings-and-customization.md
└─ prompts/
   ├─ session-1.md (requirements discussion)
   └─ session-2.md (design approval)
```

---

## ✅ Design Approval Checklist

- [x] Context-aware plugin (not dashboard-first)
- [x] Three main interfaces (plugin, search, dashboard)
- [x] Keyboard-centric navigation
- [x] Non-conflicting shortcuts (Cmd+Shift+O)
- [x] Dark mode only
- [x] Inline editing in dashboard
- [x] Cmd+Enter to save
- [x] Dashboard link in modals
- [x] Real-time validation
- [x] Undo support (30-second window)
- [x] Mouse-free, fully keyboard-navigable
- [x] Clear error messages

---

## 🎬 Next Steps

1. **Proceed with Phase 1**: Initialize project structure
2. **Set up dependencies**: React, Zustand, Vite, etc.
3. **Create IndexedDB schema**: Database setup and migrations
4. **Build core services**: CRUD operations and validation
5. **Implement Zustand store**: State management
6. **Build React components**: Start with plugin popup
7. **Add keyboard handlers**: Implement all shortcuts
8. **Style & animate**: Dark mode with cyan accents
9. **Test thoroughly**: All workflows and edge cases
10. **Build & package**: Extension ZIP file

---

**Status**: ✅ Design Complete & Approved | Ready for Development

