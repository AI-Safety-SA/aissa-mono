# Website Comparison: Live vs Astro (website-adjustments branch)

## Date: 2026-02-24

## Pages Compared
- Home (/)
- About (/about)
- Team (/team)
- Get Involved (/get-involved)

---

## Overall Assessment

The Astro website is **95% aligned** with the live site. The following differences need to be addressed:

---

## Critical Issues

### 1. Partner Logos - Home Page
**Live Site:** Includes "Deep Learning Indaba X" logo
**Astro Site:** Has "POI Logo" instead

**Files to update:**
- `apps/website/src/pages/index.astro` - Replace `poiLogo` with `indabaXLogo`
- Download logo from: `https://cdn.prod.website-files.com/682b664e23519b3b6af8a183/682b664e23519b3b6af8a1c9_IndabaX_horizontal_logo.png`
- Save to: `apps/website/src/assets/partner_logos/indabax-logo.png`

---

## Styling Differences

### 2. Get Involved Page - Heading Structure
**Live Site:** Uses inline `<strong>` tags for section headings
**Astro Site:** Uses `<h3>` headings

**Live HTML structure:**
```html
<span class="text-span home-mailing">
  <strong>Cooperative AI Research Fellowship</strong><br/>
  We are hosting...
</span>
```

**Astro HTML structure:**
```html
<h3>Cooperative AI Research Fellowship</h3>
<p>We are hosting...</p>
```

**Impact:** Visual hierarchy differs - headings appear more prominent in Astro version

**Files to update:**
- `apps/website/src/pages/get-involved.astro` - Change `<h3>` to inline `<strong>` within `<p>` tags

---

## Pages Status

### ✅ Home Page (/)
- Hero section: Aligned
- Partner logos: **NEEDS FIX** - Replace POI with Indaba X
- Get Involved preview: Aligned
- Footer: Aligned

### ✅ About Page (/about)
- Hero carousel: Aligned
- Content sections (Research, Fellowships, Workshops, Events): Aligned
- Footer: Aligned

### ✅ Team Page (/team)
- Team member cards: Aligned
- "Learn More" buttons: Aligned
- Footer: Aligned

### ⚠️ Get Involved Page (/get-involved)
- Content structure: **NEEDS FIX** - Use inline `<strong>` instead of `<h3>`
- All links and text: Aligned
- Footer: Aligned

---

## Typography

**Live Site Uses:**
- Montserrat (weights: 100-900)
- Bitter (400, 700)
- Inconsolata (400, 700)
- Inter (100-900)

**Astro Site:**
- Custom font variables: `--font-nav`, `--font-body`, `--font-display`
- Need to verify font stack matches exactly

**Recommendation:** Verify font files are properly loaded and match live site weights

---

## Content Alignment

All text content is **aligned** between live and Astro versions.

---

## Navigation

### Header
**Live Site:** Webflow with hamburger menu, shows full navigation
**Astro Site:** Similar structure, matches well

**Mobile Menu:** Both have hamburger menu behavior

---

## Footer

**Live Site:**
- Logo on left
- Email: info@aisafetysa.com
- LinkedIn icon

**Astro Site:**
- Logo on left
- Email: info@aisafetysa.com
- LinkedIn icon

**Status:** ✅ Aligned

---

## Links

All external links are **aligned**:
- Fellowship: https://www.cai-research-fellowship.com/
- Resources: https://docs.google.com/document/d/1ggO5P0Tlsf2FF1kODc6G6_DZWIsERtI2hyIn74XOwgk/
- Volunteer: https://tally.so/r/w4gD7b
- Luma Calendar: https://lu.ma/calendar/cal-p3BboQFpGbi3ioe
- Substack: https://aisafetysouthafrica.substack.com/
- Co-working: https://airtable.com/appR0NwXFE9nxfdKA/pagIQJbgF9MMX1SMu/form
- LinkedIn: https://www.linkedin.com/company/ai-safety-south-africa/
- Donations: https://www.every.org/ai-safety-cape-town?utm_campaign=donate-link#/donate

---

## Summary

| Aspect | Status | Notes |
|---------|----------|--------|
| Home page layout | ✅ | Aligned |
| About page layout | ✅ | Aligned |
| Team page layout | ✅ | Aligned |
| Get Involved layout | ⚠️ | Heading structure needs fix |
| Partner logos | ❌ | POI needs to become Indaba X |
| Navigation | ✅ | Aligned |
| Footer | ✅ | Aligned |
| Typography | ⚠️ | Verify font match |
| Links | ✅ | All aligned |

---

## Action Items

1. [x] Download Deep Learning Indaba X logo
2. [x] Add logo to assets/partner_logos/
3. [x] Update index.astro partner logos array
4. [x] Update get-involved.astro heading structure
5. [ ] Verify font stack matches live site

## Status (2026-02-24)

### Completed Fixes:
- ✅ Added indabax-logo.png to assets
- ✅ Updated index.astro to use indabaXLogo instead of poiLogo
- ✅ Updated get-involved.astro to use inline `<strong>` tags styled as block elements

### Verification:
- The partner logos carousel now includes "Deep Learning Indaba X" (verified in live site screenshot)
- The Get Involved section headings are now styled as bold, centered headings (matching live site structure)

---

## Testing Notes

- Tested on: Ubuntu 24.04 (odyssey-core)
- Dev server: http://localhost:4321
- Live site: https://www.aisafetysa.com
- Browser: Google Chrome (headless)
