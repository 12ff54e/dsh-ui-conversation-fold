# `dsh-ui-conversation-fold`

[English](README.md) | 中文

Web 端「仅对话」折叠插件：一个纯浏览器包，向会话头部（`conversation.session.header.actions`）注册一个开关，把聊天切到纯对话阅读模式。开启后，开关把推理折叠、工具调用行、命令、压缩标记、重试和未知表面折叠出聊天流，留下用户消息、steering、注入上下文、助手回答，以及回合尾部操作行（复制、分支、反馈和每回合耗时）。它对未改动的 harness 即可生效——折叠是纯展示行为，不改动任何 harness 包。

插件依赖聊天流已经输出的两个选择器：每行上的 `data-chat-flow-kind`（ChatNodeSeat 输出）和每条助手推理折叠上的 `data-variant="think"`（ReasoningRow 输出）。开启模式后，插件在文档根节点上设置 `data-dsh-fold-process`，并注入一条插件自有的 `<style>` 标签（卸载时移除），在该属性作用域下隐藏过程行类型（`tool-call`、`command`、`manual-compaction`、`compaction`、`model-retry`、`turn-error`、`turn-max-tokens`、`unknown`）以及 Think 折叠。`turn-tail` 行被刻意保留：它承载复制、分支和反馈按钮，以及悬停时的每回合耗时。

偏好是全局阅读模式而非按会话：它持久化在 `localStorage` 的 `dsh.conversation.fold` 键下，并在每个会话中重新应用。开关及其词典随 fiber 一起撤销，因此插件是 HMR 安全的。样式只使用 token；文案走插件自己的 `conversation-fold` 语言命名空间。

插件以独立 bundle 包形式发布在本目录。用 `dsh plugin --profile <name> add ./dsh-ui-conversation-fold` 把它加入 web profile（bundle patch 会在 web-app 名单之后插入 `ui-conversation-fold` 行）。在会话头部：按开关折叠过程行，再按一次恢复它们。

## Build and release

本地构建：先 `pnpm install` 再 `pnpm run build`（`tsc -b && tsdown`），产出 `lib/index.js`、`lib/invariant.js` 和 `lib/client.js`。在 harness 源码检出内构建时，把 `- dsh-plugins/*` 加入 harness 的 `pnpm-workspace.yaml` `packages` 列表，并先构建 harness 库（`build:lib:host`，再 `build:lib:client`），使 `@deepseek-ai/*` 解析到 workspace。

推送 `v*` 标签会运行随附的 [release workflow](.github/workflows/release.yml)，它基于 harness 源码构建插件，并把 tarball 附加到 GitHub release。安装命令：

```sh
dsh plugin --profile web add \
  https://github.com/<owner>/dsh-ui-conversation-fold/releases/download/v0.1.0-rc.5/dsh-ui-conversation-fold-0.1.0-rc.5.tgz
```

## Model Experience

无——插件只改变已渲染行的可见性，并把偏好存在 localStorage；这里没有任何内容进入模型请求。

#### KV Cache effect

无；该包从不组装或发送 provider 请求。

## Known Limitations and Deferred Work

- **被隐藏的行仍在 DOM 和快照中。** 折叠是 `display: none`，不是数据层过滤，因此滚动高度、分页锚点和 trajectory 视图都不受影响，也没有任何内容被丢弃。后续的「仅导出对话」转录稿应当是另一个数据层特性。
