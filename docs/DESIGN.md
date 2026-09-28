---
name: Executive Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  numeric-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  numeric-metric-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 0.75rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies high-trust, authoritative financial engineering tailored for executive oversight, asset management, and administrative governance. The interface must project institutional durability, rigorous precision, and immediate clarity. 

The aesthetic is Modern Corporate with architectural restraint:
- **Surface purity**: Sterile, neutral backdrops balanced with layered white card surfaces.
- **Micro-detail fidelity**: Border lines and subtle tint variations rather than heavy fills convey state changes and hierarchy.
- **Executive scannability**: High contrast data points against muted categorical labels enable C-suite operators to parse liquidity, burn rates, and variance metrics within seconds.
- **Restrained color application**: Emerald and rose pigments are reserved strictly for directional performance (gain/loss, positive/negative delta) rather than decorative flair.

## Colors

The palette establishes an institutional financial hierarchy using precise functional assignments:

- **Primary (`#4F46E5` - Deep Indigo)**: Reserved for primary conversion points, focus rings, active navigation indicators, and key operational interactive states.
- **Secondary (`#1E293B` - Slate Navy)**: Deployed for high-emphasis typography, critical structural headers, and dark grounding elements like primary action toolbars or contextual flyouts.
- **Tertiary (`#10B981` - Emerald)**: Dedicated strictly to positive deltas, revenue inflows, completed transactional states, and affirmative financial metrics. Supported by deep shade `#059669` for text-level contrast compliance.
- **Destructive & Expenses (`#F43F5E` - Rose Coral)**: Encodes outflows, expense overheads, risk alerts, and negative variance.
- **Neutrals & Surfaces**:
  - Canvas background: `#F8FAFC` (Slate 50) provides low-glare depth.
  - Card & Container surface: `#FFFFFF` (Pure White).
  - Subtle borders: `#E2E8F0` (Slate 200) for clean cell demarcation.
  - Secondary/Tertiary text: `#64748B` (Slate 500) for metadata and labels; `#334155` (Slate 700) for standard body copy; `#0F172A` (Slate 900) for monetary amounts.

## Typography

The typographic strategy pairs **Plus Jakarta Sans** for display figures, metric readouts, and section headers with **Inter** for dense transactional tables, data forms, and functional metadata.

- **Tabular Numerics**: All numeric values in metric displays, data tables, and balance sheets must enforce tabular figures (`font-variant-numeric: tabular-nums`) to preserve column alignment and rapid vertical comparison.
- **Visual Weighting**: Financial metrics use heavy weights (`700`) paired with reduced tracking (`-0.02em`) to eliminate optical gaps between decimal places and currency glyphs.
- **Labels & Micro-headers**: Uppercase small labels (`label-sm`) require `letterSpacing: 0.04em` to retain legibility when displaying currency codes (USD, EUR) and temporal tags (YTD, MTD).

## Layout & Spacing

This design system implements a disciplined 12-column fluid grid system pinned inside a max-width container of `1600px` for high-density administrative workstations, collapsing gracefully for tablet and mobile oversight.

- **Desktop (>= 1280px)**: 12 columns, 24px (`1.5rem`) gutters, 32px (`2rem`) page margin. Side navigation is fixed at 260px; the main content region adjusts dynamically.
- **Tablet (768px - 1279px)**: 8 columns, 16px (`1rem`) gutters, 24px (`1.5rem`) outer margin. Metric cards condense into a 2x2 matrix; secondary sidebars collapse into overlay sheets.
- **Mobile (< 768px)**: 4 columns, 12px (`0.75rem`) gutters, 16px (`1rem`) margin. Data tables switch to vertical stacked card summaries; top-line KPIs scroll horizontally with edge snappings.
- **Density Standards**: Component internals utilize an 8px base rhythmic scale, stepping down to 4px (`space-xs`) strictly for badge margins, data cell vertical padding, and inline indicator iconography.

## Elevation & Depth

Visual hierarchy uses a refined hybrid of **low-contrast micro-outlines** and **diffused ambient shadows** to keep surfaces flat, crisp, and clean of visual clutter:

- **Level 0 (Base Canvas)**: Neutral surface `#F8FAFC`. Zero elevation, zero shadow.
- **Level 1 (Card & Dashboard Panels)**: Surface `#FFFFFF`, bounded by a single-pixel outline in `#E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Hovered Cards & Interactive Rows)**: Surface `#FFFFFF`, outline `#CBD5E1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Dropdowns, Popovers & Context Menus)**: Surface `#FFFFFF`, outline `#E2E8F0`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
- **Level 4 (Modals & Critical Sheets)**: Surface `#FFFFFF`, paired with backdrop blur `backdrop-filter: blur(4px)` and background scrim `rgba(15, 23, 42, 0.4)`. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The design system enforces a disciplined `Soft` geometric language (`roundedness: 1`):

- **Standard Elements (0.25rem / 4px)**: Checkboxes, table row focus states, inner badges, progress bar tracks, and segmented control segments.
- **Cards, Panels & Inputs (`rounded-lg` - 0.5rem / 8px)**: Metric overview cards, form input fields, modal containers, and standard button controls.
- **Large Overlays (`rounded-xl` - 0.75rem / 12px)**: Floating executive summary cards, command palettes, and slide-in drawer caps.
- **Status Pills (`rounded-full`)**: Solely utilized for delta badges (e.g., `+14.2%`), system uptime indicators, and user avatars to establish clear visual differentiation against rectangular transactional rows.

## Components

### Buttons
- **Primary**: Solid Deep Indigo (`#4F46E5`) fill, white text, 8px border-radius, font weight `500`. Hover: `#4338CA`. Subtle inset top highlight `inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`.
- **Secondary**: Pure White (`#FFFFFF`) surface with `#E2E8F0` border, `#1E293B` text. Hover: `#F8FAFC` surface with `#CBD5E1` border.
- **Destructive**: Rose Coral tint (`#FFF1F2`), text `#E11D48`, border `#FFE4E6`. Hover: `#FFE4E6`.

### Executive Metric Cards (KPIs)
- Pure white background, 8px radius, 1px `#E2E8F0` border.
- Internal padding: 20px (`space-lg` adjusted).
- Top row: Muted uppercase title (`label-sm`, `#64748B`) aligned with an optional contextual icon or mini sparkline.
- Center row: Prominent numeric figure (`numeric-metric`, `#0F172A`).
- Bottom row: Inline delta pill badge (`+12.4%`) with `#ECFDF5` background and `#059669` text, accompanied by comparative label "vs last month" in `#64748B`.

### Badges & Status Indicators
- **Positive / Income**: Background `#ECFDF5`, text `#047857`, 1px border `#D1FAE5`.
- **Negative / Outflow**: Background `#FFF1F2`, text `#BE123C`, 1px border `#FFE4E6`.
- **Neutral / Draft**: Background `#F1F5F9`, text `#475569`, 1px border `#E2E8F0`.
- Geometry: Fully rounded pill, horizontal padding 8px, vertical padding 2px, typography `label-sm`.

### Input Fields
- Background `#FFFFFF`, 1px border `#CBD5E1`, 8px radius.
- Height: 40px for standard operational density; typography `body-md`.
- Focus state: Border color changes to `#4F46E5` with an external box-shadow halo `0 0 0 3px rgba(79, 70, 229, 0.12)`.
- Numeric input fields right-align text and display tabular figures.

### Tables & Dense Grids
- **Header**: `#F8FAFC` background, 1px border-bottom `#E2E8F0`, typography `label-sm` in `#475569`, text uppercase with 0.04em letter-spacing. Height: 36px.
- **Rows**: Alternating hover state `#F8FAFC`, regular background `#FFFFFF`, bottom border 1px `#F1F5F9`. Height: 48px.
- **Cell Alignment**: Text data aligns left; dates and status indicators align center; financial sums align right with monospace/tabular styling.

### Selection Controls (Checkboxes & Radios)
- Checkboxes: 16x16px, 4px radius, border 1.5px `#CBD5E1`. Checked state: `#4F46E5` fill with crisp white vector checkmark.
- Radio buttons: 16x16px circle, identical state styling with a centered 6px white dot when selected.