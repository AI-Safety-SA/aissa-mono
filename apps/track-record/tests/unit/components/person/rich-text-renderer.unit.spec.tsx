import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RichTextRenderer } from '@/components/person/rich-text-renderer'

describe('RichTextRenderer component', () => {
  it('renders null when content is null', () => {
    const { container } = render(<RichTextRenderer content={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when content is undefined', () => {
    const { container } = render(<RichTextRenderer content={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a paragraph', () => {
    const content = {
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
    render(<RichTextRenderer content={content} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders bold text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Bold text', format: 1 }],
          },
        ],
      },
    }
    render(<RichTextRenderer content={content} />)
    const boldElement = screen.getByText('Bold text')
    expect(boldElement.tagName.toLowerCase()).toBe('strong')
  })

  it('renders italic text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Italic text', format: 2 }],
          },
        ],
      },
    }
    render(<RichTextRenderer content={content} />)
    const italicElement = screen.getByText('Italic text')
    expect(italicElement.tagName.toLowerCase()).toBe('em')
  })

  it('renders headings', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Heading Text' }],
          },
        ],
      },
    }
    render(<RichTextRenderer content={content} />)
    const heading = screen.getByText('Heading Text')
    expect(heading.tagName.toLowerCase()).toBe('h2')
  })

  it('renders unordered lists', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'list',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Item 1' }],
              },
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Item 2' }],
              },
            ],
          },
        ],
      },
    }
    render(<RichTextRenderer content={content} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 1').closest('ul')).toBeInTheDocument()
  })

  it('renders ordered lists', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'list',
            listType: 'number',
            children: [
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'First' }],
              },
            ],
          },
        ],
      },
    }
    render(<RichTextRenderer content={content} />)
    expect(screen.getByText('First').closest('ol')).toBeInTheDocument()
  })

  it('renders links', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ type: 'text', text: 'Click here' }],
              },
            ],
          },
        ],
      },
    }
    render(<RichTextRenderer content={content} />)
    const link = screen.getByText('Click here')
    expect(link.tagName.toLowerCase()).toBe('a')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('renders blockquotes', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'quote',
            children: [{ type: 'text', text: 'A famous quote' }],
          },
        ],
      },
    }
    render(<RichTextRenderer content={content} />)
    const quote = screen.getByText('A famous quote')
    expect(quote.closest('blockquote')).toBeInTheDocument()
  })

  it('renders linebreaks', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Line 1' },
              { type: 'linebreak' },
              { type: 'text', text: 'Line 2' },
            ],
          },
        ],
      },
    }
    const { container } = render(<RichTextRenderer content={content} />)
    expect(container.querySelector('br')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Text' }],
          },
        ],
      },
    }
    const { container } = render(<RichTextRenderer content={content} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
