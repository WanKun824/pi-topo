/**
 * topo —— 一个命令组织多 agent 协作。
 *
 * 本包自带 subagent runner（vendor/pi-subagents），装这一个包即可使用，
 * 不需要另外安装。子 agent 角色沿用 runner 自带的那一套。
 *
 * `/topo` 由 prompts/topo.md 提供：读项目、结合当前对话给出协作方案，写入 topo.md。
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerSubagentRunner from "./vendor/pi-subagents/index.js";

export default function (pi: ExtensionAPI) {
	registerSubagentRunner(pi);
}
