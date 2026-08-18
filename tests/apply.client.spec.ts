// @vitest-environment jsdom
/** ui-conversation-fold apply wiring: dictionaries, declaration-aware header
 * registration, stylesheet injection, and teardown. */
import { Context } from '@deepseek-ai/cordis'
import { beforeEach, describe, expect, it } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { apply, inject } from '../src/client/index.ts'
import { ConversationFoldAction } from '../src/client/ConversationFoldAction.tsx'
import { NS } from '../src/client/locales.ts'
import { EMPTY_ASSISTANT_SELECTOR, FOLD_ATTRIBUTE, FOLDED_NODE_KINDS, foldStylesheet } from '../src/client/fold-style.ts'

const SLOT = 'conversation.session.header.actions'

beforeEach(() => {
  localStorage.clear()
  document.head.innerHTML = ''
  document.documentElement.removeAttribute(FOLD_ATTRIBUTE)
})

function declareItems(slots: SlotRegistry): () => void {
  return slots.register(
    { name: 'root', children: { [SLOT]: { kind: 'list', scope: 'session' } } } as never,
    () => null,
  )
}

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  return { ctx, slots: ctx.get('slots') as SlotRegistry, locale }
}

describe('ui-conversation-fold apply', () => {
  it('declares the slot and locale services', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('registers localized copy and the header action with its options', async () => {
    const b = await bench()
    declareItems(b.slots)
    b.locale.setLocale('zh')
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    expect(b.locale.bind(NS)('toggle')).toBe('仅对话')
    b.locale.setLocale('en')
    expect(b.locale.bind(NS)('toggle')).toBe('Conversation only')
    const entry = b.slots.entries(SLOT).find(e => e.component === ConversationFoldAction)!
    expect(entry.options).toMatchObject({ id: 'conversation-fold', order: 30 })
    expect(entry.locale).toBe(NS)
  })

  it('injects the fold stylesheet and removes it on dispose', async () => {
    const b = await bench()
    declareItems(b.slots)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const style = document.head.querySelector('style[data-plugin="dsh-ui-conversation-fold"]')!
    expect(style).toBeDefined()
    expect(style.textContent).toContain(FOLD_ATTRIBUTE)
    await fiber.dispose()
    expect(document.head.querySelector('style[data-plugin="dsh-ui-conversation-fold"]')).toBeNull()
  })

  it('teardown removes the header action and dictionaries', async () => {
    const b = await bench()
    declareItems(b.slots)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries(SLOT)).toHaveLength(1)
    await fiber.dispose()
    expect(b.slots.entries(SLOT)).toHaveLength(0)
    expect(b.locale.bind(NS)('toggle')).toBe('toggle')
  })
})

describe('ui-conversation-fold stylesheet', () => {
  it('scopes every folded row, the think disclosure, and empty assistant rows under the fold attribute', () => {
    const sheet = foldStylesheet()
    for (const kind of FOLDED_NODE_KINDS) {
      expect(sheet).toContain(`[${FOLD_ATTRIBUTE}] [data-chat-flow-kind='${kind}']`)
    }
    expect(sheet).toContain(`[${FOLD_ATTRIBUTE}] [data-variant='think']`)
    expect(sheet).toContain(`[${FOLD_ATTRIBUTE}] ${EMPTY_ASSISTANT_SELECTOR}`)
    expect(sheet).toContain('display: none;')
  })

  it('keeps user, steering, context, and turn-tail rows, and folds assistant only when reasoning-only', () => {
    const sheet = foldStylesheet()
    for (const kind of ['user', 'steering', 'context', 'turn-tail'] as const) {
      expect(sheet).not.toContain(`[data-chat-flow-kind='${kind}']`)
    }
    // Assistant rows are never hidden as a bare kind: the only assistant
    // selector is the reasoning-only qualifier, so text-bearing rows survive.
    expect(sheet).toContain(`[data-chat-flow-kind='assistant-step']:has`)
    expect(sheet).not.toContain(`[data-chat-flow-kind='assistant-step'],`)
    expect(sheet).not.toContain(`[data-chat-flow-kind='assistant-step'] {`)
  })
})
