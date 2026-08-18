/**
 * Session-header toggle for the conversation-only reading mode. The preference
 * is global (one reading mode, not per-session), so it lives in localStorage
 * and is mirrored onto the document root as the attribute the fold stylesheet
 * scopes its rules under. A single consumer owns it: no store seat is needed.
 */
import { useEffect, useState } from 'react'
import { IconThinkOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { NS } from './locales.ts'
import { applyFoldAttribute, readFoldPreference, writeFoldPreference } from './fold-style.ts'
import css from './ConversationFoldAction.module.css'

/** Full props for the conversation-fold header action. */
export type ConversationFoldActionProps =
  PropsRuntime<'conversation.session.header.actions'> & PropsLocale<typeof NS>

/**
 * Render the conversation-only toggle and keep the document-root attribute in
 * sync with the persisted preference.
 * @param props - runtime slot currency plus the namespace translator.
 * @returns the aria-pressed fold toggle.
 */
export function ConversationFoldAction({ t }: ConversationFoldActionProps) {
  const [folded, setFolded] = useState(readFoldPreference)
  useEffect(() => {
    applyFoldAttribute(folded)
  }, [folded])
  const toggle = (): void => {
    setFolded(current => {
      const next = !current
      writeFoldPreference(next)
      return next
    })
  }
  return (
    <button
      type="button"
      className={css.trigger}
      aria-pressed={folded}
      onClick={toggle}
    >
      <IconThinkOutline14 />
      <span className={css.label}>{t('toggle')}</span>
    </button>
  )
}
