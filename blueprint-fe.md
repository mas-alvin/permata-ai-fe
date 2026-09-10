# AI Frontend Blueprint

## Project Overview
AI is a premium AI chat interface built with React + Vite, featuring a glassmorphic design system, collapsible sidebar, WebGL shader background, and centered chat interface.

**Stack:** React 19, Vite 8, Tailwind CSS 4, ESLint

---

## Folder Structure

```
-ai-fe/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── ai.png           # AI logo
│   ├── components/
│   │   ├── MainContent/
│   │   │   ├── ChatInput.jsx     # Main chat input with model selector
│   │   │   ├── HeroSection.jsx   # Centered tagline
│   │   │   ├── MainContent.jsx   # Main content layout
│   │   │   ├── PinnedChats.jsx   # Pinned chat cards grid
│   │   │   ├── QuickActions.jsx  # Quick action chips
│   │   │   ├── ShaderBackground.jsx # WebGL shader background
│   │   │   └── TopBar.jsx        # Top navigation bar
│   │   ├── Sidebar/
│   │   │   ├── NewChatAndSearch.jsx  # New chat button + search
│   │   │   ├── PinnedModels.jsx      # Model selection cards
│   │   │   ├── RecentChats.jsx       # Recent chats list
│   │   │   ├── SavedTopics.jsx       # Starred topics
│   │   │   ├── Sidebar.jsx           # Main sidebar container
│   │   │   ├── SidebarHeader.jsx     # Header with collapse toggle
│   │   │   ├── SidebarHeader.jsx     # Header with collapse toggle
│   │   │   ├── WorkspaceFooter.jsx   # Settings, help, credits
│   │   │   └── index.js
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── CreditBadge.jsx
│   │       ├── IconButton.jsx
│   │       └── MaterialIcon.jsx
│   ├── App.jsx                   # Root component with ShaderBackground
│   ├── index.css                 # Tailwind + custom styles + design tokens
│   ├── main.jsx                  # Entry point
│   └── constants/                # (Removed - data inlined in components)
├── index.html                    # HTML template with fonts
├── package.json
├── tailwind.config.js            # Design tokens (colors, typography, spacing)
├── vite.config.js                # Vite + Tailwind plugin config
└── blueprint.md                  # This file
```

---

## Component Architecture

### Root Level

#### `App.jsx`
- Root component managing sidebar state (`isSidebarOpen`)
- Renders `ShaderBackground` at root level (z-index: 0) as global background
- Composes `Sidebar` + `MainContent`

#### `main.jsx`
- React 19 entry point
- Imports `index.css` (Tailwind + design tokens)

---

### MainContent Components

#### `MainContent.jsx`
- Layout: `flex-1` filling remaining space after sidebar
- Contains: `TopBar` + centered content area
- Centered content: `HeroSection` + `ChatInput` vertically centered
- Padding `pt-16` accounts for TopBar height (64px)

#### `HeroSection.jsx`
- Minimal centered tagline: "Think bigger with  **mata AI** for insights and innovation at your command"
- Gradient text on " mata AI" using `bg-gradient-to-br from-[#800020] to-[#FFD700]`
- No logo image, no description paragraph

#### `ChatInput.jsx`
- **Layout (left to right):** `[Attach] [Model Dropdown] | [Voice] [Send]`
- **Model dropdown:** Native `<select>` with  mata Pro / Create Image / Canvas
- **Textarea:** Auto-expanding (48px → 160px), scrollable overflow
- **Buttons:** Attach (icon), Voice (icon), Send (gradient icon-only)
- QuickActions bar above input
- Free Trial banner with Upgrade button

#### `TopBar.jsx`
- Left: Hamburger menu (mobile) +  mata Flash 2.5 title
- Right: Link, Share, More (⋮) buttons
- Glassmorphic background: `bg-white/80 backdrop-blur-sm`

#### `QuickActions.jsx`
- Horizontal scrollable chips: "Help me write", "Design Smart", "Learn about", "Analyze Image"

#### `PinnedChats.jsx`
- 3-column grid of pinned chat cards (Project Brief, Design Notes, User Feedback)

#### `ShaderBackground.jsx` ⭐
- **WebGL canvas** fixed full-screen (z-index: 0)
- **Fragment shader** with:
  - FBM (Fractional Brownian Motion) noise layers
  - Radial gradient from center
  - **Mouse-responsive glow** following cursor
  - Burgundy (#800020) → Gold (#FFD700) color palette
  - Vignette edges, animated time-based noise
- Mouse position tracked via `mousemove` on canvas
- `requestAnimationFrame` render loop at 60fps
- `pointer-events-none` allows clicks through to UI

---

### Sidebar Components

#### `Sidebar.jsx`
- **State:** `isCollapsed` (boolean)
- **Width:** `w-72` (288px) ↔ `w-16` (64px) with `transition-all duration-300`
- **Collapse behavior:** Hides all child components when collapsed
- Desktop: `w-0` when closed, `w-72` when open
- Mobile: Drawer overlay (handled by App level)

#### `SidebarHeader.jsx`
- Props: `isCollapsed`, `onToggleCollapse`
- Shows  mata AI logo + "Workspace & Studio"
- Collapse button: `chevron_left` (expanded) ↔ `chevron_right` (collapsed)

#### `NewChatAndSearch.jsx`
- "New Chat" button (primary gradient)
- Search input with 🔍 icon and ⌘F hint

#### `PinnedModels.jsx`
- Collapsible section header with chevron
- 3 model cards:  mata Pro (gradient), Create Image, Canvas
- Active model highlighted with ring

#### `SavedTopics.jsx`
- Starred topics list with ⭐ prefix icon
- Hover → text-primary transition

#### `RecentChats.jsx`
- Active chat: green dot + ✓ check
- Others: clean list with hover highlight
- No radio buttons (clean list style)

#### `WorkspaceFooter.jsx`
- Settings, Help buttons
- Credit badge: "80" with tooltip "80 credits left"

---

### UI Primitives

#### `MaterialIcon.jsx`
- Wrap  for Google Material Symbols
- `fill` prop sets `font-variation-settings: "FILL" 1`

#### `IconButton.jsx`
- Variants: `icon`, `flat`, `glass`, `outline`
- Sizes: `sm` (32px), `md` (36px), `lg` (48px), `xl` (40px)
- Focus-visible ring styling

#### `Button.jsx`
- Variants: `primary`, `secondary`, `gradient`
- Sizes: `sm`, `md`, `lg`
- Focus-visible ring

#### `CreditBadge.jsx`
- Circular badge with tooltip on hover

---

## Design System (tailwind.config.js)

### Colors (Material 3 inspired)
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#570013` | Primary actions, brand |
| `primary-container` | `#800020` | Gradient start |
| `secondary` | `#705d00` | Secondary actions |
| `secondary-container` | `#fcd400` | Accent, gradient end |
| `tertiary` | `#282727` | Tertiary surfaces |
| `surface` | `#f8f9fa` | Base background |
| `on-surface` | `#191c1d` | Primary text |
| `on-surface-variant` | `#584141` | Secondary text |

### Typography
| Class | Size/Weight/Line-height |
|-------|------------------------|
| `text-display-lg` | 48px / 700 / 56px |
| `text-headline-lg` | 32px / 600 / 40px |
| `text-headline-md` | 24px / 600 / 32px |
| `text-body-lg` | 18px / 400 / 28px |
| `text-body-md` | 16px / 400 / 24px |
| `text-label-md` | 14px / 500 / 20px |
| `text-label-sm` | 12px / 500 / 16px |

### Spacing
| Token | Value |
|-------|-------|
| `base` | 8px |
| `gutter` | 24px |
| `stack-sm` | 12px |
| `stack-md` | 24px |
| `stack-lg` | 48px |
| `container-padding` | 32px |

### Border Radius
| Token | Value |
|-------|-------|
| `DEFAULT` | 1rem (16px) |
| `lg` | 2rem (32px) |
| `xl` | 3rem (48px) |
| `full` | 9999px |

---

## Key Features

### 1. Collapsible Sidebar
- Desktop: 3 states (open 288px / compact 64px / closed 0)
- Mobile: Drawer overlay with backdrop
- Smooth `transition-all duration-300`

### 2. WebGL Shader Background
- 60fps animated noise + gradient
- Mouse-responsive glow ripple
- Brand colors: Burgundy → Gold
- Runs at z-index: 0 behind all content

### 3. Centered Chat Interface
- Hero + Input vertically centered in viewport
- `pt-16` offset for TopBar
- Max width `max-w-3xl` (768px)

### 3. Model Selection in Input
- Native `<select>` dropdown in input bar
- Options:  mata Pro / Create Image / Canvas

### 4. Auto-expanding Textarea
- Grows from 48px to 160px
- Internal scroll when maxed

### 5. Responsive Design
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Mobile sidebar drawer
- Touch-friendly targets

---

## Configuration Files

### `vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### `tailwind.config.js`
- Complete design token configuration
- `darkMode: "class"`
- Custom colors, typography, spacing, borderRadius

### `index.css`
```css
@import "tailwindcss";
@config "../tailwind.config.js";

@layer utilities {
  .bg-gradient-pro { background: linear-gradient(135deg, #800020 0%, #ffd700 100%); }
  .backdrop-blur-3xl { backdrop-filter: blur(64px); }
  /* custom scrollbar, hide-scrollbar */
}
```

### `index.html`
- Preconnect Google Fonts: Material Symbols + Inter
- Root div with `type="module"` entry

---

## Data Flow

```
App (sidebar state)
├── ShaderBackground (global, no props)
├── Sidebar (isOpen, onToggle, onClose)
│   ├── SidebarHeader (isCollapsed, onToggleCollapse)
│   ├── NewChatAndSearch (onNewChat, onSearch)
│   ├── PinnedModels (models, selected, onSelect)
│   ├── SavedTopics (hardcoded)
│   ├── RecentChats (hardcoded)
│   └── WorkspaceFooter
└── MainContent
    ├── TopBar (onToggleSidebar)
    └── Centered Content
        ├── HeroSection
        └── ChatInput
            ├── QuickActions (onQuickAction)
            ├── Model Select (onModelSelect)
            ├── Textarea (onSend)
            └── Buttons (onAttach, onVoice, onSend)
```

---

## Build & Run

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

---

## Assets

- `src/assets/ mata.png` - Logo (135KB)
- `src/assets/ mata.svg` - Favicon

---

## Notes for Future Development

1. **Shader  formance:** Consider reducing FBM octaves on mobile
2. **State Management:** Currently local component state; consider Context for chat history
3. **Accessibility:** All interactive elements have `focus-visible` rings and `aria-label`s
4. **Internationalization:** Text is hardcoded; extract to i18n when needed
5. **Testing:** No test suite yet; add Vitest + React Testing Library