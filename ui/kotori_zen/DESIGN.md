# Design System Specification: Zen Editorial

## 1. Overview & Creative North Star: "The Living Parchment"
This design system moves away from the rigid, clinical nature of traditional language apps. Our Creative North Star is **The Living Parchment**. We treat the digital interface as a sophisticated, layered workspace that balances the organic warmth of Sage Green with a high-end editorial layout.

To break the "template" look, we utilize **intentional asymmetry**. For example, document headers should be offset to the left while metadata sits in a floating glass container on the right. We prioritize "breathable" layouts where the negative space is as functional as the text itself, ensuring the learner feels calm, focused, and immersed in the Japanese language.

## 2. Colors & Surface Philosophy
The palette is rooted in deep, earthy charcoal and soft, botanical greens. It is designed to reduce eye strain during long reading sessions.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Conventional borders create visual noise that distracts from the character strokes of Kanji. Instead:
- Define boundaries through **Background Color Shifts**. Use `surface-container-low` for the main canvas and `surface-container` for the editor sidebar.
- Use **Vertical White Space** (using the Spacing Scale `8` or `10`) to separate content blocks.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine paper.
*   **Base Layer:** `surface` (#121410) - The deep "desk" surface.
*   **Mid Layer:** `surface-container-low` (#1a1c18) - The primary document background.
*   **Top Layer:** `surface-container-high` (#292b26) - Modals, tooltips, and word-lookup popovers.

### The "Glass & Gradient" Rule
To add "soul," use **Glassmorphism** for floating word-lookup cards. 
- **Style:** `surface-container-highest` at 70% opacity with a `backdrop-blur` of 12px.
- **CTAs:** Use a subtle linear gradient for primary buttons, transitioning from `primary` (#aed18f) to `primary-container` (#87a96b) at a 135-degree angle. This prevents the "flat" look of standard Material UI.

## 3. Typography: The Bilingual Rhythm
We pair the geometric softness of **Quicksand** with the clarity of **Noto Sans JP** to create a modern, approachable editorial feel.

*   **Display (PlusJakartaSans):** Use `display-lg` for chapter titles or large Kanji focus. The wide apertures of Plus Jakarta Sans complement the Sage Green accents.
*   **Headline & Title (PlusJakartaSans):** Use `headline-sm` for document headers. These should be set with a slightly tighter letter-spacing (-0.02em) for an authoritative, premium feel.
*   **Body (Inter):** While the user requested Quicksand for Latin, we utilize **Inter** for the core UI body text (labels, descriptions) to ensure maximum legibility at small scales. **Quicksand** is reserved for student-generated content and "warm" instructional notes.
*   **Japanese (Noto Sans JP):** Character tracking for Japanese text should be set to `0` for readability, with a line height of `1.8` to give complex Kanji room to breathe.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural "recessed" effect for input fields.
*   **Ambient Shadows:** If a floating element (like a dictionary lookup) requires a shadow, use a 32px blur with 6% opacity, tinted with the `on-surface` color. **Never use pure black shadows.**
*   **The "Ghost Border" Fallback:** For accessibility in form fields, use a "Ghost Border": the `outline-variant` token at **15% opacity**. It provides a hint of structure without breaking the minimal aesthetic.

## 5. Components

### The Document Editor (The Canvas)
- **Canvas:** `surface-container-low` (#1a1c18).
- **Margins:** Use Spacing Scale `12` (4rem) for lateral margins to mimic a physical book.
- **Text Selection:** Highlight color should be `primary-fixed-dim` at 30% opacity, ensuring the Kanji remains visible underneath.

### Buttons (The Interaction)
- **Primary:** Gradient from `primary` to `primary-container`. `rounded-md` (0.75rem). No border.
- **Secondary:** Transparent background with a `primary` Ghost Border (20% opacity). Text color is `primary`.
- **Tertiary/Ghost:** `on-surface-variant` text. High-contrast only on hover.

### Word-Lookup Popovers (The Insight)
- **Background:** Glassmorphic `surface-container-highest` (70% alpha + blur).
- **Corner Radius:** `rounded-lg` (1rem).
- **Content:** Pair `title-md` for the Kanji with `body-sm` for the English definition.

### Checkboxes & Inputs
- **Inputs:** `surface-container-lowest` background. Forgo the bottom-line; use a subtle background shift on focus to `surface-bright`.
- **Checkboxes:** When checked, use a `primary` fill. When unchecked, use an `outline-variant` Ghost Border.

### Cards & Lists
- **Rule:** **No Divider Lines.** 
- Separate list items (like vocabulary lists) using a background toggle between `surface-container` and `surface-container-low`, or simply use Spacing Scale `4` (1.4rem) between items.

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical layouts for headers to create a premium, custom feel.
- **Do** use the Spacing Scale religiously to maintain "rhythmic" white space.
- **Do** allow Kanji characters to be significantly larger than their Latin translations to emphasize the learning focus.

### Don't
- **Don't** use 1px solid borders (even `#333`). They look "cheap" and interrupt the flow of the Japanese script.
- **Don't** use standard "Drop Shadows." Use tonal shifts first, and ambient blurs only if absolutely necessary.
- **Don't** clutter the reading mode. Hide all UI elements except the text and a subtle "Back" button when the user is in "Flow State" reading.