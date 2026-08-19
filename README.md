# `dsh-ui-conversation-fold`

English | [中文](README.zh.md)

Web UI conversation-only fold plugin: a browser-only package that registers one session-header action (`conversation.session.header.actions`) toggling the chat into a plain-conversation reading mode. When on, the toggle folds thinking disclosures, tool-call rows, commands, compaction markers, retries, and unknown surfaces out of the flow, leaving user messages, steering, injected context, assistant answers, and the turn-tail action row (copy, branch, feedback, and per-turn timing). It works against an unmodified harness — the fold is pure presentation and changes no harness package.

The plugin relies on two selectors the chat flow already emits: `data-chat-flow-kind` on every row (ChatNodeSeat) and `data-variant="think"` on every assistant reasoning disclosure (ReasoningRow). When the mode is on, the plugin sets `data-dsh-fold-process` on the document root and injects one plugin-owned `<style>` tag (removed on unload) that hides, under that attribute, the process row kinds (`tool-call`, `command`, `manual-compaction`, `compaction`, `model-retry`, `turn-error`, `turn-max-tokens`, `unknown`) plus the Think disclosures. The `turn-tail` row is deliberately kept: it carries the copy, branch, and feedback buttons and the per-turn timing on hover.

The preference is a global reading mode, not per-session: it persists in `localStorage` under `dsh.conversation.fold` and is re-applied on every session. The toggle and its dictionaries leave with the fiber, so the plugin is HMR-safe. Styling uses tokens only; copy goes through the plugin's own `conversation-fold` locale namespace.

The plugin ships as a standalone bundle package in this directory. Add it to a web profile with `dsh plugin --profile <name> add ./dsh-ui-conversation-fold` (the bundle patch inserts the `ui-conversation-fold` row after the web-app roster). In the session header: press the toggle to fold process rows, press it again to restore them.

## Build and release

Build locally with `pnpm install` then `pnpm run build` (`tsc -b && tsdown`), which emits `lib/index.js`, `lib/invariant.js`, and `lib/client.js`. When building inside the harness source checkout, add `- dsh-plugins/*` to the harness `pnpm-workspace.yaml` `packages` list and build the harness libs first (`build:lib:host`, then `build:lib:client`), so `@deepseek-ai/*` resolves to the workspace.

Pushing a `v*` tag runs the bundled [release workflow](.github/workflows/release.yml), which builds the plugin against the harness source and attaches a tarball to the GitHub release. Install it with:

```sh
dsh plugin --profile web add \
  https://github.com/12ff54e/dsh-ui-conversation-fold/releases/download/v0.1.0/dsh-ui-conversation-fold-0.1.0.tgz
```

## Model Experience

None, as the plugin only changes which already-rendered rows are visible and stores the preference in localStorage; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

- **Hidden rows stay in the DOM and snapshot.** The fold is `display: none`, not a data-level filter, so scroll height, paging anchors, and the trajectory view are unaffected, and nothing is discarded. A later "export conversation-only transcript" would be a separate data-level feature.
