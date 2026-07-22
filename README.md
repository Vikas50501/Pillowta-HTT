# Pilllowta — Shopify OS 2.0 Theme

Rebuild of the kyliecosmetics.com storefront as a fully customizable Online Store 2.0
theme. This README covers what to set up before launch, how the font system works,
the section-to-source mapping, and the gaps/judgment calls made along the way.

## 1. Before you launch — required setup

### Navigation menus (Shopify Admin → Content → Menus)
Create these two menus exactly as named, since `sections/header.liquid` and
`sections/footer.liquid` reference them by handle:

- **`main-menu`** — 4 top-level items, each with 2 levels of sub-links (used to build
  the desktop mega-menu columns and the mobile accordion):
  - **Cosmetics** → New, Best Sellers, Lips, Face, Eyes & Brows, Featured
  - **Fragrance** → the 3 Cosmic fragrances, Hair & Body Mists, Bundles & Gift Sets
  - **Skin** → New, Lips, Face, Best Sellers, Bundles & Sets
  - **discover** → About Us, Kylie's Looks, Shade finder quiz, Gift Guide, Gift Cards
  - The real site also shows a mobile-only 5th item ("rewards") — that's handled by
    `header` section settings, not the menu itself.
- **`footer`** — one flat list: Contact Us, FAQ, Shipping, Order Tracking, Gift Card
  Balance, plus a "Legal" item with children (Privacy Policy, Terms, Accessibility,
  Cookie Settings, Cookie Policy).

### App/account setup
- **Reviews (Bazaarvoice)** — the source site uses Bazaarvoice, not Yotpo/Loox. Set
  **Theme Settings → Reviews → Bazaarvoice client name** or `snippets/reviews.liquid`
  shows a setup notice instead of the widget.
- **Loyalty (Yotpo)** — the rewards page (`templates/page.rewards.json`) is built
  natively (no Yotpo dependency) using the real tier/points data recovered from the
  source. If you already run Yotpo Loyalty, you can swap in their embed instead.
- **Firework** (`sections/fireworks.liquid`) and **Foursixty**
  (`sections/foursixty.liquid`) both lazy-load their own `<script>` on scroll — no
  setup needed beyond entering your channel/feed IDs in each section's settings.
- **Contact form spam protection** — the source uses a Google reCAPTCHA checkbox.
  Shopify's native contact form has built-in spam filtering with no setup; add a
  reCAPTCHA app if you need the same explicit checkbox UI.
- **Engraving fee** — `sections/main-product.liquid`'s `engraving_fee_variant`
  setting expects a real product/variant representing the engraving line-item fee
  (source used a separate "Engraving Fee" SKU at $10, not a metafield or discount).

### Metafield definitions (optional, for scaling Product Template B)
`templates/product.cosmic.json`'s ingredient tiles, marketing tiles, and "cosmic
universe" carousel are built as **section blocks** (fully editable in the Theme
Editor, satisfying the brief's editability requirement) rather than metafields.
This works well if you duplicate `product.cosmic.json` per unique fragrance SKU
(Shopify supports unlimited alternate templates — Admin → Products → [product] →
Theme template). If instead you want many fragrance products to share ONE template
with per-product content, define these metafields and wire them into the
corresponding sections (each section would need a small edit to loop over the
metafield first, falling back to its blocks when empty):

| Metafield | Namespace.key | Type |
|---|---|---|
| Ingredient tiles | `custom.ingredient_tiles` | List of metaobjects (fields: `group_label`, `image`, `name`) |
| Marketing tiles | `custom.marketing_tiles` | List of metaobjects (fields: `width`, `image`, `title`, `text`) |
| Cosmic universe cards | `custom.cosmic_universe` | List of metaobjects (fields: `product`, `image`, `fragrance_family`, `about_the_scent`, `key_notes`) |

## 2. The 3-font system

Theme Settings → Typography has 4 roles (Heading / Body / Accent / Condensed), each
with a **source** toggle:

- **Brand** (default) — uses the real bundled fonts already in `assets/`:
  `UniversLTStd-Bold` (heading), `Tt-Chocolate` (body, 400/600 + italics),
  `script412displayregular` (accent). `UniversLTCondensed` has no real font file
  anywhere in the source (only referenced once by a 3rd-party Klaviyo popup) — it
  falls back to a Shopify library font by default; upload the real file to
  `assets/` and add its `@font-face` in `layout/theme.liquid` if you have it.
- **Shopify library** — unlocks a `font_picker` so you can pick any font from
  Shopify's built-in library instead, per role.

Changing a role cascades site-wide via CSS custom properties (`--font-heading`,
`--font-body`, `--font-accent`, `--font-condensed`) set in `layout/theme.liquid`'s
`{% style %}` block. Every section also has its own **Font override** setting
(inherit/heading/body/accent) for per-section control.

One real quirk worth knowing: the source site's own `.woff` font URLs actually serve
WOFF2 bytes (verified via `Content-Type: font/woff2` response header) — there is no
real legacy WOFF fallback, so only `.woff2` files are bundled here. This is a
non-issue for any modern browser.

## 3. Section → source mapping

| Section/template | Source file / component | Notes |
|---|---|---|
| `layout/theme.liquid` | `en-in.html` `<head>`/`<body>` shell | Font loading, `:root` tokens, section groups |
| `sections/announcement-bar.liquid` | `<announcement-bar data-vue>` | Real 5 messages, 4s autoplay, session-dismiss |
| `sections/header.liquid` + `snippets/mega-menu.liquid` + `snippets/mobile-menu*.liquid` | `<header class="layout__header">` | 100% Vue-rendered in source, no static markup to copy — rebuilt from the real nav/mega-menu/mobile-menu config recovered |
| `sections/cart-drawer.liquid` | `theme.miniCart` config | No static markup existed in source at all; authored fresh against Shopify's native cart, preserving real copy/thresholds |
| `sections/footer.liquid` | `<div class="site-footer">` | Real social links, real single flat nav; Klaviyo newsletter swapped for Shopify's native form |
| `sections/brand-principles.liquid` | `theme.brand_principles` | Real icon+title list (~32 possible, seeded with 8) |
| `sections/promotions.liquid` | `theme.promotions` | Real gift/sample cart-total tiers |
| `sections/hero.liquid` | 7× "hero" instances | Source splits desktop/mobile into 2 sections each; consolidated into 1 section with desktop/mobile settings |
| `sections/featured-content.liquid` | "featured_content" | Media+text tile + generic recommended-products rail |
| `sections/featured-products.liquid` | 4× "featured_products" | Real hand-picked products/variants recovered |
| `sections/fireworks.liquid` | "fireworks" | **Not** a countdown — it's the Firework shoppable-video widget ("LOVE FOR COSMIC") |
| `sections/multicolumn.liquid` | "shop by category" (3 source sections) | Consolidated into 1 responsive section; real hover video/GIF crossfade preserved |
| `sections/image-with-text-overlay.liquid` | "image_with_text_overlay" | Mobile-only "Virtual Try-On" duplicate of a hero |
| `sections/foursixty.liquid` | class `bv-main-section` (misleadingly named) | **Not** Bazaarvoice — it's the Foursixty Instagram feed ("SHOP OUR IG") |
| `templates/collection.json` | `collections/kylie-cosmetics.html` | Image banner + category shortcuts |
| `templates/collection.fragrance.json` | `collections/kylie-fragrance.html` | Real gradient `#C53627 → #F8EDEB` at 45%/35% |
| `sections/main-collection.liquid` | `<faceted-collection>` (Algolia app) | Rebuilt against Shopify's native filters/sort/pagination — no paid search app required |
| `templates/product.json` | Product Template A (skin-tint, supple-glaze) | Shade swatches, "find my shade" popup (4 real options) |
| `templates/product.cosmic.json` | Cosmic fragrance product | Pill-style size variants, ingredient pyramid, marketing tiles, cosmic-universe carousel, engraving flow, distinct gradient `#CE3C2D → #F4C4BF` |
| `templates/page.contact.json` | `pages/contact.html` | Real native Shopify contact form, 9 real topic options |
| `templates/page.faq.json` | `pages/faq.html` | Real 6-category Q&A structure |
| `templates/page.rewards.json` | `pages/kylie-rewards.html` | Real Yotpo tier/points data, rebuilt native |
| `templates/page.json` | `pages/privacy-policy.html` | Generic rich-text page |
| `templates/page.shipping.json` | `pages/shipping.html` | Real rates/regions recovered |

## 4. Known gaps / judgment calls

- Several source components (header, cart drawer, collection filters, mini-cart)
  are **100% Vue-client-rendered** with zero server-side markup in the captured
  HTML — there was nothing to literally "copy," so those were rebuilt from the
  real config objects/locale strings found in inline `<script>` blocks instead.
- The source's Algolia-powered collection filters were replaced with Shopify's
  native `collection.filters` — merchants without Algolia get full filtering with
  zero extra cost; the facet *labels* (Category, Shade, Price range, etc.) were
  preserved from the real config.
- One content bug found in the source itself (not fixed, just not replicated):
  one hero's mobile image was a mismatched leftover "July 4th Sale" banner.
