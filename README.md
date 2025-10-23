# 🔗 URL Shortcut Chrome Plugin

A powerful, keyboard-first Chrome extension for managing URL shortcuts with smart categorization, search, and dark mode interface.

## ✨ Features

- **Context-Aware Plugin** - Click the plugin icon to quickly add or edit the current page
- **Keyboard-First Navigation** - Fully navigable without mouse using intuitive shortcuts
- **Smart Search** - Fast search with `Cmd+Shift+O` (global), categorized results
- **Folder Organization** - Group shortcuts into single-level folders
- **Tags & Filtering** - Add tags and search/filter by multiple criteria
- **Dark Mode** - Modern dark interface with cyan accents
- **Undo Support** - 30-second undo window for accidental deletions
- **Fast Access** - Dashboard view with quick preview of frequently used shortcuts



## How to install:

### Download Latest Release OR [Build your own binaries](#-build-your-own-binaries-10-minutes)
1.  Download the latest fixed version, use the following link:
    - [Download v1.0.2](https://github.com/nitinjoshi-dev/blink/releases/download/v1.0.2/V1.0.2.zip)

2. Open Chrome Extensions Page: Visit: chrome://extensions

3. Enable Developer Mode: Click toggle in top right

4. Load Unpacked: Click "Load unpacked" button. Select the "dist" folder from this project

5. Pin Extension (optional): Click the extension icon to pin it to your toolbar

#### Shortcut
To open search:
    `Cmd + Shift + O` or `Ctrl + Shift + O`

## 🚀 Build your own binaries (10 minutes)

### Prerequisites
- **Node.js** 18+
- **Chrome/Chromium** browser
- This repository cloned/downloaded


### Installation & Setup

```bash
# 1. Navigate to project directory
cd repoFolderPath

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build

# 4. Open Chrome Extensions Page
# Visit: chrome://extensions

# 5. Enable Developer Mode
# Click toggle in top right

# 6. Load Unpacked
# Click "Load unpacked" button
# Select the "dist" folder from this project

# 7. Pin Extension (optional)
# Click the extension icon to pin it to your toolbar
```

### Verify Installation
1. Visit any website (e.g., google.com)
2. Click the URL Shortcuts icon in your toolbar
3. You should see a popup with the current page URL and title ✅

**Done!** Your extension is now running. 🎉

#### Shortcut
To open search:
    `Cmd + Shift + O` or `Ctrl + Shift + O`

---

## 📖 How to Use

### Adding a Shortcut
1. Visit any webpage
2. Click the extension icon
3. Enter an **alias** (short code, e.g., "meet" for Google Meet)
4. (Optional) Add a **folder** and **tags**
5. Press **Cmd+Enter** to save

### Searching for Shortcuts
1. Press **Cmd+Shift+O** anywhere (globally)
2. Start typing to search
3. Use **↑↓** arrows to navigate
4. Press **Enter** to open

### Accessing Dashboard
1. From search popup, click **🏠 Home**
2. Or from plugin popup, click **Dashboard**
3. Browse all shortcuts with folder structure
4. Click any shortcut to view details
5. Press **E** to edit or **D** to delete

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+O` | Open search (global) |
| `Cmd+Z` | Undo deletion |
| `Escape` | Close modal |
| `Enter` | Open shortcut |
| `Cmd+Enter` | Save / Open in new tab |
| `E` | Edit |
| `D` | Delete |
| `C` | Copy URL |

---

## 🔧 Development

### Development Commands

```bash
# Start development (watches for changes)
npm run dev

# Build for production
npm run build

# Check code quality
npm run lint

# Fix code issues
npm run lint:fix

# Format code
npm run format
```

### During Development
- Run `npm run dev` in one terminal
- Make code changes (auto-rebuilds)
- Go to `chrome://extensions`
- Click reload ↻ on URL Shortcuts
- Changes appear instantly!

### Project Structure
```
src/
├── services/           # Business logic (validators, formatters, CRUD)
├── hooks/              # Custom React hooks (useShortcutsData, etc)
├── store/              # Zustand state management
├── components/         # React components (to be built)
├── styles/             # CSS styles
├── background/         # Service worker
└── content/            # Content script

public/
├── manifest.json       # Extension config
├── popup.html          # Popup template
└── styles/popup.css    # Popup styles

dist/                   # Build output (generated)
```

---

## 📊 Implementation Status

### ✅ PHASE 1: Setup (Complete)
- Vite build configuration
- React + Zustand setup
- Chrome extension manifest
- IndexedDB schema
- **Files**: 25+ | **Lines**: 1000+

### ✅ PHASE 2: Data Layer (Complete)
- Validators (URL, alias, folders, tags)
- Formatters (date, aliases, display)
- Shortcut CRUD service
- Folder management service
- Chrome API wrappers
- **Files**: 5 | **Lines**: 5750+

### ✅ PHASE 3: State Management (Complete)
- Zustand store (7 slices, 80+ actions)
- Custom hooks (useShortcutsData, useFoldersData, useSearchData)
- Performance optimizations
- Error handling & logging
- **Files**: 4 | **Lines**: 1000+

### ⏳ PHASE 4: React Components (Next)
- Plugin popup components
- Dashboard components
- Search popup components
- Common UI components
- **Estimated**: 3-4 hours

### ⏳ Remaining Phases
- Phase 5: Keyboard navigation
- Phase 6: Styling & animations
- Phase 7: Testing & QA
- Phase 8: Build & deployment

---

## 💾 Data Storage

All data is stored locally in **IndexedDB**:

| Store | Purpose |
|-------|---------|
| `shortcuts` | Your saved URL shortcuts |
| `folders` | Folder organization |
| `undoStack` | 30-second deletion undo history |

**Important**:
- ✅ Data persists across browser restarts
- ✅ Data persists across page reloads
- ❌ Data does NOT sync to cloud
- ❌ Data is NOT shared between browsers/devices

---

## 🎨 Design System

### Colors (Dark Mode)
```
Primary Background:  #0f0f0f
Surface:             #1a1a1a
Text Primary:        #e8e8e8
Text Secondary:      #888888
Accent (Cyan):       #00d9ff
Success (Green):     #10b981
Error (Red):         #ef4444
```

---

## 🐛 Troubleshooting

### Extension doesn't load
```bash
# Rebuild and reload
npm run build
# Then: chrome://extensions → reload ↻
```

### Popup is blank
1. Press F12 to open DevTools
2. Check console for errors
3. Run `npm run build` again
4. Reload extension

### Lost data
1. Open DevTools (F12)
2. Go to **Application** → **IndexedDB**
3. Check for `url-shortcuts-db`
4. If missing, data was cleared (cannot be recovered)

### Database errors
1. DevTools → **Application** → **IndexedDB**
2. Right-click `url-shortcuts-db` → **Delete Database**
3. Reload extension
4. Database will be recreated

---

## 📚 Documentation

### Getting Started
- **[Getting Started Guide](GETTING-STARTED.md)** - Local setup & Chrome loading
- **[Phase 1 Setup](PHASE-1-SETUP.md)** - Infrastructure details
- **[Phase 2 Services](PHASE-2-COMPLETE.md)** - Data layer documentation
- **[Phase 3 State](PHASE-3-COMPLETE.md)** - State management documentation

### Design & Requirements
- **[Design Overview](docs/design/00-design-overview.md)** - High-level architecture
- **[Full UI/UX Design](docs/design/01-ui-ux-design.md)** - Detailed specifications with mockups
- **[Implementation Checklist](docs/design/02-implementation-checklist.md)** - Development roadmap
- **[Core Requirement](docs/requirements/01-core-shortcut-management.md)** - Feature specs

### Additional References
- **[Overview](docs/requirements/00-overview.md)** - Project vision
- **[Search & Navigation](docs/requirements/02-search-navigation.md)** - Search features
- **[Tags & Categorization](docs/requirements/03-tags-and-categorization.md)** - Tag system
- **[Import & Export](docs/requirements/04-import-export.md)** - Backup features
- **[Settings](docs/requirements/05-settings-and-customization.md)** - Customization

---

## ⌨️ Keyboard Shortcuts Reference

### Global Shortcuts (Work Anywhere)
| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+O` | Open search popup |
| `Cmd+Z` | Undo last deletion (30-sec window) |

### In Plugin/Search/Dashboard
| Shortcut | Action |
|----------|--------|
| `Escape` | Close modal or popup |
| `Tab` / `Shift+Tab` | Navigate between fields |
| `↑↓` | Navigate list items |
| `Enter` | Open shortcut in current tab |
| `Cmd+Enter` | Save shortcut / Open in new tab |
| `C` | Copy URL to clipboard |
| `E` | Edit selected shortcut |
| `D` | Delete selected shortcut |
| `/` | Focus search field |

---

## 💡 Tips & Best Practices

### For Users
1. Create **folders** for different contexts (Work, Personal, Learning)
2. Use **short aliases** (2-5 chars) for quick typing
3. Add **tags** for cross-folder searching
4. Regularly review **frequent shortcuts** in dashboard

### For Developers
1. Always run `npm run lint:fix` before changes
2. Use Zustand DevTools to inspect state
3. Test in actual Chrome extension, not dev server
4. Check browser console (F12) for errors
5. Use IndexedDB inspector to verify data

---

## 🚀 Next Steps

**You're all set!** Here's what to explore:

1. ✅ **Install locally** - Follow Quick Start above
2. ✅ **Test the plugin** - Add a few shortcuts, search for them
3. 📖 **Read Phase 3 State** - Understand the architecture
4. 🔄 **Make changes** - Modify code and reload (Cmd+Dev)
5. 🚀 **Phase 4 Ready** - React components are next

---

## 📁 File Locations

| What | Where |
|------|-------|
| Source code | `src/` |
| Build output | `dist/` (generated) |
| Extension config | `public/manifest.json` |
| Documentation | `docs/` |
| Implementation notes | `PHASE-*.md` |

---

## 🤝 Architecture Overview

```
UI Layer (React Components - Phase 4)
           ↓
Custom Hooks (Phase 3 ✅)
├─ useShortcutsData
├─ useFoldersData
└─ useSearchData
           ↓
State Management (Phase 3 ✅)
└─ Zustand store with 7 slices
           ↓
Service Layer (Phase 2 ✅)
├─ Validators
├─ Formatters
├─ ShortcutService
├─ FolderService
└─ ChromeApi
           ↓
Database (Phase 1 ✅)
└─ IndexedDB (3 stores)
```

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Total Code** | 7,750+ lines |
| **Services** | 5 (validators, formatters, shortcuts, folders, chromeApi) |
| **State Slices** | 7 (shortcuts, folders, search, UI, undo, loading, filter) |
| **Custom Hooks** | 3 (useShortcutsData, useFoldersData, useSearchData) |
| **Selector Hooks** | 7 (specialized Zustand selectors) |
| **Functions** | 100+ (well-documented) |

---

## 📝 License

Private project for personal use.

---

## ✅ Ready to Use!

**Everything is configured and ready to run locally!**

```bash
# Quick commands
npm install        # Install once
npm run build      # Build extension
npm run dev        # Dev mode with watch
npm run lint:fix   # Fix code issues
```

Then load the `dist/` folder in Chrome at `chrome://extensions` 🚀

**Happy coding!**
