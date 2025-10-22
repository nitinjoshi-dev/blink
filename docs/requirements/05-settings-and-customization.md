# Requirement 5: Settings & Customization

## Overview
Users should be able to customize the plugin to match their workflow, including keyboard shortcuts, display preferences, and behavior settings.

## Business Value
- Customizable shortcuts accommodate different user preferences
- Flexible settings enable adaptation to various workflows
- User-centric configuration increases adoption and satisfaction

---

## Feature Details

### 5.1 Keyboard Shortcuts
**Description:** Customizable keyboard shortcuts for all major actions.

**User Stories:**

#### US5.1.1: Customize Global Keyboard Shortcuts
```
As a user
I want to customize keyboard shortcuts
So that I can use shortcuts that match my muscle memory

Acceptance Criteria:
- Settings page has "Keyboard Shortcuts" section
- Shows all available shortcuts with current bindings:
  - Open Search Dashboard (default: Cmd+Shift+O)
  - Open in Current Tab (default: Enter)
  - Open in New Tab (default: Shift+O or Ctrl+Enter)
  - Open in New Window (default: Cmd+Shift+Enter)
  - Copy URL (default: C)
  - Delete Shortcut (default: D)
  - Edit Shortcut (default: E)
- Each shortcut can be clicked to edit the binding
- Shows modal to input new key combination
- Validates that new shortcut doesn't conflict with existing ones
- Shows conflicts warning if trying to use system/Chrome shortcuts
- Changes take effect immediately
- Can reset all shortcuts to defaults
```

#### US5.1.2: Platform-Specific Shortcuts
```
As a user
I want platform-specific keyboard shortcuts
So that the shortcuts work naturally on my OS

Acceptance Criteria:
- App detects platform (Mac, Windows, Linux)
- Shows appropriate modifiers:
  - Mac: Cmd (⌘), Shift (⇧), Ctrl (⌃), Option (⌥)
  - Windows/Linux: Ctrl, Shift, Alt, Win
- Default shortcuts optimized per platform
- User can override with custom shortcuts
- Shortcuts display platform-appropriate notation
- Works correctly with platform modifiers
```

#### US5.1.3: Keyboard Shortcut Conflicts
```
As a user
I want to avoid keyboard shortcut conflicts
So that my custom shortcuts work reliably

Acceptance Criteria:
- System validates shortcuts don't conflict with:
  - Chrome built-in shortcuts
  - Other extension shortcuts
  - Operating system shortcuts
- Shows warnings for potentially conflicting shortcuts
- Prevents saving conflicting shortcuts (error message)
- Suggests alternative shortcuts if conflict detected
- Lists known conflicts in help section
```

---

### 5.2 Display & UI Preferences
**Description:** Customize how the dashboard and shortcuts are displayed.

**User Stories:**

#### US5.2.1: Theme & Appearance
```
As a user
I want to customize the appearance of the plugin
So that it matches my preferences and reduces eye strain

Acceptance Criteria:
- Settings has "Appearance" section with options:
  - Theme: Light, Dark, Auto (follow system)
  - Font size: Small, Normal, Large
  - Compact mode: toggle for condensed display
- Dark mode reduces blue light for evening use
- Font sizes scale all UI elements proportionally
- Compact mode reduces spacing/padding for more content visible
- Changes preview in real-time in settings panel
- Applies to all plugin UI (dashboard, modals, settings)
```

#### US5.2.2: Results Display Format
```
As a user
I want to customize how shortcuts are displayed in search results
So that I can see information that matters to me

Acceptance Criteria:
- Settings has "Display Format" options:
  - Show: Alias, URL, Tags, Last Accessed, Access Count
  - Each item can be toggled on/off
  - Can reorder display columns
- Defaults show: Alias, URL, Tags, Frequency indicator
- Changes apply immediately to search dashboard
- Can save multiple display profiles (e.g., "minimal", "detailed")
- Option to auto-switch profile based on context
```

#### US5.2.3: Sorting & Organization Defaults
```
As a user
I want to customize default sorting and filtering
So that my frequently used shortcuts appear first

Acceptance Criteria:
- Settings has "Organization" section:
  - Default sort for shortcuts list:
    - Alphabetical by alias
    - By access frequency
    - By last accessed
    - By created date
  - Default view:
    - All shortcuts
    - By folder
    - Favorites only
- Can set different defaults per view (dashboard vs list)
- Sorting preference persists across sessions
- Option to sort folders before shortcuts
```

---

### 5.3 Behavior Settings
**Description:** Configure default behaviors and actions.

**User Stories:**

#### US5.3.1: Default Open Behavior
```
As a user
I want to set default behavior for opening shortcuts
So that I don't have to press modifier keys repeatedly

Acceptance Criteria:
- Settings has "Open Behavior" section:
  - Default action when pressing Enter:
    - Open in current tab
    - Open in new tab
    - Open in new window
  - Second action (with modifier):
    - Available as alternative
- This allows flexible workflows:
  - Power user workflow: default to current tab, modifier for new
  - Or opposite based on preference
```

#### US5.3.2: Auto-Copy Behavior
```
As a user
I want to configure auto-copy behavior
So that URLs are available quickly without extra steps

Acceptance Criteria:
- Settings toggle: "Auto-copy URL when opening"
- Options: Never, Always, Only for new tab/window
- When enabled:
  - URL copied to clipboard when shortcut opened
  - Toast shows "URL copied" notification
- Useful for pasting URLs elsewhere while navigating
```

#### US5.3.3: Close Dashboard After Action
```
As a user
I want to control when the dashboard closes
So that I can quickly open multiple shortcuts or just one

Acceptance Criteria:
- Settings toggle: "Close dashboard after opening shortcut"
- Enabled (default): Dashboard closes after opening shortcut in current tab
- Disabled: Dashboard stays open for quick access to multiple shortcuts
- Opening in new tab/window doesn't close dashboard regardless
```

#### US5.3.4: Duplicate Detection
```
As a user
I want to be warned about duplicate URLs
So that I don't create redundant shortcuts

Acceptance Criteria:
- Settings toggle: "Warn about duplicate URLs"
- When creating/editing shortcut with URL that already exists:
  - Show warning with existing shortcut details
  - Can override or cancel
- Shows which existing shortcuts have same URL
- Useful for maintaining clean collection
```

---

### 5.4 Data & Privacy Settings
**Description:** Control data collection and privacy features.

**User Stories:**

#### US5.4.1: Privacy Settings
```
As a user
I want to control what data is collected
So that I maintain privacy

Acceptance Criteria:
- Settings has "Privacy" section:
  - Toggle: "Track access statistics" (default: on)
    - If off: access count and last accessed not tracked
    - Useful for privacy-sensitive users
  - Toggle: "Store browsing history" (default: on)
    - If off: recently accessed section not available
- Disabling tracking doesn't affect core functionality
- Can disable after data already collected:
  - Option to clear all access data
  - Resets access count and last accessed timestamps
```

#### US5.4.2: Data Storage Location
```
As a user
I want to know where my data is stored
So that I understand data security implications

Acceptance Criteria:
- Settings shows "Data Storage" info:
  - Storage method: IndexedDB (local only)
  - Syncing: None (local only)
  - Backup status: Last backup time/date
  - Data size: Current storage usage
  - Location: "Locally on this device"
- Clarifies that data is never sent to remote servers
- Shows what data is stored: shortcuts only (no browsing history)
```

#### US5.4.3: Data Deletion Options
```
As a user
I want to delete my data
So that I can clear data if uninstalling or wanting fresh start

Acceptance Criteria:
- Settings has "Data Management" section:
  - "Clear all shortcuts": Delete all data with confirmation
  - "Clear access statistics": Reset access counts and dates
  - "Delete auto-backups": Remove backup files
- Confirmation dialogs show what will be deleted
- After deletion, shows "Data cleared" confirmation
- Undo available for 30 seconds (restore from auto-backup)
- Clicking "Clear all shortcuts" requires double confirmation
```

---

### 5.5 Auto-Backup Settings
**Description:** Configure automatic backup behavior.

**User Stories:**

#### US5.5.1: Configure Auto-Backup
```
As a user
I want automatic backups of my shortcuts
So that I don't lose data

Acceptance Criteria:
- Settings has "Backup" section:
  - Toggle: "Enable auto-backup" (default: on)
  - Frequency: Daily, Weekly, Monthly (default: Weekly)
  - Keep backups: Dropdown 1-50 (default: 10)
  - Button: "Backup now"
- Auto-backup runs without user intervention
- Shows status of last backup and next scheduled backup
- Can manually trigger backup anytime
- Settings remembers user preferences
```

#### US5.5.2: Backup Location & Management
```
As a user
I want to manage my backups
So that I can restore from specific points in time

Acceptance Criteria:
- Settings shows "Backup History":
  - List of all existing backups with:
    - Timestamp (date and time)
    - Shortcut count at that time
    - File size
    - Actions: Download, Restore, Delete
- Can download any backup for external storage
- Can restore from any backup:
  - Shows confirmation with current count vs restore count
  - Gives option to merge or replace
- Automatic backups stored locally (in extension storage)
- Automatic cleanup removes old backups beyond "keep" limit
```

---

### 5.6 Advanced Settings
**Description:** Power user settings for advanced configuration.

**User Stories:**

#### US5.6.1: Search Settings
```
As a user
I want to configure search behavior
So that I can optimize search for my workflow

Acceptance Criteria:
- Settings has "Search" section:
  - Toggle: "Include URL in search" (default: on)
  - Toggle: "Include tags in search" (default: on)
  - Toggle: "Include folder in search" (default: on)
  - Search sensitivity: Strict/Normal/Fuzzy (default: Normal)
- Search sensitivity affects matching:
  - Strict: Exact phrase matching only
  - Normal: Current behavior (prefix/partial matching)
  - Fuzzy: Loose matching (e.g., "github" matches "g-hub")
- Changes update search behavior immediately
```

#### US5.6.2: Omnibox Settings
```
As a user
I want to configure omnibox behavior
So that address bar search works as I prefer

Acceptance Criteria:
- Settings has "Omnibox" section:
  - Keyword: "o" (default, can customize to other letters)
  - Max suggestions: 5-15 (default: 10)
  - Toggle: "Include favorites in suggestions"
  - Action on select: Current tab, New tab (default: Current tab)
- Changing keyword requires Chrome restart
- Shows warning if keyword conflicts with other extensions
```

#### US5.6.3: Debug & Logging
```
As a developer/power user
I want debug information
So that I can troubleshoot issues

Acceptance Criteria:
- Settings has expandable "Advanced" section:
  - Toggle: "Enable debug logging"
  - Button: "Export debug logs"
  - Button: "Clear cache"
  - Shows database stats:
    - Total shortcuts
    - Total tags
    - Total folders
    - Storage used
    - Last sync time
- Debug logs help with troubleshooting
- Can export logs for sharing with support
```

---

### 5.7 Settings UI
**Description:** User interface for settings management.

**User Stories:**

#### US5.7.1: Settings Dashboard
```
As a user
I want a organized settings interface
So that I can easily find and change settings

Acceptance Criteria:
- Settings accessible via:
  - Plugin icon menu
  - Dashboard menu
  - Keyboard shortcut: Cmd+, (customizable)
- Settings organized into sections:
  - Keyboard Shortcuts
  - Appearance
  - Behavior
  - Privacy & Data
  - Backup
  - Advanced
- Each section collapsible/expandable
- Search box to find settings
- "Restore Defaults" button per section
- "Save All" button (or auto-save on change)
- Unsaved changes indicator if applicable
```

#### US5.7.2: Settings Import/Export
```
As a user
I want to export and import my settings
So that I can backup or transfer settings between browsers

Acceptance Criteria:
- Settings has export/import options:
  - "Export Settings": Downloads JSON file with all settings
  - "Import Settings": Allows uploading settings JSON
- Exported file includes:
  - Keyboard shortcuts
  - Display preferences
  - Behavior settings
  - Backup preferences (but not actual backup data)
- Import shows preview of changes before applying
- Can selectively import specific settings
- Useful for transferring settings between browsers
```

#### US5.7.3: Reset Settings
```
As a user
I want to reset settings to defaults
So that I can fix misconfiguration

Acceptance Criteria:
- Each settings section has "Reset to Defaults" button
- Also global "Reset All Settings" option in Advanced
- Confirmation dialog shows what will be reset
- After reset, shows which settings changed
- Takes effect immediately
- User can undo reset by importing previous export
```

---

## Technical Implementation Notes

**Settings Storage:**
- Store settings in `chrome.storage.local` (synced within profile)
- Settings JSON schema:
```json
{
  "version": "1.0",
  "shortcuts": {
    "openSearchDashboard": "Cmd+Shift+O",
    "openInNewTab": "Shift+O",
    "copyUrl": "C"
  },
  "display": {
    "theme": "auto",
    "fontSize": "normal",
    "compactMode": false
  },
  "behavior": {
    "defaultOpenBehavior": "current-tab",
    "autoCopyUrl": false,
    "closeDashboardAfterOpen": true
  },
  "privacy": {
    "trackAccess": true,
    "storeBrowsingHistory": true
  },
  "backup": {
    "autoBackup": true,
    "backupFrequency": "weekly",
    "keepBackups": 10
  }
}
```

**Keyboard Shortcut Validation:**
- Check against Chrome reserved shortcuts
- Check against common browser shortcuts
- Test with platform modifiers
- Provide conflict detection and resolution

**Settings Persistence:**
- Auto-save each setting change (no need for Save button)
- Show toast notification on save
- Handle sync conflicts gracefully
- Validate all settings on load

**Migration:**
- Support versioning for future setting format changes
- Auto-migrate old settings format to new
- Log migrations for debugging

---

## Assumptions
- Settings stored locally (no cloud sync)
- Settings accessible only within plugin UI
- All settings optional with sensible defaults
- No multi-device settings sync initially
- Debug features hidden behind toggle
