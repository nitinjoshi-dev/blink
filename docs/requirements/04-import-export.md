# Requirement 4: Import & Export

## Overview
Users should be able to export their shortcuts collection to files and import them back, enabling backup, sharing, and migration across browsers.

## Business Value
- Data backup capability protects against data loss
- Cross-browser migration enables flexibility
- Sharing shortcuts enables team collaboration
- Data portability reduces vendor lock-in

---

## Feature Details

### 4.1 Export Functionality
**Description:** Export shortcuts collection in various formats.

**User Stories:**

#### US4.1.1: Export All Shortcuts
```
As a user
I want to export all my shortcuts
So that I can create a backup or move them to another browser

Acceptance Criteria:
- Export option available in Settings or Dashboard menu
- Can export all shortcuts at once
- Shows count of shortcuts being exported
- Download process is smooth and standard (browser download)
- Exported file is human-readable (JSON format)
- File named with timestamp: "url-shortcuts-2025-10-22.json"
- Export completes with success toast notification
```

#### US4.1.2: Export Filtered Shortcuts
```
As a user
I want to export a subset of my shortcuts
So that I can share specific shortcuts or create focused backups

Acceptance Criteria:
- Can filter what to export by:
  - Folder (single folder only)
  - Tag (single tag or multiple tags)
  - Date range (created/updated within dates)
- Shows preview of what will be exported (count and list)
- Can select individual shortcuts via checkboxes to export custom set
- Export file indicates filtering criteria in metadata
- Exported subset maintains folder/tag relationships
```

#### US4.1.3: Export Format Options
```
As a user
I want to choose export format
So that I can use shortcuts in different contexts

Acceptance Criteria:
- Support multiple export formats:
  1. JSON (full data with all metadata)
  2. CSV (for spreadsheet import/analysis)
  3. HTML (shareable, viewable in browser)
  4. Plain text (simple list of shortcuts)
- JSON format: includes all fields (alias, URL, tags, folder, metadata)
- CSV format: columns = Folder, Alias, URL, Tags, Created, LastAccessed
- HTML format: styled table with working links, tags shown
- Plain text: simple "alias → URL" format
- User can select format before exporting
- Downloaded filename reflects format (.json, .csv, .html, .txt)
```

#### US4.1.4: Schedule Automatic Backups
```
As a user
I want automatic backups of my shortcuts
So that I don't lose data if something goes wrong

Acceptance Criteria:
- Option to enable auto-backup in Settings
- Auto-backup frequency options: Daily, Weekly, Monthly
- Backups stored locally in a "backups" folder within extension data
- Can specify max number of backups to keep (e.g., keep last 10)
- Manual trigger to backup now
- Shows list of existing backups with timestamps
- Can restore from any previous backup
- Backup status shown in Settings (last backup time)
```

---

### 4.2 Import Functionality
**Description:** Import shortcuts from exported files or from other sources.

**User Stories:**

#### US4.2.1: Import Shortcuts
```
As a user
I want to import shortcuts from a backup file
So that I can restore my shortcuts on a new browser

Acceptance Criteria:
- Import option available in Settings or Dashboard
- Can select a file to import (JSON, CSV, or HTML exports)
- Shows preview of shortcuts to be imported:
  - Count of shortcuts
  - Count of new shortcuts
  - Count of conflicts (alias already exists)
- Can proceed with import or cancel
- Import completes with confirmation showing:
  - Number imported
  - Number skipped (conflicts)
  - Number updated (if merge option chosen)
- Toast notification shows result ("10 shortcuts imported, 2 skipped")
```

#### US4.2.2: Conflict Resolution During Import
```
As a user
I want to handle conflicts when importing
So that I can merge or overwrite shortcuts as needed

Acceptance Criteria:
- When alias conflict detected:
  - Show list of conflicting shortcuts
  - Provide conflict resolution options:
    1. Skip (don't import this shortcut)
    2. Rename (import but rename alias with suffix, e.g., "meet_2")
    3. Overwrite (replace existing shortcut)
    4. Create new folder (import to new folder if duplicate exists)
  - Can apply single resolution to all conflicts or handle per-shortcut
- Conflict resolution interface shows:
  - Existing shortcut details
  - Importing shortcut details
  - Side-by-side comparison
- After resolution, shows final import summary
```

#### US4.2.3: Import from Different Formats
```
As a user
I want to import shortcuts from various file formats
So that I can consolidate shortcuts from different sources

Acceptance Criteria:
- Support importing from:
  1. JSON (native export format)
  2. CSV (standard format for data exchange)
  3. Bookmarks HTML (Chrome bookmark export)
  4. Plain text (simple alias → URL pairs)
- Format detection: auto-detect or let user specify format
- CSV format: must have at least Alias and URL columns
  - Optional columns: Folder, Tags, Created, LastAccessed
  - Handles different column headers intelligently
- Bookmarks HTML: extract URL and folder structure
- Plain text: parse "alias → URL" or "alias | URL" or "alias: URL" formats
- Invalid/malformed entries shown with warnings (user can skip or fix)
```

#### US4.2.4: Merge Import Strategy
```
As a user
I want to merge imported shortcuts with existing ones
So that I can combine collections from multiple sources

Acceptance Criteria:
- Import modal offers merge strategy options:
  1. Keep existing (don't overwrite existing shortcuts)
  2. Replace existing (overwrite with imported version)
  3. Keep both (rename imported if conflicts, e.g., "alias_2")
  4. Smart merge (prefer imported if newer, else keep existing)
- Smart merge uses:
  - Timestamp comparison (which was updated more recently)
  - User prompt for unresolvable conflicts
- After merge completes:
  - Shows count of merged, skipped, updated, new
  - Option to view detailed change log
  - Undo button available for 30 seconds post-import
```

---

### 4.3 Data Validation & Security
**Description:** Ensure imported data is valid and safe.

**User Stories:**

#### US4.3.1: Validate Import Data
```
As a user
I want imported data to be validated
So that I don't accidentally import invalid shortcuts

Acceptance Criteria:
- Validate each imported shortcut:
  - URL is valid HTTP/HTTPS format
  - Alias is valid (alphanumeric/hyphens/underscores)
  - Folder name is valid (if present)
  - Tags are valid (lowercase)
- Show validation errors for invalid entries:
  - Option to skip invalid entries
  - Option to auto-fix (e.g., add "https://" to URLs)
  - Show warnings for suspicious URLs
- Validation report shows:
  - Total entries processed
  - Valid entries
  - Invalid entries with reasons
  - Auto-fixed entries
- User confirms before proceeding with import
```

#### US4.3.2: Detect Duplicate URLs
```
As a user
I want to know if I'm importing duplicate URLs
So that I can avoid redundant shortcuts

Acceptance Criteria:
- During import preview, highlight shortcuts with duplicate URLs
- Show which existing shortcuts have same URL
- Let user choose to:
  - Import anyway (allow duplicate URLs)
  - Skip duplicates
  - Update existing instead of importing
- Warning message if importing URLs already in collection
```

---

### 4.4 Export/Import UI Integration
**Description:** Seamless UI for backup and restore workflows.

**User Stories:**

#### US4.4.1: Backup & Restore UI
```
As a user
I want easy access to backup and restore options
So that I can quickly manage my data

Acceptance Criteria:
- Settings page has "Data Management" section with:
  - Export button → opens export modal
  - Import button → opens file chooser
  - Auto-backup toggle → settings panel
  - Backup history → list of backups with restore buttons
- Each backup shows:
  - Timestamp
  - Shortcut count
  - File size
  - Actions: Download, Restore, Delete
- Clear visual feedback for in-progress operations
- Success/error messages are clear and actionable
```

#### US4.4.2: Drag & Drop Import
```
As a user
I want to drag and drop files to import
So that I can import without clicking through dialogs

Acceptance Criteria:
- Can drag JSON/CSV/HTML file onto import area
- Shows drop zone highlight when dragging
- Validates file format on drop
- Immediately shows import preview and conflict resolution
- Error message if invalid file format
```

---

## Export/Import File Formats

### JSON Format (Native)
```json
{
  "version": "1.0",
  "exportDate": "2025-10-22T14:30:00Z",
  "appVersion": "1.0.0",
  "shortcuts": [
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
  ],
  "metadata": {
    "totalShortcuts": 1,
    "totalFolders": 1,
    "totalTags": 2,
    "exportedBy": "chrome-extension",
    "compressionEnabled": false
  }
}
```

### CSV Format
```csv
Folder,Alias,URL,Tags,Created,LastAccessed,AccessCount
work,meet,https://work.com/meet,"meeting, sync",2025-10-22,2025-10-22,42
,github,https://github.com,"dev, code",2025-10-20,2025-10-21,5
```

### HTML Format
```html
<html>
  <head>
    <title>URL Shortcuts Export</title>
    <style>/* table styling */</style>
  </head>
  <body>
    <h1>URL Shortcuts - Exported 2025-10-22</h1>
    <p>Total shortcuts: 42</p>
    <table>
      <tr>
        <th>Folder</th>
        <th>Alias</th>
        <th>Link</th>
        <th>Tags</th>
        <th>Frequency</th>
      </tr>
      <tr>
        <td>work</td>
        <td>meet</td>
        <td><a href="https://work.com/meet">Open</a></td>
        <td>meeting, sync</td>
        <td>⭐⭐⭐</td>
      </tr>
    </table>
  </body>
</html>
```

---

## Technical Implementation Notes

**File Format Versioning:**
- Include version in exported JSON for future compatibility
- Support migrations if format changes
- Include appVersion for compatibility tracking

**Compression:**
- Optional gzip compression for exports (user setting)
- Enables smaller file sizes for large collections
- Auto-detect compression on import

**Validation:**
```javascript
// Validation schema
{
  url: {
    required: true,
    pattern: /^https?:\/\/.+/,
    maxLength: 2000
  },
  alias: {
    required: true,
    pattern: /^[a-z0-9\-_]+$/i,
    maxLength: 50,
    minLength: 1
  },
  tags: {
    optional: true,
    arrayOf: {
      pattern: /^[a-z0-9\-]+$/,
      maxLength: 20
    },
    maxLength: 50
  }
}
```

**Conflict Detection:**
- Check for duplicate (folder + alias) combinations
- Check for duplicate URLs (advisory warning)
- Detect circular references (if applicable)

**Import Performance:**
- For large imports (1000+ shortcuts):
  - Show progress bar
  - Process in batches
  - Allow cancellation
  - Estimated time displayed

**Undo Mechanism:**
- Keep undo history of last 5 import operations
- Store pre-import state for 30 seconds
- Allow single-click rollback of import

---

## Assumptions
- JSON format is the canonical/primary format
- CSV import/export uses standard RFC 4180 format
- HTML export is for viewing/sharing, not re-importing to other tools
- File size limit: 50MB per file
- Browser download API available
- Local file system access for file picking
- No cloud storage integration initially
