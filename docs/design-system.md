# Hopping Deals — "Moon Market" design system

One dark night-sky look for the whole product (shopper site, business portal,
admin), taken from the home hero: deep violet-indigo night, moon gold, Hopping
red, and colorful coupon tickets. Deals are the loud element; everything else
stays calm. The moon photo belongs to the home hero only; every other page has
its own scene artwork.

## Tokens (`src/app/globals.css`, `tailwind.config.ts`)

| Token | Value | Use |
|---|---|---|
| `background` | `hsl(233 58% 11%)` night | page background (with faint star field) |
| `card` | `hsl(232 50% 18%)` | panels, cards (clearly lighter than the page) |
| `popover` | `hsl(232 50% 20%)` | menus, dialogs |
| `secondary` / `muted` | `hsl(232 46% 23%)` | inputs, quiet fills, skeletons |
| `accent` | `hsl(232 46% 25%)` | hover / selected surface |
| `border` | `hsl(231 40% 30%)` | all borders (visible on purpose) |
| `primary` | `#EF2B3A` hop red | main action per screen, brand marks |
| `gold` | `#F7C948` moon gold | focus ring, active nav, selected state, highlights |
| `foreground` | `#F1F3FF` | text |
| `muted-foreground` | `hsl(228 40% 77%)` | secondary text |
| `success` / `warning` / `destructive` / `info` | mint / amber / red / sky | status only, always with a label |

Type: **Unbounded** (`font-display`, applied to every `h1`/`h2`) for page and
section titles and big numbers; **Outfit** for everything else.

## Deal tickets

`public/PromotionCard` is the signature element:

- `hd-ticket-frame` > `hd-ticket-card`: punched notches at the tear line
  (`--tear`, default = bottom of a 4:3 image).
- `hd-ticket-stub`: the lower half wears the **category's ticket color**, the
  same light/dark pairs as the hero tickets (`getTicketColors(slug)` in
  `lib/deal.ts`; set `--t-light` / `--t-dark` on the frame).
- `hd-ticket-label`: hero-style category label on the artwork.
- `hd-ticket-tear` (+ `hd-ticket-tear--light` on colored stubs): dashed perforation.

## Scene artwork (`components/art/Scene.tsx`)

Original SVG night scenes, one per page, tinted with `accent`:

| Scene | Used on |
|---|---|
| `street` | category pages (tinted with the category color) |
| `directory` | business directory |
| `observatory` | about |
| `ideas` | blog |
| `gallery` | photo gallery |
| `lighthouse` | terms |
| `phone` | install app |
| `bags` | shopper login / register |
| `orbit` | password reset, shopper profile |
| `storefront` | business login, business dashboard, business profile, public business page, home CTA, business sidebar card |
| `launch` | business landing page (`/business/visitor`), business register |
| `tower` | admin login, admin overview, admin sidebar card |
| `lost` | 404, error page |
| `celebrate` | payment and subscription success |

- `<Scene name accent compact align />` draws the art; `compact` trims empty
  sky for short banners and cards.
- `<SceneBackdrop name fade />` places a scene behind content (parent needs
  `relative isolate overflow-hidden`); `fade` darkens toward the text side.
- `public/PageHero` takes `scene` (and optional `accent`) for public pages.
- `shared/AuthShell` takes `aside.scene` for sign-in screens.

## Other building blocks (CSS classes)

| Class | What it is |
|---|---|
| `hd-panel` | standard raised surface (gradient card, border, soft shadow) |
| `hd-panel-interactive` | add to a clickable panel for the gold hover edge |
| `hd-glass` | blurred night bar for sticky headers |
| `hd-icon-tile` | gold icon square for stat cards and feature rows |
| `hd-empty` | empty state: say what's missing and offer the next action |
| `hd-sparkle` | the four-point star from the hero, used as a section bullet |

## Components

- `ui/button` variants: `default` (red), `hero` (red gradient, one per screen),
  `outline`, `ghost`, `secondary`, `glass` (on artwork), `accent` (gold),
  `tab` (selected filter tab), `link` (gold).
- `ui/badge` variants: `default`, `secondary`, `outline`, `gold`, `success`,
  `warning`, `destructive`, `info`.
- `layouts/BusinessLayout`, `layouts/AdminLayout` — sidebar shells; nav items use
  `layouts/navStyles.sidebarItemClass`.

## Rules of thumb

- One red (`hero`/`default`) button per screen; use `outline` or `glass` for the rest.
- Selected / active states are gold, not red.
- Sentence case for titles, labels and buttons. No all-caps labels.
- Status colors never stand alone: pair them with text (and an icon in charts).
- No entrance animations on sections. Motion only answers a person's action.
- Never use `bg-white`, `text-gray-*` or `bg-*-50` tints; use the tokens above.
- Don't reuse the home hero photo elsewhere; pick or draw a scene instead.
