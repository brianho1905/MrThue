# Design System Specification

## 1. Overview & Creative North Star: "The Informed Curator"
Tax consultancy for household businesses is often marred by visual clutter and bureaucratic coldness. This design system rejects the "tax form" aesthetic in favor of **The Informed Curator**. 

The goal is to provide a high-end, editorial experience that feels like a premium concierge service rather than a government portal. We achieve this through "Architectural Breathing Room"—using expansive whitespace (Space 16 and 24) and intentional asymmetry. By overlapping high-contrast typography and utilizing a sophisticated layering of monochromatic surfaces, we establish an environment of absolute competence and modern transparency.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Trustworthy Blue" core, supported by a sophisticated range of neutral tints to define hierarchy without the need for structural lines.

### The "No-Line" Rule
Standard UI relies on 1px borders to separate content. **In this design system, 1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background shifts. For instance, a `surface-container-low` section should sit directly on a `surface` background to create a clean, modern break.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of premium materials. 
*   **Base Layer:** `surface` (#f8f9fa) or `background` (#f8f9fa).
*   **Sectioning:** Use `surface-container-low` (#f1f4f6) for large content blocks.
*   **Actionable Elements:** Place `surface-container-lowest` (#ffffff) cards atop low-tier containers to create a "lifted" effect.
*   **Information Density:** Use `surface-container-high` (#e2e9ec) for utility bars or sidebars to imply grounded stability.

### The "Glass & Gradient" Rule
To avoid a flat, "template" look:
*   **Glassmorphism:** For floating navigation or modal overlays, use `surface-container-lowest` with 80% opacity and a `20px` backdrop-blur.
*   **Signature Textures:** For primary CTAs and Hero backgrounds, apply a subtle linear gradient from `primary` (#0056d2) to `primary-dim` (#004bb9) at a 135-degree angle. This adds "soul" and depth that flat hex codes cannot achieve.

---

## 3. Typography
We use a high-contrast typographic scale to create an editorial rhythm.

*   **Display & Headlines (Manrope):** This is our "Consultant" voice—authoritative, geometric, and modern. Use `display-lg` (3.5rem) for hero statements with tight letter-spacing (-0.02em).
*   **Body & Titles (Inter):** This is our "Clarity" voice. Inter provides maximum legibility for complex financial data.
*   **Hierarchy as Identity:** Use `label-md` (#586064) in all-caps with 0.05em tracking for category headers to provide a sophisticated, metadata-rich feel.

---

## 4. Elevation & Depth
Depth in this system is a result of **Tonal Layering**, not heavy shadows.

*   **The Layering Principle:** Softness is key. A `surface-container-lowest` card sitting on a `surface-container-low` background provides enough contrast to be "felt" by the user without being "seen" as a hard edge.
*   **Ambient Shadows:** If a floating element requires a shadow, it must be ultra-diffused. Use the `on-surface` color (#2b3437) at 4% opacity with a `32px` blur and `8px` Y-offset.
*   **The "Ghost Border" Fallback:** If accessibility requires a container definition, use a "Ghost Border": the `outline-variant` (#abb3b7) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons: The Signature Interaction
*   **Primary:** A gradient from `primary` to `primary-dim`. Use `rounded-md` (0.375rem) for a professional edge.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Text-only using `primary` color, but with a `surface-container-lowest` ghost-state on hover.

### Forms & Inputs
*   **Input Fields:** Use `surface-container-highest` as the fill. Do not use an outline; use a 2px bottom-stroke of `outline` (#737c7f) that transforms into `primary` (#0056d2) on focus. 
*   **Labels:** Use `label-md` floating above the field to maintain a "clean desk" aesthetic.

### Data Tables & Lists
*   **The "No-Divider" Rule:** Forbid the use of horizontal rules (`<hr>`). Separate table rows using alternating fills of `surface` and `surface-container-low`, or simply use vertical whitespace (Space 4/1rem) to let the data breathe.
*   **Contextual Chips:** Use `secondary-container` (#d6e3fb) with `on-secondary-container` (#465365) text for tax status or category tags.

### Specialized Component: The "Insight Card"
A large-format card using `surface-container-lowest`. It should feature a `display-sm` headline and use `primary-container` for a small, integrated "Action Chip" in the top right corner. This is for high-level tax summaries.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. For example, a hero headline might be offset to the left while the supporting body text is tucked 2 columns to the right.
*   **Do** use `primary-fixed-dim` (#c6d3ff) for background highlights behind icons to create a soft, glowing "halo" effect.
*   **Do** lean into `surface-bright` for transition areas to keep the user feeling "organized" and "optimistic."

### Don't
*   **Don't** use pure black (#000000). Always use `on-surface` (#2b3437) for text to maintain a high-end, ink-on-paper feel.
*   **Don't** use standard 1px borders to separate "About Us," "Services," or "Contact" sections. Use color blocking with `surface-container` tiers.
*   **Don't** crowd the data. If a table feels tight, increase the padding to `spacing-6` (1.5rem) or `spacing-8` (2rem). In this system, space equals luxury.