🎨 NGPF Website Style Guide
This document outlines the comprehensive visual and interaction design system for all web components, ensuring a consistent, accessible, and user-friendly experience across all calculators, interactives, and pages on the NGPF website.

🔾 1. Brand Colors
Primary Palette
Name	Hex Code	Usage
Royal Blue	#1f3b9b	Primary buttons, links, headers
Navy Blue	#0b1541	Dark backgrounds, footers
Bright Blue	#275ce4	Interactive elements, hover states
Sky Blue	#1db8e8	Highlights, tags, tooltips
Gold	#f4ad00	Warnings, progress, CTA buttons
Orange	#f78219	Alerts, attention-grabbing elements

Light/Neutral Shades
Name	Hex Code	Usage
Soft Blue Tint	#edfaff	Backgrounds, containers, cards
Light Gray Blue	#d2d8e9	Form fields, inactive states, borders
Ice Blue	#d2eff9	Tooltips, backgrounds, accent fills

🧭 2. Header and Logo
Logo Placement
A logo placeholder must appear in the top-left corner of the website header.

The logo’s vertical height should align visually with the H1 header (recommended: 48pt or 48px).

Maintain horizontal padding of 16–24px from the left edge.

Ensure sufficient spacing between the logo and adjacent navigation elements.

Header Layout
Layout: Logo left, navigation right

Background color: white or #edfaff

Consistent spacing and vertical alignment across pages

Sticky header optional, but recommended for improved navigation on long pages

🔠 3. Typography
Font Families
Headers (H1 only): PT Sans Bold

Body & UI Text: Montserrat (Regular, Medium, Bold)

Fallback: sans-serif

Headings
Header	Font	Weight	Case	Size
H1	PT Sans	Bold	Mixed Case	48pt
H2	Montserrat	Bold	Mixed Case	36pt
H3	Montserrat	Bold	Mixed Case	24pt
H4	Montserrat	Bold	ALL CAPS	20pt
H5	Montserrat	Bold	ALL CAPS	18pt
H6	Montserrat	Bold	ALL CAPS	16pt

Paragraphs
Style	Size	Weight	Line Height	Notes
Large Paragraph	20px	Regular	140%	For intros and emphasis
Regular Paragraph	18px	Regular	140%	Default body text
Bold Paragraph	20px	Bold	140%	Use sparingly
Link Text	20px	Regular	140%	Color: #1f3b9b

🔘 4. Buttons
General Guidelines
Font: Montserrat Bold

Case: Title Case, with exceptions for short CTAs (e.g. REGISTER)

Border Radius: ~6px

Horizontal Padding: ~16px

Button Variants
Type	Background	Border	Text Color	Notes
Standard	Bright Blue	None	White	Primary CTA
Outline	Transparent	Bright Blue	Bright Blue	Secondary interaction
Small	As above	As above	As above	Compact UI environments
With Icon	Matches above	Icon + label	As above	Left-aligned icon support
Anchor Link	#edfaff	None	#1f3b9b	For internal nav actions

🏷️ 5. Labels
Type	Background	Text Color	Sizes
Default	Gray outline	Gray	Small / Large
Filled	Brand Colors	White or Dark	Small / Default / Large
Status	Green / Yellow / Red	White or Dark	Used in bill tracking or notifications

All label text is Montserrat Bold, ALL CAPS, ~14–16px font size.

🔘 6. Radio Buttons
States Supported
Unchecked

Hover

Focused

Selected

Disabled

With Help Text

With Validation Message

Validation messages appear below, with a red icon and red text (#D32F2F). All elements are keyboard accessible and follow proper aria-* conventions.

☑️ 7. Checkboxes
Same state support and styling structure as radio buttons. Includes visual distinction for:

Checked (blue background with white check)

Hover (blue outline)

Disabled (gray tone)

Help text and validation message

📝 8. Select Fields (Dropdowns)
States
Default / Hover / Focused / Disabled / Required / Error

Label may include (required) inline

Validation icon: Red circle with !, message text in red (#D32F2F), positioned below help text if both are shown.

Accessibility: Use aria-required, aria-describedby, and keyboard-friendly markup.

🔔 9. Notification Banners
Type	Border Color	Icon	Label Color	Role Attribute
Positive	Bright Blue	✔️	Blue	status
Warning	Orange	⚠️	Orange	alert

Each includes a bold title, message body, and dismiss (×) icon. Background: white. Left border and icon color match the alert type.

🪟 10. Modals
Components
Title (bold, top-left)

Body copy (regular)

Close icon (top-right)

Action buttons (Primary + Secondary)

Sizes: Small (~320px), Medium (~480px), Large (~700px)

Accessibility: aria-modal="true", keyboard focus trap, role="dialog" or role="alertdialog"

📂 11. Accordion
Click toggles panel open/closed

Chevron icon rotates to indicate state

Each accordion section includes a title (Bold Blue, ~16–18px) and optional content

Divider line separates each section. Use aria-expanded, aria-controls, and aria-labelledby for screen readers.

🧷 12. Tabs
Visual States
State	Style
Default	Light background, blue text
Active	Bright Blue background, white text
Underline	Blue underline for active tab
Error	Red dot or icon beside label

Each tab uses role="tab" and is inside a role="tablist" container.

🎠 13. Carousel Cards
Includes: Image, Date, Title (Bold), Body Text, Navigation Icons

1–3 cards per row depending on viewport

Card Background: White

Rounded corners (~12px), shadow elevation

Navigation: Left/right arrows (aria-label="Scroll left/right")

Accessible for keyboard, screen readers, and mobile responsiveness.

♿ 14. Accessibility Best Practices
Semantic HTML for all elements

aria-* roles used appropriately

Minimum 4.5:1 contrast ratio

Clearly visible focus states

Descriptive alt text for all images

Logical tab order

📱 15. Responsive Layout
Mobile-first design

Key breakpoints:

≤ 480px: Single column

481–768px: Compact grid/flex

≥ 769px: Full grid layout

Avoid horizontal scrolling at 320px width. Use fluid widths and scalable text.

🧩 16. Component Development Practices
Components should be modular and reusable

Follow BEM or token naming conventions

Example Tokens:

--color-primary

--font-heading

--spacing-md

All component behavior should reflect styles in this guide

