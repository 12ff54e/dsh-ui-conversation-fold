/** `conversation-fold` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'conversation-fold'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'toggle': '仅对话',
} as const

/** The conversation-fold namespace key union. */
export type ConversationFoldKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'toggle': 'Conversation only',
} satisfies Record<ConversationFoldKey, string>
