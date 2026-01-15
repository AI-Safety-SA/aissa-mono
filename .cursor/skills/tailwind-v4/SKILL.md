---
title: Tailwind v4
description: Always use Tailwind CSS v4 and never v3
tags: [tailwind, css, styling, v4]
priority: high
---

# TAILWIND CSS V4 REQUIREMENT

**Always use Tailwind CSS v4 and never v3.**

## Version Requirement

- ✅ **ALWAYS use Tailwind CSS v4** for all styling
- ❌ **NEVER use Tailwind CSS v3** syntax or patterns

## Key Differences to Remember

### Configuration

- Tailwind v4 uses CSS-based configuration instead of JavaScript config files
- Use `@import "tailwindcss"` in CSS files instead of `tailwind.config.js`

### Syntax Updates

- Use v4's new CSS-first approach
- Leverage v4's improved performance and features
- Follow v4's updated class naming conventions where applicable

### Installation

- Install `tailwindcss@^4.0.0` or latest v4 version
- Do not install or reference `tailwindcss@^3.x.x`

## Rule

When working with Tailwind CSS in this project:

1. **Always** use Tailwind v4 syntax and patterns
2. **Never** use Tailwind v3 syntax or patterns
3. **Verify** package.json uses Tailwind v4 before making styling changes
4. **Update** any v3 patterns to v4 equivalents if encountered
