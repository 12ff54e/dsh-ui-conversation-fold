/**
 * Package-owned invariant companion for `dsh-ui-conversation-fold`.
 * @module dsh-ui-conversation-fold/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = 'dsh-ui-conversation-fold'

/** Cordis companion plugin name. */
export const name = 'client-ui-conversation-fold-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: this package is a read-only presentation toggle. It
 * folds chat rows through a document-root attribute plus an injected
 * stylesheet, emits no cordis events, and owns no cross-plugin mutable state —
 * its only shared write is the private localStorage preference, and its single
 * slot registration proves disposal through the apply spec.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
