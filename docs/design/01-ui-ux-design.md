# UI/UX Design Specification - URL Shortcut Plugin

## Overview
A context-aware Chrome plugin for managing URL shortcuts with keyboard-first navigation, dark mode interface, and seamless add/edit workflows.

---

## 1. Design System

### Color Palette (Dark Mode)
```
Background:      #0f0f0f (pure black, minimal edge)
Surface:         #1a1a1a (cards, panels, modals)
Elevated:        #2a2a2a (hover state, active elements)
Text Primary:    #e8e8e8 (main content)
Text Secondary:  #888888 (labels, hints, secondary info)
Text Muted:      #555555 (disabled, placeholder text)
Accent Primary:  #00d9ff (actions, focus, highlights)
Accent Success:  #10b981 (confirmations, success states)
Accent Error:    #ef4444 (destructive actions, validation errors)
Border:          #333333 (dividers, input borders)
Shadow:          rgba(0, 0, 0, 0.5) (depth, modals)
```

### Typography
- **Font Stack**: System fonts (SF Pro Display, Segoe UI, Roboto)
- **Sizes**:
  - Large: 16px bold (modal titles, headings)
  - Body: 14px regular (main content, shortcuts)
  - Small: 12px regular (labels, hints, secondary info)
  - Tiny: 11px regular (keyboard hints, metadata)

### Interactive Elements
- **Buttons**: Filled with accent color, hover darkens by 10%, active state scales to 95%
- **Inputs**: Dark background (#1a1a1a), cyan focus glow `box-shadow: 0 0 8px rgba(0, 217, 255, 0.3)`
- **Focus Indicators**: Glowing cyan outline (`3px solid #00d9ff`)
- **Transitions**: All state changes use `200ms cubic-bezier(0.4, 0, 0.2, 1)`

---

## 2. Screen Layouts

### 2.1 Plugin Icon Click - Context Aware Modal

#### 2.1.1 Scenario A: New Shortcut (URL not yet saved)

```
┌──────────────────────────────────────────────┐
│ Add to URL Shortcuts              [🏠 Home]  │  ← Dashboard link (top-right)
├──────────────────────────────────────────────┤
│                                              │
│ Current Page                                 │
│ URL: [https://example.com/page]             │  ← Read-only, grayed
│      (grayed, non-interactive)              │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ SHORTCUT DETAILS                             │
│                                              │
│ Alias *                                      │  ← Required field
│ [suggested-alias________________]           │  ← Auto-filled from page title
│  (focused, ready for input)                  │
│ ⓘ Unique within folder, alphanumeric        │
│                                              │
│ Folder                                       │  ← Optional field
│ [Root ▼]                                     │  ← Dropdown
│  • work (12)                                 │
│  • personal (8)                              │
│  • + Create new folder...                    │
│                                              │
│ Tags                                         │  ← Optional field
│ [example, saved, tags____________]          │
│ (comma-separated, lowercase only)            │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ [Save]  [Cancel]                             │
│                                              │
│ ⌨️  Cmd+Enter to save | Esc to cancel       │
│                                              │
└──────────────────────────────────────────────┘
```

**Behaviors:**
- Alias field auto-focuses
- Suggested alias based on page title (highlighted, user can clear and type)
- Folder defaults to "Root" (no folder)
- Tags pre-populated with common terms if available (user can edit)
- `Tab` to next field, `Shift+Tab` to previous
- `Cmd+Enter` saves, `Escape` cancels
- On save: Toast confirmation → Option to [Stay] or [Go to Dashboard]

---

#### 2.1.2 Scenario B: Existing Shortcut (URL already saved)

```
┌──────────────────────────────────────────────┐
│ Shortcut Details                  [🏠 Home]  │  ← Dashboard link
├──────────────────────────────────────────────┤
│                                              │
│ ✓ This shortcut already exists!              │  ← Success indicator
│                                              │
│ Alias:       work/meet                       │  ← Folder/Alias
│ URL:         https://work.com/meet           │
│ Folder:      work                            │
│ Tags:        [meeting] [sync] [work]         │  ← Pill badges
│ Created:     2025-10-20 · 10:30              │
│ Last accessed: 2 hours ago                   │
│ Access count: 42                             │
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ [Open in Tab]  [Open in New Tab]  [Copy URL] │
│ [Edit]  [Delete]                             │
│                                              │
│ ⌨️  O=Open | N=New Tab | C=Copy | E=Edit    │
│    D=Delete | Esc=Close                      │
│                                              │
└──────────────────────────────────────────────┘
```

**Behaviors:**
- Shows all details read-only
- Keyboard shortcuts for each action
- [Edit] button opens inline edit mode (see 2.1.3)
- [Delete] shows confirmation dialog
- [Open] immediately goes to the URL
- Escape closes the modal

---

#### 2.1.3 Edit Mode (from Existing Shortcut)

```
┌──────────────────────────────────────────────┐
│ Edit Shortcut                     [🏠 Home]  │  ← Dashboard link
├──────────────────────────────────────────────┤
│                                              │
│ EDIT SHORTCUT DETAILS                        │
│                                              │
│ Alias *                                      │
│ [work/meet_________________]                 │  ← Editable, focused
│ ⓘ Full path shown                            │
│                                              │
│ URL *                                        │
│ [https://work.com/meet_________]             │  ← Editable
│                                              │
│ Folder                                       │
│ [work ▼]                                     │  ← Can change folder
│  • Root                                      │
│  • work                                      │
│  • personal                                  │
│  • + Create new folder...                    │
│                                              │
│ Tags                                         │
│ [meeting, sync, work_________]               │  ← Editable
│                                              │
│ ────────────────────────────────────────────│
│                                              │
│ [Save]  [Cancel]                             │
│                                              │
│ ⌨️  Cmd+Enter to save | Esc to cancel       │
│                                              │
└──────────────────────────────────────────────┘
```

**Behaviors:**
- All fields become editable
- Alias shows full path (folder/alias)
- URL field is now editable (for updating links)
- Folder can be changed (will update full alias path)
- Validation happens on blur for each field
- `Cmd+Enter` saves changes, `Escape` cancels
- On save: Toast confirmation → Return to view mode

---

### 2.2 Dashboard - Full Screen View

#### 2.2.1 Overall Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    URL SHORTCUTS DASHBOARD                              │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                          │
│ ☰ FOLDERS    │  Search & Add                                           │
│              │  🔍 [search / filter___________]  [+ New]  [⌘+Shift+O]  │
│              │  (Search works across alias, tags, URL)                 │
│              │                                                          │
│ 📁 work      │  📁 work (12 shortcuts)                                  │
│    (12)      │  ┌────────────────────────────────────────────────────┐ │
│              │  │ ▼ meet ─ https://work.com/meet   [meeting][sync] │ │
│ 📁 personal  │  │   ⭐⭐⭐ (frequently used)                        │ │
│    (8)       │  │   Last accessed: 2h ago · 42 uses                │ │
│              │  │                                                 │ │
│ 🌐 Ungrouped │  │ ▼ slack ─ https://slack.com     [team][comms]   │ │
│    (5)       │  │   Last accessed: 30m ago · 128 uses             │ │
│              │  │                                                 │ │
│ Total: 25    │  │ ▼ docs ─ https://docs.google.com [reference]   │ │
│              │  │   Last accessed: 5d ago · 8 uses                │ │
│              │  └────────────────────────────────────────────────────┘ │
│              │                                                          │
│              │  📁 personal (8 shortcuts)                               │
│ [Settings]   │  ┌────────────────────────────────────────────────────┐ │
│ [Export]     │  │ ▼ github ─ https://github.com     [dev][coding]   │ │
│ [Import]     │  │   ⭐⭐ (frequently used)                           │ │
│              │  │   Last accessed: 1h ago · 95 uses                │ │
│              │  │                                                 │ │
│              │  │ ▼ notion ─ https://notion.so      [notes][docs]  │ │
│              │  │   Last accessed: 3d ago · 12 uses               │ │
│              │  └────────────────────────────────────────────────────┘ │
│              │                                                          │
│              │  🌐 Ungrouped (5 shortcuts)                              │
│              │  ┌────────────────────────────────────────────────────┐ │
│              │  │ ▼ example ─ https://example.com                  │ │
│              │  │   Last accessed: 1w ago · 3 uses                 │ │
│              │  └────────────────────────────────────────────────────┘ │
│              │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

**Left Sidebar (Folders):**
- Hamburger menu icon (≡) toggles visibility
- Clickable folder list with counts
- "Total: X shortcuts" summary
- [Settings], [Export], [Import] buttons at bottom
- Folder names show shortcut count in parentheses

**Right Content Area:**
- Search bar always visible at top
- [+ New] button to create new shortcut
- [⌘+Shift+O] hint to open search popup
- Folders shown as collapsible sections with folder icon
- Each shortcut shown as an expandable item
- Star indicator (⭐) for frequently used shortcuts
- Last accessed time and access count
- Tags shown as pill badges

---

#### 2.2.2 Shortcut Item States

**Collapsed (Default):**
```
▼ meet ─ https://work.com/meet   [meeting][sync]
  ⭐⭐⭐ · Last accessed: 2h ago · 42 uses
```

**Expanded (Click/Arrow to expand):**
```
▼ meet ─ https://work.com/meet   [meeting][sync]
  ⭐⭐⭐ · Last accessed: 2h ago · 42 uses
  Folder: work
  Created: 2025-10-20 · 10:30
  
  [Open] [Open New Tab] [Copy URL] [Edit] [Delete]
```

**Keyboard Navigation in Dashboard:**
- `↑↓` → Navigate between shortcuts
- `→` → Expand/collapse shortcut
- `Enter` → Open URL in current tab
- `Cmd+Enter` → Open URL in new tab
- `C` → Copy URL to clipboard
- `E` → Edit shortcut (see 2.2.3)
- `D` → Delete shortcut with confirmation
- `/` → Focus search input
- `N` → Create new shortcut (modal)
- `Escape` → Deselect current item

---

#### 2.2.3 Edit Shortcut in Dashboard

When pressing `E` on a shortcut, the item expands into edit mode:

```
▼ meet ─ https://work.com/meet   [Edit Mode]
  
  Alias *
  [work/meet_________________]
  
  URL *
  [https://work.com/meet_______]
  
  Folder
  [work ▼]
   • Root
   • work
   • personal
  
  Tags
  [meeting, sync________________]
  
  [Save]  [Cancel]  [Delete]
  
  ⌨️  Cmd+Enter to save | Esc to cancel | D to delete
```

**Behaviors:**
- Inline edit form for the selected shortcut
- All fields editable
- `Cmd+Enter` saves and closes edit mode
- `Escape` cancels without saving
- `D` opens delete confirmation

---

### 2.3 Search Popup

Triggered via `Cmd+Shift+O` from anywhere (or `⌘+Shift+O` hint in Dashboard):

```
┌──────────────────────────────────────┐
│  [🏠 Home]                           │  ← Dashboard link (top-right)
├──────────────────────────────────────┤
│                                      │
│  🔍 [search shortcuts_________]     │  ← Auto-focused
│                                      │
├──────────────────────────────────────┤
│                                      │
│ 📌 FREQUENT (Top 10)                 │
│                                      │
│ work/meet                  ⭐⭐⭐   │
│ https://work.com/meet                │
│ [meeting] [sync]                     │
│                                      │
│ personal/github            ⭐⭐     │
│ https://github.com                   │
│ [dev] [coding]                       │
│                                      │
│ work/slack                 ⭐        │
│ https://slack.com                    │
│ [team] [comms]                       │
│                                      │
├──────────────────────────────────────┤
│ ↑↓ Navigate | Enter to Open          │
│ Cmd+Enter for New Tab                │
│ C to Copy URL                        │
│ 🏠 Dashboard                         │
└──────────────────────────────────────┘
```

**When Searching (user types):**
```
┌──────────────────────────────────────┐
│ [🏠 Home]                            │
├──────────────────────────────────────┤
│                                      │
│  🔍 [meet_________________]         │  ← Typed "meet"
│                                      │
├──────────────────────────────────────┤
│                                      │
│ 🎯 EXACT MATCH (1 result)            │
│                                      │
│ ▶ work/meet                          │
│   https://work.com/meet              │
│   [meeting] [sync]                   │
│                                      │
│ 🔤 PARTIAL MATCHES (2 results)       │
│                                      │
│ ▶ meeting-scheduler                  │
│   https://meet.google.com            │
│   [meeting] [online]                 │
│                                      │
│ ▶ personal/meet-notes                │
│   https://notion.so/meet             │
│   [notes]                            │
│                                      │
├──────────────────────────────────────┤
│ ↑↓ Navigate | Enter to Open          │
│ 🏠 Dashboard                         │
└──────────────────────────────────────┘
```

**Result Categories (in order):**
1. **EXACT MATCH**: Full alias matches exactly (work/meet)
2. **PARTIAL**: Alias contains search term
3. **TAG MATCH**: Tags contain search term (shown if no partial)
4. **URL MATCH**: URL contains search term (shown last, dimmed)

**Keyboard Navigation:**
- `↑↓` → Navigate results
- `Enter` → Open selected URL
- `Cmd+Enter` → Open in new tab
- `C` → Copy URL
- `E` → Edit (opens Dashboard with edit mode)
- `D` → Delete (with confirmation)
- `Escape` → Close search popup
- `🏠 Home` → Go to Dashboard

---

## 3. Global Keyboard Shortcuts

### Safe, Non-Conflicting Shortcuts

| Function | Shortcut | Context | Conflicts |
|----------|----------|---------|-----------|
| Open Search Popup | `Cmd+Shift+O` | Global | ✓ Safe (unused in Chrome) |
| Create New (in plugin) | `Cmd+N` | Plugin popup only | ✓ Safe (local scope) |
| Save Shortcut | `Cmd+Enter` | Modal/edit forms | ✓ Safe (local scope) |
| Undo Delete | `Cmd+Z` | Global | ✓ Safe (when our UI focused) |
| Copy URL | `C` | Dashboard/Search only | ✓ Safe (local scope) |
| Edit | `E` | Dashboard/Search only | ✓ Safe (local scope) |
| Delete | `D` | Dashboard/Search only | ✓ Safe (local scope) |
| Open in New Tab | `Cmd+Enter` | Dashboard/Search | ✓ Safe (local scope) |
| Focus Search | `/` | Dashboard only | ✓ Safe (local scope) |
| Cancel/Close | `Escape` | All modals/popups | ✓ Safe (standard) |
| Navigate Up/Down | `↑↓` | Lists/results | ✓ Safe (local scope) |

**Why `Cmd+Shift+O`?**
- Not used by Chrome natively ✓
- Memorable (O = Omnibox, Organization) ✓
- Works globally across all websites ✓
- User configurable in Settings ✓

---

## 4. Interaction Flows

### Flow 1: Adding Current Page as Shortcut

```
User browsing example.com
    ↓
Click plugin icon
    ↓
Plugin reads current URL
    ↓
Check if URL already exists in storage
    ↓
    ├─ YES: Show existing shortcut modal (2.1.2)
    │        [Edit] [Delete] [Open] options
    │        User can edit and save with Cmd+Enter
    │
    └─ NO: Show add shortcut modal (2.1.1)
           Auto-fill alias from page title
           User types details
           Cmd+Enter to save
           ↓
           Toast: "✓ Shortcut saved: work/example"
           ↓
           User can [Stay] or [Go to Dashboard]
```

---

### Flow 2: Quick Search from Anywhere

```
User on any webpage
    ↓
Press Cmd+Shift+O
    ↓
Search popup opens (focused)
    ↓
Shows frequent shortcuts
    ↓
User types "meet" (optional)
    ↓
Results filter in real-time:
  • Exact: work/meet
  • Partial: meeting-scheduler
  • Tags: ...(if applicable)
    ↓
User presses ↓ to navigate
    ↓
Press Enter to open selected
    ↓
URL opens in current tab
    ↓
(Optional: User can press [🏠 Home] to go to Dashboard)
```

---

### Flow 3: Managing Shortcuts in Dashboard

```
User clicks [🏠 Home] or opens Dashboard
    ↓
Dashboard displays full screen
    ↓
Left sidebar: Folders list
    ↓
Right section: All shortcuts by folder
    ↓
User clicks folder to collapse/expand or presses ↓↑ to navigate
    ↓
User presses E on a shortcut to edit
    ↓
Shortcut item expands into inline edit form
    ↓
User modifies fields (alias, url, folder, tags)
    ↓
Cmd+Enter to save
    ↓
Toast: "✓ Shortcut updated: work/meet"
    ↓
Item closes edit mode, changes applied
```

---

## 5. Confirmation Dialogs

### Delete Confirmation

```
┌─────────────────────────────────────┐
│ Delete Shortcut?                    │
├─────────────────────────────────────┤
│                                     │
│ Are you sure you want to delete:    │
│                                     │
│ work/meet                           │
│ https://work.com/meet               │
│ [meeting] [sync]                    │
│                                     │
│ This action cannot be undone.       │
│ (But you can undo within 30 sec)    │
│                                     │
│ [Delete]  [Cancel]                  │
│                                     │
│ ⌨️  D to confirm | Esc to cancel    │
│                                     │
└─────────────────────────────────────┘
```

**Behaviors:**
- Shows shortcut details to confirm
- Delete button is red accent color
- Default focus on Cancel (safer)
- `D` to confirm, `Escape` to cancel
- On delete: Show undo toast for 30 seconds
- Undo via `Cmd+Z` or [Undo] button in toast

---

### Create New Folder (in Dropdown)

```
┌─────────────────────────────────────┐
│ Create New Folder                   │
├─────────────────────────────────────┤
│                                     │
│ Folder Name *                       │
│ [________________]                  │
│ (alphanumeric, hyphens, underscores)│
│ Max 30 characters                   │
│                                     │
│ [Create]  [Cancel]                  │
│                                     │
│ ⌨️  Cmd+Enter to create             │
│    Esc to cancel                    │
│                                     │
└─────────────────────────────────────┘
```

---

## 6. Toast Notifications

### Success Toast
```
┌────────────────────────────────┐
│ ✓ Shortcut saved: work/meet    │  ← Appears top-right
│   [Undo]  [✕]                  │
└────────────────────────────────┘
(Auto-dismisses after 5 seconds or on click ✕)
```

### Error Toast
```
┌────────────────────────────────┐
│ ✗ Alias already exists         │  ← Red accent
│   [✕]                          │
└────────────────────────────────┘
(Auto-dismisses after 5 seconds)
```

### Info Toast
```
┌────────────────────────────────┐
│ ℹ 25 shortcuts in 3 folders    │
│   [✕]                          │
└────────────────────────────────┘
```

---

## 7. Validation & Error States

### Input Validation (Real-time, on blur)

**Alias Field:**
- ✗ Empty → "Required field"
- ✗ Contains invalid chars → "Only alphanumeric, hyphens, underscores"
- ✗ Exceeds 50 chars → "Max 50 characters"
- ✗ Already exists in folder → "This alias already exists in folder 'work'"
- ✓ Valid → Green checkmark indicator

**URL Field:**
- ✗ Empty → "Required field"
- ✗ Invalid format → "Must be a valid HTTP/HTTPS URL"
- ✓ Valid → Green checkmark indicator

**Tags Field:**
- ✗ Non-lowercase → "Tags must be lowercase only"
- ✗ Exceeds 20 chars per tag → "Each tag max 20 characters"
- ✓ Valid → Green checkmark indicator

**Folder Field:**
- ✗ Non-unique name → "Folder name already exists"
- ✗ Invalid chars → "Only alphanumeric, hyphens, underscores"
- ✓ Valid → Green checkmark indicator

**Visual Feedback:**
```
Error State:
Alias *
[invalid-alias]  ✗ This alias already exists
     ↑ Red text, red border

Valid State:
Alias *
[valid-alias]  ✓
     ↑ Green checkmark, normal border
```

---

## 8. Responsive & Accessibility

### Responsive Breakpoints
- **Large Screens (1200px+)**: Full dashboard with sidebar
- **Medium Screens (768px-1199px)**: Collapsible sidebar, full-width shortcuts
- **Small Screens (< 768px)**: Stacked layout or tabbed interface

### Keyboard Accessibility
- ✓ All features accessible via keyboard
- ✓ Tab order logical and consistent
- ✓ Focus indicators clearly visible (cyan glow)
- ✓ ARIA labels for dynamic content
- ✓ Screen reader friendly

### Contrast & Readability
- ✓ All text meets WCAG AAA standards (dark mode advantage)
- ✓ Error indicators use icon + color (not color-only)
- ✓ Focus states are distinct and visible

---

## 9. Implementation Notes

### Tech Stack
- **Frontend Framework**: React
- **State Management**: Zustand
- **Storage**: IndexedDB (for shortcuts) + chrome.storage.local (for settings)
- **Bundler**: Vite
- **Styling**: CSS-in-JS or Tailwind CSS
- **Keyboard**: keyboard.js or native keydown handlers

### Key Components
```
src/
├── components/
│   ├── PluginPopup/
│   │   ├── ContextAwareModal.jsx
│   │   ├── AddShortcutForm.jsx
│   │   └── ViewShortcutCard.jsx
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── FolderSidebar.jsx
│   │   ├── ShortcutList.jsx
│   │   └── ShortcutEditForm.jsx
│   ├── SearchPopup/
│   │   ├── SearchPopup.jsx
│   │   └── SearchResults.jsx
│   ├── Common/
│   │   ├── Toast.jsx
│   │   ├── Modal.jsx
│   │   └── ConfirmDialog.jsx
│   └── Icons/
│       └── SVGIcons.jsx
├── services/
│   ├── db.js (IndexedDB setup)
│   ├── shortcutService.js (CRUD operations)
│   ├── storageService.js (chrome.storage.local)
│   └── chromeApi.js (Chrome APIs)
├── hooks/
│   ├── useShortcuts.js
│   ├── useSearch.js
│   └── useKeyboard.js
├── store/
│   └── appStore.js (Zustand store)
├── styles/
│   ├── global.css
│   ├── dark-theme.css
│   └── animations.css
├── types/
│   └── shortcut.ts
└── main.jsx
```

---

## 10. Animation & Micro-interactions

### Transitions
- Modal open/close: 200ms fade + slide
- Shortcut expand: 150ms height animation
- Button hover: 100ms scale/color
- Search results: 200ms stagger animation
- Toast slide-in: 300ms from top-right

### Loading States
- Skeleton screens for lists
- Pulsing animation for loading indicators
- Disabled button state during submission

### Success Feedback
- Checkmark animation on save
- Toast slide-in with success color
- List item highlight fade-out after 500ms

---

## 11. Summary of Key Design Decisions

✅ **Context-First Plugin**: Plugin shows add/edit for current page, not generic dashboard  
✅ **Full-Screen Dashboard**: Complete view with folder sidebar and shortcut list  
✅ **Keyboard-Centric**: All actions accessible via keyboard, no mouse required  
✅ **Non-Conflicting Shortcuts**: `Cmd+Shift+O` is safe, no conflicts with Chrome  
✅ **Inline Editing**: Edit directly in dashboard without opening separate modal  
✅ **Real-time Validation**: Immediate feedback on input fields  
✅ **Undo Support**: 30-second undo window for deletions  
✅ **Dark Mode Only**: Sleek, modern dark interface  
✅ **Mouse-Free**: URL always visible, no hover tooltips  
✅ **Clear Navigation**: Easy access between Plugin → Search → Dashboard  

