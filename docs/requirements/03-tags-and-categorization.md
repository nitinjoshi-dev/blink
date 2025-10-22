# Requirement 3: Tags & Categorization System

## Overview
Users should be able to organize and categorize shortcuts using a flexible tagging system that works alongside folders for flexible categorization and discovery.

## Business Value
- Multiple categorization layers (folders + tags) provide flexible organization
- Tag-based search enables powerful discovery beyond folder hierarchy
- Reduces friction when shortcuts don't fit neatly into one folder

---

## Feature Details

### 3.1 Tag Management
**Description:** Create, assign, and manage tags for shortcuts.

**User Stories:**

#### US3.1.1: Add Tags to Shortcuts
```
As a user
I want to assign tags to shortcuts
So that I can categorize and find them by topic/theme beyond folders

Acceptance Criteria:
- Can add multiple tags when creating a shortcut
- Can add/edit tags for existing shortcuts
- Tags input: comma-separated values, e.g., "meeting, sync, recurring"
- Each tag is automatically converted to lowercase
- Tags are optional (shortcut can exist without tags)
- Tags can have spaces (e.g., "high priority" becomes "high-priority" with auto-hyphen)
- Max 50 tags per shortcut
- Each tag max 20 characters
- No duplicate tags within same shortcut
```

#### US3.1.2: View All Tags
```
As a user
I want to see all available tags
So that I can understand how my shortcuts are categorized

Acceptance Criteria:
- Dashboard has a "Tags" sidebar showing all unique tags
- Each tag shows count of shortcuts with that tag
- Tags are sorted alphabetically
- Clicking a tag filters shortcuts to only those with that tag
- Shows total unique tag count
- Can scroll tag list if many tags exist
```

#### US3.1.3: Manage Tags
```
As a user
I want to manage tags efficiently
So that I can keep my tagging system clean

Acceptance Criteria:
- Can rename a tag (updates all shortcuts with that tag)
- Can delete a tag (removes from all shortcuts with that tag)
- Deleting/renaming shows confirmation with count of affected shortcuts
- Can merge two tags (e.g., "sync" and "synchronize" → "sync")
- Can view all shortcuts for a tag
- Tag management interface is accessible from Dashboard
- Changes are immediately reflected across all shortcuts
```

#### US3.1.4: Tag Suggestions & Autocomplete
```
As a user
I want tag suggestions as I type
So that I don't create duplicate or similar tags

Acceptance Criteria:
- When typing tags, show autocomplete suggestions of existing tags
- Suggestions are sorted by frequency (most-used tags first)
- Pressing Tab or Down Arrow accepts first suggestion
- Can dismiss suggestions with Escape
- Exact match detection prevents creating duplicate tags
- Shows "No matching tags" if no similar tag exists
```

---

### 3.2 Tag-Based Search
**Description:** Powerful search capabilities using tags.

**User Stories:**

#### US3.2.1: Search by Single Tag
```
As a user
I want to search for shortcuts by tag
So that I can find all shortcuts of a specific category

Acceptance Criteria:
- Searching "tag:meeting" or just "meeting" shows all shortcuts with that tag
- Tag search is case-insensitive
- Results show all matching shortcuts regardless of folder
- Can see which shortcuts have that tag
- Results count shown ("5 shortcuts with tag 'meeting'")
```

#### US3.2.2: Search by Multiple Tags
```
As a user
I want to search for shortcuts that have multiple specific tags
So that I can narrow down to very specific shortcuts

Acceptance Criteria:
- Searching "tag:meeting tag:recurring" shows shortcuts with BOTH tags (AND logic)
- Can chain multiple tag searches
- Example: "tag:work tag:urgent tag:meeting" shows only shortcuts with all three tags
- Results count reflects all filters applied
- Can remove individual tag filters while keeping others
```

#### US3.2.3: Tag Cloud/Visualization
```
As a user
I want to visualize my tag distribution
So that I can understand how my shortcuts are organized

Acceptance Criteria:
- Dashboard can show a tag cloud (word cloud style)
- Tag size represents frequency of use (larger = more shortcuts)
- Color indicates different categories or usage frequency
- Clicking a tag filters shortcuts to that tag
- Tag cloud updates dynamically as tags are added/removed
- Can toggle between tag cloud and list view
```

---

### 3.3 Tag Workflows
**Description:** Common workflows for managing shortcuts with tags.

**User Stories:**

#### US3.3.1: Bulk Tag Operations
```
As a user
I want to add or remove tags from multiple shortcuts at once
So that I can organize large groups efficiently

Acceptance Criteria:
- Multi-select shortcuts (Cmd+Click or Shift+Click)
- "Add tags" action adds selected tags to all selected shortcuts
- "Remove tags" action removes selected tags from all selected shortcuts
- "Set tags" action replaces tags completely (with confirmation)
- Shows preview of changes before confirming
- Shows count of affected shortcuts
- Keyboard accessible: select with Shift+Click, then Tab to bulk actions
```

#### US3.3.2: Tag-Based Workflows
```
As a user
I want to have saved tag searches I can access quickly
So that I can revisit common groupings

Acceptance Criteria:
- Can save common tag searches as quick filters
- Example: Save "tag:work tag:urgent" as "Work Priority"
- Saved filters appear as buttons in dashboard sidebar
- Can edit or delete saved filters
- Keyboard shortcut to cycle through saved filters
- Max 10 saved filters
- Quick filters show shortcut count in badge
```

---

## Tag Schema & Constraints

| Property | Rules |
|----------|-------|
| Tag Name | Lowercase only, max 20 chars, alphanumeric + hyphen |
| Tags per Shortcut | Max 50 |
| Unique Tags | Enforced system-wide |
| Space Handling | Spaces auto-converted to hyphens (e.g., "high priority" → "high-priority") |
| Case | Always lowercase (user input auto-lowercased) |
| Special Characters | Hyphens only (no spaces, underscores, or special chars) |
| Duplicates | Not allowed within same shortcut |

---

## Technical Implementation Notes

**Tag Storage:**
- Store tags as array in shortcut object
- Maintain a separate "tags index" collection for quick lookups
- Example:
```json
{
  "id": "uuid",
  "alias": "meet",
  "tags": ["meeting", "sync", "recurring"],
  "folder": "work"
}
```

**Tag Index Structure:**
```json
{
  "tag": "meeting",
  "count": 12,
  "shortcuts": ["id1", "id2", ...],
  "lastUpdated": "2025-10-22T10:00:00Z"
}
```

**Search Query Parsing:**
```javascript
// Parse queries like "tag:meeting work/meet sync"
// Result: {
//   tagFilters: ["meeting"],
//   folderFilter: "work",
//   aliasFilter: "meet",
//   generalSearch: ["sync"]
// }
```

**Performance:**
- Index tags in separate collection for O(1) tag lookup
- Denormalize tag count in tag index for quick aggregation
- Cache tag cloud data (recalculate on tag changes)
- Limit tag autocomplete to 10 suggestions

**Tag Operations - Update Efficiency:**
- When renaming tag: Query shortcuts with tag, update all at once
- When deleting tag: Similar batch operation
- Use transactions to ensure consistency

---

## Tag Best Practices (In-App Guidance)

The app should guide users with these tag practices:

1. **Use lowercase tags:** System enforces this
2. **Use hyphens for multi-word tags:** "high-priority" not "high_priority"
3. **Keep tags short:** 1-3 words maximum
4. **Avoid overly specific tags:** Use folders for hierarchies
5. **Reuse existing tags:** Leverage autocomplete
6. **Combine tags semantically:** "tag:work tag:urgent" for compound queries

---

## Assumptions
- Tags are global (not per-folder)
- Case-insensitive tag matching for search
- AND logic for multiple tag searches (all tags must be present)
- Max 50 tags per shortcut is sufficient
- Autocomplete showing 10 suggestions is adequate
