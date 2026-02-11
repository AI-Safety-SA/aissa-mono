import { describe, it, expect } from 'vitest'
import { extractPlainText } from '@/lib/utils'

describe('extractPlainText utility function', () => {
  it('returns empty string for null content', () => {
    expect(extractPlainText(null)).toBe('')
  })

  it('returns empty string for undefined content', () => {
    expect(extractPlainText(undefined)).toBe('')
  })

  it('returns empty string when root is missing', () => {
    expect(extractPlainText({} as any)).toBe('')
  })

  it('extracts text from simple paragraph', () => {
    const richText = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Hello world' }],
          },
        ],
      },
    }
    expect(extractPlainText(richText)).toBe('Hello world')
  })

  it('extracts text from multiple paragraphs', () => {
    const richText = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'First paragraph' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Second paragraph' }],
          },
        ],
      },
    }
    expect(extractPlainText(richText)).toBe('First paragraph Second paragraph')
  })

  it('extracts text from nested elements', () => {
    const richText = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Hello ' },
              {
                type: 'link',
                children: [{ type: 'text', text: 'world' }],
              },
              { type: 'text', text: '!' },
            ],
          },
        ],
      },
    }
    expect(extractPlainText(richText)).toBe('Hello world !')
  })

  it('truncates text to maxLength', () => {
    const richText = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'This is a long piece of text that should be truncated' }],
          },
        ],
      },
    }
    expect(extractPlainText(richText, 20)).toBe('This is a long piece...')
  })

  it('does not truncate if text is shorter than maxLength', () => {
    const richText = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Short text' }],
          },
        ],
      },
    }
    expect(extractPlainText(richText, 100)).toBe('Short text')
  })

  it('collapses multiple spaces into one', () => {
    const richText = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Hello    world' }],
          },
        ],
      },
    }
    expect(extractPlainText(richText)).toBe('Hello world')
  })

  it('trims whitespace from result', () => {
    const richText = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: '  Hello world  ' }],
          },
        ],
      },
    }
    expect(extractPlainText(richText)).toBe('Hello world')
  })

  it('handles empty children array', () => {
    const richText = {
      root: {
        type: 'root',
        children: [],
      },
    }
    expect(extractPlainText(richText)).toBe('')
  })

  it('handles nodes without text or children', () => {
    const richText = {
      root: {
        type: 'root',
        children: [
          {
            type: 'linebreak',
          },
        ],
      },
    }
    expect(extractPlainText(richText)).toBe('')
  })
})
