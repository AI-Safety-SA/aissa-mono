import React from 'react'

type LexicalNode = {
  type: string
  text?: string
  format?: number | string
  tag?: string
  listType?: string
  children?: LexicalNode[]
  url?: string
  [key: string]: unknown
}

interface LexicalRoot {
  root: {
    type: string
    children?: LexicalNode[]
    direction?: ('ltr' | 'rtl') | null
    format?: string | number
    indent?: number
    version?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface RichTextRendererProps {
  content: LexicalRoot | null | undefined
  className?: string
}

function renderNode(node: LexicalNode, index: number): React.ReactNode {
  if (node.type === 'text') {
    let content: React.ReactNode = node.text || ''
    const format = typeof node.format === 'number' ? node.format : 0

    if (format & 1) content = <strong key={`strong-${index}`}>{content}</strong>
    if (format & 2) content = <em key={`em-${index}`}>{content}</em>
    if (format & 8) content = <u key={`u-${index}`}>{content}</u>
    if (format & 4) content = <s key={`s-${index}`}>{content}</s>
    if (format & 16) content = <code key={`code-${index}`}>{content}</code>

    return content
  }

  if (node.type === 'linebreak') {
    return <br key={index} />
  }

  const children = node.children?.map((child, i) => renderNode(child, i))

  switch (node.type) {
    case 'paragraph':
      return <p key={index}>{children}</p>
    case 'heading': {
      const tag = node.tag || 'h2'
      return React.createElement(tag, { key: index }, children)
    }
    case 'list':
      if (node.listType === 'number') {
        return <ol key={index}>{children}</ol>
      }
      return <ul key={index}>{children}</ul>
    case 'listitem':
      return <li key={index}>{children}</li>
    case 'link':
      return (
        <a key={index} href={node.url as string} className="text-primary hover:underline">
          {children}
        </a>
      )
    case 'quote':
      return <blockquote key={index}>{children}</blockquote>
    case 'root':
      return <>{children}</>
    default:
      return <>{children}</>
  }
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content?.root) {
    return null
  }

  return <div className={className}>{renderNode(content.root, 0)}</div>
}
