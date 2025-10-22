# Requirement 2: Search & Navigation

## Overview
Users should be able to quickly search and navigate to shortcuts through multiple interfaces: search dashboard, address bar integration (omnibox), and keyboard shortcuts, all with keyboard-first UX.

## Business Value
- Fast access to shortcuts via keyboard reduces context switching
- Multiple search methods accommodate different user workflows
- Keyboard-first design enables power users to stay focused without mouse interaction

---

## Feature Details

### 2.1 Search Dashboard
**Description:** A dedicated UI accessible via keyboard shortcut for searching and accessing shortcuts.

**User Stories:**

#### US2.1.1: Open Search Dashboard
```
As a user
I want to open the search dashboard quickly
So that I can find and navigate to shortcuts without browsing

Acceptance Criteria:
- Accessible via Cmd+Shift+O (Mac) / Ctrl+Shift+O (Windows/Linux)
- Shortcut is customizable in Settings
- Opens in a modal/overlay that doesn't navigate away from current page
- Dashboard modal can be closed with Escape key
- Modal appears centered on screen with focus on search input
- Keyboard shortcut works from any tab/URL
```

#### US2.1.2: Search Dashboard Layout
```
As a user
I want to see a clean search dashboard with useful information
So that I can find shortcuts efficiently

Acceptance Criteria:
- Top section: Large search input box with placeholder "Search shortcuts..."
- Middle section: Top 10 frequently used shortcuts displayed as default view
- Each shortcut shows:
  - Alias (with folder prefix if applicable, e.g., "work/meet")
  - Full URL
  - Tags (if any) displayed as small badges
  - Last accessed date
  - Access count indicator (star/frequency icon)
- Bottom section: Keyboard hints (↑↓ to navigate, Enter to open, C to copy)
- Entire interface is keyboard-navigable
- No mouse required for any action
```

#### US2.1.3: Real-time Search
```
As a user
I want to search shortcuts as I type
So that I can quickly filter to what I need

Acceptance Criteria:
- Search results update as user types (debounced 300ms)
- Search matches in priority order:
  1. Exact alias match (e.g., typing "meet" matches alias "meet")
  2. Partial alias match (e.g., typing "me" matches "meet", "meeting")
  3. Tag match (e.g., typing "sync" matches shortcuts tagged "sync")
  4. URL match (e.g., typing "work.com" shows shortcuts linking to work.com)
- Case-insensitive search
- Special characters in URL match (e.g., "." in "work.com")
- Shows count of matching results
- If search has no results, show "No shortcuts found" message with suggestion to create one
```

#### US2.1.4: Folder-Scoped Search
```
As a user
I want to search within specific folders
So that I can narrow results when I have many shortcuts

Acceptance Criteria:
- Shortcuts can be found via: folder/alias (e.g., "work/meet"), folder only (e.g., "work/"), or alias only (e.g., "meet")
- Typing "work/" shows all shortcuts in work folder
- Typing "work/me" shows shortcuts in work folder starting with "me"
- Typing "me" shows "me*" shortcuts from any folder (default behavior)
- Can filter results to specific folder via UI toggle if desired
```

#### US2.1.5: Navigate Results with Keyboard
```
As a user
I want to navigate search results using arrow keys
So that I can select shortcuts without a mouse

Acceptance Criteria:
- ↑/↓ arrow keys navigate up/down through results
- Currently selected result is highlighted with distinct styling
- First result is auto-selected when search completes
- Enter key opens selected shortcut
- C key copies selected shortcut's URL to clipboard (with confirmation toast)
- O key opens shortcut in new tab (instead of current tab)
- E key opens edit modal for selected shortcut
- D key deletes shortcut (with confirmation)
- Escape key closes search dashboard
- Home/End keys jump to first/last result
```

#### US2.1.6: Favorite Shortcuts in Dashboard
```
As a user
I want to quickly see and access my most-used shortcuts
So that I can get to them without typing

Acceptance Criteria:
- Top 10 frequently used shortcuts shown by default
- Frequency calculated from: access count + recency (last accessed date)
- Frequently used shortcuts have visual indicator (star/badge)
- Clicking on a favorite opens it immediately
- Favorites update automatically as user accesses shortcuts
- Top 10 can be customized to show Top 5/10/15
- Keyboard accessible: use ↑↓ to navigate, Enter to open
```

---

### 2.2 Address Bar Integration (Omnibox)
**Description:** Suggest shortcuts directly in Chrome's address bar using the omnibox API.

**User Stories:**

#### US2.2.1: Setup Omnibox Keyword
```
As a developer/user
I want to configure the omnibox to suggest shortcuts
So that I can use "o [query]" syntax in address bar

Acceptance Criteria:
- Plugin registers "o" as omnibox keyword
- When user types "o " in address bar, omnibox suggestions appear
- Omnibox suggestions show:
  - Alias (with folder prefix if applicable)
  - URL (as description)
  - Frequency/recency indicator
- First matching shortcut is auto-highlighted
- User can navigate with ↑/↓ arrow keys
- Pressing Enter navigates to selected shortcut
- Maximum 10 suggestions shown (most relevant first)
```

#### US2.2.2: Omnibox Search
```
As a user
I want to search for shortcuts directly from the address bar
So that I can navigate quickly without opening a modal

Acceptance Criteria:
- Typing "o meet" in address bar shows shortcuts matching "meet"
- Follows same search priority as search dashboard:
  1. Exact alias match
  2. Partial alias match
  3. Tag match
  4. URL match
- Suggestions update in real-time
- Pressing Enter navigates to first/highlighted suggestion
- Shows "Open in new tab" vs current tab behavior
```

#### US2.2.3: Omnibox Favorites
```
As a user
I want to see my favorite shortcuts when I type "o " (with space)
So that I can quickly access them

Acceptance Criteria:
- Typing "o " shows top 5-10 frequently used shortcuts
- Sorted by access count and recency
- User can still type to filter this list
- Provides quick access without needing to remember exact alias
```

---

### 2.3 Search Features & Filtering
**Description:** Advanced search capabilities for finding shortcuts by various criteria.

**User Stories:**

#### US2.3.1: Multi-Criteria Search
```
As a user
I want to search shortcuts using various criteria
So that I can find exactly what I need

Acceptance Criteria:
- Can search by:
  - Alias (exact or partial)
  - URL/domain (e.g., "work.com")
  - Tags (single or multiple)
  - Folder name
  - Combined criteria (e.g., "tag:meeting folder:work")
- Examples:
  - Search "meet" → matches alias "meet", URL with "meet", tags with "meet"
  - Search "tag:sync" → shows all shortcuts with "sync" tag
  - Search "folder:work" → shows all shortcuts in work folder
  - Search "work/me" → shows aliases starting with "me" in work folder
- Search is case-insensitive
```

#### US2.3.2: Tag-Based Search
```
As a user
I want to search by tags to find related shortcuts
So that I can group shortcuts by category beyond folders

Acceptance Criteria:
- Typing a tag name in search shows all shortcuts with that tag
- Multiple tags can be searched: "tag:meeting tag:recurring" (AND logic)
- Tags are lowercase only
- Tag autocomplete suggests existing tags as user types
- Shows count of shortcuts per tag
```

#### US2.3.3: Recent Shortcuts
```
As a user
I want to see recently accessed shortcuts
So that I can quickly re-access recent work

Acceptance Criteria:
- Search dashboard shows "Recently Accessed" section (collapsible)
- Shows last 5-10 accessed shortcuts with timestamps
- Sorted by last accessed time (most recent first)
- Can open recently accessed shortcut with arrow keys + Enter
```

---

### 2.4 URL Preview & Copy
**Description:** Show full URLs and enable quick copying without mouse interaction.

**User Stories:**

#### US2.4.1: Show Full URL in Search Results
```
As a user
I want to see full URLs in the search dashboard
So that I can verify where a shortcut leads before opening

Acceptance Criteria:
- Each shortcut result shows full URL alongside alias
- URL is visible without hovering (mouse-free approach)
- URL is truncated with ellipsis if very long
- Can view full URL by navigating to result (highlighted)
- Full URL appears in tooltip or detail panel
```

#### US2.4.2: Copy URL to Clipboard
```
As a user
I want to copy a shortcut's URL without opening it
So that I can share or paste it elsewhere

Acceptance Criteria:
- While in search dashboard: press C to copy highlighted shortcut's URL
- Copy confirmation toast shows "URL copied to clipboard"
- In search results or shortcuts list: hover/select and press C
- Works from omnibox suggestions (if applicable)
- Keyboard shortcut works consistently across all interfaces
```

---

### 2.5 Open Shortcut Options
**Description:** Different ways to open shortcuts (current tab, new tab, new window).

**User Stories:**

#### US2.5.1: Open Shortcut - Default Behavior
```
As a user
I want to open shortcuts in current tab by default
So that I maintain my workflow without extra tabs

Acceptance Criteria:
- Pressing Enter on a shortcut opens it in current tab
- From omnibox, Enter also opens in current tab
- Page loads and replaces current URL
- Plugin closes search dashboard after opening
```

#### US2.5.2: Open in New Tab
```
As a user
I want to open shortcuts in a new tab
So that I can keep my current page open

Acceptance Criteria:
- Pressing O (shift+o) or Ctrl+Enter opens shortcut in new tab
- New tab opens in background
- Search dashboard remains open for quick access to another shortcut
- User can continue searching after opening in new tab
```

#### US2.5.3: Open in New Window
```
As a user
I want to open shortcuts in a new window
So that I can separate work by window

Acceptance Criteria:
- Keyboard shortcut Cmd+Shift+Enter opens in new window
- New window opens separately
- Search dashboard closes after opening
```

---

## Technical Implementation Notes

**Omnibox API Integration:**
```javascript
// Register omnibox keyword
chrome.omnibox.setDefaultSuggestion({
  description: "Search URL shortcuts - press space to see favorites"
});

// Listen for input changes and provide suggestions
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  // Query shortcuts matching text
  // Return up to 10 suggestions sorted by priority
});

// Handle when user selects a suggestion
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  // Navigate to selected shortcut based on disposition
  // (currentTab, newForegroundTab, newBackgroundTab)
});
```

**Search Algorithm:**
1. Parse search query for special keywords (tag:, folder:)
2. Query IndexedDB with appropriate filters
3. Score results based on match type (exact > partial > tag > URL)
4. Sort by recency and frequency
5. Return top results

**Performance:**
- Debounce search input (300ms)
- Cache recent searches (limit 50)
- Index all searchable fields in IndexedDB
- Limit omnibox suggestions to top 10 (fast calculation)
- Pre-calculate favorites list on data change

**Data for Search Scoring:**
- Access count (incremented each time shortcut is opened)
- Last accessed timestamp
- Recency weight: (now - lastAccessed) with exponential decay
- Frequency weight: accessCount with logarithmic scaling

---

## Search Priority Rules

| Match Type | Example | Priority |
|-----------|---------|----------|
| Exact alias | `o/meet` matches alias `meet` | 1 (Highest) |
| Partial alias | `o/me` matches alias `meet`, `meeting` | 2 |
| Tag match | `sync` tag matches search for `sync` | 3 |
| URL domain | `work.com` in URL matches search `work` | 4 |
| URL path | URL path contains search term | 5 (Lowest) |

---

## Assumptions
- Omnibox keyword "o" is sufficient and not conflicting with Chrome defaults
- User has Chrome 88+ (omnibox API support)
- Search results limit of 10 is adequate for UX
- Debounce of 300ms is acceptable latency
