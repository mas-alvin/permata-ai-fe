---
name: Permata
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#584141'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8c7071'
  outline-variant: '#e0bfbf'
  surface-tint: '#af2b3e'
  primary: '#570013'
  on-primary: '#ffffff'
  primary-container: '#800020'
  on-primary-container: '#ff828a'
  inverse-primary: '#ffb3b5'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd400'
  on-secondary-container: '#6e5c00'
  tertiary: '#282727'
  on-tertiary: '#ffffff'
  tertiary-container: '#3e3d3d'
  on-tertiary-container: '#aaa8a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b5'
  on-primary-fixed: '#40000b'
  on-primary-fixed-variant: '#8e0f28'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 32px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is centered on a "Premium Academic & Technical" personality. It targets high-level professionals and researchers who require an AI interface that feels both powerful and sophisticated. 

The visual style is a refined **Glassmorphic Modernism**. It draws heavy inspiration from macOS window management, utilizing layers of translucency, background blurs, and depth to organize complex information without overwhelming the user. The aesthetic is clean, spacious, and evokes the feeling of a high-end physical workspace. It balances the "heaviness" of a deep Burgundy and Golden Yellow palette with the light, airy properties of frosted glass surfaces.

## Colors

The palette is anchored by **Burgundy**, used sparingly for high-intent actions and primary branding to maintain its regal, serious impact. **Golden Yellow** serves as a precise accent for status indicators, active states, or premium features.

The background is a crisp **Off-white (#F9FAFB)**, which provides the necessary contrast for the glass layers. Text follows a strict hierarchy: high-contrast dark gray (approaching black) for headings and body, while a muted gray-500 is reserved for secondary metadata and placeholders. Glass surfaces should utilize a semi-transparent white fill with a significant backdrop-blur (minimum 20px) to ensure legibility over dynamic backgrounds.

## Typography

The system utilizes **Inter** (as the modern web-optimized equivalent to Helvetica Neue) to maintain a neutral, Swiss-inspired clarity. 

Typography is utilized to create structure in the absence of heavy borders. Headlines use tighter letter spacing and heavier weights to feel "anchored." Body text prioritizes generous line heights (1.5x - 1.6x) to ensure the AI's generated content remains readable during long research sessions. Labels and small UI elements use medium weights to maintain visibility against semi-transparent glass backgrounds.

## Layout & Spacing

This design system employs a **Fluid Grid** with fixed-width constraints for the main content containers (max-width 1440px). The layout mimics a desktop application with a persistent sidebar (280px) and a main content area that adapts to the viewport.

Spacing follows an 8px linear scale. A "Spacious" philosophy is applied: margins and paddings are intentionally larger than standard web apps to evoke a premium, unhurried feel. Breakpoints are set at 768px (Tablet) and 1024px (Desktop). On mobile, the sidebar collapses into a bottom navigation bar or a hamburger menu, and container padding reduces from 32px to 16px.

## Elevation & Depth

Hierarchy is defined through three distinct layers:
1. **The Canvas:** The base Off-white layer (#F9FAFB).
2. **The Glass Layer:** Elevated panels with a `white/70%` fill and `backdrop-blur: 24px`. These panels use a very soft, diffused shadow (`0 4px 12px rgba(0,0,0,0.05)`) and a 1px white inner-stroke to simulate light catching the edge of the glass.
3. **The Interactive Layer:** Primary buttons and active states. These sit "above" the glass, using the solid Burgundy color or vibrant Golden Yellow to draw immediate attention.

Avoid using heavy black shadows; instead, use shadows tinted slightly with the primary color to keep the interface feeling clean and integrated.

## Shapes

The design system uses an "Extra Rounded" language. Standard UI components (buttons, inputs) utilize **1rem (16px)** corner radii. Larger layout containers and glass panels use **2rem (32px)** or **3rem (48px)** to reinforce the friendly, modern macOS aesthetic. 

Search bars and status tags should use the **Pill-shaped** (fully rounded) approach. This softness offsets the formal nature of the Burgundy color palette, making the tool feel accessible despite its power.

## Components

### Buttons
- **Primary:** Solid Burgundy fill, white text, 16px border-radius.
- **Secondary:** Glass-fill (white/30%) with a 1px Burgundy outline.
- **Icon Buttons:** Circular glass containers with centered icons.

### Input Fields
Large, 56px height fields with a subtle off-white background and a 1px gray-200 border. Upon focus, the border transitions to Burgundy with a soft Golden Yellow outer glow.

### Cards & Panels
All main content resides in glass panels. Each panel must have a `backdrop-filter: blur(20px)` and a `rounded-3xl` (32px) corner radius. Use a 1px border with 10% opacity black to define edges.

### Chips & Tags
Used for AI categories or status. Small, pill-shaped elements. The "Premium" tag uses a Golden Yellow background with black text. 

### Navigation Sidebar
A translucent glass vertical bar on the left. Active items are indicated by a solid Burgundy vertical "pill" indicator and high-contrast text.