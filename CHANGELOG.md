# 更新日志

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## 0.2.0

重新定位：从「评估工具 + 预制骨架」变成**一个命令的多 agent 协作组织工具**。

### 变更

- **内嵌 subagent runner**（`vendor/pi-subagents`）—— 装本包一个即可用，
  不再需要另外安装 runner。子 agent 角色沿用 runner 自带的那一套，
  由 runner 作为 builtin 自动加载。
- **只保留 `/topo` 一个命令** —— 移除 `/topo-init`。
  `/topo` 改由 prompt 提供（`prompts/topo.md`），Pi 原生展开后直接开始分析，
  不需要先初始化再跑第二个命令。
- **产物改为项目根目录 `topo.md`** —— 替代原先的 `docs/TOPOLOGY.md`。
  内容是可复查的记录：结论、调用方式、判断依据的项目事实、
  为什么不是别的形式、角色分工、复查触发条件、变更记录。
- **文案改为中性表述** —— 全面去掉原先那套带指派色彩的措辞。

### 移除

- `bin/seam-scan.mjs` 及其全套（静态 import 图分析：弱/强连通分量、
  git 改动共现、测试-源对应）。项目分析改由 `/topo` 现场读项目完成。
- `topo_seam_scan` 工具。
- `workflows/{supervisor-worker,pipeline,staged-lanes}.js` 三个预制骨架。
  组织形式由 `/topo` 按实际情况给出，不再提供固定脚本。
  （`staged-lanes.js` 本就以 `seam-scan.mjs` 为数据源。）
- `agents/{topologist,council-*}.md` 自定义角色。
- `templates/TOPOLOGY.md`。

### 内嵌相关的处理

- **vendor 瘦身**：删除 sourcemap（642 个 `.map`，6.3M）与 `docs/`，15M → 7.9M。
  测试守着「内部相对 import 无断链」，防止瘦身漏删。
- **运行依赖提升**：runner 的 `dependencies`
  （`jiti`、`typebox`、`yaml`、`acorn`、`undici`、`@js-temporal/polyfill`）
  必须由本包声明，否则用户装包后内嵌代码解析不到。
  `@earendil-works/*` 由 Pi 宿主提供，留在 `peerDependencies`。
- **不重复声明角色目录**：runner 的 `BUILTIN_AGENTS_DIR` 解析到
  `vendor/pi-subagents/agents`，会自动作为 builtin 加载。
  再通过 `pi-subagents.agents` 声明一遍会以优先级更高的 `package` 来源重名覆盖。
- **版本自检**：runner 入口会比对「已安装版本」与「加载时版本」，不一致就抛错。
  该函数读的是相对自身位置的 `package.json`，内嵌后两者同源恒等，不受影响。

### 未验证

`/topo` **未在真实 Pi 会话里跑过**。内嵌加载已逐项验证（版本自检一致、
1273 条内部相对 import 零断链、运行依赖可从 vendor 位置解析），
但 `@earendil-works/*` 宿主 peer 依赖只在真实 Pi 进程中存在，
实际加载仍需 Pi 环境确认。

## 0.1.0

首个版本。确定性接缝扫描 + 评估角色 + 三个预制编排骨架 + 决策记录模板。
该版本的全部内容已在 0.2.0 中移除或重构，详见上。
