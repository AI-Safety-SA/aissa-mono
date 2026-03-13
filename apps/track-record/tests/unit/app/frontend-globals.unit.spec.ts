import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const globalsCssPath = path.resolve(currentDir, '../../../src/app/(frontend)/globals.css')
const globalsCss = readFileSync(globalsCssPath, 'utf8')

const requiredThemeTokens = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
]

function extractThemeBlock(selector: ':root' | '.dark') {
  const escapedSelector = selector.replace('.', '\\.')
  const match = globalsCss.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'))

  return match?.[1] ?? ''
}

describe('frontend globals theme tokens', () => {
  it('defines the full token set for both light and dark themes', () => {
    const lightThemeBlock = extractThemeBlock(':root')
    const darkThemeBlock = extractThemeBlock('.dark')

    expect(lightThemeBlock).not.toBe('')
    expect(darkThemeBlock).not.toBe('')

    for (const token of requiredThemeTokens) {
      expect(lightThemeBlock).toContain(token)
      expect(darkThemeBlock).toContain(token)
    }
  })
})
