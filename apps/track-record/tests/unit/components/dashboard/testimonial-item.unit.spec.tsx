import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TestimonialItem } from '@/components/dashboard/testimonial-item'

const shortQuote = 'Concise feedback that fits within three lines.'
const borderlineQuote =
  'This testimonial is long enough to exceed the old character threshold while still rendering within the collapsed height that the card allows on screen for a typical desktop width.'
const longQuote =
  'This testimonial is intentionally verbose so the rendered paragraph exceeds three lines in the testimonial card, which means the read more control should appear and reveal additional content when the collapsible is opened by the user.'

const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
const originalRequestAnimationFrame = window.requestAnimationFrame
const originalCancelAnimationFrame = window.cancelAnimationFrame
const originalResizeObserver = globalThis.ResizeObserver

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function getMeasuredScrollHeight(text: string): number {
  if (text === longQuote) {
    return 96
  }

  return 48
}

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      const className =
        typeof this.className === 'string' ? this.className : this.getAttribute('class') ?? ''

      return className.includes('line-clamp-3') ? 48 : getMeasuredScrollHeight(this.textContent ?? '')
    },
  })

  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get() {
      return getMeasuredScrollHeight(this.textContent ?? '')
    },
  })

  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  window.cancelAnimationFrame = vi.fn()
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
})

afterEach(() => {
  if (originalClientHeight) {
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight)
  }

  if (originalScrollHeight) {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', originalScrollHeight)
  }

  window.requestAnimationFrame = originalRequestAnimationFrame
  window.cancelAnimationFrame = originalCancelAnimationFrame
  globalThis.ResizeObserver = originalResizeObserver
})

describe('TestimonialItem', () => {
  it('does not render a read more button for short testimonials', async () => {
    render(<TestimonialItem quote={shortQuote} />)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Read more' })).not.toBeInTheDocument()
    })
  })

  it('does not render a read more button for borderline testimonials that do not overflow', async () => {
    render(<TestimonialItem quote={borderlineQuote} />)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Read more' })).not.toBeInTheDocument()
    })
  })

  it('renders a read more button only when the testimonial actually overflows', async () => {
    render(<TestimonialItem quote={longQuote} />)

    const button = await screen.findByRole('button', { name: 'Read more' })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument()
  })
})
