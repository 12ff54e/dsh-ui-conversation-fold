/**
 * Conversation-only fold plugin, browser half: contributes one session-header
 * toggle that folds process rows (thinking, tool calls, turn chrome) by
 * scoping a document-root attribute plus an injected stylesheet. Everything
 * else in the chat flow already emits the stable selectors this relies on
 * (`data-chat-flow-kind` and `data-variant="think"`), so the plugin owns no
 * renderer and changes no harness package.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls ui-conversation's Context merge (the header-action slot).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ConversationFoldAction } from './ConversationFoldAction.tsx'
import { en, NS, zh, type ConversationFoldKey } from './locales.ts'
import { foldStylesheet } from './fold-style.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The conversation-only toggle's copy. */
    'conversation-fold': ConversationFoldKey
  }
}

export type { ConversationFoldActionProps } from './ConversationFoldAction.tsx'

/** Required services for locale registration and header-slot contribution. */
export const inject = ['slots', 'locale']

const STYLESHEET_TAG_ID = 'dsh-ui-conversation-fold/stylesheet'

/**
 * Inject the fold stylesheet once, idempotently, and remove it on dispose.
 * A no-op outside a browser document (node-side tests and the empty node half).
 * @returns disposer removing the tag this call created.
 */
function injectFoldStylesheet(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (document.querySelector(`style[data-plugin-css="${STYLESHEET_TAG_ID}"]`) !== null) return () => {}
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-ui-conversation-fold'
  tag.dataset.pluginCss = STYLESHEET_TAG_ID
  tag.textContent = foldStylesheet()
  document.head.appendChild(tag)
  return () => { tag.remove() }
}

/**
 * Client plugin body: register the dictionary, the fold stylesheet, and the
 * header action.
 * @param ctx - client cordis context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => injectFoldStylesheet(), 'ui-conversation-fold: stylesheet')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-conversation-fold: dictionaries')
  ctx.slots.inject(
    'conversation.session.header.actions',
    () => ctx.slots.register({
      name: 'conversation.session.header.actions',
      id: 'conversation-fold',
      // After the subagent catalog (10) and background jobs (20).
      order: 30,
      locale: NS,
    }, ConversationFoldAction),
  )
}
