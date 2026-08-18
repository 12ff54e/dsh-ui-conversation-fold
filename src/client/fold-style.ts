/**
 * Conversation-only fold contract: the document-root attribute that scopes the
 * hiding rules, the localStorage preference, and the stylesheet built from the
 * folded node-kind list. The chat flow already emits `data-chat-flow-kind` on
 * every row (ChatNodeSeat) and `data-variant="think"` on every assistant
 * reasoning disclosure (ReasoningRow), so the fold is pure presentation with no
 * changes to the owning packages.
 */

/** Stable attribute whose presence on the document root folds process rows. */
export const FOLD_ATTRIBUTE = 'data-dsh-fold-process'

/** localStorage key for the conversation-only reading preference. */
export const FOLD_STORAGE_KEY = 'dsh.conversation.fold'

/**
 * Chat node kinds folded out of the conversation-only view. User, steering,
 * context, assistant text, and the turn-tail stay visible: the turn-tail row
 * carries the copy/branch/feedback actions and the per-turn timing on hover,
 * so it is conversation chrome rather than process narration.
 */
export const FOLDED_NODE_KINDS = [
  'tool-call',
  'command',
  'manual-compaction',
  'compaction',
  'model-retry',
  'turn-error',
  'turn-max-tokens',
  'unknown',
] as const

/**
 * Selector for an assistant row whose rendered content is reasoning only: a
 * reasoning block with no text/image/unknown block before or after it. Hiding
 * just the Think disclosure leaves such a row as an empty flex item, which
 * still consumes the flow column's `gap` — so the whole row folds instead.
 */
export const EMPTY_ASSISTANT_SELECTOR =
  `[data-chat-flow-kind='assistant-step']:has([data-variant='think'])`
  + `:not(:has([data-variant='think'] ~ *:not([data-variant='think'])))`
  + `:not(:has(*:not([data-variant='think']) ~ [data-variant='think']))`

/**
 * Build the fold stylesheet: one rule hiding every folded process row (keyed
 * by the chat flow's `data-chat-flow-kind`), the assistant's Think
 * disclosures (keyed by `data-variant="think"`), and an assistant row whose
 * only content was reasoning (keyed by {@link EMPTY_ASSISTANT_SELECTOR}), all
 * scoped under the fold attribute so the default view is untouched.
 * @returns the ready-to-inject CSS text.
 */
export function foldStylesheet(): string {
  const attr = `[${FOLD_ATTRIBUTE}]`
  const rows = FOLDED_NODE_KINDS
    .map(kind => `${attr} [data-chat-flow-kind='${kind}']`)
  const reasoning = `${attr} [data-variant='think']`
  const emptyAssistant = `${attr} ${EMPTY_ASSISTANT_SELECTOR}`
  return `${[...rows, reasoning, emptyAssistant].join(',\n')} {\n  display: none;\n}\n`
}

/**
 * Read the persisted preference; storage unavailable or unreadable reads as
 * unfolded so the default view never depends on browser storage.
 * @returns whether the conversation-only view is folded on.
 */
export function readFoldPreference(): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    return localStorage.getItem(FOLD_STORAGE_KEY) === '1'
  } catch {
    // Private mode or quota blocks the read: fall back to unfolded.
    return false
  }
}

/**
 * Persist the preference. Storage failures leave it unpersisted (the toggle
 * still works for this page), never throw.
 * @param folded - the value to persist.
 */
export function writeFoldPreference(folded: boolean): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (folded) localStorage.setItem(FOLD_STORAGE_KEY, '1')
    else localStorage.removeItem(FOLD_STORAGE_KEY)
  } catch {
    // Private mode or quota blocks the write: the page-local toggle still holds.
  }
}

/**
 * Reflect the preference on the document root, where the fold stylesheet reads
 * it. A no-op outside a browser document.
 * @param folded - whether the fold attribute should be present.
 */
export function applyFoldAttribute(folded: boolean): void {
  if (typeof document === 'undefined') return
  document.documentElement.toggleAttribute(FOLD_ATTRIBUTE, folded)
}
