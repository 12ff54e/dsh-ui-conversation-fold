// @vitest-environment jsdom
/** ConversationFoldAction behavior: the toggle mirrors the persisted
 * preference, drives the document-root attribute, and writes localStorage. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ConversationFoldAction, type ConversationFoldActionProps } from '../src/client/ConversationFoldAction.tsx'
import { zh } from '../src/client/locales.ts'
import { FOLD_ATTRIBUTE, FOLD_STORAGE_KEY } from '../src/client/fold-style.ts'

const t: ConversationFoldActionProps['t'] = key => (zh as Record<string, string>)[key] ?? key

function mount() {
  // The component reads only the locale seat; the runtime share is unused.
  return render(<ConversationFoldAction {...{ t } as unknown as ConversationFoldActionProps} />)
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute(FOLD_ATTRIBUTE)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.removeAttribute(FOLD_ATTRIBUTE)
})

describe('ConversationFoldAction', () => {
  it('renders unfolded by default and leaves the document attribute absent', () => {
    mount()
    const button = screen.getByRole('button', { name: zh['toggle'] })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(document.documentElement.hasAttribute(FOLD_ATTRIBUTE)).toBe(false)
  })

  it('folds on click: aria-pressed, document attribute, and persisted preference', () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: zh['toggle'] }))
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true')
    expect(document.documentElement.hasAttribute(FOLD_ATTRIBUTE)).toBe(true)
    expect(localStorage.getItem(FOLD_STORAGE_KEY)).toBe('1')
  })

  it('unfolds on a second click and clears the persisted preference', () => {
    mount()
    const button = screen.getByRole('button', { name: zh['toggle'] })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(document.documentElement.hasAttribute(FOLD_ATTRIBUTE)).toBe(false)
    expect(localStorage.getItem(FOLD_STORAGE_KEY)).toBeNull()
  })

  it('restores the persisted preference on mount', () => {
    localStorage.setItem(FOLD_STORAGE_KEY, '1')
    mount()
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true')
    expect(document.documentElement.hasAttribute(FOLD_ATTRIBUTE)).toBe(true)
  })
})
