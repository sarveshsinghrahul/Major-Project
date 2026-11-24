---
name: LearnPath
description: A DSA study plan set as a split-flap departures board in a brushed-steel frame.
colors:
  canvas: "#2a2d31"
  surface: "#0b0b0d"
  hairline: "#44474d"
  bezel: "#5b5e63"
  ink: "#f2f2f2"
  ink-2: "#d3d5d8"
  muted: "#a7aaaf"
  faint: "#80848b"
  primary: "#ffb000"
  primary-active: "#e69e00"
  primary-soft: "#2a1f05"
  success: "#3fcf74"
  danger: "#ff6166"
  danger-soft: "#2b0f11"
  line-sky: "#5fb0ff"
  line-violet: "#b99cff"
  line-pink: "#ff7ac6"
  line-orange: "#ff8a3d"
  line-teal: "#3ccfc3"
  line-green: "#7bd66b"
  line-brown: "#c9a27a"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(30px, 5.2vw, 66px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 62"
  board-data:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
    fontFeature: "'tnum', 'lnum'"
    fontVariation: "'wdth' 62"
  question:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum', 'lnum'"
  body-small:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 62"
rounded:
  cell: "2px"
  sm: "3px"
  md: "4px"
  lg: "6px"
spacing:
  hair: "3px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.board-data}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.board-data}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-utility:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  board:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  board-row-ready:
    backgroundColor: "{colors.primary-soft}"
  board-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  flap-cell:
    textColor: "{colors.ink}"
    rounded: "{rounded.cell}"
    padding: "0.08em 0.06em"
  status-ready:
    textColor: "{colors.primary}"
    typography: "{typography.board-data}"
  status-mastered:
    textColor: "{colors.success}"
    typography: "{typography.board-data}"
  status-in-progress:
    textColor: "{colors.line-orange}"
    typography: "{typography.board-data}"
  status-locked:
    textColor: "{colors.muted}"
    typography: "{typography.board-data}"
  nav-rail-item:
    textColor: "{colors.muted}"
    typography: "{typography.board-data}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  nav-rail-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
  error-notice:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: LearnPath

## Overview

**Creative North Star: "The Departures Board"**

LearnPath is a station concourse at night. Matte flap-black boards sit in a brushed-steel frame, and the student reads their study plan the way a traveller reads departures: sixteen topic rows in prerequisite order that never move, where only the status and mastery cells change. Board data is set in condensed Archivo capitals inside fixed flap cells; the reasons beneath each row stay in normal-width sentence case, because a reason is a sentence to be read, not a destination to be scanned.

Colour behaves like lamps on a board. Everything rests in black, steel and letter-white; a single amber lamp marks the one thing to act on (the Ready row, the primary button, the active nav item), signal green means mastered and nothing else, and red appears only for errors and wrong answers. Each topic also carries one permanent rail-line colour, a thin stripe under its number, the way a line keeps its colour on every sign in a network.

Motion is the board's one indulgence and it is earned: a cell cascades through characters, left to right, only when its value differs from the one it last showed. A board that has not changed is still. Under reduced motion every cell renders settled. The system refuses the category default of a white dashboard of cards and progress bars.

**Key Characteristics:**
- Dark, matte, high-contrast: flap-black boards on a steel ground with a fine vertical grain.
- Condensed capitals in fixed cells for board data and labels; normal-width sentence case for prose and reasons.
- One amber lamp per screen for the action; green only for mastered; red only for errors.
- Fixed rows, changing cells: topic order and numbering never move.
- Tabular, lining figures everywhere, so numbers align in columns.
- Semantic tables under the board look; the flaps are decoration, the text is real.

## Colors

A steel-and-black ground lit by lamps: amber to act, green for mastered, red for errors, and seven rail-line colours that only identify topics.

### Primary
- **Amber Lamp** (`primary`): the one thing to act on. Primary button fill, the active rail item's text, the Ready status word, the Ready-now fact, text selection, focus outlines and the input caret.
- **Pressed Amber** (`primary-active`): hover and pressed fill of the primary button; text on amber-glow chips and stepper markers.
- **Amber Glow** (`primary-soft`): the lit background of the Ready row on a board, selected quiz options, and selected day chips.

### Secondary
- **Signal Green** (`success`): mastered status, mastery segments at 80% and above, the Mastered count, correct answers, the advanced level.

### Tertiary
- **Cancel Red** (`danger`) on **Red Glow** (`danger-soft`): error notices, failed loads and wrong answers in the answer review. Never decorative.

### Neutral
- **Steel Frame** (`canvas`): the page ground, under a repeating 1px vertical grain at 1.8% white. Also the hover fill of options on a board.
- **Flap Black** (`surface`): every board, panel, input, secondary button and the phone bottom bar.
- **Inner Rule** (`hairline`): rules between board rows, under board heads, between rail sections, and the resting border of inputs and secondary buttons.
- **Bezel Steel** (`bezel`): the outer edge of every board and panel, one step lighter than the inner rules.
- **Letter White** (`ink`): primary text and board data.
- **Dim Letter** (`ink-2`): secondary prose, locked topic names, mastery percentages, minutes.
- **Steel Light** (`muted`): column heads, notes, reasons under topics, the Locked status, inactive nav.
- **Steel Faint** (`faint`): input placeholders only.

### Rail Lines
- **Sky, Violet, Pink, Orange, Teal, Green, Brown** (`line-*`): one per topic, assigned by its permanent position (index modulo 7), drawn as a 3px stripe under the topic number. Orange doubles as the In-progress status word.

### Named Rules
**The One Lamp Rule.** Amber marks the action. If a screen has amber on two unrelated things, one of them is wrong.

**The Green Means Mastered Rule.** Signal green appears only for mastery at or above 80%, the mastered count, the advanced level and correct answers. It is never a generic "success" or decoration.

**The Line Colour Is Identity Rule.** A rail-line colour belongs to its topic forever and only identifies it. Never use line colours for buttons, backgrounds or emphasis.

## Typography

**Display Font:** Archivo, condensed (`font-stretch: 62%`), self-hosted variable woff2 with weight 100-900 and width 62-125%, falling back to system-ui
**Body Font:** Archivo at normal width (100%)
**Label/Mono Font:** none; tabular figures (`tnum`, `lnum`) are on globally instead of a mono face

**Character:** One family on two widths. Condensed uppercase with 0.08em tracking is the paint on a flap; normal-width sentence case is the voice that explains it.

### Hierarchy
- **Display** (700, clamp(30px, 5.2vw, 66px), 1.02, condensed caps in flap cells): landing-page hero and closing headline only.
- **Headline** (700, 40px desktop / 34px phone, 1.05, condensed caps): one page title per app screen.
- **Title** (700, 24px, 1.15, condensed caps): board heads and panel headings.
- **Board Data** (700, 15px, condensed caps, 0.08em, tabular): status words, button labels, nav items, topic names (17px), facts (22px), mastery percentages (600).
- **Question** (600, 19px, 1.3, sentence case, normal width): quiz question text, the one place a heading is a sentence.
- **Body** (400, 16px, 1.5): prose, list items, level reasons, capped at 60-70ch. The landing page sets body at 17px/1.55.
- **Body Small** (400, 14px): reasons under topics (60ch), board notes, helper text.
- **Label** (600, 12px, condensed caps, 0.08em, muted): table column heads and fact labels over data.

### Named Rules
**The Two Widths Rule.** Data and labels are condensed capitals; reasons and prose are normal-width sentence case. Never set a reason in board type, never set a status word in sentence case.

**The Tabular Rule.** Figures are tabular and lining everywhere, so percentages, counts and minutes align in their columns.

## Layout

App screens sit in a centred column of 1024px max (`max-w-5xl`) with 16px gutters on phones and 40px from 768px up. From 768px a 240px steel rail sticks to the left, full height, holding the brand plate, nav and the signed-in block at its foot; below 768px it becomes a 56px top strip with the brand and Log out, plus a fixed bottom bar of nav items (56px tall, safe-area padded) on flap black. Signed-out screens get a 64px name-plate header and a centred column; auth panels cap at 400px.

The departures board runs full width of the column. Columns are NO, TOPIC, STATUS, MIN (from 640px) and MASTERY (from 768px); below 768px the mastery bar moves under the topic reason. Rows pad 14px vertically and 20px at the board's edges. The landing page uses a 1180px wrap with 20px gutters and generous 88-96px section bands separated by inner rules.

Spacing follows Tailwind's 4px grid: 3px between mastery segments and flap gaps, 8-12px inside controls, 16-24px between blocks, 24-32px panel padding, 32-40px between page sections.

## Elevation & Depth

Depth is physical and mostly tonal: steel frame behind, black board in front, edged by a lighter bezel. Boards that are the subject of a screen (the departures board, auth panels) lift off the frame with one heavy ambient shadow and a 1px top highlight, like a backlit sign in its housing; other panels stay flat. Flap cells carry their own inset highlight and a dark hinge line through the middle.

### Shadow Vocabulary
- **Board lift** (`box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 32px rgba(0,0,0,0.55)`): departures boards and auth panels. The landing page uses a deeper `0 18px 40px rgba(0,0,0,.5)` for its hero board.
- **Flap highlight** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.05)`): every flap cell.
- **Selected option ring** (`box-shadow: inset 0 0 0 1px #ffb000`): a selected quiz option, doubling its amber border.

### Named Rules
**The Lit Board Rule.** Only the board a screen is about gets the lift shadow. Supporting panels are flat flap black with a bezel edge.

## Shapes

Corners are small and mechanical: 2px on a flap cell, 3px on option letters and the landing page's cells, 4px on buttons, inputs, chips and notices, 6px on boards and panels. Nothing larger. Borders are 1px: bezel steel on the outside of a board, inner rules inside it. Fully round shapes are reserved for the thin line stripe under topic numbers, the quiz progress track and the onboarding stepper markers. A flap cell is a dark rectangle split by a hinge: a gradient of #1b1c20 above, a 2% band of #050506 at the middle, #141518 below.

## Components

### Buttons
Board-type labels, quick and mechanical.
- **Shape:** 4px corners.
- **Primary:** amber fill, flap-black label, condensed caps 15px bold, 10px by 20px. One per screen.
- **Hover / Focus:** hover darkens to pressed amber; press scales to 0.98; transitions 150ms on `cubic-bezier(0.23, 1, 0.32, 1)`; focus is the global 2px amber outline at 2px offset. Disabled drops to 40% opacity.
- **Secondary:** flap black with an inner-rule border and letter-white label; hover lightens the border to steel light.
- **Utility:** the secondary look at 14px, 6px by 14px; used for Back and Log out. Hidden (not dimmed) when disabled.
- **Ghost:** no border, normal-width 15px dim-letter text, 6% white wash on hover.

### Chips
- **Style:** day toggles on the onboarding form: 4px corners, inner-rule border, dim-letter text.
- **State:** pressed shows an amber border on amber glow with pressed-amber text; hover fills with steel frame.

### Cards / Containers (boards and panels)
- **Corner Style:** 6px.
- **Background:** flap black.
- **Shadow Strategy:** board lift only for the screen's main board (see Elevation).
- **Border:** 1px bezel steel outside, inner rules between rows and under the head.
- **Internal Padding:** 24px phone, 32px desktop for panels; boards pad rows 20px horizontally with a 16px head strip.

### Inputs / Fields
- **Style:** flap black, inner-rule border, 4px corners, 10px by 12px, 16px body text so phones never zoom; steel-faint placeholder; amber caret.
- **Focus:** the border turns amber; the default outline is suppressed in favour of it.
- **Error:** a notice below the fields in red on red glow, 4px corners, `role="alert"`.
- **Labels:** form section labels are 15px condensed caps; auth field labels are 14px normal-width dim letter.

### Navigation
- **Rail (768px and up):** items are condensed caps 15px semibold with an 18px 1.5-stroke line icon, steel light at rest, letter white on a 5% wash on hover; the active item sits on flap black with amber text. Brand plate: the ring mark in amber and LEARNPATH at 22px with 0.14em tracking.
- **Phone:** a fixed flap-black bottom bar of equal items, icon over 12px caps label, amber when active; a 56px top strip carries the brand and a ghost Log out.
- **Skip link:** amber on focus, top left.

### Departures Board (signature)
A semantic `<table>` inside a board. Each row: the topic's permanent two-digit number in flap cells with its line stripe beneath; the topic name in 17px board type with its reason in 14px sentence case below; the status word in flap cells, lit in its lamp colour; minutes right-aligned; the mastery bar. The Ready row is lit with amber glow. Rows never reorder.

### Flap Text
Text drawn as one cell per character, words separated by a 0.4em gap. With a memory key it cascades left to right (a 38ms tick, each cell settling 5 ticks after its left neighbour) only when the value differs from the last one stored for that cell; otherwise, and always under reduced motion, it renders settled. The plain text is in a screen-reader span; the cells are `aria-hidden`.

### Status Words and Mastery Bar
- **Status:** the word itself, never a pill: READY in amber, MASTERED in green, IN PROGRESS in line orange, LOCKED in steel light.
- **Mastery:** ten 5px by 10px lamp segments with 3px gaps and 1px corners, lit amber below 80% and green from 80%, unlit at 9% white, followed by the percentage in 15px board type. The same ramp everywhere.

## Do's and Don'ts

### Do:
- **Do** keep topic rows in prerequisite order with their permanent two-digit numbers; change only status and mastery cells.
- **Do** put amber (#ffb000) on exactly one action per screen, with flap-black (#0b0b0d) text on it.
- **Do** set board data, labels and buttons in condensed Archivo caps (62% width, 0.08em tracking) and every reason in normal-width sentence case.
- **Do** edge boards in bezel steel (#5b5e63) and rule their rows in the darker inner rule (#44474d).
- **Do** cascade a flap cell only when its value changed, and render it settled under reduced motion.
- **Do** keep the table semantic and give every flap group a screen-reader text twin.

### Don't:
- **Don't** build a white dashboard of cards and progress bars; this world is a dark board of fixed rows.
- **Don't** use signal green for anything but mastery, the mastered count, the advanced level and correct answers.
- **Don't** use rail-line colours outside topic identity (the In-progress status word is the one exception in the build).
- **Don't** render status as pills or badges; status is a lit word in a column.
- **Don't** round corners past 6px or add shadows to supporting panels.
- **Don't** animate a board that has not changed.
