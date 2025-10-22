# Requirement 1: Core Shortcut Management

## Overview
Users should be able to create, read, update, and delete URL shortcuts with folder organization and alias assignment.

## Business Value
- Enables users to quickly access frequently used URLs via memorable aliases
- Reduces time spent navigating to important web resources
- Provides a centralized repository for URL bookmarking with better organization than browser bookmarks

---

## Feature Details

### 1.1 Create Shortcut
**Description:** Users can add a new URL shortcut with an alias and optional folder/tags.

**User Stories:**

#### US1.1.1: Add Shortcut via Plugin Interface
```
As a user
I want to add a new shortcut with a URL and alias
So that I can quickly access it later

Acceptance Criteria:
- I can open a form/modal to create a new shortcut
- Form requires: URL, Alias, optional Folder (dropdown), optional Tags (comma-separated)
- URL validation: must be a valid HTTP/HTTPS URL
- Alias validation: 
  - Must be unique within the folder (full alias = folder/alias)
  - Alphanumeric, hyphens, underscores allowed
  - Min 1 char, Max 50 chars
  - Case-insensitive for comparison but preserves input case
- Tags: lowercase only, comma-separated
- On success, show confirmation toast
- On failure, show validation error messages
- Form should be keyboard-navigable (no mouse required)
```

#### US1.1.2: Add Shortcut via Context Menu
```
As a user
I want to right-click on any link and add it as a shortcut
So that I can quickly save shortcuts without manually typing URLs

Acceptance Criteria:
- Context menu item "Add to URL Shortcut" appears on link right-click
- Clicking opens quick add modal with URL pre-filled
- Modal only requires Alias, Folder, and Tags
- Can submit with Cmd+Enter or keyboard navigation
```

#### US1.1.3: Add Shortcut via Plugin Icon
```
As a user
I want to click the plugin icon to add current page as a shortcut
So that I can save the current page I'm viewing

Acceptance Criteria:
- Plugin icon shows action menu when clicked
- "Add Current Page" option adds current tab's URL and title
- URL is pre-filled, title becomes suggested alias
- User can edit alias, folder, tags before saving
```

---

### 1.2 Read Shortcut
**Description:** Users can view all their shortcuts and their details.

**User Stories:**

#### US1.2.1: View All Shortcuts
```
As a user
I want to see all my saved shortcuts
So that I can browse and understand what I have saved

Acceptance Criteria:
- Dashboard displays all shortcuts in a structured list
- Shows: Folder (if any), Alias, URL, Tags, Last accessed date
- Shortcuts are organized by folder with collapsible sections
- Supports scrolling/pagination if many shortcuts
- Each shortcut shows a visual indicator (e.g., icon) if frequently used
```

#### US1.2.2: View Shortcut Details
```
As a user
I want to see full details of a shortcut
So that I can verify the URL before clicking

Acceptance Criteria:
- Clicking on a shortcut shows: Full URL, Tags, Folder, Last accessed, Access count
- Option to copy URL to clipboard
- Option to open in new tab/current tab
- Option to edit or delete from this view
```

---

### 1.3 Update Shortcut
**Description:** Users can edit existing shortcuts.

**User Stories:**

#### US1.3.1: Edit Shortcut Details
```
As a user
I want to edit an existing shortcut
So that I can update incorrect information or change its organization

Acceptance Criteria:
- Can edit: URL, Alias, Folder, Tags
- Alias must still be unique after edit (can't conflict with other aliases)
- If moving to different folder, must ensure folder/alias combination is unique
- Shows success confirmation
- Changes are immediately persisted to storage
- Edit form preserves all current values on open
```

#### US1.3.2: Bulk Edit Operations
```
As a user
I want to perform bulk operations on multiple shortcuts
So that I can reorganize efficiently

Acceptance Criteria:
- Multi-select shortcuts via checkboxes
- Bulk actions: Move to folder, Add tags, Delete
- Shows count of affected shortcuts before confirming
- Keyboard support: Shift+Click for range select, Cmd+Click for multi-select
```

---

### 1.4 Delete Shortcut
**Description:** Users can remove shortcuts they no longer need.

**User Stories:**

#### US1.4.1: Delete Single Shortcut
```
As a user
I want to delete a shortcut I no longer need
So that my collection stays organized and relevant

Acceptance Criteria:
- Delete option appears in shortcut details/context menu
- Shows confirmation dialog with shortcut details
- Confirmation can be dismissed with Escape key
- After deletion, shows success message
- Deleted shortcut is immediately removed from dashboard
```

#### US1.4.2: Undo Recent Deletion
```
As a user
I want to undo a deletion I just made
So that I can recover accidentally deleted shortcuts

Acceptance Criteria:
- Toast notification after deletion with "Undo" button
- Undo works for last 5 deletions within 30 seconds
- Can be triggered via keyboard shortcut (Cmd+Z)
```

---

### 1.5 Organize Shortcuts with Folders
**Description:** Users can group shortcuts into single-level folders.

**User Stories:**

#### US1.5.1: Create and Manage Folders
```
As a user
I want to organize shortcuts into folders
So that I can group related shortcuts together

Acceptance Criteria:
- Can create new folder when adding a shortcut
- Folder names: alphanumeric, hyphens, underscores (Max 30 chars)
- Folder names are unique
- Folder names are case-insensitive for comparison
- Dashboard shows folders as collapsible sections
- Can rename folder (only if no alias conflicts after rename)
- Can delete folder (requires moving/deleting all shortcuts first)
- Empty folders can be auto-deleted on dashboard refresh
```

#### US1.5.2: Move Shortcuts Between Folders
```
As a user
I want to move shortcuts between folders
So that I can reorganize as my workflow changes

Acceptance Criteria:
- Drag-and-drop shortcut to different folder
- Or use keyboard: select shortcut, press M, choose destination folder
- Can move to root (no folder)
- Alias uniqueness is validated after move
- Shows error if destination has conflict
```

---

### 1.6 Data Validation & Constraints

| Field | Rules |
|-------|-------|
| URL | Valid HTTP/HTTPS URL, required |
| Alias | Max 50 chars, alphanumeric/hyphens/underscores, required, unique within folder |
| Folder | Max 30 chars, alphanumeric/hyphens/underscores, optional, max 1 level |
| Tags | Lowercase only, comma-separated, each tag Max 20 chars, optional |
| Full Alias | Unique combination of Folder/Alias |

---

## Technical Implementation Notes

**Storage Strategy:**
- Use IndexedDB for flexible querying by alias, tags, folder, URL patterns
- Store search index separately for fast lookups
- Implement schema versioning for future migrations

**Data Structure:**
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

**Performance Considerations:**
- Index all searchable fields (alias, tags, folder, URL)
- Limit initial load to 50 shortcuts; paginate beyond
- Debounce search queries (300ms)
- Cache frequently accessed shortcuts

---

## Assumptions
- Single user per browser (no multi-user support)
- Local storage only (no sync across devices initially)
- No version history for shortcut changes
